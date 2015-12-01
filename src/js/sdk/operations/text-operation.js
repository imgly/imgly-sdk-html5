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

    this.vertexShader = require('raw!./generic/sprite.vert')
  }

  /**
   * Returns a serialized version of the given option
   * @param {String} optionName
   * @return {*} optionName
   * @private
   */
  _serializeOption (optionName) {
    // Since `texts` is an array of configurables, we need
    // to serialize them as well
    if (optionName === 'texts') {
      return this._options.texts.map((sticker) => {
        return sticker.serializeOptions()
      })
    }
    return super._serializeOption(optionName)
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when this operation has been marked as dirty
   * @protected
   */
  _onDirty () {
    this._textures = []
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

    translationMatrix.tx += scaleMatrix.a - scaleMatrix.a * 2 * textAnchor.x
    translationMatrix.ty -= scaleMatrix.d - scaleMatrix.d * 2 * textAnchor.y

    // Rotation matrix
    const c = Math.cos(textRotation * -1)
    const s = Math.sin(textRotation * -1)
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
    return new Promise((resolve, reject) => {
      const texts = this._options.texts
      texts.forEach((text) => {
        this._renderTextCanvas(renderer, text)
      })
      resolve()
    })
  }

  /**
   * Renders the given text using canvas2d
   * @param  {CanvasRenderer} renderer
   * @param  {String} text
   * @return {Promise}
   * @private
   */
  _renderTextCanvas (renderer, text) {
    let canvas = null
    return text.render(renderer)
      .then((_canvas) => {
        canvas = _canvas
        return this._renderTextToCanvas(renderer, text, canvas)
      })
  }

  /**
   * Renders the given text to the output canvas
   * @param  {CanvasRenderer} renderer
   * @param  {String} text
   * @param  {CanvasElement} canvas
   * @return {Promise}
   * @private
   */
  _renderTextToCanvas (renderer, text, canvas) {
    const outputCanvas = renderer.getCanvas()
    const context = renderer.getContext()

    const canvasDimensions = new Vector2(
      outputCanvas.width,
      outputCanvas.height
    )

    return new Promise((resolve, reject) => {
      const textPosition = text.getPosition()
      const textRotation = text.getRotation()
      const textAnchor = text.getAnchor()

      const textDimensions = new Vector2(
        canvas.width,
        canvas.height
      )

      const absoluteTextPosition = textPosition.clone()
        .multiply(canvasDimensions)
      const absoluteTextAnchor = textAnchor.clone()
        .multiply(textDimensions)

      context.save()

      context.translate(
        absoluteTextPosition.x,
        absoluteTextPosition.y
      )
      context.rotate(textRotation)

      context.drawImage(canvas,
        -absoluteTextAnchor.x,
        -absoluteTextAnchor.y)

      context.restore()

      resolve()
    })
  }

  /**
   * Returns the text object at the given position on the canvas
   * @param  {BaseRenderer} renderer
   * @param  {Vector2} position
   * @return {Text}
   */
  getTextAtPosition (renderer, position) {
    const canvas = renderer.getCanvas()
    const canvasDimensions = new Vector2(canvas.width, canvas.height)

    let intersectingText = null
    this._options.texts.slice(0).reverse()
      .forEach((text) => {
        if (intersectingText) return

        const absoluteTextPosition = text.getPosition()
          .clone()
          .multiply(canvasDimensions)
        const relativeClickPosition = position
          .clone()
          .subtract(absoluteTextPosition)
        const clickDistance = relativeClickPosition.len()
        const radians = Math.atan2(
          relativeClickPosition.y,
          relativeClickPosition.x
        )
        const newRadians = radians - text.getRotation()

        const x = Math.cos(newRadians) * clickDistance
        const y = Math.sin(newRadians) * clickDistance

        const textDimensions = text.getBoundingBox(renderer)

        if (x > -0.5 * textDimensions.x &&
            x < 0.5 * textDimensions.x &&
            y > 0 &&
            y < textDimensions.y) {
          intersectingText = text
        }

      })
    return intersectingText
  }

  /**
   * Sets this operation to dirty, so that it will re-render next time
   * @param {Boolean} dirty = true
   */
  setDirty (dirty) {
    super.setDirty(dirty)
    if (dirty) {
      const texts = this.getTexts()
      texts.forEach((text) => text.setDirty(true))
    }
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
      texts = texts.map((text, i) => {
        if (text instanceof Text) return text

        // Update texts if they already exist
        if (this._options.texts[i]) {
          this._options.texts[i].set(text)
          return this._options.texts[i]
        }

        return new Text(this, text)
      })
      return texts
    }
  }
}

export default TextOperation
