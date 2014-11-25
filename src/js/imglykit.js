"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var OperationsManager = require("./operations-manager");
var RenderImage = require("./render-image");
var ImageExporter = require("./image-exporter");
var Utils = require("./lib/utils");
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
  if (typeof options !== "object") throw new Error("No options given.");
  // `options.image` is required
  if (typeof options.image === "undefined") throw new Error("`options.image` is undefined.");

  /**
   * @type {Object}
   * @private
   */
  this._options = options;

  /**
   * @type {ImglyKit.OperationsManager}
   */
  this.operations = new OperationsManager(this);

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
ImglyKit.Operation = require("./operations/operation");
ImglyKit.Operations = {};
ImglyKit.Operations.FiltersOperation = require("./operations/filters-operation");
ImglyKit.Operations.RotationOperation = require("./operations/rotation-operation");
ImglyKit.Operations.CropOperation = require("./operations/crop-operation");

// Exposed constants
ImglyKit.RenderType = Constants.RenderType;
ImglyKit.ImageFormat = Constants.ImageFormat;

/**
 * Registers all default operations
 * @private
 */
ImglyKit.prototype._registerOperations = function () {
  this.operations.register(ImglyKit.Operations.FiltersOperation);
  this.operations.register(ImglyKit.Operations.RotationOperation);
  this.operations.register(ImglyKit.Operations.CropOperation);
};

/**
 * Renders the image
 * @param  {ImglyKit.RenderType} [renderType=ImglyKit.RenderType.DATA_URL] - The output type
 * @param  {ImglyKit.ImageFormat} [imageFormat=ImglyKit.ImageFormat.PNG] - The output image format
 * @param  {string} [dimensions] - The final dimensions of the image
 * @return {Promise}
 */
ImglyKit.prototype.render = function(renderType, imageFormat, dimensions) {
  // Validate RenderType
  if ((typeof renderType !== "undefined" && renderType !== null) &&
    Utils.values(ImglyKit.RenderType).indexOf(renderType) === -1) {
    throw new Error("Invalid render type: " + renderType);
  } else if (typeof renderType === "undefined") {
    renderType = ImglyKit.RenderType.DATA_URL;
  }

  // Validate ImageFormat
  if ((typeof imageFormat !== "undefined" && imageFormat !== null) &&
    Utils.values(ImglyKit.ImageFormat).indexOf(imageFormat) === -1) {
    throw new Error("Invalid image format: " + imageFormat);
  } else if (typeof imageFormat === "undefined") {
    imageFormat = ImglyKit.ImageFormat.PNG;
  }

  // Create a RenderImage
  var renderImage = new RenderImage(this._options.image, this.operationsStack, dimensions);

  // Initiate image rendering
  return renderImage.render()
    .then(function () {
      return ImageExporter.export(renderImage.getCanvas(), renderType, imageFormat);
    });
};

/**
 * Resets all custom and selected operations
 */
ImglyKit.prototype.reset = function () {
  this.operations.reset();
  this._registerOperations();
};

module.exports = ImglyKit;
