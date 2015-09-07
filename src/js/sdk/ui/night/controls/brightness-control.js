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

import Control from './control'
import Slider from '../lib/slider'

class BrightnessControl extends Control {
  /**
   * The entry point for this control
   */
  init () {
    let controlsTemplate = __DOTJS_TEMPLATE('../../../templates/night/operations/brightness_controls.jst')
    this._controlsTemplate = controlsTemplate
    this._partialTemplates.slider = Slider.template

    this._onUpdate = this._onUpdate.bind(this)
  }

  /**
   * Gets called when this control is activated
   * @override
   */
  _onEnter () {
    this._historyItem = null
    this._operationExistedBefore = !!this._ui.operations.brightness
    this._operation = this._ui.getOrCreateOperation('brightness')

    // Initially set value
    const brightness = this._operation.getBrightness()
    this._initialBrightness = brightness

    const sliderElement = this._controls.querySelector('.imglykit-slider')
    this._slider = new Slider(sliderElement, {
      minValue: -1,
      maxValue: 1,
      defaultValue: brightness
    })
    this._slider.on('update', this._onUpdate)
    this._slider.setValue(brightness)
  }

  /**
   * Gets called when the back button has been clicked
   * @override
   */
  _onBack () {
    let currentBrightness = this._operation.getBrightness()

    if (currentBrightness === 1.0) {
      this._ui.removeOperation('brightness')
    }

    this._ui.canvas.render()
    this._slider = null
  }

  /**
   * Gets called when the value has been updated
   * @override
   */
  _onUpdate (value) {
    this._operation.setBrightness(value)
    this._ui.canvas.render()

    if (!this._historyItem) {
      this._historyItem = this._ui.addHistory(this._operation, {
        brightness: this._initialBrightness
      }, this._operationExistedBefore)
    }
  }
}

/**
 * A unique string that identifies this control.
 * @type {String}
 */
BrightnessControl.prototype.identifier = 'brightness'

export default BrightnessControl
