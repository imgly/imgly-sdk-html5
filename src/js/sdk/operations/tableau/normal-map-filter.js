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
import Color from '../../lib/color'
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
          var center = new Color(0.0, 0.0, 0.0, 1)
          var topLeft = new Color(0.0, 0.0, 0.0, 1)
          var left = new Color(0.0, 0.0, 0.0, 1)
          var bottomLeft = new Color(0.0, 0.0, 0.0, 1)
          var top = new Color(0.0, 0.0, 0.0, 1)
          var bottom = new Color(0.0, 0.0, 0.0, 1)
          var topRight = new Color(0.0, 0.0, 0.0, 1)
          var right = new Color(0.0, 0.0, 0.0, 1)
          var bottomRight = new Color(0.0, 0.0, 0.0, 1)
          index = (y * canvas.width + x) * 4
          center[0] = originalPixels[index]
          center[1] = originalPixels[index + 1]
          center[2] = originalPixels[index + 2]

          index = ((y - 1) * canvas.width + (x - 1)) * 4
          topLeft[0] = originalPixels[index]
          topLeft[1] = originalPixels[index + 1]
          topLeft[2] = originalPixels[index + 2]

          index = ((y - 1) * canvas.width + (x - 1)) * 4
          topLeft[0] = originalPixels[index]
          topLeft[1] = originalPixels[index + 1]
          topLeft[2] = originalPixels[index + 2]
        }
      }
      context.putImageData(imageData, 0, 0)
      resolve()
    })
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
