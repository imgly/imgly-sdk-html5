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
 * @alias ImglyKit.Filter.Primitives.Saturation
 * @extends {ImglyKit.Filter.Primitive}
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
    this._fragmentShader = `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform sampler2D u_image;
      uniform float u_saturation;

      const vec3 luminanceWeighting = vec3(0.2125, 0.7154, 0.0721);

      void main() {
        vec4 texColor = texture2D(u_image, v_texCoord);
        float luminance = dot(texColor.rgb, luminanceWeighting);

        vec3 greyScaleColor = vec3(luminance);

        gl_FragColor = vec4(mix(greyScaleColor, texColor.rgb, u_saturation) * texColor.a, texColor.a);
      }
    `
  }

  /**
   * Renders the primitive (WebGL)
   * @param  {WebGLRenderer} renderer
   */
  /* istanbul ignore next */
  renderWebGL (renderer) {
    if (!this._glslPrograms[renderer.id]) {
      this._glslPrograms[renderer.id] = renderer.setupGLSLProgram(
        null,
        this._fragmentShader
      )
    }

    renderer.runProgram(this._glslPrograms[renderer.id], {
      uniforms: {
        u_saturation: { type: 'f', value: this._options.saturation }
      }
    })
  }

  /**
   * Renders the primitive (Canvas)
   * @param  {CanvasRenderer} renderer
   * @return {Promise}
   */
  renderCanvas (renderer) {
    var canvas = renderer.getCanvas()
    var imageData = renderer.getContext().getImageData(0, 0, canvas.width, canvas.height)
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

    renderer.getContext().putImageData(imageData, 0, 0)
  }
}

export default Saturation
