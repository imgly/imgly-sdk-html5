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

import { ReactBEM, BaseComponent, Color } from '../../globals'
import DraggableComponent from '../draggable-component'

export default class HueComponent extends BaseComponent {

  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onKnobDrag',
      '_onKnobDragStart'
    )

    this._value = this.props.initialValue.clone()
    const hsvArr = this._value.toHSV()
    const h = hsvArr[0]
    const s = hsvArr[1]
    const v = hsvArr[2]
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
      const hsvArr = this._value.toHSV()
      const h = hsvArr[0]
      const s = hsvArr[1]
      const v = hsvArr[2]
      this._hsvColor = { h, s, v }
      this._renderCanvas()
      return true
    }
    return false
  }

  // -------------------------------------------------------------------------- DRAG EVENTS

  /**
   * Gets called when the user starts dragging the knob
   * @param  {Vector2} position
   * @param  {Event} e
   * @private
   */
  _onKnobDragStart (position, e) {
    if (e.target === this.refs.knob) {
      this._initialHue = this._hsvColor.h
    } else {
      this._setValueFromPosition(position)
    }
  }

  /**
   * Gets called while the user drags the knob
   * @param  {Vector2} offset
   * @param  {Event} e
   * @private
   */
  _onKnobDrag (offset, e) {
    const { canvas } = this.refs
    const canvasHeight = canvas.offsetHeight

    const hueChange = offset.y / canvasHeight
    this._setHue(this._initialHue + hueChange)
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

  // -------------------------------------------------------------------------- MISC

  /**
   * Sets the hue value of the color to the given one
   * @param {Number} h
   * @private
   */
  _setHue (h) {
    let { s, v } = this._hsvColor
    h = Math.min(1, Math.max(0, h))
    s = Math.max(0.01, Math.min(s, 0.99))
    v = Math.max(0.01, Math.min(v, 0.99))

    this._value = Color.fromHSV(h, s, v, this._value.a)
    this._hsvColor = { h, s, v }
    this.forceUpdate()
    this.props.onChange && this.props.onChange(this._value)
  }

  /**
   * Sets the value from the given cursor position
   * @param {Vector2} position
   * @private
   */
  _setValueFromPosition (position) {
    const { canvas } = this.refs
    this._initialHue = position.y / canvas.offsetHeight
    this._setHue(this._initialHue)
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the hue colors to the canvas
   * @private
   */
  _renderCanvas () {
    const { canvas } = this.refs
    const context = canvas.getContext('2d')

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    for (let y = 0; y < canvas.height; y++) {
      const ratio = y / canvas.height
      const color = Color.fromHSV(ratio, 1, 1)

      context.strokeStyle = color.toRGBA()
      context.beginPath()
      context.moveTo(0, y)
      context.lineTo(canvas.width, y)
      context.stroke()
    }
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    return (<div bem='$b:colorPicker $e:hue'>
      <DraggableComponent
        onStart={this._onKnobDragStart}
        onDrag={this._onKnobDrag}>
        <div>
          <canvas bem='e:canvas' ref='canvas' />
          <div
            bem='e:knob $b:knob m:transparent'
            ref='knob'
            style={this._getKnobStyle()} />
        </div>
      </DraggableComponent>
    </div>)
  }
}
