/* global Image */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Operation from './operation'
import Vector2 from '../lib/math/vector2'
import Matrix from '../lib/math/matrix'
import Sticker from './stickers/sticker'
import Promise from '../vendor/promise'

/**
 * An operation that can draw text on the canvas
 *
 * @class
 * @alias ImglyKit.Operations.StickersOperation
 * @extends ImglyKit.Operation
 */
class StickersOperation extends Operation {
  constructor (...args) {
    super(...args)

    this._framebuffers = []
    this._framebufferTextures = []
    this._framebufferIndex = 0

    this._programs = {}
    this._textures = {}
    this._loadedStickers = {}

    this.vertexShader = require('raw!./generic/sprite.vert')
    this.adjustmentsShader = require('raw!./stickers/adjustments.frag')
    this.blurShader = require('raw!./blur/blur.frag')

    this._registerStickers()
  }

  /**
   * Registers the existing stickers
   * @private
   */
  _registerStickers () {
    this._stickers = {}

    const stickerNames = [
      'glasses-nerd',
      'glasses-normal',
      'glasses-shutter-green',
      'glasses-shutter-yellow',
      'glasses-sun',
      'hat-cap',
      'hat-cylinder',
      'hat-party',
      'hat-sheriff',
      'heart',
      'mustache-long',
      'mustache1',
      'mustache2',
      'mustache3',
      'pipe',
      'snowflake',
      'star'
    ]
    stickerNames.forEach((name) => {
      this._stickers[name] = `stickers/${name}.png`
    })
  }

  /**
   * Renders this operation using WebGL
   * @param  {WebGLRenderer} renderer
   * @param  {Image} image
   * @private
   */
  /* istanbul ignore next */
  _renderWebGL (renderer, image) {
    const canvas = renderer.getCanvas()
    const canvasDimensions = new Vector2(canvas.width, canvas.height)
    if (!this._outputTexture) {
      const { texture, fbo } = renderer.createFramebuffer()
      this._outputTexture = texture
      this._outputFramebuffer = fbo
    }
    const stickers = this.getStickers()
    const promises = stickers.map((sticker) => {
      return this._renderStickerWebGL(renderer, sticker)
    })
    renderer.resizeTexture(this._outputTexture, canvasDimensions)
    return Promise.all(promises)
      .then(() => {
        this._renderFinal(renderer)
      })
  }

  /**
   * Creates the framebuffers and textures for rendering
   * @param  {WebGLRenderer} renderer
   * @private
   */
  _setupFrameBuffers (renderer) {
    for (let i = 0; i < 2; i++) {
      const { fbo, texture } = renderer.createFramebuffer()
      this._framebuffers.push(fbo)
      this._framebufferTextures.push(texture)
    }
  }

  _renderTexture (renderer, image, texture, sticker) {
    return new Promise((resolve, reject) => {
      if (!this._programs[renderer.id].adjustments) {
        this._programs[renderer.id].adjustments =
          renderer.setupGLSLProgram(null, this.adjustmentsShader)
      }

      const stickerAdjustments = sticker.getAdjustments()
      const stickerScale = sticker.getScale()

      const canvas = renderer.getCanvas()

      const inputTexture = texture
      const outputTexture = this._framebufferTextures[this._framebufferIndex % 2]
      const outputFBO = this._framebuffers[this._framebufferIndex % 2]

      const blurRadius = (stickerAdjustments && stickerAdjustments.blur) || 0

      const stickerDimensions = new Vector2(image.width, image.height)
        .multiply(stickerScale)

      const start = new Vector2(0.0, 0.0)
        .subtract(blurRadius * canvas.width / image.width)
      const end = new Vector2(1.0, 1.0)
        .add(blurRadius * canvas.width / image.width)

      const textureCoordinates = new Float32Array([
        // First triangle
        start.x, start.y,
        end.x, start.y,
        start.x, end.y,

        // Second triangle
        start.x, end.y,
        end.x, start.y,
        end.x, end.y
      ])

      let [ brightness, saturation, contrast ] = [0.0, 1.0, 1.0]
      if (stickerAdjustments) {
        if (typeof stickerAdjustments.brightness !== 'undefined') {
          brightness = stickerAdjustments.brightness
        }
        if (typeof stickerAdjustments.saturation !== 'undefined') {
          saturation = stickerAdjustments.saturation
        }
        if (typeof stickerAdjustments.contrast !== 'undefined') {
          contrast = stickerAdjustments.contrast
        }
      }
      const uniforms = {
        u_brightness: { type: 'f', value: brightness },
        u_saturation: { type: 'f', value: saturation },
        u_contrast: { type: 'f', value: contrast }
      }

      const textureSize = stickerDimensions.clone()
        .add(blurRadius * canvas.width * 2)

      const program = this._programs[renderer.id].adjustments
      renderer.runProgram(program, {
        inputTexture,
        outputTexture,
        outputFBO,
        textureSize,
        textureCoordinates,
        switchBuffer: false,
        clear: false,
        uniforms
      })

      this._lastTexture = outputTexture
      this._framebufferIndex++

      resolve()
    })
  }

