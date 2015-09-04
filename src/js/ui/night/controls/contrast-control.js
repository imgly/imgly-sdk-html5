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

class ContrastControl extends Control {
  /**
   * Entry point for this control
   */
  init () {
    let controlsTemplate = __DOTJS_TEMPLATE('../../../templates/night/operations/contrast_controls.jst')
    this._controlsTemplate = controlsTemplate
    this._partialTemplates.slider = Slider.template
  }

  /**
   * Gets called when this control is activated
   * @override
   */
  _onEnter () {
    this._historyItem = null
    this._operationExistedBefore = !!this._ui.operations.contrast
    this._operation = this._ui.getOrCreateOperation('contrast')

    // Initially set value
    let contrast = this._operation.getContrast()
    this._initialContrast = contrast

    let sliderElement = this._controls.querySelector('.imglykit-slider')
    this._slider = new Slider(sliderElement, {
      minValue: 0,
      maxValue: 2,
      defaultValue: contrast
    })
    this._slider.on('update', this._onUpdate.bind(this))
    this._slider.setValue(this._initialContrast)
  }

  /**
   * Gets called when the back button has been clicked
   * @override
   */
  _onBack () {
    let currentContrast = this._operation.getContrast()

    if (currentContrast === 1.0) {
      this._ui.removeOperation('contrast')
    }

    this._ui.canvas.render()
  }

  /**
   * Gets called when the value has been updated
   * @override
   */
  _onUpdate (value) {
    this._operation.setContrast(value)
    this._ui.canvas.render()

    let currentContrast = this._operation.getContrast()
    if (this._initialContrast !== currentContrast && !this._historyItem) {
      this._historyItem = this._ui.addHistory(this._operation, {
        contrast: this._initialContrast
      }, this._operationExistedBefore)
    }
  }
}

/**
 * A unique string that identifies this control.
 * @type {String}
 */
ContrastControl.prototype.identifier = 'contrast'

export default ContrastControl
