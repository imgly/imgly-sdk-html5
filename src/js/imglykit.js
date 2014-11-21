"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var OperationsManager = require("./lib/operations-manager");

/**
 * @class
 */
function ImglyKit() {
  /**
   * The stack of {@link Operation} instances that will be used
   * to render the final Image
   * @type {array.<Operation>}
   */
  this.operationsStack = [];
}

/**
 * The current version of the SDK
 * @name ImglyKit.version
 */
ImglyKit.version = "0.0.1";

/**
 * The global OperationsManager object
 * @type {OperationsManager}
 */
ImglyKit.operations = new OperationsManager();

// Exposed classes
ImglyKit.Operation = require("./operations/operation");

/**
 * Registers all default operations
 * @private
 */
ImglyKit._registerOperations = function () {
  this.operations.register(require("./operations/filters-operation"));
  this.operations.register(require("./operations/rotation-operation"));
  this.operations.register(require("./operations/crop-operation"));
};

/**
 * Resets all custom and selected operations
 */
ImglyKit.reset = function () {
  this.operations.reset();
  this._registerOperations();
}

// Initial operations registration
ImglyKit._registerOperations();

if (typeof window !== "undefined") {
  window.ImglyKit = ImglyKit;
} else if (typeof module !== "undefined") {
  module.exports = ImglyKit;
} else if (typeof global !== "undefined") {
  global.ImglyKit = ImglyKit;
}
