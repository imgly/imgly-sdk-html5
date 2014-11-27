"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = require("./filter");

/**
 * X400 Filter
 * @class
 * @alias ImglyKit.Filters.X400Filter
 * @extends {ImglyKit.Filter}
 */
var X400Filter = Filter.extend({});

/**
 * A unique string that identifies this operation. Can be used to select
 * the active filter.
 * @type {String}
 */
X400Filter.identifier = "x400";

/**
 * Renders the filter
 * @param  {Renderer} renderer
 * @return {Promise}
 */
X400Filter.prototype.render = function(renderer) {
  var stack = new Filter.PrimitivesStack();

  // Tone curve
  stack.add(new Filter.Primitives.X400());

  stack.render(renderer);
};

module.exports = X400Filter;
