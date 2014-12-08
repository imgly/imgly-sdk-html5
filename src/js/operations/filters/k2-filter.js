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
var Color = require("../../lib/color");

/**
 * K2 Filter
 * @class
 * @alias ImglyKit.Filters.K2Filter
 * @extends {ImglyKit.Filter}
 */
var K2Filter = Filter.extend({});

/**
 * A unique string that identifies this operation. Can be used to select
 * the active filter.
 * @type {String}
 */
K2Filter.identifier = "k2";

/**
 * Renders the filter
 * @param  {Renderer} renderer
 * @return {Promise}
 */
K2Filter.prototype.render = function(renderer) {
  var stack = new Filter.PrimitivesStack();

  // Tone curve
  stack.add(new Filter.Primitives.ToneCurve({
    controlPoints: [
      [0, 0],
      [54, 33],
      [77, 82],
      [94, 103],
      [122, 126],
      [177, 193],
      [229, 232],
      [255, 255]
    ]
  }));

  // Soft color overlay
  stack.add(new Filter.Primitives.SoftColorOverlay({
    color: new Color(40 / 255, 40 / 255, 40 / 255)
  }));

  stack.render(renderer);
};

module.exports = K2Filter;
