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
import GaussianBlurFilter from '../blur/gaussian-blur-filter'
import NormalMapFilter from './normal-map-filter'
import GrayFilter from './gray-filter'

/**
 * Oil Paint Filter
 * @class
 * @alias PhotoEditorSDK.Filters.OilPaintFilter
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

    this._blendFragmentShader = `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform sampler2D u_image;
      uniform sampler2D u_filteredImage;
      uniform float intensity;

      void main() {
        vec4 color0 = texture2D(u_image, v_texCoord);
        vec4 color1 = texture2D(u_filteredImage, v_texCoord);
        gl_FragColor = mix(color0, color1, intensity);
      }
    `

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

        float rate =  1.0;

        float distance = distance(v_texCoord, vec2(0.5, 0.5));
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
               offset[i].x = cos(angle) / src_size.x;
               offset[i].y = sin(angle) / src_size.y;
               angle += step;
            }

            float sources = 0.0;

            for(int i = 0; i < 12; i++){
                vec4 goingTo = (texture2D( u_filteredImage, v_texCoord + offset[i] ) - vec4(0.5)) * 2.0;

                if ( dot( goingTo.xy ,offset[i]) < 0.0/12.0 ){
                   sources += 1.0;
                   color += texture2D(u_image, v_texCoord + offset[i]);
                }
            }

            if(sources > 0.){
                color = color / sources;
            }else{
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
      var repetitions = Math.round(this._intensity * 50)
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
            src_size: { type: '2f', value: [ canvas.width, canvas.height ] },
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
   * @return {Promise}
   */
  /* istanbul ignore next */
  _renderReliefMap (renderer) {
    if (!this._fbosAvailable) this._createFramebuffers(renderer)

    if (this._dirty) {
      this._resizeAllTextures(renderer)
      let inputTexture = renderer.getLastTexture()
      inputTexture = this._renderIndermidiate(this._grayFilter, renderer, inputTexture)
      inputTexture = this._renderIndermidiate(this._gaussianBlurOperation, renderer, inputTexture)
      inputTexture = this._renderIndermidiate(this._gaussianBlurOperation, renderer, inputTexture)
      inputTexture = this._renderIndermidiate(this._gaussianBlurOperation, renderer, inputTexture)
      inputTexture = this._renderIndermidiate(this._normalMapFilter, renderer, inputTexture)

      this._dirty = false
    }
  }

  _renderIndermidiate (operation, renderer, inputTexture) {
    let texture = this._getCurrentTexture()
    let fbo = this._getCurrentFramebuffer()

    operation.renderWebGL(renderer, inputTexture, fbo, texture)
    inputTexture = texture
    this._lastTexture = texture
    this._bufferIndex++
    return inputTexture
  }

  _getCurrentTexture () {
    return this._textures[this._bufferIndex % this._textures.length]
  }

  _getCurrentFramebuffer () {
    return this._framebuffers[this._bufferIndex % this._framebuffers.length]
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
