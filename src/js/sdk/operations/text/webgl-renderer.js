/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Vector2 from '../../lib/math/vector2'
import Matrix from '../../lib/math/matrix'

export default class TextWebGLRenderer {
  constructor (operation, renderer) {
    this._operation = operation
    this._renderer = renderer

    this._programs = {}
    this._textures = {}

    this.vertexShader = require('raw!../generic/sprite.vert')
  }

  // -------------------------------------------------------------------------- RESET

  /**
   * Resets all textures
   */
  reset () {
    this._textures = {}
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the given text using WebGL
   * @param  {Text} text
   * @return {Promise}
   */
  _renderText (text) {
    let canvas = null
    return text.render(this._renderer)
      .then((_canvas) => {
        canvas = _canvas
        return this._uploadTexture(text, canvas)
      })
      .then((texture) => {
        return this._renderToOutput(text, canvas, texture)
      })
  }

  /**
   * Uploads the given image to the texture with the given id
   * @param  {Text} text
   * @param  {Image} image
   * @return {Promise}
   * @private
   */
  _uploadTexture (text, image) {
    return new Promise((resolve, reject) => {
      // If the texture has been loaded already, reuse it
      const cachedTexture = this._textures[text.id]
      if (cachedTexture) {
        return resolve(cachedTexture)
      }

      const texture = this._renderer.createTexture(image)
      this._textures[text.id] = texture
      resolve(texture)
    })
  }

  /**
   * Renders the given texture to the output texture
   * @param  {Text} text
   * @param  {CanvasElement} canvas
   * @param  {WebGLTexture} texture
   * @return {Promise}
   * @private
   */
  _renderToOutput (text, canvas, texture) {
    return new Promise((resolve, reject) => {
      this._program = this._renderer.setupGLSLProgram(this.vertexShader)

      const outputCanvas = this._renderer.getCanvas()
      const canvasDimensions = new Vector2(outputCanvas.width, outputCanvas.height)
      const projectionMatrix = this._createProjectionMatrixForText(text, canvas)

      this._renderer.runProgram(this._program, {
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
   * @return {Promise}
   * @private
   */
  _renderFinal () {
    return new Promise((resolve, reject) => {
      // Render last texture to current FBO
      this._renderer.runProgram(this._renderer.getDefaultProgram(), {
        switchBuffer: false
      })

      // Render this operation's texture to current FBO
      this._renderer.runProgram(this._renderer.getDefaultProgram(), {
        inputTexture: this._outputTexture,
        resizeTextures: false,
        clear: false,
        blend: 'normal'
      })
      resolve()
    })
  }

  /**
   * Renders the text operation
   * @return {Promise}
   */
  render () {
    // Setup output buffer
    if (!this._outputTexture) {
      const { texture, fbo } = this._renderer.createFramebuffer()
      this._outputTexture = texture
      this._outputFramebuffer = fbo
    }

    // Resize output to match canvas dimensions
    const canvas = this._renderer.getCanvas()
    const canvasDimensions = new Vector2(canvas.width, canvas.height)
    this._renderer.resizeTexture(this._outputTexture, canvasDimensions)

    // Render
    const texts = this._operation.getTexts()
    const promises = texts.map((text) => {
      return text.validateSettings()
        .then(() => {
          return this._renderText(text)
        })
    })
    return Promise.all(promises)
      .then(() => {
        return this._renderFinal()
      })
  }

  // -------------------------------------------------------------------------- CALCULATIONS

  /**
   * Creates a projection matrix for the given text
   * @param  {Text} text
   * @param  {CanvasElement} canvas
   * @param  {WebGLTexture} texture
   * @return {Matrix}
   */
  _createProjectionMatrixForText (text, canvas) {
    const outputCanvas = this._renderer.getCanvas()
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
}
