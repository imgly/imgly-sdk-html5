/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

// import Utils from '../../lib/utils'
import Filter from '../filters/filter'
import GaussianBlurFilter from '../blur/gaussian-blur-filter'

/**
 * Gray Filter
 * @class
 * @alias PhotoEditorSDK.Art.StreetArtFilter
 * @extends {PhotoEditorSDK.Filter}
 */
class BrushMarkFilter extends Filter {
  constructor (...args) {
    super(...args)
    this._glslPrograms = {}
    this._textures = {}
    this._image = {}
    this._gaussianBlurOperation = new GaussianBlurFilter()
    this._vertexShader = require('raw!../generic/default.vert')
    this._fragmentShader = this._blurShader = require('raw!./brush-mark.frag')
  }

  /**
   * Renders the opertaion (WebGL)
   * @param  {WebGLRenderer} renderer
   * @param  {WebGLTexture} inputTexture
   * @param  {WebGLFramebuffer} outputFBO
   * @param  {WebGLTexture} outputTexture
   * @return {Promise}
   */
  /* istanbul ignore next */
  renderWebGL (renderer, inputTexture, outputFBO, outputTexture) {
    let promise = Promise.resolve()
    for (var i = 0; i < 15; i++) {
      promise = promise.then(() => this._gaussianBlurOperation.renderWebGL(renderer, inputTexture, outputFBO, outputTexture))
    }
    return promise
      .then(() => this._createTexture(renderer))
      .then((texture) => {
        if (!this._glslPrograms[renderer.id]) {
          this._glslPrograms[renderer.id] = renderer.setupGLSLProgram(
            null,
            this._fragmentShader
          )
        }
        const gl = renderer.getContext()
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.activeTexture(gl.TEXTURE0)
        renderer.runProgram(this._glslPrograms[renderer.id], {
          uniforms: {
            intensity: { type: 'f', value: this._intensity / 100 },
            u_brushImage: { type: 'i', value: 1 }
          }
        })
      })
  }
  /**
   * Uploads the given image to a texture
   * @param  {WebGLRenderer} renderer
   * @return {Promise}
   * @private
   */
  _createTexture (renderer) {
    return new Promise((resolve, reject) => {
      if (!this._textures[renderer.id]) {
        const texture = renderer.createTexture(this._image)
        this._textures[renderer.id] = texture
      }
      return resolve(this._textures[renderer.id])
    })
  }

  /**
  * Renders the gray operation to a canvas
  * @param  {CanvasRenderer} renderer
  * @private
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
    return 'brush-mark'
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return 'Brush Mark'
  }

  /**
   * Sets the image for this filter
   * @param {Image}
   */
  setImage (image) {
    this._image = image
  }

  /**
   * Gets the image of this filter
   * @return {Image}
   */
  get image () {
    return this._image
  }
}

export default BrushMarkFilter
