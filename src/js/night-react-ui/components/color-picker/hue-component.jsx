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
import DraggableComponent from '../draggable-component'

export default class HueComponent extends BaseChildComponent {

  // -------------------------------------------------------------------------- DRAG EVENTS

  _onKnobDragStart (e) {

  }

  _onKnobDrag (e, offset) {

  }

  // -------------------------------------------------------------------------- STYLING

  _getKnobStyle () {
    return {
      left: 0,
      top: 0
    }
  }

  // -------------------------------------------------------------------------- RENDERING

  renderWithBEM () {
    return (<div bem='$b:colorPicker $e:hue'>
      <canvas bem='e:canvas' />
      <DraggableComponent
        onStart={this._onKnobDragStart}
        onDrag={this._onKnobDrag}>
        <div bem='e:knob $b:knob m:transparent' style={this._getKnobStyle()}></div>
      </DraggableComponent>
    </div>)
  }
}
