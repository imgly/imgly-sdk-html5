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

};

/**
 * Crops the image using Canvas2D
 * @param  {CanvasRenderer} renderer
 */
CropOperation.prototype._renderCanvas = function(renderer) {
  var canvas = renderer.getCanvas();
  var dimensions = new Vector2(canvas.width, canvas.height);

  // The new size, relative to the current dimensions
  var newDimensions = this._options.end
    .clone()
    .subtract(this._options.start)
    .multiply(dimensions);

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

module.exports = CropOperation;
