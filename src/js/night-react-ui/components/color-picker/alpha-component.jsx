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

import { ReactBEM, BaseChildComponent, Utils } from '../../globals'
import DraggableComponent from '../draggable-component'

export default class AlphaComponent extends BaseChildComponent {

  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onKnobDrag',
      '_onKnobDragStart'
    )

    this._value = this.props.initialValue.clone()
    this._transparentPatternCanvas = Utils.createTransparentPatternCanvas()
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
    if (e.target === this.refs.knob.getDOMNode()) {
      this._initialAlpha = this._value.a
    } else {
      this._setAlphaFromPosition(position)
    }
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

    const alphaChange = offset.x / canvasWidth
    this._setAlpha(this._initialAlpha + alphaChange)
  }

  // -------------------------------------------------------------------------- STYLING

  /**
   * Returns the style object for the knob
   * @return {Object}
   * @private
   */
  _getKnobStyle () {
    return {
      left: (this._value.a * 100).toFixed(2) + '%',
      top: '50%'
    }
  }

  // -------------------------------------------------------------------------- MISC

  /**
   * Sets the alpha value of the color to the given one
   * @param {Number} a
   * @private
   */
  _setAlpha (a) {
    this._value.a = a
    this._value.a = Math.min(1, Math.max(0, this._value.a))
    this.forceUpdate()
    this.props.onChange && this.props.onChange(this._value)
  }

  /**
   * Sets the alpha from the given cursor position
   * @param {Vector2} position
   * @private
   */
  _setAlphaFromPosition (position) {
    const canvas = this.refs.canvas.getDOMNode()
    this._initialAlpha = position.x / canvas.offsetWidth
    this._setAlpha(this._initialAlpha)
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the canvas with the current color
   * @private
   */
  _renderCanvas () {
    const canvas = this.refs.canvas.getDOMNode()
    const context = canvas.getContext('2d')

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Fill with pattern
    const pattern = context.createPattern(this._transparentPatternCanvas, 'repeat')
    context.fillStyle = pattern
    context.fillRect(0, 0, canvas.width, canvas.height)

    // Create gradient
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height)
    let color = this._value.clone()
    color.a = 0
    gradient.addColorStop(0, color.toRGBA())
    gradient.addColorStop(1, this._value.toHex())

    // Draw gradient
    context.fillStyle = gradient
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    return (<div bem='$b:colorPicker $e:alpha'>
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
