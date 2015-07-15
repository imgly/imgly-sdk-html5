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
 * Chest Filter
 * @class
 * @alias ImglyKit.Filters.ChestFilter
 * @extends {ImglyKit.Filter}
 */
class ChestFilter extends Filter {
  /**
   * A unique string that identifies this operation. Can be used to select
   * the active filter.
   * @type {String}
   */
  static get identifier () {
    return 'chest'
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return 'Chest'
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
          [0, 0],
          [44, 44],
          [124, 143],
          [221, 204],
          [255, 255]
        ],
        green: [
          [0, 0],
          [130, 127],
          [213, 199],
          [255, 255]
        ],
        blue: [
          [0, 0],
          [51, 52],
          [219, 204],
          [255, 255]
        ]
      }
    }))

    stack.render(renderer)
  }
}

export default ChestFilter
