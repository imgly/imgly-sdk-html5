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
var Utils = require("../lib/utils");

/**
 * An operation that can rotate the canvas
 *
 * @class
 * @alias ImglyKit.Operations.RotationOperation
 * @extends ImglyKit.Operation
 */
var RotationOperation = Operation.extend({
  constructor: function () {
    Operation.apply(this, arguments);

    if (typeof this._options.degrees === "undefined") {
      this._options.degrees = 0;
    }
  }
});

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
RotationOperation.identifier = "rotation";

/**
 * Checks whether this Operation can be applied the way it is configured
 * @return {boolean}
 */
RotationOperation.prototype.validateSettings = function() {
  if (this._options.degrees % 90 !== 0) {
    throw new Error("RotationOperation: `rotation` must be a multiple of 90");
  }
};

/**
 * The fragment shader used for this operation
 */
RotationOperation.fragmentShader = Utils.shaderString(function () {/**webgl

  precision mediump float;
  uniform sampler2D u_image;
  varying vec2 v_texCoord;
  uniform bool u_rotation;

  void main() {
    gl_FragColor = texture2D(u_image, v_texCoord);
  }

*/});

/**
 * Applies this operation
 * @param  {Renderer} renderer
 * @return {Promise}
 * @abstract
 */
RotationOperation.prototype.render = function(renderer) {
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
RotationOperation.prototype._renderWebGL = function(renderer) {
  renderer.runShader(null, RotationOperation.fragmentShader, {
    uniforms: {
      u_rotation: { type: "f", value: this._options.rotation }
    }
  });
};

/**
 * Crops the image using Canvas2D
 * @param  {CanvasRenderer} renderer
 */
RotationOperation.prototype._renderCanvas = function(renderer) {
  var canvas = renderer.getCanvas();
  var context = renderer.getContext();

  var actualDegrees = this._options.degrees % 360;
  var width = canvas.width;
  var height = canvas.height;

  if (actualDegrees % 180 !== 0) {
    width = canvas.height;
    height = canvas.width;
  }

  // Create a rotated canvas
  var newCanvas = renderer.createCanvas();
  newCanvas.width = width;
  newCanvas.height = height;
  var newContext = newCanvas.getContext("2d");

  newContext.save();

  // Translate the canvas
  newContext.translate(newCanvas.width / 2, newCanvas.height / 2);

  // Rotate the canvas
  newContext.rotate(actualDegrees * (Math.PI / 180));

  // Create a temporary canvas so that we can draw the image
  // with the applied transformation
  var tempCanvas = renderer.cloneCanvas();
  newContext.drawImage(tempCanvas, -canvas.width / 2, -canvas.height / 2);

  // Restore old transformation
  newContext.restore();

  renderer.setCanvas(newCanvas);
};

module.exports = RotationOperation;
