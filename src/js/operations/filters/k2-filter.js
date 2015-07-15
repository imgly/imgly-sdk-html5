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
import Color from '../../lib/color'

/**
 * K2 Filter
 * @class
 * @alias ImglyKit.Filters.K2Filter
 * @extends {ImglyKit.Filter}
 */
class K2Filter extends Filter {
  /**
   * A unique string that identifies this operation. Can be used to select
   * the active filter.
   * @type {String}
   */
  static get identifier () {
    return 'k2'
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return 'K2'
  }

  /**
   * Renders the filter
   * @param  {Renderer} renderer
   * @return {Promise}
   */
  render (renderer) {
    var stack = new Filter.PrimitivesStack()

    // Tone curve
    stack.add(new Filter.Primitives.ToneCurve({
      controlPoints: [
        [0, 0],
        [54, 33],
        [77, 82],
        [94, 103],
        [122, 126],
        [177, 193],
        [229, 232],
        [255, 255]
      ]
    }))

    // Soft color overlay
    stack.add(new Filter.Primitives.SoftColorOverlay({
      color: new Color(40 / 255, 40 / 255, 40 / 255)
    }))

    stack.render(renderer)
  }
}

export default K2Filter
