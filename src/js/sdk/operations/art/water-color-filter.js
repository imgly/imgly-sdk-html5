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
import GaussianBlurFilter from '../blur/gaussian-blur-filter'
import NormalMapFilter from './normal-map-filter'
import GrayFilter from './gray-filter'

/**
 * Watercolor Filter
 * @class
 * @alias PhotoEditorSDK.Art.WaterColorFilter
 * @extends {PhotoEditorSDK.Filter}
 */
class WaterColorFilter extends Filter {
  constructor (...args) {
    super(...args)
    this._glslPrograms = {}
    this._options = Utils.defaults(this._options, {
      contrast: 1.0
    })

    this._textures = []
    this._framebuffers = []
    this._fbosAvailable = false
    this._bufferIndex = 0
    this._dirty = true

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
    uniform highp float intensity;

    precision highp float;

    uniform vec2 src_size;

    uniform sampler2D u_image;
    uniform sampler2D u_filteredImage;

    void main(){
      vec4 newFrame = texture2D(u_image, v_texCoord);
      vec4 color = vec4(0., 0., 0., 0.);
      vec2 norm = ( texture2D(u_filteredImage, v_texCoord).rg - vec2(0.5) ) * 2.0;
      float inc = (abs(norm.x) + abs(norm.y)) * 0.5;

      vec2 offset[12];
      float fTotal = 12.0;

      float pi = 3.14159265358979323846;
      float step = (pi*2.0)/fTotal;
      float angle = 0.0;
      for (int i = 0; i < 12; i++) {
         offset[i].x = cos(angle) * src_size.x;
         offset[i].y = sin(angle) * src_size.y;
         angle += step;
      }

      float sources = 0.0;

      for (int i = 0; i < 12; i++) {
          vec4 goingTo = (texture2D( u_filteredImage, v_texCoord + offset[i] ) - vec4(0.5)) * 2.0;

          if (dot( goingTo.xy ,offset[i]) < 0.0/12.0) {
             sources += 1.0;
             color += texture2D(u_image, v_texCoord + offset[i]);
          }
      }

      if (sources > 0.) {
          color = color / sources;
      } else {
        color = newFrame;
      }

      gl_FragColor =  color*(1.0 - inc) + newFrame * inc;
    }
    `
    this._gaussianBlurOperation = new GaussianBlurFilter()
    this._normalMapFilter = new NormalMapFilter()
    this._grayFilter = new GrayFilter()
  }

  /**
   * Renders the filter (WebGL)
   * @param  {WebGLRenderer} renderer
   * @return {Promise}
   */
  /* istanbul ignore next */
  renderWebGL (renderer) {
    return new Promise((resolve, reject) => {
      var repetitions = Math.round(this._intensity * 20)
      for (var i = 0; i < repetitions; i++) {
        this._renderReliefMap(renderer)
        const gl = renderer.getContext()
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, this._lastTexture)
        gl.activeTexture(gl.TEXTURE0)

        if (!this._glslPrograms[renderer.id]) {
          this._glslPrograms[renderer.id] = renderer.setupGLSLProgram(
            null,
            this._fragmentShader
          )
        }

        var canvas = renderer.getCanvas()
        renderer.runProgram(this._glslPrograms[renderer.id], {
          uniforms: {
            src_size: { type: '2f', value: [ 1.0 / canvas.width, 1.0 / canvas.height ] },
            intensity: { type: 'f', value: this._intensity },
            u_filteredImage: { type: 'i', value: 1 }
          }
        })
      }
      resolve()
    })
  }

  /**
   * Creates two textures and framebuffers that are used for the reliefmap creation
   * rendering
   * @param {WebGLRenderer} renderer
   * @private
   */
  /* istanbul ignore next */
  _createFramebuffers (renderer) {
    for (var i = 0; i < 2; i++) {
      let { fbo, texture } = renderer.createFramebuffer()
      this._textures.push(texture)
      this._framebuffers.push(fbo)
    }
    this._fbosAvailable = true
  }

  /**
   * Resizes all used textures
   * @param {WebGLRenderer} renderer
   * @private
   */
  /* istanbul ignore next */
  _resizeAllTextures (renderer) {
    this._textures.forEach((texture) => {
      renderer.resizeTexture(texture)
    })
  }

  /**
   * Renders the reliefmap (WebGL)
   * @param  {WebGLRenderer} renderer
   * @private
   */
  /* istanbul ignore next */
  _renderReliefMap (renderer) {
    if (!this._fbosAvailable) this._createFramebuffers(renderer)

    if (this._dirty) {
      this._resizeAllTextures(renderer)
      let inputTexture = renderer.getLastTexture()
      inputTexture = this._renderIntermediate(this._grayFilter, renderer, inputTexture)
      inputTexture = this._renderIntermediate(this._gaussianBlurOperation, renderer, inputTexture)
      inputTexture = this._renderIntermediate(this._gaussianBlurOperation, renderer, inputTexture)
      inputTexture = this._renderIntermediate(this._gaussianBlurOperation, renderer, inputTexture)
      inputTexture = this._renderIntermediate(this._normalMapFilter, renderer, inputTexture)

      this._dirty = false
    }
  }

  /**
   * Renders an intermediate frame to a texture. (WebGL)
   * These frames culmulate to the final image.
   * @param  {WebGLRenderer} renderer
   * @private
   * @return {Textture}
   */
  /* istanbul ignore next */
  _renderIntermediate (operation, renderer, inputTexture) {
    let texture = this._getCurrentTexture()
    let fbo = this._getCurrentFramebuffer()

    operation.renderWebGL(renderer, inputTexture, fbo, texture)
    inputTexture = texture
    this._lastTexture = texture
    this._bufferIndex++
    return inputTexture
  }

  /**
   * gets the current render texture.
   * @private
   * @return {texture}
   */
   /* istanbul ignore next */
  _getCurrentTexture () {
    return this._textures[this._bufferIndex % this._textures.length]
  }

  /**
   * gets the current frame buffer.
   * @private
   * @return {FBO}
   */
   /* istanbul ignore next */
  _getCurrentFramebuffer () {
    return this._framebuffers[this._bufferIndex % this._framebuffers.length]
  }

  /**
  * Renders the oil operation to a canvas
  * @param  {CanvasRenderer} renderer
  * @private
  * @private
  */
  /* istanbul ignore next */
  renderCanvas (renderer) {
    return new Promise((resolve, reject) => {
      resolve()
    })
  }

  /**
   * Renders the operation
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
    return 'water-color'
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return 'Watercolor'
  }
}

export default WaterColorFilter
