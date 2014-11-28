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
 * Pola669 Filter
 * @class
 * @alias ImglyKit.Filters.Pola669Filter
 * @extends {ImglyKit.Filter}
 */
var Pola669Filter = Filter.extend({});

/**
 * A unique string that identifies this operation. Can be used to select
 * the active filter.
 * @type {String}
 */
Pola669Filter.identifier = "pola669";

/**
 * Renders the filter
 * @param  {Renderer} renderer
 * @return {Promise}
 */
Pola669Filter.prototype.render = function(renderer) {
  var stack = new Filter.PrimitivesStack();

  stack.add(new Filter.Primitives.ToneCurve({
    rgbControlPoints: {
      red: [
        [0, 0],
        [56, 18],
        [196, 209],
        [255, 255]
      ],
      green: [
        [0, 38],
        [71, 84],
        [255, 255]
      ],
      blue: [
        [0, 0],
        [131, 133],
        [204, 211],
        [255, 255]
      ]
    }
  }));

  stack.add(new Filter.Primitives.Saturation({
    saturation: 0.8
  }));

  stack.add(new Filter.Primitives.Contrast({
    contrast: 1.5
  }));

  stack.render(renderer);
};

module.exports = Pola669Filter;
