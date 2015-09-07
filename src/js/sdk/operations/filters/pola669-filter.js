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
 * Pola669 Filter
 * @class
 * @alias ImglyKit.Filters.Pola669Filter
 * @extends {ImglyKit.Filter}
 */
class Pola669Filter extends Filter {
  /**
   * A unique string that identifies this operation. Can be used to select
   * the active filter.
   * @type {String}
   */
  static get identifier () {
    return 'pola669'
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return 'Pola 669'
  }

  /**
   * Renders the filter
   * @param  {Renderer} renderer
   * @return {Promise}
   */
  render (renderer) {
    var stack = new Filter.PrimitivesStack()

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
    }))

    stack.add(new Filter.Primitives.Saturation({
      saturation: 0.8
    }))

    stack.add(new Filter.Primitives.Contrast({
      contrast: 1.5
    }))

    stack.render(renderer)
  }
}

export default Pola669Filter
