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

import Slider from '../lib/slider'
import Control from './control'

class SaturationControl extends Control {
  /**
   * Entry point for this control
   */
  init () {
    let controlsTemplate = __DOTJS_TEMPLATE('../../../templates/night/operations/saturation_controls.jst')
    this._controlsTemplate = controlsTemplate
    this._partialTemplates.slider = Slider.template
  }

  /**
   * Gets called when this control is activated
   * @override
   */
  _onEnter () {
    this._historyItem = null
    this._operationExistedBefore = !!this._ui.operations.saturation
    this._operation = this._ui.getOrCreateOperation('saturation')

    // Initially set value
    let saturation = this._operation.getSaturation()
    this._initialSaturation = saturation

    let sliderElement = this._controls.querySelector('.imglykit-slider')
    this._slider = new Slider(sliderElement, {
      minValue: 0,
      maxValue: 2,
      defaultValue: saturation
    })
    this._slider.on('update', this._onUpdate.bind(this))
    this._slider.setValue(this._initialSaturation)
  }

  /**
   * Gets called when the back button has been clicked
   * @override
   */
  _onBack () {
    let currentSaturation = this._operation.getSaturation()

    if (currentSaturation === 1) {
      this._ui.removeOperation('saturation')
    }

    this._ui.canvas.render()
  }

  /**
   * Gets called when the value has been updated
   * @override
   */
  _onUpdate (value) {
    this._operation.setSaturation(value)
    this._ui.canvas.render()

    let currentSaturation = this._operation.getSaturation()
    if (this._initialSaturation !== currentSaturation && !this._historyItem) {
      this._historyItem = this._ui.addHistory(this._operation, {
        saturation: this._initialSaturation
      }, this._operationExistedBefore)
    }
  }
}

/**
 * A unique string that identifies this control.
 * @type {String}
 */
SaturationControl.prototype.identifier = 'saturation'

export default SaturationControl
