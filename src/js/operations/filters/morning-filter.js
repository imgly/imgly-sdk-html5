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
 * Morning Filter
 * @class
 * @alias ImglyKit.Filters.MorningFilter
 * @extends {ImglyKit.Filter}
 */
class MorningFilter extends Filter {
  /**
   * A unique string that identifies this operation. Can be used to select
   * the active filter.
   * @type {String}
   */
  static get identifier () {
    return 'morning'
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return 'Morning'
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
          [0, 40],
          [255, 230]
        ],
        green: [
          [0, 10],
          [255, 225]
        ],
        blue: [
          [0, 20],
          [255, 181]
        ]
      }
    }))

    stack.add(new Filter.Primitives.Glow())

    stack.render(renderer)
  }
}

export default MorningFilter
