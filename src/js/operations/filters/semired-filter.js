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
 * Semired Filter
 * @class
 * @alias ImglyKit.Filters.SemiredFilter
 * @extends {ImglyKit.Filter}
 */
class SemiredFilter extends Filter {
  /**
   * A unique string that identifies this operation. Can be used to select
   * the active filter.
   * @type {String}
   */
  static get identifier () {
    return 'semired'
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return 'Semi Red'
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
          [0, 129],
          [75, 153],
          [181, 227],
          [255, 255]
        ],
        green: [
          [0, 8],
          [111, 85],
          [212, 158],
          [255, 226]
        ],
        blue: [
          [0, 5],
          [75, 22],
          [193, 90],
          [255, 229]
        ]
      }
    }))

    stack.add(new Filter.Primitives.Glow())

    stack.render(renderer)
  }
}

export default SemiredFilter
