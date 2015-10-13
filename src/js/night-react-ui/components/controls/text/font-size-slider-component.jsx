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

export default class TextControlsComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onSliderValueChange'
    )

    this.state = { fontSize: this.props.value }
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called when this component receives new props
   * @param  {Object} props
   */
  componentWillReceiveProps (props) {
    if (props.value !== this.state.fontSize) {
      this.state.fontSize = props.value
    }
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the slider value has changed
   * @param  {Number} value
   * @private
   */
  _onSliderValueChange (value) {
    this.props.onChange &&
      this.props.onChange(value)
    this.setState({ fontSize: value })
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const { kit } = this.context
    const canvasDimensions = kit.getOutputDimensions()

    const maxFontSize = Math.round(canvasDimensions.y)
    const fontSize = this.state.fontSize

    return (<div bem='$b:controls e:overlay m:large m:dark'>
      <SliderComponent
        style='large'
        middleDot={false}
        minValue={1}
        maxValue={maxFontSize}
        label={this._t('controls.text.size')}
        onChange={this._onSliderValueChange}
        value={fontSize} />
    </div>)
  }
}
