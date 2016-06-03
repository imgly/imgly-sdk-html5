/* global Image */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

const MAX_CONTEXT_LOST_COUNT = 3

import Renderer from './renderer'
import Vector2 from '../lib/math/vector2'
import Promise from '../vendor/promise'

/**
 * @class
 * @alias ImglyKit.WebGLRenderer
 * @extends {ImglyKit.Renderer}
 * @private
 */
class WebGLRenderer extends Renderer {
  constructor (...args) {
    super(...args)
    this._contextLostCount = 0
    this._handleContextLoss()

    this._defaultProgram = this.setupGLSLProgram()
    this.reset()

    this.id = WebGLRenderer.contextId
    WebGLRenderer.contextId++
  }

  /**
   * Gets called when the webgl context has been lost
   * @private
   */
  _handleContextLoss () {
    this._canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault()
      this._contextLostCount++

      let err = new Error('WebGL context has been lost')
      err.code = 'WEBGL_CONTEXT_LOST'
      this.emit('error', err)
    })
    this._canvas.addEventListener('webglcontextrestored', () => {
      if (this._contextLostCount >= MAX_CONTEXT_LOST_COUNT) {
        let err = new Error('WebGL context has been lost and could not be restored')
        err.code = 'WEBGL_CONTEXT_LOST_LIMIT'
        return this.emit('error', err)
      }
      this.emit('reset')
      this.reset(true, true)
    })
  }

  /**
   * Returns the context options passed to getContext()
   * @type {Object}
   * @private
   */
  get _contextOptions () {
    return {
      alpha: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: true
    }
  }

  /**
   * A unique string that identifies this renderer
   * @type {String}
   */
  get identifier () {
    return 'webgl'
  }

  /**
   * Caches the current canvas content for the given identifier
   * @param {String} identifier
   */
  cache (identifier) {
    // Re-use FBO and textures
    let fbo, texture, cacheObject
    if (!this._cache[identifier]) {
      cacheObject = this._createFramebuffer()
    } else {
      cacheObject = this._cache[identifier]
    }

    // Extract FBO and texture
    fbo = cacheObject.fbo
    texture = cacheObject.texture

    // Resize output texture
    let gl = this._context
    gl.useProgram(this._defaultProgram)
    this._setCoordinates(this._defaultProgram)

    // Resize cached texture
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this._size.x, this._size.y, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

    // Render to FBO
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.viewport(0, 0, this._size.x, this._size.y)

    // Use last fbo texture as input
    gl.bindTexture(gl.TEXTURE_2D, this._lastTexture)

    gl.drawArrays(gl.TRIANGLES, 0, 6)

    this._cache[identifier] = { fbo, texture, size: this._size.clone() }
  }

  /**
   * Draws the stored texture / image data for the given identifier
   * @param {String} identifier
   */
  drawCached (identifier) {
    let { texture, size } = this._cache[identifier]

    let fbo = this.getCurrentFramebuffer()
    let currentTexture = this.getCurrentTexture()

    let gl = this._context
    gl.useProgram(this._defaultProgram)
    this._setCoordinates(this._defaultProgram)

    // Resize all textures
    for (let i = 0; i < this._textures.length; i++) {
      let otherTexture = this._textures[i]
      gl.bindTexture(gl.TEXTURE_2D, otherTexture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size.x, size.y, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    }

    // Select the current framebuffer to draw to
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)

    // Resize the texture we're drawing to
    gl.bindTexture(gl.TEXTURE_2D, currentTexture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size.x, size.y, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

    // Use the cached texture as input
    gl.bindTexture(gl.TEXTURE_2D, texture)

    gl.viewport(0, 0, size.x, size.y)

    // Clear
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // Draw the rectangle
    gl.drawArrays(gl.TRIANGLES, 0, 6)

    this.setLastTexture(currentTexture)
    this.selectNextBuffer()

    this._size = size.clone()
  }

  /**
   * The default vertex shader which just passes the texCoord to the
   * fragment shader.
   * @type {String}
   * @private
   */
  get defaultVertexShader () {
    var shader = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;

      void main() {
        gl_Position = vec4(a_position, 0, 1);
        v_texCoord = a_texCoord;
      }
    `
    return shader
  }

  /**
   * The default fragment shader which will just look up the colors from the
   * texture.
   * @type {String}
   * @private
   */
  get defaultFragmentShader () {
    var shader = `
      precision mediump float;
      uniform sampler2D u_image;
      varying vec2 v_texCoord;

      void main() {
        gl_FragColor = texture2D(u_image, v_texCoord);
      }
    `
    return shader
  }

  /**
   * Checks whether this type of renderer is supported in the current environment
   * @abstract
   * @returns {boolean}
   */
  static isSupported () {
    if (typeof window === 'undefined') { return false }

    let canvas = document.createElement('canvas')
    let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!gl
  }

  /**
   * Gets the rendering context from the Canvas
   * @return {RenderingContext}
   * @abstract
   */
  _getContext () {
    /* istanbul ignore next */
    let gl = this._canvas.getContext('webgl', this._contextOptions) ||
      this._canvas.getContext('experimental-webgl', this._contextOptions)

    if (window.WebGLDebugUtils) {
      gl = window.WebGLDebugUtils.makeDebugContext(gl)
    }

    gl.disable(gl.DEPTH_TEST)
    gl.disable(gl.CULL_FACE)

    this._maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE)

    return gl
  }

  /**
   * Draws the given image on the canvas
   * @param  {Image} image
   * @returns {Promise}
   */
  /* istanbul ignore next */
  drawImage (image) {
    var gl = this._context
    this._size = new Vector2(gl.drawingBufferWidth, gl.drawingBufferHeight)
    return new Promise((resolve, reject) => {
      gl.useProgram(this._defaultProgram)
      this._setCoordinates(this._defaultProgram)

      var fbo = this.getCurrentFramebuffer()
      var currentTexture = this.getCurrentTexture()

      // Select the current framebuffer
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
      gl.viewport(0, 0, this._size.x, this._size.y)
      gl.bindTexture(gl.TEXTURE_2D, currentTexture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this._size.x, this._size.y, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

      // Create the texture
      var texture = this.createTexture()
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
      this._inputTexture = texture
      this.setLastTexture(texture)

      // Set premultiplied alpha
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)

      // Upload the image into the texture
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

      // Draw the rectangle
      gl.drawArrays(gl.TRIANGLES, 0, 6)

      resolve()
    })
  }

  /**
   * Resizes the given image to fit the maximum texture size
   * @param {Image}
   * @returns {Promise}
   * @private
   */
  prepareImage (image) {
    if (image.width <= this._maxTextureSize &&
        image.height <= this._maxTextureSize) {
      return Promise.resolve(image)
    }

    // Calculate new size that fits the graphics card's max texture size
    let maxSize = new Vector2(this._maxTextureSize, this._maxTextureSize)
    let size = new Vector2(image.width, image.height)
    let scale = Math.min(maxSize.x / size.x, maxSize.y / size.y)
    let newSize = size.clone()
      .multiply(scale)

    // Create a new canvas to draw the image to
    let canvas = this.createCanvas(newSize.x, newSize.y)
    let context = canvas.getContext('2d')

    // Draw the resized image
    context.drawImage(image,
      0, 0,
      size.x, size.y,
      0, 0,
      newSize.x, newSize.y)

    // Turn into a data url and make an image out of it
    let data = canvas.toDataURL('image/jpeg')

    return new Promise((resolve, reject) => {
      let image = new Image()
      image.addEventListener('load', () => {
        resolve(image)
      })
      image.src = data
    })
  }

  /**
   * Clears the WebGL context
   * @param {WebGLRenderingContext} gl
   * @private
   */
  _clear (gl) {
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }

  _setCoordinates (program, textureCoordinates, triangleCoordinates) {
    const gl = this._context

    // Lookup texture coordinates location
    var positionLocation = gl.getAttribLocation(program, 'a_position')
    var texCoordLocation = gl.getAttribLocation(program, 'a_texCoord')

    textureCoordinates = textureCoordinates || new Float32Array([
        // First triangle
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,

        // Second triangle
        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0
      ])

    // Provide texture coordinates
    var texCoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, textureCoordinates, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(texCoordLocation)
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0)

    triangleCoordinates = triangleCoordinates || new Float32Array([
      // First triangle
      -1.0, -1.0,
       1.0, -1.0,
      -1.0, 1.0,

      // Second triangle
      -1.0, 1.0,
       1.0, -1.0,
       1.0, 1.0
    ])

    // Create a buffer for the rectangle positions
    var buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
    gl.bufferData(gl.ARRAY_BUFFER, triangleCoordinates, gl.STATIC_DRAW)
  }

  runProgram (program, options) {
    let gl = this._context
    gl.useProgram(program)
    this._setCoordinates(program, options.textureCoordinates, options.triangleCoordinates)

    var fbo = this.getCurrentFramebuffer()
    var currentTexture = this.getCurrentTexture()

    // Select the current framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.viewport(0, 0, this._size.x, this._size.y)

    // Resize the texture to canvas size
    gl.bindTexture(gl.TEXTURE_2D, currentTexture)

    // Set premultiplied alpha
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this._size.x, this._size.y, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

    // Make sure we select the current texture
    gl.bindTexture(gl.TEXTURE_2D, this._lastTexture)

    // Set the uniforms
    for (var name in options.uniforms) {
      var location = gl.getUniformLocation(program, name)
      var uniform = options.uniforms[name]

      switch (uniform.type) {
        case 'i':
        case '1i':
          gl.uniform1i(location, uniform.value)
          break
        case 'f':
        case '1f':
          gl.uniform1f(location, uniform.value)
          break
        case '2f':
          gl.uniform2f(location, uniform.value[0], uniform.value[1])
          break
        case '3f':
          gl.uniform3f(location, uniform.value[0], uniform.value[1], uniform.value[2])
          break
        case '4f':
          gl.uniform4f(location, uniform.value[0], uniform.value[1], uniform.value[2], uniform.value[3])
          break
        case '2fv':
          gl.uniform2fv(location, uniform.value)
          break
        case 'mat3fv':
          gl.uniformMatrix3fv(location, false, uniform.value)
          break
        default:
          throw new Error('Unknown uniform type: ' + uniform.type)
      }
    }

    // Clear
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // Draw the rectangle
    gl.drawArrays(gl.TRIANGLES, 0, 6)

    this.setLastTexture(currentTexture)
    this.selectNextBuffer()
  }

  /**
   * Runs the given shader
   * @param  {String} [vertexShader]
   * @param  {String} [fragmentShader]
   */
  /* istanbul ignore next */
  runShader (vertexShader, fragmentShader, options) {
    if (typeof options === 'undefined') options = {}
    if (typeof options.uniforms === 'undefined') options.uniforms = {}

    var program = this.setupGLSLProgram(vertexShader, fragmentShader)
    this.runProgram(program, options)
  }

  /**
   * Draws the last used buffer onto the canvas
   */
  /* istanbul ignore next */
  renderFinal () {
    var gl = this._context
    var program = this._defaultProgram
    gl.useProgram(program)

    // Don't draw to framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    // Make sure the viewport size is correct
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)

    // Select the last texture that has been rendered to
    gl.bindTexture(gl.TEXTURE_2D, this._lastTexture)

    // Clear
    this._clear(gl)

    // Draw the rectangle
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }

  /**
   * Sets up a GLSL program. Uses the default vertex and fragment shader
   * if none are given.
   * @param {String} [vertexShader]
   * @param {String} [fragmentShader]
   * @return {WebGLProgram}
   */
  /* istanbul ignore next */
  setupGLSLProgram (vertexShader, fragmentShader, textureCoordinates) {
    var gl = this._context
    var shaders = []

    // Use default vertex shader
    vertexShader = this._createShader(gl.VERTEX_SHADER, vertexShader || WebGLRenderer.prototype.defaultVertexShader)
    shaders.push(vertexShader)

    // Use default fragment shader
    fragmentShader = this._createShader(gl.FRAGMENT_SHADER, fragmentShader || WebGLRenderer.prototype.defaultFragmentShader)
    shaders.push(fragmentShader)

    // Create the program
    var program = gl.createProgram()

    // Attach the shaders
    for (var i = 0; i < shaders.length; i++) {
      gl.attachShader(program, shaders[i])
    }

    // Link the program
    gl.linkProgram(program)

    // Check linking status
    var linked = gl.getProgramParameter(program, gl.LINK_STATUS)
    if (!linked) {
      var lastError = gl.getProgramInfoLog(program)
      gl.deleteProgram(program)
      throw new Error('WebGL program linking error: ' + lastError)
    }

    return program
  }

  /**
   * Creates a WebGL shader with the given type and source code
   * @param  {WebGLShaderType} shaderType
   * @param  {String} shaderSource
   * @return {WebGLShader}
   * @private
   */
  /* istanbul ignore next */
  _createShader (shaderType, shaderSource) {
    var gl = this._context

    // Create the shader and compile it
    var shader = gl.createShader(shaderType)
    gl.shaderSource(shader, shaderSource)
    gl.compileShader(shader)

    // Check compilation status
    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    if (!compiled) {
      var lastError = gl.getShaderInfoLog(shader)
      gl.deleteShader(shader)
      throw new Error('WebGL shader compilation error: ' + lastError)
    }

    return shader
  }

  /**
   * Creates an empty texture
   * @return {WebGLTexture}
   */
  /* istanbul ignore next */
  createTexture () {
    var gl = this._context
    var texture = gl.createTexture()

    gl.bindTexture(gl.TEXTURE_2D, texture)

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

    return texture
  }

  /**
   * Creates two textures and framebuffers that are used for the stack
   * rendering
   * @private
   */
  /* istanbul ignore next */
  _createFramebuffers () {
    for (var i = 0; i < 2; i++) {
      let { fbo, texture } = this._createFramebuffer()
      this._textures.push(texture)
      this._framebuffers.push(fbo)
    }
  }

  /**
   * Creates and returns a frame buffer and texture
   * @return {Object}
   * @private
   */
  _createFramebuffer () {
    let gl = this._context

    // Create texture
    let texture = this.createTexture()

    // Set premultiplied alpha
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this._size.x, this._size.y, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

    // Create framebuffer
    let fbo = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)

    // Attach the texture
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)

    return { fbo, texture }
  }

  /**
   * Resizes the current canvas picture to the given dimensions
   * @param  {Vector2} dimensions
   * @todo Use a downsampling shader for smoother image resizing
   */
  /* istanbul ignore next */
  resizeTo (dimensions) {
    var gl = this._context

    // Resize the canvas
    this._canvas.width = dimensions.x
    this._canvas.height = dimensions.y
  }

  /**
   * Returns the current framebuffer
   * @return {WebGLFramebuffer}
   */
  getCurrentFramebuffer () {
    return this._framebuffers[this._bufferIndex % 2]
  }

  /**
   * Returns the current texture
   * @return {WebGLTexture}
   */
  getCurrentTexture () {
    return this._textures[this._bufferIndex % 2]
  }

  /**
   * Increases the buffer index
   */
  selectNextBuffer () {
    this._bufferIndex++
  }

  /**
   * Returns the default program
   * @return {WebGLProgram}
   */
  getDefaultProgram () {
    return this._defaultProgram
  }

  /**
   * Returns the last texture that has been drawn to
   * @return {WebGLTexture}
   */
  getLastTexture () {
    return this._lastTexture
  }

  /**
   * Returns all textures
   * @return {Array.<WebGLTexture>}
   */
  getTextures () {
    return this._textures
  }

  /**
   * Sets the last texture
   * @param {WebGLTexture} texture
   */
  setLastTexture (texture) {
    this._lastTexture = texture
  }

  /**
   * Resets the renderer
   * @param {Boolean} resetCache = false
   * @param {Boolean} newContext = false
   * @override
   */
  reset (resetCache=false, newContext=false) {
    this._lastTexture = null
    this._textures = []
    this._framebuffers = []
    this._bufferIndex = 0

    if (resetCache) {
      this._cache = []
    }

    if (newContext) {
      this._inputTexture = null
      this._context = this._getContext()
      this._defaultProgram = this.setupGLSLProgram()
    }

    this._createFramebuffers()
    this.setLastTexture(this._inputTexture)
  }

  get maxTextureSize () {
    return this._maxTextureSize
  }
}

WebGLRenderer.contextId = 0

export default WebGLRenderer
