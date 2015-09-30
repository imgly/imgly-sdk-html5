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

import { ReactBEM, BaseChildComponent } from '../../globals'
import AlphaComponent from './alpha-component'
import SaturationComponent from './saturation-component'
import HueComponent from './hue-component'

export default class ColorPickerOverlayComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._value = this.props.initialValue.clone()
    const [ h, s, v ] = this._value.toHSV()
    this._hsv = { h, s, v }

    this._bindAll(
      '_onColorChange'
    )
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the color changes
   * @param  {Color} color
   * @private
   */
  _onColorChange (color) {
    this._value = color
    this.props.onChange && this.props.onChange(color)
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    return (<div bem='$b:colorPicker $e:overlay'>
      <AlphaComponent
        initialValue={this._value}
        onChange={this._onColorChange}
        />
      <div bem='e:bottom'>
        <SaturationComponent
          initialValue={this._value}
          onChange={this._onColorChange}
          />
        <HueComponent
          initialValue={this._value}
          onChange={this._onColorChange}
          />
      </div>
    </div>)
  }
}
