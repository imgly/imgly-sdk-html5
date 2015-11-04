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
 * X400 Filter
 * @class
 * @alias PhotoEditorSDK.Filters.X400Filter
 * @extends {PhotoEditorSDK.Filter}
 */
class X400Filter extends Filter {
  constructor (...args) {
    super(...args)

    this._stack.add(new Filter.Primitives.X400())
  }

  /**
   * A unique string that identifies this operation. Can be used to select
   * the active filter.
   * @type {String}
   */
  static get identifier () {
    return 'x400'
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return 'X400'
  }
}

export default X400Filter
