"use strict";
/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Renderer from "./renderer";

/**
 * @class
 * @alias ImglyKit.WebGLRenderer
 * @extends {ImglyKit.Renderer}
 * @private
 */
class WebGLRenderer extends Renderer {
  constructor (...args) {
    super(...args);

    this._defaultProgram = this.setupGLSLProgram();
    this.reset();
  }

  /**
   * A unique string that identifies this renderer
   * @type {String}
   */
  get identifier () {
    return "webgl";
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
    `;
    return shader;
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
    `;
    return shader;
  }

  /**
   * Checks whether this type of renderer is supported in the current environment
   * @abstract
   * @returns {boolean}
   */
  static isSupported () {
    return !!(typeof window !== "undefined" && window.WebGLRenderingContext);
  }

  /**
   * Gets the rendering context from the Canvas
   * @return {RenderingContext}
   * @abstract
   */
  _getContext () {
    /* istanbul ignore next */
    return this._canvas.getContext("webgl") ||
      this._canvas.getContext("webgl-experimental");
  }

  /**
   * Draws the given image on the canvas
   * @param  {Image} image
   */
  /* istanbul ignore next */
  drawImage (image) {
    var gl = this._context;
    gl.useProgram(this._defaultProgram);

    // Create the texture
    var texture = this.createTexture();
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    this._inputTexture = texture;
    this.setLastTexture(texture);

    // Upload the image into the texture
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // Draw the rectangle
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  /**
   * Runs the given shader
   * @param  {String} [vertexShader]
   * @param  {String} [fragmentShader]
   */
  /* istanbul ignore next */
  runShader (vertexShader, fragmentShader, options) {
    if (typeof options === "undefined") options = {};
    if (typeof options.uniforms === "undefined") options.uniforms = {};

    var gl = this._context;
    var program = this.setupGLSLProgram(vertexShader, fragmentShader);
    gl.useProgram(program);

    var fbo = this.getCurrentFramebuffer();
    var currentTexture = this.getCurrentTexture();

    // Select the current framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, this._canvas.width, this._canvas.height);

    // Make sure we select the current texture
    gl.bindTexture(gl.TEXTURE_2D, this._lastTexture);

    // Set the uniforms
    for (var name in options.uniforms) {
      var location = gl.getUniformLocation(program, name);
      var uniform = options.uniforms[name];

      switch (uniform.type) {
        case "i":
        case "1i":
          gl.uniform1i(location, uniform.value);
          break;
        case "f":
        case "1f":
          gl.uniform1f(location, uniform.value);
          break;
        case "2f":
          gl.uniform2f(location, uniform.value[0], uniform.value[1]);
          break;
        case "3f":
          gl.uniform3f(location, uniform.value[0], uniform.value[1], uniform.value[2]);
          break;
        case "4f":
          gl.uniform4f(location, uniform.value[0], uniform.value[1], uniform.value[2], uniform.value[3]);
          break;
        case "2fv":
          gl.uniform2fv(location, uniform.value);
          break;
        case "mat3fv":
          gl.uniformMatrix3fv(location, false, uniform.value);
          break;
        default:
          throw new Error("Unknown uniform type: " + uniform.type);
      }
    }

    // Draw the rectangle
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    this.setLastTexture(currentTexture);
    this.selectNextBuffer();
  }

  /**
   * Draws the last used buffer onto the canvas
   */
  /* istanbul ignore next */
  renderFinal () {
    var gl = this._context;
    var program = this._defaultProgram;
    gl.useProgram(program);

    // Don't draw to framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // Make sure the viewport size is correct
    gl.viewport(0, 0, this._canvas.width, this._canvas.height);

    // Select the last texture that has been rendered to
    gl.bindTexture(gl.TEXTURE_2D, this._lastTexture);

    // Draw the rectangle
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  /**
   * Sets up a GLSL program. Uses the default vertex and fragment shader
   * if none are given.
   * @param {String} [vertexShader]
   * @param {String} [fragmentShader]
   * @return {WebGLProgram}
   */
  /* istanbul ignore next */
  setupGLSLProgram (vertexShader, fragmentShader) {
    var gl = this._context;
    var shaders = [];

    // Use default vertex shader
    vertexShader = this._createShader(gl.VERTEX_SHADER, vertexShader || WebGLRenderer.prototype.defaultVertexShader);
    shaders.push(vertexShader);

    // Use default fragment shader
    fragmentShader = this._createShader(gl.FRAGMENT_SHADER, fragmentShader || WebGLRenderer.prototype.defaultFragmentShader);
    shaders.push(fragmentShader);

    // Create the program
    var program = gl.createProgram();

    // Attach the shaders
    for (var i = 0; i < shaders.length; i++) {
      gl.attachShader(program, shaders[i]);
    }

    // Link the program
    gl.linkProgram(program);

    // Check linking status
    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
      var lastError = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error("WebGL program linking error: " + lastError);
    }

    // Lookup texture coordinates location
    var positionLocation = gl.getAttribLocation(program, "a_position");
    var texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

    // Provide texture coordinates
    var texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      // First triangle
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,

      // Second triangle
      0.0, 1.0,
      1.0, 0.0,
      1.0, 1.0
    ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    // Create a buffer for the rectangle positions
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      // First triangle
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,

      // Second triangle
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0
    ]), gl.STATIC_DRAW);

    return program;
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
    var gl = this._context;

    // Create the shader and compile it
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    // Check compilation status
    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
      var lastError = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error("WebGL shader compilation error: " + lastError);
    }

    return shader;
  }

  /**
   * Creates an empty texture
   * @return {WebGLTexture}
   */
  /* istanbul ignore next */
  createTexture () {
    var gl = this._context;
    var texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    return texture;
  }

  /**
   * Creates two textures and framebuffers that are used for the stack
   * rendering
   * @private
   */
  /* istanbul ignore next */
  _createFramebuffers () {
    var gl = this._context;

    for(var i = 0; i < 2; i++) {
      // Create texture
      var texture = this.createTexture();
      this._textures.push(texture);

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this._canvas.width, this._canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

      // Create framebuffer
      var fbo = gl.createFramebuffer();
      this._framebuffers.push(fbo);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

      // Attach the texture
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    }
  }

  /**
   * Resizes the current canvas picture to the given dimensions
   * @param  {Vector2} dimensions
   * @todo Use a downsampling shader for smoother image resizing
   */
  /* istanbul ignore next */
  resizeTo (dimensions) {
    var gl = this._context;

    // Resize the canvas
    this._canvas.width = dimensions.x;
    this._canvas.height = dimensions.y;

    // Update the viewport dimensions
    gl.viewport(0, 0, this._canvas.width, this._canvas.height);

    // Draw the rectangle
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  /**
   * Returns the current framebuffer
   * @return {WebGLFramebuffer}
   */
  getCurrentFramebuffer () {
    return this._framebuffers[this._bufferIndex % 2];
  }

  /**
   * Returns the current texture
   * @return {WebGLTexture}
   */
  getCurrentTexture () {
    return this._textures[this._bufferIndex % 2];
  }

  /**
   * Increases the buffer index
   */
  selectNextBuffer () {
    this._bufferIndex++;
  }

  /**
   * Returns the default program
   * @return {WebGLProgram}
   */
  getDefaultProgram () {
    return this._defaultProgram;
  }

  /**
   * Returns the last texture that has been drawn to
   * @return {WebGLTexture}
   */
  getLastTexture () {
    return this._lastTexture;
  }

  /**
   * Returns all textures
   * @return {Array.<WebGLTexture>}
   */
  getTextures () {
    return this._textures;
  }

  /**
   * Sets the last texture
   * @param {WebGLTexture} texture
   */
  setLastTexture (texture) {
    this._lastTexture = texture;
  }

  reset () {
    this._lastTexture = null;
    this._textures = [];
    this._framebuffers = [];
    this._bufferIndex = 0;

    this._createFramebuffers();
    this.setLastTexture(this._inputTexture);
  }
}

export default WebGLRenderer;
