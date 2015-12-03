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

import { ReactBEM, BaseComponent, Constants } from '../../../../globals'
import SliderComponent from '../../../slider-component'

export default class PaintCanvasControlsComponent extends BaseComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onSliderValueChange',
      '_onOperationUpdated'
    )

    this._events = {
      [Constants.EVENTS.OPERATION_UPDATED]: this._onOperationUpdated
    }
  }

  /**
   * Gets called when an operation has been updated
   * @param  {Operation} operation
   * @private
   */
  _onOperationUpdated (operation) {
    if (operation === this.getSharedState('operation')) {
      this.forceUpdate()
    }
  }

  /**
   * Gets called when the slider value has been changed
   * @param {Number} value
   * @private
   */
  _onSliderValueChange (value) {
    this.getSharedState('operation').setIntensity(value / 100)
    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const currentFilter = this.getSharedState('operation').getFilter()
    if (currentFilter && (currentFilter === 'identity')) return null
    return (<div bem='$b:canvasControls e:container m:bottom m:dark'>
      <SliderComponent
        minValue={0}
        maxValue={100}
        middleDot={false}
        valueUnit='%'
        label={this._t('controls.filters.intensity')}
        onChange={this._onSliderValueChange}
        value={this.getSharedState('operation').getIntensity() * 100} />
    </div>)
  }
}
