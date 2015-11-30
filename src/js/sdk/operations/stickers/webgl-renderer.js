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

export default class StickersWebGLRenderer {
  constructor (operation, renderer) {
    this._operation = operation
    this._renderer = renderer

    this._framebuffers = []
    this._framebufferTextures = []
    this._framebufferIndex = 0

    this._programs = {}
    this._textures = {}

    this._vertexShader = require('raw!../../shaders/sprite.vert')
    this._adjustmentsShader = require('raw!../../shaders/adjustments.frag')
    this._blurShader = require('raw!../../shaders/blur.frag')
  }

  /**
   * Renders the stickers operation using WebGL
   * @return {Promise}
   */
  render () {
    const canvas = this._renderer.getCanvas()
    const canvasDimensions = new Vector2(canvas.width, canvas.height)
    if (!this._outputTexture) {
      const { texture, fbo } = this._renderer.createFramebuffer()
      this._outputTexture = texture
      this._outputFramebuffer = fbo
    }

    this._renderer.resizeTexture(this._outputTexture, canvasDimensions)

    const stickers = this._operation.getStickers()
    let promise = Promise.resolve()
    stickers.forEach((sticker) => {
      promise = promise.then(() => {
        return this._renderSticker(sticker)
      })
    })
    return promise
      .then(() => {
        this._renderFinal()
      })
  }

  /**
   * Renders the given sticker using WebGL
   * @param  {Object} sticker
   * @private
   */
  _renderSticker (sticker) {
    this._setupFrameBuffers()

    const image = sticker.getImage()
    this._lastTexture = null
    this._framebufferIndex = 0
    return this._uploadTexture(image, sticker)
      .then((texture) => {
        return this._renderTexture(image, texture, sticker)
      })
      .then(() => {
        return this._applyBlur(image, sticker)
      })
      .then(() => {
        return this._renderToOutput(image, sticker)
      })
  }

  /**
   * Uploads the given image to a texture
   * @param  {Image} image
   * @return {Promise}
   * @private
   */
  _uploadTexture (image) {
    if (!this._textures[this._renderer.id]) {
      this._textures[this._renderer.id] = {}
    }

    return new Promise((resolve, reject) => {
      // If the texture has been loaded already, reuse it
      const cachedTexture = this._textures[this._renderer.id][image.src]
      if (cachedTexture) {
        return resolve(cachedTexture)
      }

      const texture = this._renderer.createTexture(image)
      this._textures[this._renderer.id][image.src] = texture
      resolve(texture)
    })
  }

  /**
   * Creates the framebuffers and textures for rendering
   * @private
   */
  _setupFrameBuffers () {
    for (let i = 0; i < 2; i++) {
      const { fbo, texture } = this._renderer.createFramebuffer()
      this._framebuffers.push(fbo)
      this._framebufferTextures.push(texture)
    }
  }

