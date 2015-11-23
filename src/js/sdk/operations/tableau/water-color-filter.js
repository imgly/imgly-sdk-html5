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
import Operation from '../operation'
import GaussianBlurFilter from '../blur/gaussian-blur-filter'
import NormalMapFilter from './normal-map-filter'
import GrayFilter from './gray-filter'

/**
 * Watercolor Filter
 * @class
 * @alias PhotoEditorSDK.Art.WaterColorFilter
 * @extends {PhotoEditorSDK.Filter}
 */
class WaterColorFilter extends Operation {
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
    this._vertexShader = require('raw!../generic/default.vert')
    this._fragmentShader = require('raw!./water-color.frag')

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
    return this._renderReliefMap(renderer)
      .then(() => {
        const gl = renderer.getContext()
        const repititions = Math.round(this.getIntensity() * 40)
        for (let i = 0; i < repititions; i++) {
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
              u_filteredImage: { type: 'i', value: 1 }
            }
          })
        }
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

    let responsePromise = Promise.resolve()
    if (this._dirty) {
      this._resizeAllTextures(renderer)
      let inputTexture = renderer.getLastTexture()

      const operations = [
        this._grayFilter,
        this._gaussianBlurOperation,
        this._gaussianBlurOperation,
        this._gaussianBlurOperation,
        this._normalMapFilter
      ]

      const promise = Promise.resolve(inputTexture)
      operations.forEach((operation) => {
        promise
          .then((currentTexture) => {
            return this._renderIntermediate(operation, renderer, currentTexture)
          })
      })

      responsePromise = promise

      this._dirty = false
    }
    return responsePromise
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

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
WaterColorFilter.prototype.availableOptions = {
  intensity: {
    type: 'number',
    default: 0.5
  }
}

export default WaterColorFilter
