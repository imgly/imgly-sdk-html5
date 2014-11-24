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
var OperationsStack = require("./operations-stack");

/**
 * @class
 * @param {HTMLElementObject} [container]
 * @param {Object} options
 * @param {boolean} [options.ui=true] - Specifies whether the UI should be visible
 * @param {Image} options.image - The source image
 */
function ImglyKit(container, options) {
  // `container` is optional
  if (typeof options === "undefined") options = container;
  // `options` is required
  if (typeof options !== "object") throw new Error("No options given.");
  // `options.image` is required
  if (typeof options.image === "undefined") throw new Error("`options.image` is undefined.");

  /**
   * @type {ImglyKit.OperationsManager}
   */
  this.operations = new OperationsManager(this);

  /**
   * The stack of {@link Operation} instances that will be used
   * to render the final Image
   * @type {ImglyKit.OperationsStack}
   */
  this.operationsStack = new OperationsStack(this);

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

/**
 * Registers all default operations
 * @private
 */
ImglyKit.prototype._registerOperations = function () {
  this.operations.register(require("./operations/filters-operation"));
  this.operations.register(require("./operations/rotation-operation"));
  this.operations.register(require("./operations/crop-operation"));
};

/**
 * Resets all custom and selected operations
 */
ImglyKit.prototype.reset = function () {
  this.operations.reset();
  this._registerOperations();
};

module.exports = ImglyKit;
