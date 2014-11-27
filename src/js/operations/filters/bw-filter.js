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
 * BW Filter
 * @class
 * @alias ImglyKit.Filters.BWFilter
 * @extends {ImglyKit.Filter}
 */
var BWFilter = Filter.extend({});

/**
 * A unique string that identifies this operation. Can be used to select
 * the active filter.
 * @type {String}
 */
BWFilter.identifier = "bw";

/**
 * Renders the filter
 * @param  {Renderer} renderer
 * @return {Promise}
 */
BWFilter.prototype.render = function(renderer) {
  var stack = new Filter.PrimitivesStack();

  stack.add(new Filter.Primitives.Grayscale());

  stack.render(renderer);
};

module.exports = BWFilter;
