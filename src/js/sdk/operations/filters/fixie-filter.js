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
 * Fixie Filter
 * @class
 * @alias ImglyKit.Filters.FixieFilter
 * @extends {ImglyKit.Filter}
 */
class FixieFilter extends Filter {
  constructor (...args) {
    super(...args)

    // Tone curve
    this._stack.add(new Filter.Primitives.ToneCurve({
      rgbControlPoints: {
        red: [
          [0, 0],
          [44, 28],
          [63, 48],
          [128, 132],
          [235, 248],
          [255, 255]
        ],
        green: [
          [0, 0],
          [20, 10],
          [60, 45],
          [190, 209],
          [211, 231],
          [255, 255]
        ],
        blue: [
          [0, 31],
          [41, 62],
          [150, 142],
          [234, 212],
          [255, 224]
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
    return 'fixie'
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return 'Fixie'
  }
}

export default FixieFilter
