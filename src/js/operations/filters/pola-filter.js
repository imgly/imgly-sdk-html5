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
 * Pola Filter
 * @class
 * @alias ImglyKit.Filters.PolaFilter
 * @extends {ImglyKit.Filter}
 */
var PolaFilter = Filter.extend({});

/**
 * A unique string that identifies this operation. Can be used to select
 * the active filter.
 * @type {String}
 */
PolaFilter.identifier = "pola";

/**
 * Renders the filter
 * @param  {Renderer} renderer
 * @return {Promise}
 */
PolaFilter.prototype.render = function(renderer) {
  var stack = new Filter.PrimitivesStack();

  stack.add(new Filter.Primitives.ToneCurve({
    rgbControlPoints: {
      red: [
        [0, 0],
        [94, 74],
        [181, 205],
        [255, 255]
      ],
      green: [
        [0, 0],
        [34, 34],
        [99, 76],
        [176, 190],
        [255, 255]
      ],
      blue: [
        [0, 0],
        [102, 73],
        [227, 213],
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

module.exports = PolaFilter;
