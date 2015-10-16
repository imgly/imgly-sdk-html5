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

    this._operation = this.getSharedState('operation')
    this._bindAll(
      '_onBackClick',
      '_onDoneClick',
      '_onThicknessUpdate',
      '_onColorUpdate'
    )
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called when this component has been mounted
   */
  componentDidMount () {
    super.componentDidMount()

    // Reset zoom to fit the container
    this._emitEvent(Constants.EVENTS.CANVAS_ZOOM, 'auto', () => {
      // Disable zoom and drag while we're cropping
      this._emitEvent(Constants.EVENTS.EDITOR_DISABLE_FEATURES, ['zoom', 'drag'])
    })
  }

  // -------------------------------------------------------------------------- EVENTS

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

    const { ui } = this.context
    if (!this.getSharedState('operationExistedBefore')) {
      ui.removeOperation(this._operation)
    } else {
      this._operation.set(this.getSharedState('initialOptions'))
    }

    this._emitEvent(Constants.EVENTS.CANVAS_UNDO_ZOOM)
    this._emitEvent(Constants.EVENTS.EDITOR_ENABLE_FEATURES, ['zoom', 'drag'])
  }

  /**
   * Gets called when the user clicks the done button
   * @param  {Event} e
   * @private
   */
  _onDoneClick (e) {
    const { editor } = this.props

    editor.addHistory(this._operation,
      this.getSharedState('initialOptions'),
      this.getSharedState('operationExistedBefore'))

    this.props.onSwitchControls('back')
  }

  /**
   * Gets called when the color has changed
   * @param  {Color} color
   * @private
   */
  _onColorUpdate (color) {
    this._operation.setColor(color)
    this._emitEvent(Constants.EVENTS.OPERATION_UPDATED, this._operation)
    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
  }

  // -------------------------------------------------------------------------- RENDERING

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
          middleDot={false}
          label={this._t('controls.frames.thickness')}
          onChange={this._onThicknessUpdate}
          value={currentWidth} />
      </div>
      <div bem='e:cell m:colorPicker'>
        <ColorPickerComponent
          initialValue={this._operation.getColor().clone()}
          onChange={this._onColorUpdate} />
      </div>
      <div bem='e:cell m:button m:withBorderLeft'>
        <div bem='$e:button' onClick={this._onDoneClick}>
          <img bem='e:icon' src={ui.getHelpers().assetPath(`controls/tick@2x.png`, true)} />
        </div>
      </div>
    </div>)
  }
}
