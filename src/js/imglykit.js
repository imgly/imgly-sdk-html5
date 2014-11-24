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

/**
 * @class
 */
function ImglyKit() {
  /**
   * @type {ImglyKit.OperationsManager}
   */
  this.operations = new OperationsManager();

  /**
   * The stack of {@link Operation} instances that will be used
   * to render the final Image
   * @type {array.<Operation>}
   */
  this.operationsStack = [];

  this.reset();
}

/**
 * The current version of the SDK
 * @name ImglyKit.version
 */
ImglyKit.version = "0.0.1";

// Exposed classes
ImglyKit.Operation = require("./operations/operation");

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

if (typeof window !== "undefined") {
  window.ImglyKit = ImglyKit;
} else if (typeof module !== "undefined") {
  module.exports = ImglyKit;
} else if (typeof global !== "undefined") {
  global.ImglyKit = ImglyKit;
}
