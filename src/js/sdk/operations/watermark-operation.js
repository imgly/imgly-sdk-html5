/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Utils from '../lib/utils'
import Vector2 from '../lib/math/vector2'
import Matrix from '../lib/math/matrix'
import Operation from './operation'

class WatermarkOperation extends Operation {
  constructor (...args) {
    super(...args)

    this._vertexShader = require('raw!../shaders/generic/sprite.vert')
    this._textures = {}
  }

  /**
   * Renders the watermark using Canvas2d
   * @param  {CanvasRenderer} renderer
   * @return {Promise}
   */
  _renderCanvas (renderer) {
    return new Promise((resolve, reject) => {
      const canvas = renderer.getCanvas()
      const context = renderer.getContext()
      const { image } = this._options

      const size = Utils.resizeVectorToFit(
        new Vector2(image.width, image.height),
        new Vector2(canvas.width, canvas.height)
      )

      const position = new Vector2(canvas.width, canvas.height)
        .divide(2)
        .subtract(size.clone()
          .divide(2))
      context.drawImage(
        image,
        position.x, position.y,
        size.x, size.y
      )

      resolve()
    })
  }

  /**
   * Renders the watermark using WebGL
   * @param  {WebGLRenderer} renderer
   * @private
   */
  /* istanbul ignore next */
  _renderWebGL (renderer) {
    return new Promise((resolve, reject) => {
      if (!this._glslPrograms[renderer.id]) {
        this._glslPrograms[renderer.id] = renderer.setupGLSLProgram(
          this._vertexShader,
          null
        )
      }

      if (!this._textures[renderer.id]) {
        this._textures[renderer.id] = renderer.createTexture(this._options.image)
      }

      if (!this._outputTexture) {
        const { texture, fbo } = renderer.createFramebuffer()
        this._outputTexture = texture
        this._outputFramebuffer = fbo
      }

      const outputCanvas = renderer.getCanvas()
      renderer.resizeTexture(this._outputTexture, new Vector2(
        outputCanvas.width, outputCanvas.height
      ))

      const program = this._glslPrograms[renderer.id]
      const projectionMatrix = this._createProjectionMatrix(renderer)

      renderer.runProgram(program, {
        inputTexture: this._textures[renderer.id],
        outputTexture: this._outputTexture,
        outputFBO: this._outputFramebuffer,
        textureSize: new Vector2(
          outputCanvas.width, outputCanvas.height
        ),
        resizeTextures: false,
        switchBuffer: false,
        clear: false,
        blend: 'normal',
        uniforms: {
          u_projMatrix: { type: 'mat3fv', value: projectionMatrix }
        }
      })

      // Render last texture to current FBO
      renderer.runProgram(renderer.getDefaultProgram(), {
        switchBuffer: false
      })

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
   * Creates the projection matrix
   * @param  {WebGLRenderer} renderer
   * @return {Matrix}
   * @private
   */
  _createProjectionMatrix (renderer) {
    const outputCanvas = renderer.getCanvas()
    const image = this._options.image

    let scale
    if (image.width / image.height > outputCanvas.width / outputCanvas.height) {
      scale = outputCanvas.width / image.width
    } else {
      scale = outputCanvas.height / image.height
    }

    // Projection matrix
    let projectionMatrix = new Matrix()
    projectionMatrix.a = 2 / outputCanvas.width
    projectionMatrix.d = -2 / outputCanvas.height
    projectionMatrix.tx = -1
    projectionMatrix.ty = 1

    // Scale matrix
    let scaleMatrix = new Matrix()
    scaleMatrix.a = image.width * 0.5 * scale
    scaleMatrix.d = -image.height * 0.5 * scale

    // Translation matrix
    let translationMatrix = new Matrix()
    translationMatrix.tx = 0.5 * outputCanvas.width
    translationMatrix.ty = 0.5 * outputCanvas.height

    let matrix = scaleMatrix.multiply(translationMatrix)
    matrix.multiply(projectionMatrix)
    return matrix.toArray()
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
WatermarkOperation.identifier = 'watermark'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
WatermarkOperation.prototype.availableOptions = {
  image: { type: 'object', required: true }
}

export default WatermarkOperation
