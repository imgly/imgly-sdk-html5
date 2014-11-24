"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Utils = require("./lib/utils");

/**
 * Manages the available and selected operations
 * @class
 * @alias ImglyKit.OperationsManager
 * @param {ImglyKit} kit
 */
function OperationsManager(kit) {
  /**
   * @type {ImglyKit}
   * @private
   */
  this._kit = kit;

  /**
   * The registered operations
   * @type {Object.<string, class>}
   */
  this.operations = {};

  /**
   * The enabled operations
   * @type {Array.<class>}
   */
  this.enabledOperations = [];
}

/**
 * Sets the active {@link Operation} objects
 * @param  {ImglyKit~Selector} selector - A Selector object that
 *                                      specifies which operations should
 *                                      be enabled.
 */
OperationsManager.prototype.select = function(selector) {
  if (["string", "object", "array"].indexOf(typeof selector) === -1) {
    throw new Error("Argument of type " + typeof selector + " is not a valid selector.");
  }

  var availableIdentifiers = [];
  var name, operation;

  // Iterate over all available operations, get their identifiers
  for (name in this.operations) {
    operation = this.operations[name];
    availableIdentifiers.push(operation.identifier);
  }

  // Filter the identifiers
  var selectedIdentifiers = Utils.select(availableIdentifiers, selector);

  // Iterate over all available operations, finding those that have been
  // selected and push them to the `enabledOperations` array
  this.enabledOperations = [];
  for (name in this.operations) {
    operation = this.operations[name];
    if (selectedIdentifiers.indexOf(operation.identifier) !== -1) {
      this.enabledOperations.push(operation);
    }
  }
};

/**
 * Registers the given {@link Operation}
 * @param  {class} operation - The {@link Operation} to register
 */
OperationsManager.prototype.register = function(operation) {
  if (this.operations[operation.identifier]) {
    throw new Error("An operation with identifier \"" + operation.identifier +
      "\" has already been registered.");
  }

  // Register the operation
  this.operations[operation.identifier] = operation;

  // Enable it per default
  this.enabledOperations.push(operation);
};

/**
 * Finds the instance of the {@link Operation} with the given identifier
 * @param  {string} identifier - The {@link Operation}'s identifier
 */
OperationsManager.prototype.find = function(identifier) {
  for (var name in this.operations) {
    var operation = this.operations[name];
    if (operation.identifier === identifier) {
      return operation;
    }
  }
  return null;
};

/**
 * Resets all custom and selected operations
 */
OperationsManager.prototype.reset = function() {
  this.operations = {};
  this.enabledOperations = [];
};

module.exports = OperationsManager;