  /**
   * Renders the given texture to the next FBO
   * @param  {Image} image
   * @param  {WebGLTexture} texture
   * @param  {Sticker} sticker
   * @return {Promise}
   * @private
   */
  _renderTexture (image, texture, sticker) {
    return new Promise((resolve, reject) => {
      if (!this._programs.adjustments) {
        this._programs.adjustments =
          this._renderer.setupGLSLProgram(null, this._adjustmentsShader)
      }

      const stickerAdjustments = sticker.getAdjustments()
      const stickerScale = sticker.getScale()

      const canvas = this._renderer.getCanvas()

      const inputTexture = texture
      const outputTexture = this._framebufferTextures[this._framebufferIndex % 2]
      const outputFBO = this._framebuffers[this._framebufferIndex % 2]

      const blurRadius = stickerAdjustments.getBlur()

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

      const uniforms = {
        u_brightness: { type: 'f', value: stickerAdjustments.getBrightness() },
        u_saturation: { type: 'f', value: stickerAdjustments.getSaturation() },
        u_contrast: { type: 'f', value: stickerAdjustments.getContrast() }
      }

      const textureSize = stickerDimensions.clone()
        .add(blurRadius * canvas.width * 2)

      const program = this._programs.adjustments
      this._renderer.runProgram(program, {
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

  /**
   * Applies the blur for the given sticker
   * @param  {Image} image
   * @param  {Sticker} sticker
   * @return {Promise}
   * @private
   */
  _applyBlur (image, sticker) {
    const stickerAdjustments = sticker.getAdjustments()

    return new Promise((resolve, reject) => {
      const stickerBlur = stickerAdjustments.getBlur()
      if (!stickerBlur) {
        return resolve()
      }

      if (!this._programs.blur) {
        this._programs.blur =
          this._renderer.setupGLSLProgram(null, this._blurShader)
      }

      const textureSize = new Vector2(image.width, image.height)
        .multiply(sticker.getScale())

      textureSize.add(textureSize.clone().multiply(stickerBlur))

      const canvas = this._renderer.getCanvas()
      const blurWidth = (stickerBlur * canvas.width / textureSize.x) / 4
      const uniforms = {
        delta: { type: '2f', value: [blurWidth, 0] }
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

      this._renderer.runProgram(this._programs.blur, programOptions)

      this._lastTexture = programOptions.outputTexture
      this._framebufferIndex++

      programOptions.outputTexture = this._framebufferTextures[this._framebufferIndex % 2]
      programOptions.outputFBO = this._framebuffers[this._framebufferIndex % 2]

      uniforms.delta.value = [0, blurWidth]

      programOptions.inputTexture = this._lastTexture
      this._renderer.runProgram(this._programs.blur, programOptions)

      this._lastTexture = programOptions.outputTexture
      this._framebufferIndex++

      resolve()
    })
  }

  /**
   * Renders the sticker to the current FBO
   * @param  {Image} image
   * @param  {Sticker} sticker
   * @return {Promise}
   * @private
   */
  _renderToOutput (image, sticker) {
    return new Promise((resolve, reject) => {
      if (!this._programs.default) {
        this._programs.default =
          this._renderer.setupGLSLProgram(this._vertexShader)
      }
      const canvas = this._renderer.getCanvas()
      const canvasDimensions = new Vector2(canvas.width, canvas.height)
      const program = this._programs.default
      const projectionMatrix = this._createProjectionMatrixForSticker(image, sticker)

      this._renderer.runProgram(program, {
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

  /**
   * Renders the output texture to the renderer
   * @return {Promise}
   * @private
   */
  _renderFinal () {
    return new Promise((resolve, reject) => {
      this._renderer.runProgram(this._renderer.getDefaultProgram(), {
        switchBuffer: false
      })

      this._renderer.runProgram(this._renderer.getDefaultProgram(), {
        inputTexture: this._outputTexture,
        resizeTextures: false,
        clear: false,
        blend: 'normal'
      })
    })
  }

  /**
   * Creates a projection matrix for the given sticker
   * @param  {Image} image
   * @param  {Object} sticker
   * @return {Array}
   * @private
   */
  _createProjectionMatrixForSticker (image, sticker) {
    const canvas = this._renderer.getCanvas()
    const blurRadius = sticker.getAdjustments().getBlur()
    const parentScale = this._renderer.getScale()

    // Projection matrix
    let projectionMatrix = new Matrix()
    projectionMatrix.a = 2 / canvas.width
    projectionMatrix.d = -2 / canvas.height
    projectionMatrix.tx = -1
    projectionMatrix.ty = 1

    // Scale matrix
    let scaleMatrix = new Matrix()
    const stickerScale = sticker.getScale()
    const additionalBlurScale = (1 + (blurRadius * canvas.width / image.width) * 2)
    scaleMatrix.a = stickerScale.x * image.width * 0.5
    scaleMatrix.d = -stickerScale.y * image.height * 0.5
    scaleMatrix.a *= additionalBlurScale
    scaleMatrix.d *= additionalBlurScale
    scaleMatrix.a *= parentScale
    scaleMatrix.d *= parentScale

    // Translation matrix
    const stickerPosition = sticker.getPosition()
    let translationMatrix = new Matrix()
    translationMatrix.tx = stickerPosition.x * canvas.width
    translationMatrix.ty = stickerPosition.y * canvas.height

    const stickerAnchor = sticker.getAnchor()
    translationMatrix.tx += scaleMatrix.a - scaleMatrix.a * 2 * stickerAnchor.x
    translationMatrix.ty -= scaleMatrix.d - scaleMatrix.d * 2 * stickerAnchor.y

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
}
