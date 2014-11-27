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
 * Sunny Filter
 * @class
 * @alias ImglyKit.Filters.SunnyFilter
 * @extends {ImglyKit.Filter}
 */
var SunnyFilter = Filter.extend({});

/**
 * A unique string that identifies this operation. Can be used to select
 * the active filter.
 * @type {String}
 */
SunnyFilter.identifier = "sunny";

/**
 * Renders the filter
 * @param  {Renderer} renderer
 * @return {Promise}
 */
SunnyFilter.prototype.render = function(renderer) {
  var stack = new Filter.PrimitivesStack();

  stack.add(new Filter.Primitives.ToneCurve({
    rgbControlPoints: {
      red: [
        [0, 0],
        [62, 82],
        [141, 154],
        [255, 255]
      ],
      green: [
        [0, 39],
        [56, 96],
        [192, 176],
        [255, 255]
      ],
      blue: [
        [0, 0],
        [174, 99],
        [255, 235]
      ]
    }
  }));

  stack.add(new Filter.Primitives.ToneCurve({
    controlPoints: [
      [0, 0],
      [55, 20],
      [158, 191],
      [255, 255]
    ]
  }));

  stack.render(renderer);
};

module.exports = SunnyFilter;
