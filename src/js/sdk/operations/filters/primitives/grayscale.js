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
 * Grayscale primitive
 * @class
 * @alias PhotoEditorSDK.Filter.Primitives.Grayscale
 * @extends {PhotoEditorSDK.Filter.Primitive}
 */
class Grayscale extends Primitive {
  constructor (...args) {
    super(...args)

    /**
     * The fragment shader for this primitive
     * @return {String}
     * @private
     */
    this._fragmentShader = `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform sampler2D u_image;
      vec3 W = vec3(0.2125, 0.7154, 0.0721);

      void main() {
        vec4 texColor = texture2D(u_image, v_texCoord);
        float luminance = dot(texColor.rgb, W);
        gl_FragColor = vec4(vec3(luminance) * texColor.a, texColor.a);
      }
    `
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
      switchBuffer: false
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

    for (var x = 0; x < canvas.width; x++) {
      for (var y = 0; y < canvas.height; y++) {
        var index = (canvas.width * y + x) * 4

        var luminance = imageData.data[index] * 0.2125 + imageData.data[index + 1] * 0.7154 + imageData.data[index + 2] * 0.0721

        imageData.data[index] = luminance
        imageData.data[index + 1] = luminance
        imageData.data[index + 2] = luminance
      }
    }

    const outputContext = canvas.getContext('2d')
    outputContext.putImageData(imageData, 0, 0)
  }
}

export default Grayscale
