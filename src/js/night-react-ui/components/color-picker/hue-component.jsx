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

import { ReactBEM, BaseChildComponent, Color } from '../../globals'
import DraggableComponent from '../draggable-component'

export default class HueComponent extends BaseChildComponent {

  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onKnobDrag',
      '_onKnobDragStart'
    )

    this._value = this.props.initialValue.clone()
    const [ h, s, v ] = this._value.toHSV()
    this._hsvColor = { h, s, v }
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called when this component has been mounted
   */
  componentDidMount () {
    this._renderColor()
  }

  // -------------------------------------------------------------------------- DRAG EVENTS

  /**
   * Gets called when the user starts dragging the knob
   * @param  {Event} e
   * @private
   */
  _onKnobDragStart (e) {
    this._initialHue = this._hsvColor.h
  }

  /**
   * Gets called while the user drags the knob
   * @param  {Vector2} offset
   * @param  {Event} e
   * @private
   */
  _onKnobDrag (offset, e) {
    const canvas = this.refs.canvas.getDOMNode()
    const canvasHeight = canvas.offsetHeight

    const hueChange = offset.y / canvasHeight * -1
    this._hsvColor.h = this._initialHue + hueChange
    this._hsvColor.h = Math.min(1, Math.max(0, this._hsvColor.h))

    this.forceUpdate()
    const { h, s, v } = this._hsvColor
    this._value.fromHSV(h, s, v)

    this.props.onChange && this.props.onChange(this._value.clone())
  }

  // -------------------------------------------------------------------------- STYLING

  _getKnobStyle () {
    return {
      left: 0,
      top: 0
    }
  }

  // -------------------------------------------------------------------------- STYLING

  /**
   * Returns the style object for the knob
   * @return {Object}
   * @private
   */
  _getKnobStyle () {
    return {
      left: '50%',
      top: ((1 - this._hsvColor.h) * 100).toFixed(2) + '%'
    }
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the current color on the preview canvas
   * @private
   */
  _renderColor () {
    const canvas = this.refs.canvas.getDOMNode()
    const context = canvas.getContext('2d')

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    let color = new Color()
    for (let y = 0; y < canvas.height; y++) {
      let ratio = y / canvas.height
      color.fromHSV(ratio, 1, 1)

      context.strokeStyle = color.toRGBA()
      context.beginPath()
      context.moveTo(0, y)
      context.lineTo(canvas.width, y)
      context.stroke()
    }
  }

  renderWithBEM () {
    return (<div bem='$b:colorPicker $e:hue'>
      <canvas bem='e:canvas' ref='canvas' />
      <DraggableComponent
        onStart={this._onKnobDragStart}
        onDrag={this._onKnobDrag}>
        <div bem='e:knob $b:knob m:transparent' style={this._getKnobStyle()}></div>
      </DraggableComponent>
    </div>)
  }
}
