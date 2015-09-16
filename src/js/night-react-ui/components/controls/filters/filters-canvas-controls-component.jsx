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

import { ReactBEM, BaseChildComponent, ReactRedux, ActionCreators } from '../../../globals'
import SliderComponent from '../../slider-component'

class FiltersCanvasControlsComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._bindAll('_onSliderValueChange')
    this._operation = this.context.ui.getOrCreateOperation('filters')
  }

  /**
   * Maps the given state to properties for this component
   * @param {*} state
   * @return {Object}
   */
  static mapStateToProps (state) {
    const { operationsOptions } = state
    return {
      operationOptions: operationsOptions.filters
    }
  }

  /**
   * Gets called when the slider value has been changed
   * @param {Number} value
   * @private
   */
  _onSliderValueChange (value) {
    this._operation.setIntensity(value / 100)
    this.props.dispatch(ActionCreators.operationUpdated(this._operation))
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const options = this.props.operationOptions
    if (!options || options.filter.isIdentity) {
      return null
    }

    return (<div bem='$b:canvasControls e:container m:bottom m:dark'>
      <SliderComponent
        minValue={0}
        maxValue={100}
        label={this._t('controls.filters.intensity')}
        onChange={this._onSliderValueChange}
        value={options.intensity * 100} />
    </div>)
  }
}

export default ReactRedux.connect(FiltersCanvasControlsComponent.mapStateToProps)(FiltersCanvasControlsComponent)
