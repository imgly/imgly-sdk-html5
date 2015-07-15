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
 * BW Filter
 * @class
 * @alias ImglyKit.Filters.BWFilter
 * @extends {ImglyKit.Filter}
 */
class BWFilter extends Filter {
  /**
   * A unique string that identifies this operation. Can be used to select
   * the active filter.
   * @type {String}
   */
  static get identifier () {
    return 'bw'
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return 'B&W'
  }

  /**
   * Renders the filter
   * @param  {Renderer} renderer
   * @return {Promise}
   */
  render (renderer) {
    var stack = new Filter.PrimitivesStack()

    stack.add(new Filter.Primitives.Grayscale())

    stack.render(renderer)
  }
}

export default BWFilter
