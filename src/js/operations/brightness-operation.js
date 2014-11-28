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
var BrightnessPrimitive = require("./filters/primitives/brightness");

/**
 * @class
 * @alias ImglyKit.Operations.BrightnessOperation
 * @extends ImglyKit.Operation
 */
var BrightnessOperation = Operation.extend({});

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
BrightnessOperation.identifier = "brightness";

/**
 * Checks whether this Operation can be applied the way it is configured
 * @return {boolean}
 */
BrightnessOperation.prototype.validateSettings = function() {
  if (this._options.brightness === null) {
    throw new Error("BrightnessOperation: No brightness set.");
  }
};

/**
 * Renders the filter
 * @param  {Renderer} renderer
 * @return {Promise}
 */
BrightnessOperation.prototype.render = function(renderer) {
  var stack = new PrimitivesStack();

  stack.add(new BrightnessPrimitive({
    brightness: this._options.brightness
  }));

  stack.render(renderer);
};

module.exports = BrightnessOperation;
