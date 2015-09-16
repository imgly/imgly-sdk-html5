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
 * KDynamic Filter
 * @class
 * @alias ImglyKit.Filters.KDynamicFilter
 * @extends {ImglyKit.Filter}
 */
class KDynamicFilter extends Filter {
  constructor (...args) {
    super(...args)

    // Tone curve
    this._stack.add(new Filter.Primitives.ToneCurve({
      controlPoints: [
        [0, 0],
        [17, 27],
        [46, 69],
        [90, 112],
        [156, 200],
        [203, 243],
        [255, 255]
      ]
    }))

    // Saturation
    this._stack.add(new Filter.Primitives.Saturation({
      saturation: 0.7
    }))
  }

  /**
   * A unique string that identifies this operation. Can be used to select
   * the active filter.
   * @type {String}
   */
  static get identifier () {
    return 'kdynamic'
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return 'KDynamic'
  }
}

export default KDynamicFilter
