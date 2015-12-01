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
import SliderComponent from '../../../slider-component.jsx'

export default class ContrastControlsComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onBackClick',
      '_onSliderValueChange',
      '_onOperationUpdated',
      '_onOperationRemoved'
    )
    this._operation = this.context.ui.getOrCreateOperation('contrast')

    this._events = {
      [Constants.EVENTS.OPERATION_UPDATED]: this._onOperationUpdated,
      [Constants.EVENTS.OPERATION_REMOVED]: this._onOperationRemoved
    }
    this.state = {
      value: this._operation.getContrast()
    }
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when an operation is updated
   * @param  {Operation} operation
   * @private
   */
  _onOperationUpdated (operation) {
    // Operation options can be changed by undo button etc.,
    // we need to notice the change and update the slider value
    if (operation === this._operation &&
        operation.getContrast() !== this.state.value) {
      this.setState({ value: operation.getContrast() })
    }
  }

  /**
   * Gets called when an operation is removed
   * @param  {Operation} operation
   * @private
   */
  _onOperationRemoved (operation) {
    if (operation !== this._operation) return

    // Operation can be removed by the undo button. We need
    // to make sure we re-create the operation for the lifetime
    // of this control
    const { ui } = this.context
    const newOperation = ui.getOrCreateOperation('contrast')
    this._operation = newOperation
    this._historyItem = null
    this.state.value = this._operation.getContrast()
    this.setSharedState({
      operation: newOperation,
      operationExistedBefore: false,
      initialOptions: {}
    })
  }

  /**
   * Gets called when the user clicks the back button
   * @param {Event} e
   * @private
   */
  _onBackClick (e) {
    this.props.onSwitchControls('back')

    if (this._operation.getContrast() === this._operation.getOptionDefault('contrast')) {
      const { ui } = this.context
      ui.removeOperation(this._operation)
    }
  }

  /**
   * Gets called when the slider value has changed
   * @param {Number} value
   * @private
   */
  _onSliderValueChange (value) {
    const actualValue = (value + 100) / 100
    this._operation.setContrast(actualValue)
    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)

    if (!this._historyItem) {
      const { editor } = this.props
      this._historyItem = editor.addHistory(
        this._operation,
        this.getSharedState('initialOptions'),
        this.getSharedState('operationExistedBefore')
      )
    }

    this.setState({ value: actualValue })
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const ui = this.context.ui

    return (<div bem='$b:controls e:table'>
      <div bem='e:cell m:button m:withBorderRight m:narrow'>
        <div bem='$e:button m:narrow' onClick={this._onBackClick}>
          <img bem='e:icon' src={ui.getHelpers().assetPath(`controls/back@2x.png`, true)} />
        </div>
      </div>
      <div bem='e:cell m:slider'>
        <SliderComponent
          style='large'
          minValue={-100}
          maxValue={100}
          valueUnit='%'
          positiveValuePrefix='+'
          label={this._t('controls.adjustments.contrast')}
          onChange={this._onSliderValueChange}
          value={this.state.value * 100 - 100} />
      </div>
    </div>)
  }
}
