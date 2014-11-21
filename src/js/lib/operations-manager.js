"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Utils = require("./utils");
var Operation = require("../operations/operation");

/**
 * @constructor
 */
function OperationsManager() {
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
  var availableIdentifiers = this.operations.map(function (operation) {
    return operation.identifier;
  });
  var selectedIdentifiers = Utils.select(availableIdentifiers, selector);
  this.enabledOperations = this.operations.filter(function (operation) {
    return selectedIdentifiers.indexOf(operation) !== -1;
  });
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
  this.operations[operation.identifier] = operation;
};

/**
 * Finds the operation with the given identifier and calls the given
 * function with the operation as first parameter.
 * @param  {string} identifier - The {@link Operation}'s identifier
 * @param  {Function} fn - The function that will be called with the {@link Operation}
 *                         as first parameter.
 */
OperationsManager.prototype.configure = function(identifier, fn) {

};

module.exports = OperationsManager;
