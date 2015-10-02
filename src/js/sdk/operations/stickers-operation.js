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

    this._programs = {}
    this._textures = {}
    this._loadedStickers = {}

    /**
     * The vertex shader used for this operation
     */
    this.vertexShader = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      uniform mat3 u_projMatrix;

      void main() {
        gl_Position = vec4((u_projMatrix * vec3(a_position, 1)).xy, 0, 1);
        v_texCoord = a_texCoord;
      }
    `

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
      this._stickers[name] = `stickers/sticker-${name}.png`
    })
  }

  /**
   * Crops this image using WebGL
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

    // // Execute the shader
    // renderer.runShader(null, this._fragmentShader, {
    //   uniforms: {
    //     u_stickerImage: { type: 'i', value: this._textureIndex },
    //     u_position: { type: '2f', value: [position.x, position.y] },
    //     u_size: { type: '2f', value: [size.x, size.y] }
    //   }
    // })
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

    let program = this._programs[renderer.id]
    if (!program) {
      program = renderer.setupGLSLProgram(this.vertexShader)
      this._programs[renderer.id] = program
    }

    let image = null
    return this._loadSticker(sticker.name)
      .then((stickerImage) => {
        image = stickerImage
        return this._uploadTexture(renderer, stickerImage)
      })
      .then((texture) => {
        const projectionMatrix = this._createProjectionMatrixForSticker(renderer, image, sticker)
        const vectorCoordinates = this._createVectorCoordinatesForSticker(renderer, image, sticker)

        renderer.runProgram(renderer.getDefaultProgram(), {
          clear: false,
          switchBuffer: false
        })
        // return
        renderer.runProgram(program, {
          clear: false,
          inputTexture: texture,
          resizeTextures: false,
          blend: 'normal',
          // vectorCoordinates,
          uniforms: {
            u_projMatrix: { type: 'mat3fv', value: projectionMatrix }
          }
        })
      })
  }

  /**
   * Creates the vector coordinates for the given sticker
   * @param  {WebGLRenderer} renderer
   * @param  {Image} image
   * @param  {Object} sticker
   * @return {Float32Array}
   * @private
   */
  _createVectorCoordinatesForSticker (renderer, image, sticker) {
    return new Float32Array([
      // First triangle
      -0.5, -0.5,
      0.5, -0.5,
      -0.5, 0.5,

      // Second triangle
      -0.5, 0.5,
      0.5, -0.5,
      0.5, 0.5
    ])
  }

  /**
   * Creates a projection matrix for the given sticker
   * @param  {WebGLRenderer} renderer
   * @param  {Image} image
   * @param  {Objet} sticker
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

  getStickers () { return this._stickers }
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
  stickers: { type: 'array' }
}

export default StickersOperation
