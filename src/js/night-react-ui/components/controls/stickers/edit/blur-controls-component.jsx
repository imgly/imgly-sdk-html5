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

import { ReactBEM, BaseChildComponent, Constants } from '../../../../globals'
import SliderComponent from '../../../slider-component'

export default class StickersBlurControlsComponent extends BaseChildComponent {
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
    const stickerAdjustments = this._selectedSticker.getAdjustments()
    stickerAdjustments.setBlur(value / 100)
    this._operation.setDirty(true)
    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const ui = this.context.ui

    const adjustments = this._selectedSticker.getAdjustments()
    const blur = adjustments.getBlur()

    return (<div bem='$b:controls e:table'>
      <div bem='e:cell m:button m:withBorderRight'>
        <div bem='$e:button' onClick={this._onBackClick}>
          <img bem='e:icon' src={ui.getHelpers().assetPath(`controls/back@2x.png`, true)} />
        </div>
      </div>
      <div bem='e:cell m:slider'>
        <SliderComponent
          style='large'
          minValue={0}
          maxValue={50}
          middleDot={false}
          label={this._t('controls.stickers.blur')}
          onChange={this._onSliderValueChange}
          value={blur * 100} />
      </div>
    </div>)
  }
}

StickersBlurControlsComponent.identifier = 'blur'
