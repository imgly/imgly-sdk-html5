/* jshint unused:false */
"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

/**
 * Base class for Operations. Extendable via {@link ImglyKit.Operation#extend}.
 * @class
 * @alias ImglyKit.Operation
 */
function Operation(kit) {
  this.kit = kit;
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
Operation.identifier = null;

/**
 * Checks whether this Operation can be applied the way it is configured
 */
Operation.prototype.validateSettings = function() {};

/**
 * Applies this operation
 * @param  {Renderer} renderer
 * @return {Promise}
 * @abstract
 */
Operation.prototype.render = function(renderer) {
  /* istanbul ignore next */
  throw new Error("Operation#render is abstract and not implemented in inherited class.");
};

/**
 * To create an {@link ImglyKit.Operation} class of your own, call this
 * method and provide instance properties and functions.
 * @function
 */
Operation.extend = require("../lib/extend");

module.exports = Operation;
