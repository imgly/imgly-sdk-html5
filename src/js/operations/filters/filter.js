/* jshint unused: false */
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
 * Base class for filters. Extendable via {@link ImglyKit.Filter#extend}
 * @class
 * @alias ImglyKit.Filter
 */
function Filter() {

}

/**
 * A unique string that identifies this operation. Can be used to select
 * the active filter.
 * @type {String}
 */
Filter.identifier = null;

/**
 * To create an {@link ImglyKit.Filter} class of your own, call this
 * method and provide instance properties and functions.
 * @function
 */
Filter.extend = require("../../lib/extend");

/**
 * Renders the filter
 * @param  {Renderer} renderer
 * @return {Promise}
 */
Filter.prototype.render = function(renderer) {
  /* istanbul ignore next */
  throw new Error("Filter#render is abstract and not implemented in inherited class.");
};

// Exposed classes
Filter.PrimitivesStack = require("./primitives-stack");
Filter.Primitives = {};
Filter.Primitives.Saturation = require("./primitives/saturation");

module.exports = Filter;
