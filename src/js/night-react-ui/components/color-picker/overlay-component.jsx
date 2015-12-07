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

import { ReactBEM, BaseComponent } from '../../globals'
import AlphaComponent from './alpha-component'
import SaturationComponent from './saturation-component'
import HueComponent from './hue-component'

export default class ColorPickerOverlayComponent extends BaseComponent {
  constructor (...args) {
    super(...args)

    this._value = this.props.initialValue.clone()
    const hsvArr = this._value.toHSV()
    const h = hsvArr[0]
    const s = hsvArr[1]
    const v = hsvArr[2]
    this._hsv = { h, s, v }

    this._bindAll(
      '_onElementClick',
      '_onColorChange'
    )
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Catches clicks on the element and makes sure that no click event is triggered
   * on the parent element
   * @param  {Event} e
   * @private
   */
  _onElementClick (e) {
    e.stopPropagation()
  }

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
    return (<div bem='$b:colorPicker $e:overlay' onClick={this._onElementClick}>
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
