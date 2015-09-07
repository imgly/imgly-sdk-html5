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
 * Brightness primitive
 * @class
 * @alias ImglyKit.Filter.Primitives.Brightness
 * @extends {ImglyKit.Filter.Primitive}
 */
class Brightness extends Primitive {
  constructor (...args) {
    super(...args)

    this._options = Utils.defaults(this._options, {
      brightness: 1.0
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
      uniform float u_brightness;

      void main() {
        vec4 texColor = texture2D(u_image, v_texCoord);
        gl_FragColor = vec4((texColor.rgb + vec3(u_brightness) * texColor.a), texColor.a);;
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
        u_brightness: { type: 'f', value: this._options.brightness }
      }
    })
  }

  /**
   * Renders the primitive (Canvas)
   * @param  {CanvasRenderer} renderer
   */
  renderCanvas (renderer) {
    var canvas = renderer.getCanvas()
    var imageData = renderer.getContext().getImageData(0, 0, canvas.width, canvas.height)
    var brightness = this._options.brightness

    for (var x = 0; x < canvas.width; x++) {
      for (var y = 0; y < canvas.height; y++) {
        var index = (canvas.width * y + x) * 4

        imageData.data[index] = imageData.data[index] + brightness * 255
        imageData.data[index + 1] = imageData.data[index + 1] + brightness * 255
        imageData.data[index + 2] = imageData.data[index + 2] + brightness * 255
      }
    }

    renderer.getContext().putImageData(imageData, 0, 0)
  }
}

export default Brightness
