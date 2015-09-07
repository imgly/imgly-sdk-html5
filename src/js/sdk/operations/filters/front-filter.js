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
 * Front Filter
 * @class
 * @alias ImglyKit.Filters.FrontFilter
 * @extends {ImglyKit.Filter}
 */
class FrontFilter extends Filter {
  /**
   * A unique string that identifies this operation. Can be used to select
   * the active filter.
   * @type {String}
   */
  static get identifier () {
    return 'front'
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return 'Front'
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
          [0, 65],
          [28, 67],
          [67, 113],
          [125, 183],
          [187, 217],
          [255, 229]
        ],
        green: [
          [0, 52],
          [42, 59],
          [104, 134],
          [169, 209],
          [255, 240]
        ],
        blue: [
          [0, 52],
          [65, 68],
          [93, 104],
          [150, 153],
          [255, 198]
        ]
      }
    }))

    stack.render(renderer)
  }
}

export default FrontFilter
