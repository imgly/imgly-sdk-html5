"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */
var bluebird = require("bluebird");
var ImageDimensions = require("./image-dimensions");
var Vector2 = require("./lib/math/vector2");
var CanvasRenderer = require("./renderers/canvas-renderer");
var WebGLRenderer = require("./renderers/webgl-renderer");

// Load canvas in non-browser environments
var Canvas, isBrowser = true;
if (typeof window === "undefined") {
  Canvas = require("canvas");
  isBrowser = false;
}

/**
 * Handles the image rendering process
 * @class
 * @alias ImglyKit.RenderImage
 * @param {Image} image
 * @param {Array.<ImglyKit.Operation>} operationsStack
 * @param {string} dimensions
 * @private
 */
function RenderImage(image, operationsStack, dimensions) {
  /**
   * @type {Boolean}
   * @private
   * @default true
   */
  this._webglEnabled = true;

  /**
   * @type {Canvas}
   * @private
   */
  this._canvas = null;

  /**
   * @type {CanvasRenderingContext2D|CanvasRenderingContext3D}
   * @private
   */
  this._context = null;

  /**
   * @type {Image}
   * @private
   */
  this._image = image;

  /**
   * @type {Array.<ImglyKit.Operation>}
   * @private
   */
  this._stack = operationsStack;

  /**
   * @type {ImglyKit.ImageDimensions}
   * @private
   */
  this._dimensions = new ImageDimensions(dimensions);

  /**
   * @type {Vector2}
   * @private
   */
  this._initialDimensions = new Vector2(this._image.width, this._image.height);

  this._initCanvas();
}

/**
 * Creates a canvas with the input image drawn on it
 * @return {Promise}
 * @private
 */
RenderImage.prototype._initCanvas = function() {
  this._canvas = isBrowser ? /* istanbul ignore next */ document.createElement("canvas") : new Canvas();
  this._canvas.width = this._initialDimensions.x;
  this._canvas.height = this._initialDimensions.y;

  // Detect WebGL support
  this._context = this._canvas.getContext("webgl") ||
    this._canvas.getContext("webgl-experimental");

  /* istanbul ignore else  */
  if (typeof this._context === "undefined") {
    // No WebGL support
    this._context = this._canvas.getContext("2d");
    this._renderer = new CanvasRenderer(this._canvas, this._context);
    this._webglEnabled = false;
  } else {
    // WebGL support
    this._renderer = new WebGLRenderer(this._canvas, this._context);
    this._webglEnabled = true;
  }

  this._renderer.drawImage(this._image);
};

/**
 * Renders the image
 * @return {Promise}
 */
RenderImage.prototype.render = function() {
  var self = this;
  return bluebird.map(this._stack, function (operation) {
    return operation.render(self._renderer);
  }).then(function () {
    return null;
    // var finalDimensions = self._dimensions.calculateFinalDimensions(self._renderer.getSize());
    // console.log(finalDimensions);
  });
};

/**
 * Returns the canvas
 * @return {Canvas}
 */
RenderImage.prototype.getCanvas = function() {
  return this._canvas;
};

module.exports = RenderImage;
