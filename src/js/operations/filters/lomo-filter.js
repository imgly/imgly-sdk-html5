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
 * Lomo Filter
 * @class
 * @alias ImglyKit.Filters.LomoFilter
 * @extends {ImglyKit.Filter}
 */
var LomoFilter = Filter.extend({});

/**
 * A unique string that identifies this operation. Can be used to select
 * the active filter.
 * @type {String}
 */
LomoFilter.identifier = "lomo";

/**
 * Renders the filter
 * @param  {Renderer} renderer
 * @return {Promise}
 */
LomoFilter.prototype.render = function(renderer) {
  var stack = new Filter.PrimitivesStack();

  stack.add(new Filter.Primitives.ToneCurve({
    controlPoints: [
      [0, 0],
      [87, 20],
      [131, 156],
      [183, 205],
      [255, 200]
    ]
  }));

  stack.render(renderer);
};

module.exports = LomoFilter;
