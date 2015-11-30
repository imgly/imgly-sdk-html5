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

import { ReactBEM, BaseComponent, Constants } from '../../../../../globals'
import SliderComponent from '../../../../slider-component'
import BackButtonComponent from '../../../../back-button-component'

export default class StickersSaturationControlsComponent extends BaseComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onBackClick',
      '_onSliderValueChange'
    )
    this._selectedSticker = this.getSharedState('selectedSticker')
    this._operation = this.getSharedState('operation')
  }

  /**
   * Gets called when the user clicks the back button
   * @param {Event} e
   * @private
   */
  _onBackClick (e) {
    this.props.onSwitchControls('back')
  }

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

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const adjustments = this._selectedSticker.getAdjustments()
    const saturation = adjustments.getSaturation()

    return (<div bem='$b:controls e:table'>
      <BackButtonComponent onClick={this._onBackClick} />
      <div bem='e:cell m:slider'>
        <SliderComponent
          style='large'
          minValue={-100}
          maxValue={100}
          valueUnit='%'
          positiveValuePrefix='+'
          label={this._t('controls.adjustments.saturation')}
          onChange={this._onSliderValueChange}
          value={saturation * 100 - 100} />
      </div>
    </div>)
  }
}

StickersSaturationControlsComponent.identifier = 'saturation'
