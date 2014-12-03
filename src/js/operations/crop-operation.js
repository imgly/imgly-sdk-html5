"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Operation = require("./operation");
var Vector2 = require("../lib/math/vector2");
var Utils = require("../lib/utils");

/**
 * An operation that can apply a selected filter
 *
 * @class
 * @alias ImglyKit.Operations.CropOperation
 * @extends ImglyKit.Operation
 */
var CropOperation = Operation.extend({});

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
CropOperation.identifier = "crop";

/**
 * The fragment shader used for this operation
 */
CropOperation.fragmentShader = Utils.shaderString(function () {/**webgl

  precision mediump float;
  uniform sampler2D u_image;
  varying vec2 v_texCoord;
  uniform vec4 u_cropCoords;

  void main() {
    vec2 start = u_cropCoords.xy;
    vec2 end = vec2(u_cropCoords.z, u_cropCoords.w);
    vec2 size = end - start;
    gl_FragColor = texture2D(u_image, v_texCoord * size + start);
  }

*/});

/**
 * Checks whether this Operation can be applied the way it is configured
 * @return {boolean}
 */
CropOperation.prototype.validateSettings = function() {
  if (!(this._options.start instanceof Vector2)) {
    throw new Error("CropOperation: `start` has to be a Vector2 instance.");
  }

  if (!(this._options.end instanceof Vector2)) {
    throw new Error("CropOperation: `end` has to be a Vector2 instance.");
  }
};

/**
 * Applies this operation
 * @param  {Renderer} renderer
 * @return {Promise}
 * @abstract
 */
CropOperation.prototype.render = function(renderer) {
  if (renderer.identifier === "webgl") {
    this._renderWebGL(renderer);
  } else {
    this._renderCanvas(renderer);
  }
};

/**
 * Crops this image using WebGL
 * @param  {WebGLRenderer} renderer
 */
CropOperation.prototype._renderWebGL = function(renderer) {
  var canvas = renderer.getCanvas();
  var gl = renderer.getContext();
  var program = renderer.setupGLSLProgram(null, CropOperation.fragmentShader);
  gl.useProgram(program);

  var start = this._options.start;
  var end = this._options.end;

  var originalStartY = start.y;
  start.y = 1 - end.y;
  end.y = 1 - originalStartY;


  // Provide the cropping parameters
  var cropCoordsUniform = gl.getUniformLocation(program, "u_cropCoords");
  gl.uniform4f(cropCoordsUniform, start.x, start.y, end.x, end.y);

  // The new size
  var newDimensions = this._getNewDimensions(renderer);

  // Make sure we're drawing to the current FBO
  var fbo = renderer.getCurrentFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

  // Resize the attached texture
  var attachedTexture = renderer.getCurrentTexture();
  gl.bindTexture(gl.TEXTURE_2D, attachedTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, newDimensions.x, newDimensions.y, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  var lastTexture = renderer.getLastTexture();

  // Resize all textures except the one we already resized and the
  // one we use as input
  var textures = renderer.getTextures();
  var texture;
  for (var i = 0; i < textures.length; i++) {
    texture = textures[i];
    if (texture === attachedTexture) continue;
    if (texture === lastTexture) continue;

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, newDimensions.x, newDimensions.y, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  }

  // Make sure we use the last texture as input
  gl.bindTexture(gl.TEXTURE_2D, lastTexture);

  // Resize the canvas
  canvas.width = newDimensions.x;
  canvas.height = newDimensions.y;

  // Resize the viewport
  gl.viewport(0, 0, newDimensions.x, newDimensions.y);

  // Draw the rectangle
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  // Set the last used texture
  renderer.setLastTexture(attachedTexture);
};

/**
 * Crops the image using Canvas2D
 * @param  {CanvasRenderer} renderer
 */
CropOperation.prototype._renderCanvas = function(renderer) {
  var canvas = renderer.getCanvas();
  var dimensions = new Vector2(canvas.width, canvas.height);

  var newDimensions = this._getNewDimensions(renderer);

  // Create a temporary canvas to draw to
  var newCanvas = renderer.createCanvas();
  newCanvas.width = newDimensions.x;
  newCanvas.height = newDimensions.y;
  var newContext = newCanvas.getContext("2d");

  // The upper left corner of the cropped area on the original image
  var startPosition = dimensions.clone().multiply(this._options.start);

  // Draw the source canvas onto the new one
  newContext.drawImage(canvas,
    startPosition.x, startPosition.y, // source x, y
    newDimensions.x, newDimensions.y, // source dimensions
    0, 0, // destination x, y
    newDimensions.x, newDimensions.y // destination dimensions
    );

  // Set the new canvas
  renderer.setCanvas(newCanvas);
};

/**
 * Gets the new dimensions
 * @return {Vector2}
 * @private
 */
CropOperation.prototype._getNewDimensions = function(renderer) {
  var canvas = renderer.getCanvas();
  var dimensions = new Vector2(canvas.width, canvas.height);

  return this._options.end
    .clone()
    .subtract(this._options.start)
    .multiply(dimensions);
};

module.exports = CropOperation;
