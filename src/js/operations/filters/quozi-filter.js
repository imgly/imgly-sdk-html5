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
 * Quozi Filter
 * @class
 * @alias ImglyKit.Filters.QuoziFilter
 * @extends {ImglyKit.Filter}
 */
var QuoziFilter = Filter.extend({});

/**
 * A unique string that identifies this operation. Can be used to select
 * the active filter.
 * @type {String}
 */
QuoziFilter.identifier = "quozi";

/**
 * Renders the filter
 * @param  {Renderer} renderer
 * @return {Promise}
 */
QuoziFilter.prototype.render = function(renderer) {
  var stack = new Filter.PrimitivesStack();

  // Desaturation
  stack.add(new Filter.Primitives.Desaturation({
    desaturation: 0.65
  }));

  // Tone curve
  stack.add(new Filter.Primitives.ToneCurve({
    rgbControlPoints: {
      red: [
        [0, 50],
        [40, 78],
        [118, 170],
        [181, 211],
        [255, 255]
      ],
      green: [
        [0, 27],
        [28, 45],
        [109, 157],
        [157, 195],
        [179, 208],
        [206, 212],
        [255, 240]
      ],
      blue: [
        [0, 50],
        [12, 55],
        [46, 103],
        [103, 162],
        [194, 182],
        [241, 201],
        [255, 219]
      ]
    }
  }));

  stack.render(renderer);
};

module.exports = QuoziFilter;
