/** @jsx ReactBEM.createElement **/
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { ReactBEM, Constants } from '../../../../../globals'
import ControlsComponent from '../../../controls-component'
import SliderComponent from '../../../../slider-component'

export default class StickersSaturationControlsComponent extends ControlsComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onSliderValueChange'
    )
    this._selectedSticker = this.getSharedState('selectedSticker')
    this._operation = this.getSharedState('operation')
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the slider value has changed
   * @param {Number} value
   * @private
   */
  _onSliderValueChange (value) {
    let stickerAdjustments = this._selectedSticker.getAdjustments()
    stickerAdjustments.setSaturation((value + 100) / 100)
    this._operation.setDirty(true)
    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the controls of this component
   * @return {ReactBEM.Element}
   */
  renderControls () {
    const adjustments = this._selectedSticker.getAdjustments()
    const saturation = adjustments.getSaturation()

    return (<div bem='e:cell m:slider'>
      <SliderComponent
        style='large'
        minValue={-100}
        maxValue={100}
        valueUnit='%'
        positiveValuePrefix='+'
        label={this._t('controls.adjustments.saturation')}
        onChange={this._onSliderValueChange}
        value={saturation * 100 - 100} />
    </div>)
  }
}

StickersSaturationControlsComponent.identifier = 'saturation'
