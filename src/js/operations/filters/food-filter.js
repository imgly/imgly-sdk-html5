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
 * Food Filter
 * @class
 * @alias ImglyKit.Filters.FoodFilter
 * @extends {ImglyKit.Filter}
 */
class FoodFilter extends Filter {
  /**
   * A unique string that identifies this operation. Can be used to select
   * the active filter.
   * @type {String}
   */
  static get identifier () {
    return 'food'
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return 'Food'
  }

  /**
   * Renders the filter
   * @param  {Renderer} renderer
   * @return {Promise}
   */
  render (renderer) {
    var stack = new Filter.PrimitivesStack()

    stack.add(new Filter.Primitives.Saturation({
      saturation: 1.35
    }))

    stack.add(new Filter.Primitives.Contrast({
      contrast: 1.1
    }))

    stack.render(renderer)
  }
}

export default FoodFilter
