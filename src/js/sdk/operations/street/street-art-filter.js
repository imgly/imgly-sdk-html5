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

/**
 * Gray Filter
 * @class
 * @alias PhotoEditorSDK.Art.StreetArtFilter
 * @extends {PhotoEditorSDK.Filter}
 */
class StreetArtFilter extends Filter {
  constructor (...args) {
    super(...args)
    this._glslPrograms = {}
    this._textures = {}
    this._framebuffer = null
    this._fbosAvailable = false

    this._vertexShader = require('raw!../generic/default.vert')
    this._fragmentShader = this._blurShader = require('raw!./street-art.frag')
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
    return this._uploadTexture(renderer)
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
            intensity: { type: 'f', value: this._intensity },
            artTexture: { type: 'i', value: 1 }
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
  _uploadTexture (renderer) {
    return new Promise((resolve, reject) => {
      // Use cached texture
      if (this._textures[renderer.id]) {
        return resolve(this._textures[renderer.id])
      }

      const image = new window.Image()
      image.addEventListener('load', () => {
        const texture = renderer.createTexture(image)
        this._textures[renderer.id] = texture
        resolve(texture)
      })

      image.crossOrigin = 'Anonymous'
      image.src = '/build/assets/art/grunge1.jpg'
    })
  }

  /**
  * Renders the gray operation to a canvas
  * @param  {CanvasRenderer} renderer
  * @private
  */
  renderCanvas (renderer) {
    return new Promise((resolve, reject) => {
      var canvas = renderer.getCanvas()
      var context = renderer.getContext()
      var imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      var pixels = imageData.data
      var artPixels = null // TODO use hand over assert
      var index = 0
      var normedArtColor = [0, 0, 0]
      var newColor = [0, 0, 0]
      for (var y = 0; y < canvas.height; y++) {
        for (var x = 0; x < canvas.width; x++) {
          index = (y * canvas.width + x) * 4
          var blend = 0
          var gray = pixels[index] / 255.0 * 0.2125 + pixels[index + 1] / 255.0 * 0.7154 + pixels[index + 2] / 255.0 * 0.0721
          if (gray > (1.0 - this._intensity)) {
            blend = 1
          }
          normedArtColor[0] = artPixels[index] / 255
          normedArtColor[1] = artPixels[index + 1] / 255
          normedArtColor[2] = artPixels[index + 2] / 255
          if (blend < 0.5) {
            newColor[0] = 1.0 - 2.0 * (1.0 - normedArtColor[0])
            newColor[1] = 1.0 - 2.0 * (1.0 - normedArtColor[1])
            newColor[2] = 1.0 - 2.0 * (1.0 - normedArtColor[2])
          } else {
            newColor[0] = 2.0 * normedArtColor[0]
            newColor[1] = 2.0 * normedArtColor[1]
            newColor[2] = 2.0 * normedArtColor[2]
          }
          pixels[index] = newColor[0]
          pixels[index + 1] = newColor[1]
          pixels[index + 2] = newColor[2]
        }
      }
      resolve()
    })
  }

  /**
   * Renders the stack of primitives on the renderer
   * @param  {Renderer} renderer
   */
  render (renderer) {
    console.log(renderer.identifier)
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
    return 'street'
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return 'StreetArt'
  }
}

export default StreetArtFilter
