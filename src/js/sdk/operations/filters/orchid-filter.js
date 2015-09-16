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
 * Orchid Filter
 * @class
 * @alias ImglyKit.Filters.OrchidFilter
 * @extends {ImglyKit.Filter}
 */
class OrchidFilter extends Filter {
  constructor (...args) {
    super(...args)

    // Tone curve
    this._stack.add(new Filter.Primitives.ToneCurve({
      rgbControlPoints: {
        red: [
          [0, 0],
          [115, 130],
          [195, 215],
          [255, 255]
        ],
        green: [
          [0, 0],
          [148, 153],
          [172, 215],
          [255, 255]
        ],
        blue: [
          [0, 46],
          [58, 75],
          [178, 205],
          [255, 255]
        ]
      }
    }))

    // Tone curve
    this._stack.add(new Filter.Primitives.ToneCurve({
      controlPoints: [
        [0, 0],
        [117, 151],
        [189, 217],
        [255, 255]
      ]
    }))

    // Desaturation
    this._stack.add(new Filter.Primitives.Desaturation({
      desaturation: 0.65
    }))
  }

  /**
   * A unique string that identifies this operation. Can be used to select
   * the active filter.
   * @type {String}
   */
  static get identifier () {
    return 'orchid'
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return 'Orchid'
  }
}

export default OrchidFilter
