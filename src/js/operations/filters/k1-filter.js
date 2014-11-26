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
K1Filter.identifier = "k1";

/**
 * Renders the filter
 * @param  {Renderer} renderer
 * @return {Promise}
 */
K1Filter.prototype.render = function(renderer) {
  var stack = new Filter.PrimitivesStack();

  // Tone curve
  // stack.add(new Filter.Primitives.ToneCurve({
  //   controlPoints: [
  //     [0, 0],
  //     [53 / 255, 32 / 255],
  //     [91 / 255, 80 / 255],
  //     [176 / 255, 205 / 255],
  //     [0, 205 / 255]
  //   ]
  // }));

  // Saturation
  stack.add(new Filter.Primitives.Saturation({
    saturation: 0.9
  }));

  stack.render(renderer);
};

module.exports = K1Filter;
