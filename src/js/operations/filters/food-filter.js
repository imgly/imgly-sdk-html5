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
 * Food Filter
 * @class
 * @alias ImglyKit.Filters.FoodFilter
 * @extends {ImglyKit.Filter}
 */
var FoodFilter = Filter.extend({});

/**
 * A unique string that identifies this operation. Can be used to select
 * the active filter.
 * @type {String}
 */
FoodFilter.identifier = "food";

/**
 * Renders the filter
 * @param  {Renderer} renderer
 * @return {Promise}
 */
FoodFilter.prototype.render = function(renderer) {
  var stack = new Filter.PrimitivesStack();

  stack.add(new Filter.Primitives.Saturation({
    saturation: 1.35
  }));

  stack.add(new Filter.Primitives.Contrast({
    contrast: 1.1
  }));

  stack.render(renderer);
};

module.exports = FoodFilter;
