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
 * Pola Filter
 * @class
 * @alias ImglyKit.Filters.PolaFilter
 * @extends {ImglyKit.Filter}
 */
class PolaFilter extends Filter {
  /**
   * A unique string that identifies this operation. Can be used to select
   * the active filter.
   * @type {String}
   */
  static get identifier () {
    return "pola";
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return "Pola SX";
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
  }
}

export default PolaFilter;
