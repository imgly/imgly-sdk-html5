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
 * Lomo Filter
 * @class
 * @alias ImglyKit.Filters.LomoFilter
 * @extends {ImglyKit.Filter}
 */
class LomoFilter extends Filter {

  /**
   * A unique string that identifies this operation. Can be used to select
   * the active filter.
   * @type {String}
   */
  static get identifier () {
    return 'lomo'
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return 'Lomo'
  }

  /**
   * Renders the filter
   * @param  {Renderer} renderer
   * @return {Promise}
   */
  render (renderer) {
    var stack = new Filter.PrimitivesStack()

    stack.add(new Filter.Primitives.ToneCurve({
      controlPoints: [
        [0, 0],
        [87, 20],
        [131, 156],
        [183, 205],
        [255, 200]
      ]
    }))

    stack.render(renderer)
  }
}

export default LomoFilter