  _renderFinal (renderer) {
    return new Promise((resolve, reject) => {
      renderer.runProgram(renderer.getDefaultProgram(), {
        switchBuffer: false
      })

      renderer.runProgram(renderer.getDefaultProgram(), {
        inputTexture: this._outputTexture,
        resizeTextures: false,
        clear: false,
        blend: 'normal'
      })
    })
  }

  _renderToOutput (renderer, image, sticker) {
    return new Promise((resolve, reject) => {
      if (!this._programs[renderer.id].default) {
        this._programs[renderer.id].default =
          renderer.setupGLSLProgram(this.vertexShader)
      }
      const canvas = renderer.getCanvas()
      const canvasDimensions = new Vector2(canvas.width, canvas.height)
      const program = this._programs[renderer.id].default
      const projectionMatrix = this._createProjectionMatrixForSticker(renderer, image, sticker)

      renderer.runProgram(program, {
        clear: false,
        inputTexture: this._lastTexture,
        outputTexture: this._outputTexture,
        outputFBO: this._outputFramebuffer,
        switchBuffer: false,
        resizeTextures: false,
        textureSize: canvasDimensions,
        blend: 'normal',
        uniforms: {
          u_projMatrix: { type: 'mat3fv', value: projectionMatrix }
        }
      })
      resolve()
    })
  }

  _applyBlur (renderer, image, sticker) {
    const stickerAdjustments = sticker.getAdjustments()

    return new Promise((resolve, reject) => {
      if (!(stickerAdjustments && stickerAdjustments.blur)) {
        return resolve()
      }

      const canvas = renderer.getCanvas()

      if (!this._programs[renderer.id].blur) {
        this._programs[renderer.id].blur =
          renderer.setupGLSLProgram(null, this.blurShader)
      }

      const textureSize = new Vector2(image.width, image.height)
        .multiply(sticker.getScale())

      textureSize.add(textureSize.clone().multiply(stickerAdjustments.blur))

      const uniforms = {
        delta: { type: '2f', value: [stickerAdjustments.blur * canvas.width, 0] },
        resolution: { type: 'f', value: textureSize.x }
      }

      const programOptions = {
        inputTexture: this._lastTexture,
        outputTexture: this._framebufferTextures[this._framebufferIndex % 2],
        outputFBO: this._framebuffers[this._framebufferIndex % 2],
        uniforms,
        textureSize,
        switchBuffer: false,
        clear: false
      }

      renderer.runProgram(this._programs[renderer.id].blur, programOptions)

      this._lastTexture = programOptions.outputTexture
      this._framebufferIndex++

      programOptions.outputTexture = this._framebufferTextures[this._framebufferIndex % 2]
      programOptions.outputFBO = this._framebuffers[this._framebufferIndex % 2]

      uniforms.delta.value = [0, stickerAdjustments.blur * canvas.width]

      programOptions.inputTexture = this._lastTexture
      renderer.runProgram(this._programs[renderer.id].blur, programOptions)

      this._lastTexture = programOptions.outputTexture
      this._framebufferIndex++

      resolve()
    })
  }

