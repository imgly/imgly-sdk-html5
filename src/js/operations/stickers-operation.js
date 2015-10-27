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

    /**
     * The texture index used for the sticker
     * @type {Number}
     * @private
     */
    this._textureIndex = 1

    /**
     * The fragment shader used for this operation
     */
    this._fragmentShader = `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform sampler2D u_image;
      uniform sampler2D u_stickerImage;
      uniform vec2 u_position;
      uniform vec2 u_size;

      void main() {
        vec4 color0 = texture2D(u_image, v_texCoord);
        vec2 relative = (v_texCoord - u_position) / u_size;

        if (relative.x >= 0.0 && relative.x <= 1.0 &&
          relative.y >= 0.0 && relative.y <= 1.0) {

            vec4 color1 = texture2D(u_stickerImage, relative);

            // GL_SOURCE_ALPHA, GL_ONE_MINUS_SOURCE_ALPHA
            gl_FragColor = color1 + color0 * (1.0 - color1.a);

        } else {

          gl_FragColor = color0;

        }
      }
    `

    this._loadedStickers = {}
  }

  /**
   * Applies this operation
   * @param  {Renderer} renderer
   * @return {Promise}
   * @abstract
   */
  render (renderer) {
    var self = this
    return this._loadSticker()
      .then(function (image) {
        if (renderer.identifier === 'webgl') {
          /* istanbul ignore next */
          return self._renderWebGL(renderer, image)
        } else {
          return self._renderCanvas(renderer, image)
        }
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
    var canvas = renderer.getCanvas()
    var gl = renderer.getContext()

    var position = this._options.position.clone()
    var canvasSize = new Vector2(canvas.width, canvas.height)

    if (this._options.numberFormat === 'absolute') {
      position.divide(canvasSize)
    }

    var size = new Vector2(image.width, image.height)
    if (typeof this._options.size !== 'undefined') {
      size.copy(this._options.size)

      if (this._options.numberFormat === 'relative') {
        size.multiply(canvasSize)
      }

      // Calculate image ratio, scale by width
      let ratio = image.height / image.width
      size.y = size.x * ratio
    }
    size.divide(canvasSize)

    position.y = 1 - position.y // Invert y
    position.y -= size.y // Fix y

    // Upload the texture
    gl.activeTexture(gl.TEXTURE0 + this._textureIndex)
    this._texture = gl.createTexture()

    gl.bindTexture(gl.TEXTURE_2D, this._texture)

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    // Set premultiplied alpha
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    gl.activeTexture(gl.TEXTURE0)

    // Execute the shader
    renderer.runShader(null, this._fragmentShader, {
      uniforms: {
        u_stickerImage: { type: 'i', value: this._textureIndex },
        u_position: { type: '2f', value: [position.x, position.y] },
        u_size: { type: '2f', value: [size.x, size.y] }
      }
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
   * @return {Promise}
   * @private
   */
  _loadSticker () {
    var isBrowser = typeof window !== 'undefined'
    if (isBrowser) {
      return this._loadImageBrowser(this._options.sticker)
    } else {
      return this._loadImageNode(this._options.sticker)
    }
  }

  /**
   * Loads the given image using the browser's `Image` class
   * @param  {String} fileName
   * @return {Promise}
   * @private
   */
  _loadImageBrowser (fileName) {
    var self = this
    return new Promise((resolve, reject) => {
      // Return preloaded sticker if available
      if (self._loadedStickers[fileName]) {
        return resolve(self._loadedStickers[fileName])
      }

      var image = new Image()

      image.addEventListener('load', () => {
        self._loadedStickers[fileName] = image
        resolve(image)
      })
      image.addEventListener('error', () => {
        reject(new Error('Could not load sticker: ' + fileName))
      })

      image.crossOrigin = 'Anonymous'
      image.src = self._kit.getAssetPath(fileName)
    })
  }

  /**
   * Loads the given image using node.js' `fs` and node-canvas `Image`
   * @param  {String} fileName
   * @return {Promise}
   * @private
   */
  _loadImageNode (fileName) {
    var Canvas = require('canvas')
    var fs = require('fs')

    var self = this
    var image = new Canvas.Image()
    var path = self._kit.getAssetPath(fileName)

    return new Promise((resolve, reject) => {
      fs.readFile(path, (err, buffer) => {
        if (err) return reject(err)

        image.src = buffer
        resolve(image)
      })
    })
  }

  /**
   * The registered stickers
   * @type {Object.<String,String>}
   */
  get stickers () {
    return this._stickers
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
StickersOperation.prototype.identifier = 'stickers'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
StickersOperation.prototype.availableOptions = {
  sticker: { type: 'string', required: true },
  position: { type: 'vector2', default: new Vector2(0, 0) },
  size: { type: 'vector2', default: new Vector2(0, 0) }
}

export default StickersOperation
