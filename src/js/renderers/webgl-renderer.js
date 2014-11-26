"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */
var Renderer = require("./renderer");
var Utils = require("../lib/utils");

/**
 * @class
 * @alias ImglyKit.WebGLRenderer
 * @extends {ImglyKit.Renderer}
 * @private
 */
var WebGLRenderer = Renderer.extend({});

/**
 * The default vertex shader which just passes the texCoord to the
 * fragment shader.
 * @type {String}
 * @private
 */
WebGLRenderer.defaultVertexShader = Utils.shaderString(function() {/*webgl

  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;

  void main() {
    gl_Position = vec4(a_position, 0, 1);
    v_texCoord = a_texCoord;
  }

*/});

/**
 * The default fragment shader which will just look up the colors from the
 * texture.
 * @type {String}
 * @private
 */
WebGLRenderer.defaultFragmentShader = Utils.shaderString(function() {/*webgl

  precision mediump float;
  uniform sampler2D u_image;
  varying vec2 v_texCoord;

  void main() {
    gl_FragColor = texture2D(u_image, v_texCoord);
  }

*/});

/**
 * Checks whether this type of renderer is supported in the current environment
 * @abstract
 * @returns {boolean}
 */
WebGLRenderer.isSupported = function () {
  return !!(typeof window !== "undefined" && window.WebGLRenderingContext);
};

/**
 * Gets the rendering context from the Canvas
 * @return {RenderingContext}
 * @abstract
 */
WebGLRenderer.prototype._getContext = function() {
  /* istanbul ignore next */
  return this._canvas.getContext("webgl") ||
    this._canvas.getContext("webgl-experimental");
};

/**
 * Draws the given image on the canvas
 * @param  {Image} image
 */
WebGLRenderer.prototype.drawImage = function(image) {
  var gl = this._context;
  var program = this.setupGLSLProgram();
  gl.useProgram(program);

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

  // Create the texture
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  // Set the parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Upload the image into the texture
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

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

  // Draw the rectangle
  gl.drawArrays(gl.TRIANGLES, 0, 6);
};

/**
 * Runs the given shader
 * @param  {String} [vertexShader]
 * @param  {String} [fragmentShader]
 */
WebGLRenderer.prototype.runShader = function(vertexShader, fragmentShader, options) {
  if (typeof options === "undefined") options = {};
  if (typeof options.uniforms === "undefined") options.uniforms = {};

  var gl = this._context;
  var program = this.setupGLSLProgram(vertexShader, fragmentShader);
  gl.useProgram(program);

  var positionLocation = gl.getAttribLocation(program, "a_position");

  // Set the uniforms
  for (var name in options.uniforms) {
    var location = gl.getUniformLocation(program, name);
    gl.uniform1f(location, options.uniforms[name]);
  }

  // Create a buffer for the rectangle positions
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
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

  // Draw the rectangle
  gl.drawArrays(gl.TRIANGLES, 0, 6);
};

/**
 * Sets up a GLSL program. Uses the default vertex and fragment shader
 * if none are given.
 * @param {String} [vertexShader]
 * @param {String} [fragmentShader]
 * @return {WebGLProgram}
 */
WebGLRenderer.prototype.setupGLSLProgram = function(vertexShader, fragmentShader) {
  var gl = this._context;
  var shaders = [];

  // Use default vertex shader
  vertexShader = this._createShader(gl.VERTEX_SHADER, vertexShader || WebGLRenderer.defaultVertexShader);
  shaders.push(vertexShader);

  // Use default fragment shader
  fragmentShader = this._createShader(gl.FRAGMENT_SHADER, fragmentShader || WebGLRenderer.defaultFragmentShader);
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
  return program;
};

/**
 * Creates a WebGL shader with the given type and source code
 * @param  {WebGLShaderType} shaderType
 * @param  {String} shaderSource
 * @return {WebGLShader}
 * @private
 */
WebGLRenderer.prototype._createShader = function(shaderType, shaderSource) {
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
};

module.exports = WebGLRenderer;
