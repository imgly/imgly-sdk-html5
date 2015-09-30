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
   * Gets called after this component has been mounted
   */
  componentDidMount () {
    super.componentDidMount()
    this._renderCanvas()
  }

  /**
   * Gets called when this component receives new props or state
   * @param  {Object} newProps
   * @return {Boolean}
   */
  shouldComponentUpdate (newProps) {
    const { initialValue } = newProps
    if (initialValue !== this._value) {
      this._value = initialValue.clone()
      const [ h, s, v ] = this._value.toHSV()
      this._hsvColor = { h, s, v }
      this._renderCanvas()
      return true
    }
    return false
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

    const hueChange = offset.y / canvasHeight

    let { h, s, v } = this._hsvColor
    h = this._initialHue + hueChange
    h = Math.min(1, Math.max(0, h))
    s = Math.max(0.01, Math.min(s, 0.99))
    v = Math.max(0.01, Math.min(v, 0.99))

    this.forceUpdate()
    this._value.fromHSV(h, s, v)
    this._hsvColor = { h, s, v }

    this.props.onChange && this.props.onChange(this._value)
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
      top: (this._hsvColor.h * 100).toFixed(2) + '%'
    }
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the hue colors to the canvas
   * @private
   */
  _renderCanvas () {
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
