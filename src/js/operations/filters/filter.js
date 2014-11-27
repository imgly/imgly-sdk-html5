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
Filter.Primitives.LookupTable = require("./primitives/lookup-table");
Filter.Primitives.ToneCurve = require("./primitives/tone-curve");
Filter.Primitives.SoftColorOverlay = require("./primitives/soft-color-overlay");
Filter.Primitives.Desaturation = require("./primitives/desaturation");
Filter.Primitives.X400 = require("./primitives/x400");
Filter.Primitives.Grayscale = require("./primitives/grayscale");
Filter.Primitives.Contrast = require("./primitives/contrast");
Filter.Primitives.Glow = require("./primitives/glow");
Filter.Primitives.Gobblin = require("./primitives/gobblin");
Filter.Primitives.Brightness = require("./primitives/brightness");

module.exports = Filter;
