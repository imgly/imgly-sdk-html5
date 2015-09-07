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
 * Texas Filter
 * @class
 * @alias ImglyKit.Filters.TexasFilter
 * @extends {ImglyKit.Filter}
 */
class TexasFilter extends Filter {
  /**
   * A unique string that identifies this operation. Can be used to select
   * the active filter.
   * @type {String}
   */
  static get identifier () {
    return 'texas'
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return 'Texas'
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
          [0, 72],
          [89, 99],
          [176, 212],
          [255, 237]
        ],
        green: [
          [0, 49],
          [255, 192]
        ],
        blue: [
          [0, 72],
          [255, 151]
        ]
      }
    }))

    stack.render(renderer)
  }
}

export default TexasFilter
