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

var PrimitivesStack = require("./filters/primitives-stack");
var ContrastPrimitive = require("./filters/primitives/contrast");

/**
 * @class
 * @alias ImglyKit.Operations.ContrastOperation
 * @extends ImglyKit.Operation
 */
var ContrastOperation = Operation.extend({});

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
ContrastOperation.identifier = "contrast";

/**
 * Checks whether this Operation can be applied the way it is configured
 * @return {boolean}
 */
ContrastOperation.prototype.validateSettings = function() {
  if (this._options.contrast === null) {
    throw new Error("ContrastOperation: No contrast set.");
  }
};

/**
 * Renders the filter
 * @param  {Renderer} renderer
 * @return {Promise}
 */
ContrastOperation.prototype.render = function(renderer) {
  var stack = new PrimitivesStack();

  stack.add(new ContrastPrimitive({
    contrast: this._options.contrast
  }));

  stack.render(renderer);
};

module.exports = ContrastOperation;
