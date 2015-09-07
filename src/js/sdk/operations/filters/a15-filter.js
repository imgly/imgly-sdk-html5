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
 * A15 Filter
 * @class
 * @alias ImglyKit.Filters.A15Filter
 * @extends {ImglyKit.Filter}
 */
class A15Filter extends Filter {
  /**
   * A unique string that identifies this operation. Can be used to select
   * the active filter.
   * @type {String}
   */
  static get identifier () {
    return 'a15'
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return '15'
  }

  /**
   * Renders the filter
   * @param  {Renderer} renderer
   * @return {Promise}
   */
  render (renderer) {
    var stack = new Filter.PrimitivesStack()

    stack.add(new Filter.Primitives.Contrast({
      contrast: 0.63
    }))

    stack.add(new Filter.Primitives.Brightness({
      brightness: 0.12
    }))

    stack.add(new Filter.Primitives.ToneCurve({
      rgbControlPoints: {
        red: [
          [0, 38],
          [94, 94],
          [148, 142],
          [175, 187],
          [255, 255]
        ],
        green: [
          [0, 0],
          [77, 53],
          [171, 190],
          [255, 255]
        ],
        blue: [
          [0, 10],
          [48, 85],
          [174, 228],
          [255, 255]
        ]
      }
    }))

    stack.render(renderer)
  }
}

export default A15Filter
