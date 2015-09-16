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
 * Gobblin Filter
 * @class
 * @alias ImglyKit.Filters.GobblinFilter
 * @extends {ImglyKit.Filter}
 */
class GobblinFilter extends Filter {
  constructor (...args) {
    super(...args)

    this._stack.add(new Filter.Primitives.Gobblin())
  }

  /**
   * A unique string that identifies this operation. Can be used to select
   * the active filter.
   * @type {String}
   */
  static get identifier () {
    return 'gobblin'
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return 'Gobblin'
  }
}

export default GobblinFilter