  /**
   * Renders the given sticker using WebGL
   * @param  {WebGLRenderer} renderer
   * @param  {Object} sticker
   * @private
   */
  _renderStickerWebGL (renderer, sticker) {
    const stickerName = sticker.getName()

    if (!(stickerName in this._stickers)) {
      return Promise.reject(new Error(`Unknown sticker "${stickerName}"`))
    }

    this._setupFrameBuffers(renderer)

    if (!this._programs[renderer.id]) {
      this._programs[renderer.id] = {}
    }

    let image
    return this._loadSticker(stickerName)
      .then((_image) => {
        this._lastTexture = null
        this._framebufferIndex = 0
        image = _image
        return this._uploadTexture(renderer, image, sticker)
      })
      .then((texture) => {
        return this._renderTexture(renderer, image, texture, sticker)
      })
      .then(() => {
        return this._applyBlur(renderer, image, sticker)
      })
      .then(() => {
        return this._renderToOutput(renderer, image, sticker)
      })
  }

  /**
   * Creates a projection matrix for the given sticker
   * @param  {WebGLRenderer} renderer
   * @param  {Image} image
   * @param  {Object} sticker
   * @return {Array}
   * @private
   */
  _createProjectionMatrixForSticker (renderer, image, sticker) {
    const canvas = renderer.getCanvas()

    // Projection matrix
    let projectionMatrix = new Matrix()
    projectionMatrix.a = 2 / canvas.width
    projectionMatrix.d = -2 / canvas.height
    projectionMatrix.tx = -1
    projectionMatrix.ty = 1

    // Scale matrix
    let scaleMatrix = new Matrix()
    const stickerScale = sticker.getScale()
    scaleMatrix.a = stickerScale.x * image.width * 0.5
    scaleMatrix.d = -stickerScale.y * image.height * 0.5

    // Translation matrix
    const stickerPosition = sticker.getPosition()
    let translationMatrix = new Matrix()
    translationMatrix.tx = stickerPosition.x * canvas.width
    translationMatrix.ty = stickerPosition.y * canvas.height

    // Rotation matrix
    const stickerRotation = sticker.getRotation()
    const c = Math.cos(stickerRotation * -1)
    const s = Math.sin(stickerRotation * -1)
    let rotationMatrix = new Matrix()
    rotationMatrix.a = c
    rotationMatrix.b = -s
    rotationMatrix.c = s
    rotationMatrix.d = c

    // Flip matrix
    let flipMatrix = new Matrix()
    flipMatrix.a = sticker.getFlipHorizontally() ? -1 : 1
    flipMatrix.d = sticker.getFlipVertically() ? -1 : 1

    let matrix = scaleMatrix.multiply(flipMatrix)
    matrix.multiply(rotationMatrix)
    matrix.multiply(translationMatrix)
    matrix.multiply(projectionMatrix)
    return matrix.toArray()
  }

  /**
   * Uploads the given image to the texture with the given id
   * @param  {WebGLRenderer} renderer
   * @param  {Image} image
   * @return {Promise}
   * @private
   */
  _uploadTexture (renderer, image) {
    return new Promise((resolve, reject) => {
      // Make sure we have a texture hash for the renderer
      if (!this._textures[renderer.id]) {
        this._textures[renderer.id] = {}
      }

      // If the texture has been loaded already, reuse it
      const cachedTexture = this._textures[renderer.id][image.src]
      if (cachedTexture) {
        return resolve(cachedTexture)
      }

      const texture = renderer.createTexture(image)
      this._textures[renderer.id][image.src] = texture
      resolve(texture)
    })
  }

  /**
   * Crops the image using Canvas2D
   * @param  {CanvasRenderer} renderer
   * @param  {Image} image
   * @private
   */
  _renderCanvas (renderer, image) {
    var canvas = renderer.getCanvas()
    var context = renderer.getContext()

    var canvasSize = new Vector2(canvas.width, canvas.height)
    var scaledPosition = this._options.position.clone()

    if (this._options.numberFormat === 'relative') {
      scaledPosition.multiply(canvasSize)
    }

    var size = new Vector2(image.width, image.height)
    if (typeof this._options.size !== 'undefined') {
      size.copy(this._options.size)

      if (this._options.numberFormat === 'relative') {
        size.multiply(canvasSize)
      }
    }

    context.drawImage(image,
      0, 0,
      image.width, image.height,
      scaledPosition.x, scaledPosition.y,
      size.x, size.y)
  }

