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

export default class RadialBlurControlsComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._operation = this.getSharedState('operation')
    this._bindAll(
      '_onBackClick',
      '_onDoneClick',
      '_onSliderValueChange'
    )
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called when this component has been mounted
   */
  componentDidMount () {
    super.componentDidMount()

    this._emitEvent(Constants.EVENTS.CANVAS_ZOOM, 'auto', () => {
      this._emitEvent(Constants.EVENTS.EDITOR_DISABLE_FEATURES, ['zoom', 'drag'])
      this.props.sharedState.broadcastUpdate()
    })
  }

  // -------------------------------------------------------------------------- EVENTS

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

    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
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

    this._emitEvent(Constants.EVENTS.CANVAS_UNDO_ZOOM)
    this._emitEvent(Constants.EVENTS.EDITOR_ENABLE_FEATURES, ['zoom', 'drag'])
    this.props.onSwitchControls('back')
  }

  /**
   * Gets called when the slider value has changed
   * @param {Number} value
   * @private
   */
  _onSliderValueChange (value) {
    this._operation.setBlurRadius(value)
    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const ui = this.context.ui

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
          maxValue={40}
          valueUnit='px'
          middleDot={false}
          label={this._t('controls.blur.blurRadius')}
          onChange={this._onSliderValueChange}
          value={this._operation.getBlurRadius()} />
      </div>
      <div bem='e:cell m:button m:withBorderLeft'>
        <div bem='$e:button' onClick={this._onDoneClick}>
          <img bem='e:icon' src={ui.getHelpers().assetPath(`controls/tick@2x.png`, true)} />
        </div>
      </div>
    </div>)
  }
}
