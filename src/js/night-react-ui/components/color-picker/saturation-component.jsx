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

export default class SaturationComponent extends BaseComponent {

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
   * @param  {Vector} position
   * @param  {Event} e
   * @private
   */
  _onKnobDragStart (position, e) {
    if (e.target === this.refs.knob) {
      this._initialValue = this._hsvColor.v
      this._initialSaturation = this._hsvColor.s
    } else {
      this._setValuesFromPosition(position)
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
    const canvasWidth = canvas.offsetWidth
    const canvasHeight = canvas.offsetHeight

    const saturationChange = offset.x / canvasWidth
    const valueChange = offset.y / canvasHeight * -1

    let { h } = this._hsvColor
    this._setHSV(
      h,
      this._initialSaturation + saturationChange,
      this._initialValue + valueChange
    )
  }

  // -------------------------------------------------------------------------- STYLING

  /**
   * Returns the style object for the knob
   * @return {Object}
   * @private
   */
  _getKnobStyle () {
    const { s, v } = this._hsvColor

    return {
      left: (s * 100).toFixed(2) + '%',
      top: ((1 - v) * 100).toFixed(2) + '%'
    }
  }

  // -------------------------------------------------------------------------- MISC

  /**
   * Sets the HSV values of the color to the given values
   * @param {Number} h
   * @param {Number} s
   * @param {Number} v
   * @private
   */
  _setHSV (h, s, v) {
    s = Math.max(0.01, Math.min(s, 0.99))
    v = Math.max(0.01, Math.min(v, 0.99))
    this._value = Color.fromHSV(h, s, v, this._value.a)
    this._hsvColor = { h, s, v }

    this.forceUpdate()
    this.props.onChange && this.props.onChange(this._value)
  }

  /**
   * Sets the values from the given cursor position
   * @param {Vector2} position
   * @private
   */
  _setValuesFromPosition (position) {
    const { canvas } = this.refs
    this._initialSaturation = position.x / canvas.offsetWidth
    this._initialValue = 1 - (position.y / canvas.offsetHeight)

    let { h } = this._hsvColor
    this._setHSV(
      h,
      this._initialSaturation,
      this._initialValue
    )
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the current color to the canvas
   * @private
   */
  _renderCanvas () {
    const { canvas } = this.refs
    const context = canvas.getContext('2d')

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    let imageData = context.getImageData(0, 0, canvas.width, canvas.height)

    for (let y = 0; y < canvas.height; y++) {
      const value = (canvas.height - y) / canvas.height
      for (let x = 0; x < canvas.width; x++) {
        const saturation = x / canvas.width
        const color = Color.fromHSV(this._hsvColor.h, saturation, value)
        const { r, g, b, a } = color

        const index = (y * canvas.width + x) * 4

        imageData.data[index] = r * 255
        imageData.data[index + 1] = g * 255
        imageData.data[index + 2] = b * 255
        imageData.data[index + 3] = a * 255
      }
    }

    context.putImageData(imageData, 0, 0)
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    return (<div bem='$b:colorPicker $e:saturation'>
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
