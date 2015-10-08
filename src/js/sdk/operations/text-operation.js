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
import Text from './text/text'
import Promise from '../vendor/promise'

/**
 * An operation that can draw text on the canvas
 *
 * @class
 * @alias ImglyKit.Operations.TextOperation
 * @extends ImglyKit.Operation
 */
class TextOperation extends Operation {
  constructor (...args) {
    super(...args)

    this._programs = {}
    this._textures = []

    this.vertexShader = require('raw!./text/text.vert')
  }

  // -------------------------------------------------------------------------- TEXT CREATION

  /**
   * Creates a new text object and returns it
   * @param  {Object} options
   * @return {Text}
   */
  createText (options) {
    return new Text(this, options)
  }

  // -------------------------------------------------------------------------- CALCULATIONS

  /**
   * Creates a projection matrix for the given text
   * @param  {WebGLRenderer} renderer
   * @param  {Text} text
   * @param  {CanvasElement} canvas
   * @param  {WebGLTexture} texture
   * @return {[type]}          [description]
   */
  _createProjectionMatrixForText (renderer, text, canvas) {
    const outputCanvas = renderer.getCanvas()
    const textPosition = text.getPosition()
    const textRotation = text.getRotation()
    const textAnchor = text.getAnchor()

    // Projection matrix
    let projectionMatrix = new Matrix()
    projectionMatrix.a = 2 / outputCanvas.width
    projectionMatrix.d = -2 / outputCanvas.height
    projectionMatrix.tx = -1
    projectionMatrix.ty = 1

    // Scale matrix
    let scaleMatrix = new Matrix()
    scaleMatrix.a = canvas.width * 0.5
    scaleMatrix.d = -canvas.height * 0.5

    // Translation matrix
    let translationMatrix = new Matrix()
    translationMatrix.tx = textPosition.x * outputCanvas.width
    translationMatrix.ty = textPosition.y * outputCanvas.height

    // Anchor translation matrix
    let anchorTranslationMatrix = new Matrix()
    anchorTranslationMatrix.tx = canvas.width / 2 - canvas.width * textAnchor.x
    anchorTranslationMatrix.ty = canvas.height / 2 - canvas.height * textAnchor.y

    // Rotation matrix
    const c = Math.cos(textRotation * -1)
    const s = Math.sin(textRotation * -1)
    let rotationMatrix = new Matrix()
    rotationMatrix.a = c
    rotationMatrix.b = -s
    rotationMatrix.c = s
    rotationMatrix.d = c

    let matrix = scaleMatrix.multiply(anchorTranslationMatrix)
    matrix.multiply(rotationMatrix)
    matrix.multiply(translationMatrix)
    matrix.multiply(projectionMatrix)
    return matrix.toArray()
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Crops this image using WebGL
   * @param  {WebGLRenderer} renderer
   */
  /* istanbul ignore next */
  _renderWebGL (renderer) {
    // Setup output buffer
    if (!this._outputTexture) {
      const { texture, fbo } = renderer.createFramebuffer()
      this._outputTexture = texture
      this._outputFramebuffer = fbo
    }

    // Resize output to match canvas dimensions
    const canvas = renderer.getCanvas()
    const canvasDimensions = new Vector2(canvas.width, canvas.height)
    renderer.resizeTexture(this._outputTexture, canvasDimensions)

    // Render
    const texts = this._options.texts
    const promises = texts.map((text) => {
      return text.validateSettings()
        .then(() => {
          return this._renderTextWebGL(renderer, text)
        })
    })
    return Promise.all(promises)
      .then(() => {
        return this._renderFinal(renderer)
      })
  }

  /**
   * Renders the given text using WebGL
   * @param  {WebGLRenderer} renderer
   * @param  {Text} text
   * @return {Promise}
   */
  _renderTextWebGL (renderer, text) {
    let canvas = null
    return text.render(renderer)
      .then((_canvas) => {
        canvas = _canvas
        return this._uploadTexture(renderer, text, canvas)
      })
      .then((texture) => {
        return this._renderToOutput(renderer, text, canvas, texture)
      })
  }

  /**
   * Uploads the given image to the texture with the given id
   * @param  {WebGLRenderer} renderer
   * @param  {Text} text
   * @param  {Image} image
   * @return {Promise}
   * @private
   */
  _uploadTexture (renderer, text, image) {
    return new Promise((resolve, reject) => {
      // Make sure we have a texture hash for the renderer
      if (!this._textures[renderer.id]) {
        this._textures[renderer.id] = {}
      }

      // If the texture has been loaded already, reuse it
      const cachedTexture = this._textures[renderer.id][text.id]
      if (cachedTexture) {
        return resolve(cachedTexture)
      }

      const texture = renderer.createTexture(image)
      this._textures[renderer.id][text.id] = texture
      resolve(texture)
    })
  }

  /**
   * Renders the given texture to the output texture
   * @param  {WebGLRenderer} renderer
   * @param  {Text} text
   * @param  {CanvasElement} canvas
   * @param  {WebGLTexture} texture
   * @return {Promise}
   * @private
   */
  _renderToOutput (renderer, text, canvas, texture) {
    return new Promise((resolve, reject) => {
      if (!this._programs[renderer.id]) {
        this._programs[renderer.id] =
          renderer.setupGLSLProgram(this.vertexShader)
      }

      const outputCanvas = renderer.getCanvas()
      const canvasDimensions = new Vector2(outputCanvas.width, outputCanvas.height)
      const program = this._programs[renderer.id]
      const projectionMatrix = this._createProjectionMatrixForText(renderer, text, canvas)

      renderer.runProgram(program, {
        inputTexture: texture,
        outputTexture: this._outputTexture,
        outputFBO: this._outputFramebuffer,
        textureSize: canvasDimensions,
        resizeTextures: false,
        switchBuffer: false,
        clear: false,
        blend: 'normal',
        uniforms: {
          u_projMatrix: { type: 'mat3fv', value: projectionMatrix }
        }
      })

      resolve()
    })
  }

  /**
   * Renders the output texture to the output canvas
   * @param  {WebGLRenderer} renderer
   * @return {Promise}
   * @private
   */
  _renderFinal (renderer) {
    return new Promise((resolve, reject) => {
      // Render last texture to current FBO
      renderer.runProgram(renderer.getDefaultProgram(), {
        switchBuffer: false
      })

      // Render this operation's texture to current FBO
      renderer.runProgram(renderer.getDefaultProgram(), {
        inputTexture: this._outputTexture,
        resizeTextures: false,
        clear: false,
        blend: 'normal'
      })
      resolve()
    })
  }

  /**
   * Crops the image using Canvas2D
   * @param  {CanvasRenderer} renderer
   */
  _renderCanvas (renderer) {
    var textCanvas = this._renderTextCanvas(renderer)

    var canvas = renderer.getCanvas()
    var context = renderer.getContext()

    var canvasSize = new Vector2(canvas.width, canvas.height)
    var scaledPosition = this._options.position.clone()

    if (this._options.numberFormat === 'relative') {
      scaledPosition.multiply(canvasSize)
    }

    // Adjust vertical alignment
    if (this._options.verticalAlignment === 'center') {
      scaledPosition.y -= textCanvas.height / 2
    } else if (this._options.verticalAlignment === 'bottom') {
      scaledPosition.y -= textCanvas.height
    }

    // Adjust horizontal alignment
    if (this._options.alignment === 'center') {
      scaledPosition.x -= textCanvas.width / 2
    } else if (this._options.alignment === 'right') {
      scaledPosition.x -= textCanvas.width
    }

    context.drawImage(textCanvas, scaledPosition.x, scaledPosition.y)
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
TextOperation.identifier = 'text'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
TextOperation.prototype.availableOptions = {
  texts: {
    type: 'array', default: [],
    setter: function (texts) {
      texts = texts.map((text) => {
        return new Text(this, text)
      })
      return texts
    }
  }
}

export default TextOperation
