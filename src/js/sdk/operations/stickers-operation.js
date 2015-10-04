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

    this.vertexShader = require('raw!./stickers/stickers.vert')
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
    const stickers = this._options.stickers
    const promises = stickers.map((sticker) => {
      return this._renderStickerWebGL(renderer, sticker)
    })
    return Promise.all(promises)
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
    if (!this._programs[renderer.id].adjustments) {
      this._programs[renderer.id].adjustments =
        renderer.setupGLSLProgram(null, this.adjustmentsShader)
    }

    const canvas = renderer.getCanvas()

    const inputTexture = texture
    const outputTexture = this._framebufferTextures[this._framebufferIndex % 2]
    const outputFBO = this._framebuffers[this._framebufferIndex % 2]

    const blurRadius = (sticker.adjustments && sticker.adjustments.blur) || 0

    const stickerDimensions = new Vector2(image.width, image.height)
      .multiply(sticker.scale)

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

    console.log('stickerDimensions', stickerDimensions.toString())

    const textureSize = stickerDimensions.clone()
      .add(blurRadius * canvas.width * 2)

    console.log('textureSize', textureSize.toString())

    const program = this._programs[renderer.id].adjustments
    renderer.runProgram(program, {
      inputTexture,
      outputTexture,
      outputFBO,
      textureSize,
      textureCoordinates,
      switchBuffer: false,
      clear: false
    })

    this._lastTexture = outputTexture
    this._framebufferIndex++
  }

  _renderFinal (renderer, image, sticker) {
    if (!this._programs[renderer.id].default) {
      this._programs[renderer.id].default =
        renderer.setupGLSLProgram(this.vertexShader)
    }

    const program = this._programs[renderer.id].default
    const projectionMatrix = this._createProjectionMatrixForSticker(renderer, image, sticker)

    renderer.runProgram(renderer.getDefaultProgram(), {
      clear: false,
      switchBuffer: false
    })

    renderer.runProgram(program, {
      clear: false,
      inputTexture: this._lastTexture,
      resizeTextures: false,
      blend: 'normal',
      uniforms: {
        u_projMatrix: { type: 'mat3fv', value: projectionMatrix }
      }
    })
  }

  _applyBlur (renderer, image, sticker) {
    if (!(sticker.adjustments && sticker.adjustments.blur)) {
      return
    }

    const canvas = renderer.getCanvas()

    if (!this._programs[renderer.id].blur) {
      this._programs[renderer.id].blur =
        renderer.setupGLSLProgram(null, this.blurShader)
    }

    const textureSize = new Vector2(image.width, image.height)
      .multiply(sticker.scale)

    textureSize.add(textureSize.clone().multiply(sticker.adjustments.blur))

    const uniforms = {
      delta: { type: '2f', value: [sticker.adjustments.blur * canvas.width, 0] },
      resolution: { type: 'f', value: textureSize.x }
    }

    console.log((sticker.adjustments.blur * canvas.width) / textureSize.x)

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

    uniforms.delta.value = [0, sticker.adjustments.blur * canvas.width]

    programOptions.inputTexture = this._lastTexture
    renderer.runProgram(this._programs[renderer.id].blur, programOptions)

    this._lastTexture = programOptions.outputTexture
    this._framebufferIndex++
  }

  /**
   * Renders the given sticker using WebGL
   * @param  {WebGLRenderer} renderer
   * @param  {Object} sticker
   * @private
   */
  _renderStickerWebGL (renderer, sticker) {
    if (!(sticker.name in this._stickers)) {
      return Promise.reject(new Error(`Unknown sticker "${sticker.name}"`))
    }

    this._setupFrameBuffers(renderer)

    if (!this._programs[renderer.id]) {
      this._programs[renderer.id] = {}
    }

    let image
    return this._loadSticker(sticker.name)
      .then((_image) => {
        image = _image
        return this._uploadTexture(renderer, image, sticker)
      })
      .then((texture) => {
        this._renderTexture(renderer, image, texture, sticker)
      })
      .then(() => {
        return this._applyBlur(renderer, image, sticker)
      })
      .then(() => {
        this._renderFinal(renderer, image, sticker)
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
    scaleMatrix.a = sticker.scale.x * image.width * 0.5
    scaleMatrix.d = -sticker.scale.y * image.height * 0.5

    // Translation matrix
    let translationMatrix = new Matrix()
    translationMatrix.tx = sticker.position.x * canvas.width
    translationMatrix.ty = sticker.position.y * canvas.height

    // Rotation matrix
    const c = Math.cos(sticker.rotation * -1)
    const s = Math.sin(sticker.rotation * -1)
    let rotationMatrix = new Matrix()
    rotationMatrix.a = c
    rotationMatrix.b = -s
    rotationMatrix.c = s
    rotationMatrix.d = c

    let matrix = scaleMatrix.multiply(rotationMatrix)
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
        return resolve(self._loadedStickers[filePath])
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

        const absoluteStickerPosition = sticker.position
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
        const newRadians = radians - sticker.rotation

        const x = Math.cos(newRadians) * clickDistance
        const y = Math.sin(newRadians) * clickDistance

        const stickerPath = this._kit.getAssetPath(this._stickers[sticker.name])
        const stickerTexture = this._loadedStickers[stickerPath]
        const stickerDimensions = new Vector2(
            stickerTexture.width,
            stickerTexture.height
          )
          .multiply(sticker.scale)

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
  stickers: { type: 'array', default: [] }
}

export default StickersOperation
