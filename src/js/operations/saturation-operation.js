"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var _ = require("lodash");
var Operation = require("./operation");
var PrimitivesStack = require("./filters/primitives-stack");
var SaturationPrimitive = require("./filters/primitives/saturation");

/**
 * @class
 * @alias ImglyKit.Operations.SaturationOperation
 * @extends ImglyKit.Operation
 */
var SaturationOperation = Operation.extend({
  constructor: function () {
    Operation.apply(this, arguments);

    this._options = _.defaults(this._options, {
      saturation: 1.0
    });
  }
});

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
SaturationOperation.identifier = "saturation";

/**
 * Checks whether this Operation can be applied the way it is configured
 * @return {boolean}
 */
SaturationOperation.prototype.validateSettings = function() {
  if (typeof this._options.saturation === "undefined") {
    throw new Error("SaturationOperation: No saturation set.");
  }
};

/**
 * Renders the filter
 * @param  {Renderer} renderer
 * @return {Promise}
 */
SaturationOperation.prototype.render = function(renderer) {
  var stack = new PrimitivesStack();

  stack.add(new SaturationPrimitive({
    saturation: this._options.saturation
  }));

  stack.render(renderer);
};

module.exports = SaturationOperation;
