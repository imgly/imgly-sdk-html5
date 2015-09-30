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

export default class SaturationComponent extends BaseChildComponent {

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
    this._initialValue = this._hsvColor.v
    this._initialSaturation = this._hsvColor.s
  }

  /**
   * Gets called while the user drags the knob
   * @param  {Vector2} offset
   * @param  {Event} e
   * @private
   */
  _onKnobDrag (offset, e) {
    const canvas = this.refs.canvas.getDOMNode()
    const canvasWidth = canvas.offsetWidth
    const canvasHeight = canvas.offsetHeight

    const saturationChange = offset.x / canvasWidth
    const valueChange = offset.y / canvasHeight * -1

    let { h, s, v } = this._hsvColor
    s = this._initialSaturation + saturationChange
    v = this._initialValue + valueChange
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
    const { s, v } = this._hsvColor

    return {
      left: (s * 100).toFixed(2) + '%',
      top: ((1 - v) * 100).toFixed(2) + '%'
    }
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the current color to the canvas
   * @private
   */
  _renderCanvas () {
    const canvas = this.refs.canvas.getDOMNode()
    const context = canvas.getContext('2d')

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    let imageData = context.getImageData(0, 0, canvas.width, canvas.height)

    let color = new Color(1, 0, 0, 1)
    for (let y = 0; y < canvas.height; y++) {
      const value = (canvas.height - y) / canvas.height
      for (let x = 0; x < canvas.width; x++) {
        const saturation = x / canvas.width
        color.fromHSV(this._hsvColor.h, saturation, value)
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
      <canvas bem='e:canvas' ref='canvas' />
      <DraggableComponent
        onStart={this._onKnobDragStart}
        onDrag={this._onKnobDrag}>
        <div bem='e:knob $b:knob m:transparent' style={this._getKnobStyle()}></div>
      </DraggableComponent>
    </div>)
  }
}
