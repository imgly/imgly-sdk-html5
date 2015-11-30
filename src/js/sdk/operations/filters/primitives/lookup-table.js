/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Primitive from './primitive'

/**
 * Stores a 256 byte long lookup table in a 2d texture which will be
 * used to look up the corresponding value for each channel.
 * @class
 * @alias PhotoEditorSDK.Filter.Primitives.LookupTable
 * @extends {PhotoEditorSDK.Filter.Primitive}
 */
class LookupTable extends Primitive {
  constructor (...args) {
    super(...args)

    this._textureIndex = 3

    /**
     * The fragment shader for this primitive
     * @return {String}
     * @private
     */
    this._fragmentShader = require('raw!../../../shaders/primitives/lookup-table.frag')
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
    this._updateTexture(renderer)

    renderer.runShader(null, this._fragmentShader, {
      inputTexture,
      outputFBO,
      outputTexture,
      switchBuffer: false,
      uniforms: {
        u_lookupTable: { type: 'i', value: 3 }
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
    var table = this._options.data

    for (var x = 0; x < canvas.width; x++) {
      for (var y = 0; y < canvas.height; y++) {
        var index = (canvas.width * y + x) * 4

        var r = imageData.data[index]
        imageData.data[index] = table[r * 4]
        var g = imageData.data[index + 1]
        imageData.data[index + 1] = table[1 + g * 4]
        var b = imageData.data[index + 2]
        imageData.data[index + 2] = table[2 + b * 4]
      }
    }

    const outputContext = canvas.getContext('2d')
    outputContext.putImageData(imageData, 0, 0)
  }

  /**
   * Updates the lookup table texture (WebGL only)
   * @private
   */
  /* istanbul ignore next */
  _updateTexture (renderer) {
    var gl = renderer.getContext()

    if (typeof this._options.data === 'undefined') {
      throw new Error('LookupTable: No data specified.')
    }

    var dataTypedArray = new Uint8Array(this._options.data)

    gl.activeTexture(gl.TEXTURE0 + this._textureIndex)
    if (!this._texture) {
      this._texture = gl.createTexture()
    }
    gl.bindTexture(gl.TEXTURE_2D, this._texture)

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, dataTypedArray)
    gl.activeTexture(gl.TEXTURE0)
  }
}

export default LookupTable
