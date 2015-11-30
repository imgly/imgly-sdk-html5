/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Promise from '../../vendor/promise'

/**
 * A helper class that can collect {@link Primitive} instances and render
 * the stack
 * @class
 * @alias PhotoEditorSDK.Filter.PrimitivesStack
 */
class PrimitivesStack {
  constructor (intensity = 1) {
    this._intensity = intensity

    this._stack = []

    this._glslPrograms = {}
    this._dirty = true
    this._bufferIndex = 0
    this._textures = []
    this._framebuffers = []
    this._fbosAvailable = false

    this._blendFragmentShader = require('raw!../../shaders/blend.frag')
  }

  /**
   * Creates two textures and framebuffers that are used for the stack
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
   * Adds the given primitive to the stack
   * @param {PhotoEditorSDK.Filter.Primitive} primitive
   */
  add (primitive) {
    this._stack.push(primitive)
  }

  _resizeAllTextures (renderer) {
    this._textures.forEach((texture) => {
      renderer.resizeTexture(texture)
    })
  }

  renderWebGL (renderer) {
    if (!this._fbosAvailable) this._createFramebuffers(renderer)

    if (this._dirty) {
      this._resizeAllTextures(renderer)
      let inputTexture = renderer.getLastTexture()
      let texture, fbo
      for (var i = 0; i < this._stack.length; i++) {
        texture = this._getCurrentTexture()
        fbo = this._getCurrentFramebuffer()

        var primitive = this._stack[i]
        primitive.render(renderer, inputTexture, fbo, texture)
        inputTexture = texture
        this._lastTexture = texture
        this._bufferIndex++
      }
      this._dirty = false
    }

    const gl = renderer.getContext()
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, this._lastTexture)
    gl.activeTexture(gl.TEXTURE0)

    if (!this._glslPrograms[renderer.id]) {
      this._glslPrograms[renderer.id] = renderer.setupGLSLProgram(
        null,
        this._blendFragmentShader
      )
    }

    renderer.runProgram(this._glslPrograms[renderer.id], {
      uniforms: {
        u_intensity: { type: 'f', value: this._intensity },
        u_filteredImage: { type: 'i', value: 1 }
      }
    })

    return Promise.resolve()
  }

  _getCurrentTexture () {
    return this._textures[this._bufferIndex % this._textures.length]
  }

  _getCurrentFramebuffer () {
    return this._framebuffers[this._bufferIndex % this._framebuffers.length]
  }

  renderCanvas (renderer) {
    const outputCanvas = renderer.cloneCanvas()

    let promise = Promise.resolve()
    if (this._dirty) {
      for (var i = 0; i < this._stack.length; i++) {
        var primitive = this._stack[i]
        primitive.renderCanvas(renderer, outputCanvas)
      }
    }

    promise = promise.then(() => {
      this._dirty = false
    }).then(() => {
      // Render with intensity
      const context = renderer.getContext()
      context.globalAlpha = this._intensity
      context.drawImage(outputCanvas, 0, 0)
      context.globalAlpha = 1.0
    })

    return promise
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

  setDirty (dirty) { this._dirty = dirty }
  setIntensity (intensity) { this._intensity = intensity }
}

export default PrimitivesStack
