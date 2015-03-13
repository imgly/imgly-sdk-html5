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
 * Celsius Filter
 * @class
 * @alias ImglyKit.Filters.CelsiusFilter
 * @extends {ImglyKit.Filter}
 */
class CelsiusFilter extends Filter {
  /**
   * A unique string that identifies this operation. Can be used to select
   * the active filter.
   * @type {String}
   */
  static get identifier () {
    return "celsius";
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return "Celsius";
  }

  /**
   * Renders the filter
   * @param  {Renderer} renderer
   * @return {Promise}
   */
  render (renderer) {
    var stack = new Filter.PrimitivesStack();

    stack.add(new Filter.Primitives.ToneCurve({
      rgbControlPoints: {
        red: [
          [0, 69],
          [55, 110],
          [202, 230],
          [255, 255]
        ],
        green: [
          [0, 44],
          [89, 93],
          [185, 141],
          [255, 189]
        ],
        blue: [
          [0, 76],
          [39, 82],
          [218, 138],
          [255, 171]
        ]
      }
    }));

    stack.render(renderer);
  }
}

export default CelsiusFilter;
