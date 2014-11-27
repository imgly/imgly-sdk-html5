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
 * K1 Filter
 * @class
 * @alias ImglyKit.Filters.K1Filter
 * @extends {ImglyKit.Filter}
 */
var K1Filter = Filter.extend({});

/**
 * A unique string that identifies this operation. Can be used to select
 * the active filter.
 * @type {String}
 */
K1Filter.identifier = "k6";

/**
 * Renders the filter
 * @param  {Renderer} renderer
 * @return {Promise}
 */
K1Filter.prototype.render = function(renderer) {
  var stack = new Filter.PrimitivesStack();

  // Saturation
  stack.add(new Filter.Primitives.Saturation({
    saturation: 0.5
  }));

  stack.render(renderer);
};

module.exports = K1Filter;
