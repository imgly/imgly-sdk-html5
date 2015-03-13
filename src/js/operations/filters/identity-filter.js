"use strict";
/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Filter from "./filter";

/**
 * Identity Filter
 * @class
 * @alias ImglyKit.Filters.IdentityFilter
 * @extends {ImglyKit.Filter}
 */
class IdentityFilter extends Filter {
  /**
   * A unique string that identifies this operation. Can be used to select
   * the active filter.
   * @type {String}
   */
  static get identifier () {
    return "identity";
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return "Original";
  }

  /**
   * Renders the filter
   * @param  {Renderer} renderer
   * @return {Promise}
   */
  render (renderer) {
    // This is the identity filter, it doesn't have any effect.
  }
}

export default IdentityFilter;
