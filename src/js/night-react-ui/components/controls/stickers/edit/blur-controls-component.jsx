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

import { ReactBEM, Constants } from '../../../../globals'
import ControlsComponent from '../../controls-component'
import SliderComponent from '../../../slider-component'

export default class StickersBlurControlsComponent extends ControlsComponent {
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
    const stickerAdjustments = this._selectedSticker.getAdjustments()
    stickerAdjustments.setBlur(value / 100)
    this._operation.setDirty(true)
    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the controls of this component
   * @return {ReactBEM.Element}
   */
  renderControls () {
    const { editor } = this.props
    const canvasDimensions = editor.getInitialDimensions()

    const adjustments = this._selectedSticker.getAdjustments()
    const blur = adjustments.getBlur()
    const maxBlur = canvasDimensions.x * 0.1

    return (<div bem='e:cell m:slider'>
      <SliderComponent
        style='large'
        minValue={0}
        maxValue={maxBlur}
        middleDot={false}
        label={this._t('controls.stickers.blur')}
        onChange={this._onSliderValueChange}
        value={blur * 100} />
    </div>)
  }
}

StickersBlurControlsComponent.identifier = 'blur'
StickersBlurControlsComponent.iconName = 'focus'
