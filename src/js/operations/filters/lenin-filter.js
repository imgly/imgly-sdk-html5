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
 * Lenin Filter
 * @class
 * @alias ImglyKit.Filters.LeninFilter
 * @extends {ImglyKit.Filter}
 */
class LeninFilter extends Filter {
  /**
   * A unique string that identifies this operation. Can be used to select
   * the active filter.
   * @type {String}
   */
  static get identifier () {
    return "lenin";
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return "Lenin";
  }

  /**
   * Renders the filter
   * @param  {Renderer} renderer
   * @return {Promise}
   */
  render (renderer) {
    var stack = new Filter.PrimitivesStack();

    // Desaturation
    stack.add(new Filter.Primitives.Desaturation({
      desaturation: 0.4
    }));

    // Tone curve
    stack.add(new Filter.Primitives.ToneCurve({
      rgbControlPoints: {
        red: [
          [0, 20],
          [40, 20],
          [106, 111],
          [129, 153],
          [190, 223],
          [255, 255]
        ],
        green: [
          [0, 20],
          [40, 20],
          [62, 41],
          [106, 108],
          [132, 159],
          [203, 237],
          [255, 255]
        ],
        blue: [
          [0, 40],
          [40, 40],
          [73, 60],
          [133, 160],
          [191, 297],
          [203, 237],
          [237, 239],
          [255, 255]
        ]
      }
    }));

    stack.render(renderer);
  }
}

export default LeninFilter;
