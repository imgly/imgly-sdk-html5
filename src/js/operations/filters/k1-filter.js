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
 * K1 Filter
 * @class
 * @alias ImglyKit.Filters.K1Filter
 * @extends {ImglyKit.Filter}
 */
class K1Filter extends Filter {
  /**
   * A unique string that identifies this operation. Can be used to select
   * the active filter.
   * @type {String}
   */
  static get identifier () {
    return "k1";
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return "K1";
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
      controlPoints: [
        [0, 0],
        [53, 32],
        [91, 80],
        [176, 205],
        [255, 255]
      ]
    }));

    // Saturation
    stack.add(new Filter.Primitives.Saturation({
      saturation: 0.9
    }));

    stack.render(renderer);
  }
}

export default K1Filter;
