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

import { ReactBEM, BaseChildComponent, Constants } from '../../../globals'
import SliderComponent from '../../slider-component'
import ColorPickerComponent from '../../color-picker/color-picker-component'

export default class FramesControlsComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    const { ui } = this.context
    this._operation = ui.getOrCreateOperation('frames')
    this._bindAll(
      '_onBackClick',
      '_onThicknessUpdate'
    )
  }

  /**
   * Gets called when the thickness has been updated
   * @param  {Number} thickness
   * @private
   */
  _onThicknessUpdate (thickness) {
    const { kit } = this.context
    const canvasDimensions = kit.getOutputDimensions()

    const shorterSide = Math.min(canvasDimensions.x, canvasDimensions.y)
    const relativeThickness = thickness / shorterSide
    this._operation.setThickness(relativeThickness)
    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
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
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const ui = this.context.ui

    const { kit } = this.context
    const canvasDimensions = kit.getOutputDimensions()
    const minThickness = 0
    const maxThickness = Math.round(Math.min(canvasDimensions.x, canvasDimensions.y) / 2)
    const currentWidth = this._operation.getThickness() * maxThickness

    return (<div bem='$b:controls e:table'>
      <div bem='e:cell m:button m:withBorderRight'>
        <div bem='$e:button' onClick={this._onBackClick}>
          <img bem='e:icon' src={ui.getHelpers().assetPath(`controls/back@2x.png`, true)} />
        </div>
      </div>
      <div bem='e:cell m:slider'>
        <SliderComponent
          style='large'
          minValue={minThickness}
          maxValue={maxThickness}
          valueUnit='px'
          label={this._t('controls.frames.thickness')}
          onChange={this._onThicknessUpdate}
          value={currentWidth} />
      </div>
      <div bem='e:cell m:colorPicker'>
        <ColorPickerComponent
          value={this._operation.getColor()}
          onChange={this._onColorUpdate} />
      </div>
    </div>)
  }
}
