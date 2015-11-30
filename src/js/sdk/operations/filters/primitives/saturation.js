/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Utils from '../../../lib/utils'
import Primitive from './primitive'

/**
 * Saturation primitive
 * @class
 * @alias PhotoEditorSDK.Filter.Primitives.Saturation
 * @extends {PhotoEditorSDK.Filter.Primitive}
 */
class Saturation extends Primitive {
  constructor (...args) {
    super(...args)

    this._options = Utils.defaults(this._options, {
      saturation: 0
    })

    /**
     * The fragment shader for this primitive
     * @return {String}
     * @private
     */
    this._fragmentShader = require('raw!../../../shaders/primitives/saturation.frag')
  }

  /**
   * Renders the primitive (WebGL)
   * @param  {WebGLRenderer} renderer
   * @param  {WebGLTexture} inputTexture
   * @param  {WebGLFramebuffer} outputFBO
   * @param  {WebGLTexture} outputTexture
   */
  /* istanbul ignore next */
  renderWebGL (renderer, inputTexture, outputFBO, outputTexture) {
    if (!this._glslPrograms[renderer.id]) {
      this._glslPrograms[renderer.id] = renderer.setupGLSLProgram(
        null,
        this._fragmentShader
      )
    }

    renderer.runProgram(this._glslPrograms[renderer.id], {
      inputTexture,
      outputFBO,
      outputTexture,
      switchBuffer: false,
      uniforms: {
        u_saturation: { type: 'f', value: this._options.saturation }
      }
    })
  }

  /**
   * Renders the primitive (Canvas)
   * @param  {CanvasRenderer} renderer
   * @param  {Canvas} canvas
   */
  renderCanvas (renderer, canvas) {
    const context = canvas.getContext('2d')
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    var saturation = this._options.saturation

    for (var x = 0; x < canvas.width; x++) {
      for (var y = 0; y < canvas.height; y++) {
        var index = (canvas.width * y + x) * 4

        var luminance = imageData.data[index] * 0.2125 + imageData.data[index + 1] * 0.7154 + imageData.data[index + 2] * 0.0721
        imageData.data[index] = luminance * (1 - saturation) + (imageData.data[index] * saturation)
        imageData.data[index + 1] = luminance * (1 - saturation) + (imageData.data[index + 1] * saturation)
        imageData.data[index + 2] = luminance * (1 - saturation) + (imageData.data[index + 2] * saturation)
      }
    }

    const outputContext = canvas.getContext('2d')
    outputContext.putImageData(imageData, 0, 0)
  }
}

export default Saturation
