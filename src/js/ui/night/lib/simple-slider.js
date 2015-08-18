/* global __DOTJS_TEMPLATE */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Slider from './slider'

class SimpleSlider extends Slider {
  /**
   * The partial template string
   * @type {String}
   */
  static get template () {
    return __DOTJS_TEMPLATE('../../../templates/night/generics/simple-slider_control.jst')
  }

  /**
   * Sets the slider position to the given X value and resizes
   * the fill div
   * @private
   */
  _setX (x) {
    this._xPosition = x

    this._dotElement.style.left = `${x}px`
    this._fillElement.style.width = `${x}px`
  }
}

export default SimpleSlider
