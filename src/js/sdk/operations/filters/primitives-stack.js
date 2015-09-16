/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

/**
 * A helper class that can collect {@link Primitive} instances and render
 * the stack
 * @class
 * @alias ImglyKit.Filter.PrimitivesStack
 */
class PrimitivesStack {
  constructor (intensity) {
    this._intensity = intensity

    this._stack = []

    this._dirty = true
    this._bufferIndex = 0
    this._textures = []
    this._framebuffers = []
    this._fbosAvailable = false

    this._blendFragmentShader = `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform sampler2D u_image;
      uniform sampler2D u_filteredImage;
      uniform float u_intensity;

      void main() {
        vec4 color0 = texture2D(u_image, v_texCoord);
        vec4 color1 = texture2D(u_filteredImage, v_texCoord);
        gl_FragColor = mix(color0, color1, u_intensity);
      }
    `
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
   * @param {ImglyKit.Filter.Primitive} primitive
   */
  add (primitive) {
    this._stack.push(primitive)
  }

  renderWebGL (renderer) {
    if (!this._fbosAvailable) this._createFramebuffers(renderer)

    if (this._dirty) {
      let inputTexture = renderer.getCurrentTexture()
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

    renderer.runShader(null, this._blendFragmentShader, {
      uniforms: {
        u_intensity: { type: 'f', value: this._intensity },
        u_filteredImage: { type: 'i', value: 1 }
      }
    })
  }

  _getCurrentTexture () {
    return this._textures[this._bufferIndex % this._textures.length]
  }

  _getCurrentFramebuffer () {
    return this._framebuffers[this._bufferIndex % this._framebuffers.length]
  }

  renderCanvas (renderer) {
    for (var i = 0; i < this._stack.length; i++) {
      var primitive = this._stack[i]
      primitive.render(renderer)
    }
  }

  /**
   * Renders the stack of primitives on the renderer
   * @param  {Renderer} renderer
   */
  render (renderer) {
    if (renderer.identifier === 'webgl') {
      this.renderWebGL(renderer)
    } else {
      this.renderCanvas(renderer)
    }
  }

  setIntensity (intensity) { this._intensity = intensity }
}

export default PrimitivesStack
