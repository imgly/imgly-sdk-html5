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
 * @alias PhotoEditorSDK.Filters.NormalMapFilter
 * @extends {PhotoEditorSDK.Filter}
 */
class GaussianBlurFilter extends Filter {
  constructor (...args) {
    super(...args)
    this._glslPrograms = {}
    this._options = Utils.defaults(this._options, {
      contrast: 1.0
    })

    /**
     * The fragment shader for this primitive
     * @return {String}
     * @private
     */
    this._vertexShader = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;

    void main() {
     gl_Position = vec4(a_position, 0, 1);
     v_texCoord = a_texCoord;
    }
    `

     /**
     * The fragment shader used for this operation
     */
    this._fragmentShader = `
    varying highp vec2 v_texCoord;
    uniform sampler2D inputImageTexture;
    uniform highp float intensity;
    precision highp float;

    uniform vec2 src_size;

    float kernel[9];
    vec2  offset[9];

    void main(){
        vec4 sum = vec4(0.0);

        float dx = src_size.x;
        float dy = src_size.y;
        offset[0] = vec2(-dx, -dy);
        offset[1] = vec2(0.0, -dy);
        offset[2] = vec2(dx, -dy);

        offset[3] = vec2(-dx, 0.0);
        offset[4] = vec2(0.0, 0.0);
        offset[5] = vec2(dx, 0.0);

        offset[6] = vec2(-dx, dy);
        offset[7] = vec2(0.0, dy);
        offset[8] = vec2(dx, dy);

        kernel[0] = 1.0/16.0;   kernel[1] = 2.0/16.0;   kernel[2] = 1.0/16.0;
        kernel[3] = 2.0/16.0;   kernel[4] = 4.0/16.0;   kernel[5] = 2.0/16.0;
        kernel[6] = 1.0/16.0;   kernel[7] = 2.0/16.0;   kernel[8] = 1.0/16.0;

        for(int i = 0; i < 9; i++){
            vec4 tmp = texture2D( inputImageTexture, v_texCoord + offset[i]);
            sum += tmp * kernel[i];
        }

        gl_FragColor = mix(texture2D( inputImageTexture, v_texCoord), sum, intensity);
    }    `
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
        switchBuffer: true,
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
      var index
      var radius = 3
      var n = (radius + 1) * (radius + 1)
      var k = 0
      var l = 0
      var i = 0
      var j = 0
      var original = [0, 0, 0]
      for (var y = 0; y < canvas.height; y++) {
        for (var x = 0; x < canvas.width; x++) {
          var m0 = new Color(0.0, 0.0, 0.0, 1)
          var m1 = new Color(0.0, 0.0, 0.0, 1)
          var m2 = new Color(0.0, 0.0, 0.0, 1)
          var m3 = new Color(0.0, 0.0, 0.0, 1)
          var s0 = new Color(0.0, 0.0, 0.0, 1)
          var s1 = new Color(0.0, 0.0, 0.0, 1)
          var s2 = new Color(0.0, 0.0, 0.0, 1)
          var s3 = new Color(0.0, 0.0, 0.0, 1)
          var c = new Color(0.0, 0.0, 0.0, 1)
          index = (y * canvas.width + x) * 4
          original[0] = pixels[index]
          original[1] = pixels[index + 1]
          original[2] = pixels[index + 2]
          for (j = -radius; j <= 0; ++j) {
            for (i = -radius; i <= 0; ++i) {
              k = x + i
              l = y + j
              if ((k >= 0 && k < canvas.width) && (l >= 0 && l < canvas.height)) {
                index = (l * canvas.width + k) * 4
                c.r = pixels[index] / 255.0
                c.g = pixels[index + 1] / 255.0
                c.b = pixels[index + 2] / 255.0
                m0.add(c)
                s0.add(c.multiply(c))
              }
            }
          }
          for (j = -radius; j <= 0; ++j) {
            for (i = 0; i <= radius; ++i) {
              k = x + i
              l = y + j
              if ((k >= 0 && k < canvas.width) && (l >= 0 && l < canvas.height)) {
                index = (l * canvas.width + k) * 4
                c.r = pixels[index] / 255.0
                c.g = pixels[index + 1] / 255.0
                c.b = pixels[index + 2] / 255.0
                m1.add(c)
                s1.add(c.multiply(c))
              }
            }
          }
          for (j = 0; j <= radius; ++j) {
            for (i = 0; i <= radius; ++i) {
              k = x + i
              l = y + j
              if ((k >= 0 && k < canvas.width) && (l >= 0 && l < canvas.height)) {
                index = (l * canvas.width + k) * 4
                c.r = pixels[index] / 255.0
                c.g = pixels[index + 1] / 255.0
                c.b = pixels[index + 2] / 255.0
                m2.add(c)
                s2.add(c.multiply(c))
              }
            }
          }
          for (j = 0; j <= radius; ++j) {
            for (i = -radius; i <= 0; ++i) {
              k = x + i
              l = y + j
              if ((k >= 0 && k < canvas.width) && (l >= 0 && l < canvas.height)) {
                index = (l * canvas.width + k) * 4
                c.r = pixels[index] / 255.0
                c.g = pixels[index + 1] / 255.0
                c.b = pixels[index + 2] / 255.0
                m3.add(c)
                s3.add(c.multiply(c))
              }
            }
          }
          index = (y * canvas.width + x) * 4
          var min_sigma2 = 25500
          m0.divide(n)
          s0.r = Math.abs(s0.r / n - m0.r * m0.r)
          s0.g = Math.abs(s0.g / n - m0.g * m0.g)
          s0.b = Math.abs(s0.b / n - m0.b * m0.b)
          var sigma2 = s0.r + s0.g + s0.b
          if (sigma2 < min_sigma2) {
            min_sigma2 = sigma2
            pixels[index] = m0.r * 255.0
            pixels[index + 1] = m0.g * 255.0
            pixels[index + 2] = m0.b * 255.0
          }
          m1.divide(n)
          s1.r = Math.abs(s1.r / n - m1.r * m1.r)
          s1.g = Math.abs(s1.g / n - m1.g * m1.g)
          s1.b = Math.abs(s1.b / n - m1.b * m1.b)
          sigma2 = s1.r + s1.g + s1.b
          if (sigma2 < min_sigma2) {
            min_sigma2 = sigma2
            pixels[index] = m1.r * 255.0
            pixels[index + 1] = m1.g * 255.0
            pixels[index + 2] = m1.b * 255.0
          }
          m2.divide(n)
          s2.r = Math.abs(s2.r / n - m2.r * m2.r)
          s2.g = Math.abs(s2.g / n - m2.g * m2.g)
          s2.b = Math.abs(s2.b / n - m2.b * m2.b)
          sigma2 = s2.r + s2.g + s2.b
          if (sigma2 < min_sigma2) {
            min_sigma2 = sigma2
            pixels[index] = m2.r * 255.0
            pixels[index + 1] = m2.g * 255.0
            pixels[index + 2] = m2.b * 255.0
          }
          m3.divide(n)
          s3.r = Math.abs(s3.r / n - m3.r * m3.r)
          s3.g = Math.abs(s3.g / n - m3.g * m3.g)
          s3.b = Math.abs(s3.b / n - m3.b * m3.b)
          sigma2 = s3.r + s3.g + s2.b
          if (sigma2 < min_sigma2) {
            min_sigma2 = sigma2
            pixels[index] = m3.r * 255.0
            pixels[index + 1] = m3.g * 255.0
            pixels[index + 2] = m3.b * 255.0
          }
          pixels[index] = (1 - this._intensity) * original[0] + this._intensity * pixels[index]
          pixels[index + 1] = (1 - this._intensity) * original[1] + this._intensity * pixels[index + 1]
          pixels[index + 2] = (1 - this._intensity) * original[2] + this._intensity * pixels[index + 2]
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
    return 'gaussian-blur'
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return 'Gaussian blur'
  }
}

export default GaussianBlurFilter
