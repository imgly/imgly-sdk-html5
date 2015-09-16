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
 * Mellow Filter
 * @class
 * @alias ImglyKit.Filters.MellowFilter
 * @extends {ImglyKit.Filter}
 */
class MellowFilter extends Filter {
  constructor (...args) {
    super(...args)

    this._stack.add(new Filter.Primitives.ToneCurve({
      rgbControlPoints: {
        red: [
          [0, 0],
          [41, 84],
          [87, 134],
          [255, 255]
        ],
        green: [
          [0, 0],
          [255, 216]
        ],
        blue: [
          [0, 0],
          [255, 131]
        ]
      }
    }))
  }

  /**
   * A unique string that identifies this operation. Can be used to select
   * the active filter.
   * @type {String}
   */
  static get identifier () {
    return 'mellow'
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return 'Mellow'
  }
}

export default MellowFilter
