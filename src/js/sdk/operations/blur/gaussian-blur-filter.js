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
 * Gaussian Blur Filter
 * @class
 * @alias PhotoEditorSDK.Blur.GaussianBlurFilter
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
   * Renders the filter (WebGL)
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
  */
  renderCanvas (renderer) {
    return new Promise((resolve, reject) => {
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
