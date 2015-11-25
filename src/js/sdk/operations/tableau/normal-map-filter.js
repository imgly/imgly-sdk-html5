/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */
import Utils from '../../lib/utils'
import Filter from '../filters/filter'

/**
 * Normal Map Filter
 * @class
 * @alias PhotoEditorSDK.Art.NormalMapFilter
 * @extends {PhotoEditorSDK.Filter}
 */
class NormalMapFilter extends Filter {
  constructor (...args) {
    super(...args)
    this._glslPrograms = {}
    this._options = Utils.defaults(this._options, {
      contrast: 1.0
    })

    this._vertexShader = require('raw!../generic/default.vert')
    this._fragmentShader = this._blurShader = require('raw!./normal.frag')
  }

  /**
   * Renders the primitive (WebGL)
   * @param  {WebGLRenderer} renderer
   * @param  {WebGLTexture} inputTexture
   * @param  {WebGLFramebuffer} outputFBO
   * @param  {WebGLTexture} outputTexture
   * @return {Promise}
   */
  /* istanbul ignore next */
  renderWebGL (renderer, inputTexture, outputFBO, outputTexture) {
    return new Promise((resolve, reject) => {
      if (!this._glslPrograms[renderer.id]) {
        this._glslPrograms[renderer.id] = renderer.setupGLSLProgram(
          null,
          this._fragmentShader
        )
      }

      var canvas = renderer.getCanvas()

      renderer.runProgram(this._glslPrograms[renderer.id], {
        inputTexture,
        outputFBO,
        outputTexture,
        switchBuffer: false,
        uniforms: {
          src_size: { type: '2f', value: [ 1.0 / canvas.width, 1.0 / canvas.height ] },
          intensity: { type: 'f', value: this._intensity }
        }
      })
      resolve()
    })
  }

  /**
  * Renders the oil operation to a canvas
  * @param  {CanvasRenderer} renderer
  * @private
  */
  renderCanvas (renderer) {
    return new Promise((resolve, reject) => {
      var canvas = renderer.getCanvas()
      var context = renderer.getContext()
      var imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      var pixels = imageData.data
      var originalPixels = context.getImageData(0, 0, canvas.width, canvas.height).data
      var index

      for (var y = 0; y < canvas.height; y++) {
        for (var x = 0; x < canvas.width; x++) {
          index = ((y - 1) * canvas.width + x) * 4
          var top = originalPixels[index]

          index = ((y + 1) * canvas.width + x) * 4
          var bottom = originalPixels[index]

          index = ((y - 1) * canvas.width + (x - 1)) * 4
          var topLeft = originalPixels[index]

          index = (y * canvas.width + (x - 1)) * 4
          var left = originalPixels[index]

          index = ((y + 1) * canvas.width + (x - 1)) * 4
          var bottomLeft = originalPixels[index]

          index = ((y - 1) * canvas.width + (x + 1)) * 4
          var topRight = originalPixels[index]

          index = (y * canvas.width + (x + 1)) * 4
          var right = originalPixels[index]

          index = ((y + 1) * canvas.width + (x + 1)) * 4
          var bottomRight = originalPixels[index]

          var dX = topRight + 2.0 * right + bottomRight - topLeft - 2.0 * left - bottomLeft
          var dY = bottomLeft + 2.0 * bottom + bottomRight - topLeft - 2.0 * top - topRight

          var N = this._finalize_normal(dX, dY, 0.01)
          index = (y * canvas.width + x) * 4
          pixels[index] = N[0] * 255
          pixels[index + 1] = N[1] * 255
          pixels[index + 2] = N[2] * 255
        }
      }
      context.putImageData(imageData, 0, 0)
      resolve()
    })
  }

  _finalize_normal (x, y, z) {
    var vec = [x, y, z]
    var length = Math.sqrt(x * x + y * y + z * z)
    vec[0] /= length
    vec[1] /= length
    vec[2] /= length
    vec[0] = vec[0] * 0.5 + 0.5
    vec[1] = vec[1] * 0.5 + 0.5
    vec[2] = vec[2] * 0.5 + 0.5
    return vec
  }

  /**
   * Renders the stack of primitives on the renderer
   * @param  {Renderer} renderer
   */
  render (renderer) {
    if (renderer.identifier === 'webgl') {
      return this.renderWebGL(renderer)
    } else {
      return this.renderCanvas(renderer)
    }
  }

  /**
   * A unique string that identifies this operation. Can be used to select
   * the active filter.
   * @type {String}
   */
  static get identifier () {
    return 'normal-map'
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return 'Normal map'
  }
}

export default NormalMapFilter
