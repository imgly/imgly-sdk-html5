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
 * K6 Filter
 * @class
 * @alias ImglyKit.Filters.K6Filter
 * @extends {ImglyKit.Filter}
 */
class K6Filter extends Filter {
  constructor (...args) {
    super(...args)

    // Saturation
    this._stack.add(new Filter.Primitives.Saturation({
      saturation: 0.5
    }))
  }

  /**
   * A unique string that identifies this operation. Can be used to select
   * the active filter.
   * @type {String}
   */
  static get identifier () {
    return 'k6'
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return 'K6'
  }
}

export default K6Filter
