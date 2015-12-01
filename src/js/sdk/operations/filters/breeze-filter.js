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
 * Breeze Filter
 * @class
 * @alias PhotoEditorSDK.Filters.BreezeFilter
 * @extends {PhotoEditorSDK.Filter}
 */
class BreezeFilter extends Filter {
  constructor (...args) {
    super(...args)

    // Desaturation
    this._stack.add(new Filter.Primitives.Desaturation({
      desaturation: 0.5
    }))

    // Tone curve
    this._stack.add(new Filter.Primitives.ToneCurve({
      rgbControlPoints: {
        red: [
          [0, 0],
          [170, 170],
          [212, 219],
          [234, 242],
          [255, 255]
        ],
        green: [
          [0, 0],
          [170, 168],
          [234, 231],
          [255, 255]
        ],
        blue: [
          [0, 0],
          [170, 170],
          [212, 208],
          [255, 255]
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
    return 'breeze'
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return 'Breeze'
  }
}

export default BreezeFilter
