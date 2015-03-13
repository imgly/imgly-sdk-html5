"use strict";
/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Filter from "./filter";

/**
 * Orchid Filter
 * @class
 * @alias ImglyKit.Filters.OrchidFilter
 * @extends {ImglyKit.Filter}
 */
class OrchidFilter extends Filter {
  /**
   * A unique string that identifies this operation. Can be used to select
   * the active filter.
   * @type {String}
   */
  static get identifier () {
    return "orchid";
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return "Orchid";
  }

  /**
   * Renders the filter
   * @param  {Renderer} renderer
   * @return {Promise}
   */
  render (renderer) {
    var stack = new Filter.PrimitivesStack();

    // Tone curve
    stack.add(new Filter.Primitives.ToneCurve({
      rgbControlPoints: {
        red: [
          [0, 0],
          [115, 130],
          [195, 215],
          [255, 255]
        ],
        green: [
          [0, 0],
          [148, 153],
          [172, 215],
          [255, 255]
        ],
        blue: [
          [0, 46],
          [58, 75],
          [178, 205],
          [255, 255]
        ]
      }
    }));

    // Tone curve
    stack.add(new Filter.Primitives.ToneCurve({
      controlPoints: [
        [0, 0],
        [117, 151],
        [189, 217],
        [255, 255]
      ]
    }));

    // Desaturation
    stack.add(new Filter.Primitives.Desaturation({
      desaturation: 0.65
    }));

    stack.render(renderer);
  }
}

export default OrchidFilter;
