"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var RenderImage = require("./render-image");
var ImageExporter = require("./image-exporter");
var Constants = require("./constants");

/**
 * @class
 * @param {Object} options
 * @param {HTMLElement} [options.container] - Specifies where the UI should be
 *                                          added to. If none is given, the UI
 *                                          will automatically be disabled.
 * @param {Image} options.image - The source image
 */
function ImglyKit(options) {
  // `options` is required
  if (typeof options === "undefined") throw new Error("No options given.");
  // `options.image` is required
  if (typeof options.image === "undefined") throw new Error("`options.image` is undefined.");

  /**
   * @type {Object}
   * @private
   */
  this._options = options;

  /**
   * The stack of {@link Operation} instances that will be used
   * to render the final Image
   * @type {Array.<ImglyKit.Operation>}
   */
  this.operationsStack = [];

  this.reset();
}

/**
 * The current version of the SDK
 * @name ImglyKit.version
 * @internal Keep in sync with package.json
 */
ImglyKit.version = "0.0.1";

// Exposed classes
ImglyKit.RenderImage = require("./render-image");
ImglyKit.Operation = require("./operations/operation");
ImglyKit.Operations = {};
ImglyKit.Operations.FiltersOperation = require("./operations/filters-operation");
ImglyKit.Operations.RotationOperation = require("./operations/rotation-operation");
ImglyKit.Operations.CropOperation = require("./operations/crop-operation");
ImglyKit.Operations.SaturationOperation = require("./operations/saturation-operation");
ImglyKit.Operations.ContrastOperation = require("./operations/contrast-operation");
ImglyKit.Operations.BrightnessOperation = require("./operations/brightness-operation");
ImglyKit.Operations.FlipOperation = require("./operations/flip-operation");
ImglyKit.Operations.TiltShiftOperation = require("./operations/tilt-shift-operation");

// Exposed constants
ImglyKit.RenderType = Constants.RenderType;
ImglyKit.ImageFormat = Constants.ImageFormat;
ImglyKit.Vector2 = require("./lib/math/vector2");

/**
 * Renders the image
 * @param  {ImglyKit.RenderType} [renderType=ImglyKit.RenderType.DATA_URL] - The output type
 * @param  {ImglyKit.ImageFormat} [imageFormat=ImglyKit.ImageFormat.PNG] - The output image format
 * @param  {string} [dimensions] - The final dimensions of the image
 * @return {Promise}
 */
ImglyKit.prototype.render = function(renderType, imageFormat, dimensions) {
  var settings = ImageExporter.validateSettings(renderType, imageFormat);

  renderType = settings.renderType;
  imageFormat = settings.imageFormat;

  // Create a RenderImage
  var renderImage = new RenderImage(this._options.image, this.operationsStack, dimensions, this._options.renderer);

  // Initiate image rendering
  return renderImage.render()
    .then(function () {
      var canvas = renderImage.getRenderer().getCanvas();
      return ImageExporter.export(canvas, renderType, imageFormat);
    });
};

/**
 * Resets all custom and selected operations
 */
ImglyKit.prototype.reset = function () {

};

module.exports = ImglyKit;
