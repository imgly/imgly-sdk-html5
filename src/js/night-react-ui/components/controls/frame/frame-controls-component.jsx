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

import { ReactBEM, Constants } from '../../../globals'
import ControlsComponent from '../controls-component'
import SliderComponent from '../../slider-component'
import ColorPickerComponent from '../../color-picker/color-picker-component'

export default class FrameControlsComponent extends ControlsComponent {
  constructor (...args) {
    super(...args)

    this._hasDoneButton = true
    this._operation = this.getSharedState('operation')
    this._bindAll(
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
    const { editor } = this.props
    const canvasDimensions = editor.getInitialDimensions()

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
    super._onBackClick(e)

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

    const operationExistedBefore = this.getSharedState('operationExistedBefore')
    const initialOptions = this.getSharedState('initialOptions')
    const optionsChanged = !this._operation.optionsEqual(initialOptions)

    if (optionsChanged || !operationExistedBefore) {
      editor.addHistory(this._operation,
        this.getSharedState('initialOptions'),
        this.getSharedState('operationExistedBefore'))
    }

    super._onDoneClick(e)
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
   * Renders the controls of this component
   * @return {ReactBEM.Element}
   */
  renderControls () {
    const { editor } = this.props
    const canvasDimensions = editor.getInitialDimensions()

    const shorterSide = Math.min(canvasDimensions.x, canvasDimensions.y)
    const minThickness = 0
    const maxThickness = Math.round(shorterSide / 2)
    const currentWidth = this._operation.getThickness() * shorterSide

    return [(<div bem='e:cell m:slider'>
      <SliderComponent
        style='large'
        minValue={minThickness}
        maxValue={maxThickness}
        valueUnit='px'
        middleDot={false}
        label={this._t('controls.frame.thickness')}
        onChange={this._onThicknessUpdate}
        value={currentWidth} />
    </div>),
    (<div bem='e:cell m:colorPicker'>
      <ColorPickerComponent
        initialValue={this._operation.getColor().clone()}
        onChange={this._onColorUpdate} />
    </div>)]
  }
}
