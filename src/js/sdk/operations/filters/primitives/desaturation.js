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
 * Desaturation primitive
 * @class
 * @alias PhotoEditorSDK.Filter.Primitives.Desaturation
 * @extends {PhotoEditorSDK.Filter.Primitive}
 */
class Desaturation extends Primitive {
  constructor (...args) {
    super(...args)

    this._options = Utils.defaults(this._options, {
      desaturation: 1.0
    })

    /**
     * The fragment shader for this primitive
     * @return {String}
     * @private
     */
    this._fragmentShader = require('raw!../../../shaders/desaturation.frag')
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
    renderer.runShader(null, this._fragmentShader, {
      inputTexture,
      outputFBO,
      outputTexture,
      switchBuffer: false,
      uniforms: {
        u_desaturation: { type: 'f', value: this._options.desaturation }
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
    var desaturation = this._options.desaturation

    for (var x = 0; x < canvas.width; x++) {
      for (var y = 0; y < canvas.height; y++) {
        var index = (canvas.width * y + x) * 4

        var luminance = imageData.data[index] * 0.3 + imageData.data[index + 1] * 0.59 + imageData.data[index + 2] * 0.11
        imageData.data[index] = luminance * (1 - desaturation) + (imageData.data[index] * desaturation)
        imageData.data[index + 1] = luminance * (1 - desaturation) + (imageData.data[index + 1] * desaturation)
        imageData.data[index + 2] = luminance * (1 - desaturation) + (imageData.data[index + 2] * desaturation)
      }
    }

    const outputContext = canvas.getContext('2d')
    outputContext.putImageData(imageData, 0, 0)
  }
}

export default Desaturation
