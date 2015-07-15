/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Filter from './filter'

/**
 * Fridge Filter
 * @class
 * @alias ImglyKit.Filters.FridgeFilter
 * @extends {ImglyKit.Filter}
 */
class FridgeFilter extends Filter {
  /**
   * A unique string that identifies this operation. Can be used to select
   * the active filter.
   * @type {String}
   */
  static get identifier () {
    return 'fridge'
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return 'Fridge'
  }

  /**
   * Renders the filter
   * @param  {Renderer} renderer
   * @return {Promise}
   */
  render (renderer) {
    var stack = new Filter.PrimitivesStack()

    // Tone curve
    stack.add(new Filter.Primitives.ToneCurve({
      rgbControlPoints: {
        red: [
          [0, 9],
          [21, 11],
          [45, 24],
          [255, 220]
        ],
        green: [
          [0, 12],
          [21, 21],
          [42, 42],
          [150, 150],
          [170, 173],
          [255, 210]
        ],
        blue: [
          [0, 28],
          [43, 72],
          [128, 185],
          [255, 220]
        ]
      }
    }))

    stack.render(renderer)
  }
}

export default FridgeFilter
