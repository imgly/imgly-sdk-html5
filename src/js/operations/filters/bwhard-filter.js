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
 * BWHard Filter
 * @class
 * @alias ImglyKit.Filters.BWHardFilter
 * @extends {ImglyKit.Filter}
 */
var BWHardFilter = Filter.extend({});

/**
 * A unique string that identifies this operation. Can be used to select
 * the active filter.
 * @type {String}
 */
BWHardFilter.identifier = "bwhard";

/**
 * Renders the filter
 * @param  {Renderer} renderer
 * @return {Promise}
 */
BWHardFilter.prototype.render = function(renderer) {
  var stack = new Filter.PrimitivesStack();

  stack.add(new Filter.Primitives.Grayscale());
  stack.add(new Filter.Primitives.Contrast({
    contrast: 1.5
  }));

  stack.render(renderer);
};

module.exports = BWHardFilter;
