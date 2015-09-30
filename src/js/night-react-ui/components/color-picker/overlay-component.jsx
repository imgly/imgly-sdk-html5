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
  }

  // -------------------------------------------------------------------------- RENDERING

  renderWithBEM () {
    return (<div bem='$b:colorPicker $e:overlay'>
      <AlphaComponent
        initialValue={this.props.initialValue}
        />
      <div bem='e:bottom'>
        <SaturationComponent
          initialValue={this.props.initialValue}
          />
        <HueComponent
          initialValue={this.props.initialValue}
          />
      </div>
    </div>)
  }
}