  /**
   * Loads the sticker
   * @param  {String} sticker
   * @return {Promise}
   * @private
   */
  _loadSticker (sticker) {
    const isBrowser = typeof window !== 'undefined'
    const stickerPath = this._kit.getAssetPath(this._stickers[sticker])
    if (isBrowser) {
      return this._loadImageBrowser(stickerPath)
    } else {
      return this._loadImageNode(stickerPath)
    }
  }

  /**
   * Loads the given image using the browser's `Image` class
   * @param  {String} filePath
   * @return {Promise}
   * @private
   */
  _loadImageBrowser (filePath) {
    var self = this
    return new Promise((resolve, reject) => {
      // Return preloaded sticker if available
      if (self._loadedStickers[filePath]) {

        // Bug in native-promise only. Immediately resolving
        // the promise (synchronously) breaks rendering
        setTimeout(() => {
          resolve(self._loadedStickers[filePath])
        }, 1)
        return
      }

      var image = new Image()

      image.addEventListener('load', () => {
        self._loadedStickers[filePath] = image
        resolve(image)
      })
      image.addEventListener('error', () => {
        reject(new Error('Could not load sticker: ' + filePath))
      })

      image.crossOrigin = 'Anonymous'
      image.src = self._kit.getAssetPath(fileName)
    })
  }

  /**
   * Loads the given image using node.js' `fs` and node-canvas `Image`
   * @param  {String} filePath
   * @return {Promise}
   * @private
   */
  _loadImageNode (filePath) {
    var Canvas = require('canvas')
    var fs = require('fs')
    var image = new Canvas.Image()

    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, buffer) => {
        if (err) return reject(err)

        image.src = buffer
        resolve(image)
      })
    })
  }

  /**
   * Returns the sticker at the given position on the canvas
   * @param  {BaseRenderer} renderer
   * @param  {Vector2} position
   * @return {Object}
   */
  getStickerAtPosition (renderer, position) {
    const canvas = renderer.getCanvas()
    const canvasDimensions = new Vector2(canvas.width, canvas.height)

    let intersectingSticker = null
    this._options.stickers.slice(0).reverse()
      .forEach((sticker) => {
        if (intersectingSticker) return

        const stickerPosition = sticker.getPosition()
        const stickerRotation = sticker.getRotation()
        const stickerName = sticker.getName()
        const stickerScale = sticker.getScale()

        const absoluteStickerPosition = stickerPosition
          .clone()
          .multiply(canvasDimensions)
        const relativeClickPosition = position
          .clone()
          .subtract(absoluteStickerPosition)
        const clickDistance = relativeClickPosition.len()
        const radians = Math.atan2(
          relativeClickPosition.y,
          relativeClickPosition.x
        )
        const newRadians = radians - stickerRotation

        const x = Math.cos(newRadians) * clickDistance
        const y = Math.sin(newRadians) * clickDistance

        const stickerPath = this._kit.getAssetPath(this._stickers[stickerName])
        const stickerTexture = this._loadedStickers[stickerPath]
        const stickerDimensions = new Vector2(
            stickerTexture.width,
            stickerTexture.height
          )
          .multiply(stickerScale)

        if (x > -0.5 * stickerDimensions.x &&
            x < 0.5 * stickerDimensions.x &&
            y > -0.5 * stickerDimensions.y &&
            y < 0.5 * stickerDimensions.y) {
          intersectingSticker = sticker
        }

      })
    return intersectingSticker
  }

  getAvailableStickers () { return this._stickers }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
StickersOperation.identifier = 'stickers'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
StickersOperation.prototype.availableOptions = {
  stickers: {
    type: 'array', default: [],
    setter: function (stickers) {
      stickers = stickers.map((sticker) => {
        if (sticker instanceof Sticker) return sticker
        return new Sticker(this, sticker)
      })
      return stickers
    }
  }
}

export default StickersOperation
