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

export default class AlphaComponent extends BaseChildComponent {

  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onKnobDrag',
      '_onKnobDragStart'
    )

    this._value = this.props.initialValue.clone()
    this._renderTransparentPatternCanvas()
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  componentDidMount () {
    super.componentDidMount()
    this._renderCanvas()
  }

  // -------------------------------------------------------------------------- DRAG EVENTS

  /**
   * Gets called when the user starts dragging the knob
   * @param  {Event} e
   * @private
   */
  _onKnobDragStart (e) {
    this._initialAlpha = this._value.a
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
    this._value.a = this._initialAlpha + alphaChange
    this._value.a = Math.min(1, Math.max(0, this._value.a))
    this.forceUpdate()
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

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the canvas that is used as the transparency pattern
   * @private
   */
  _renderTransparentPatternCanvas () {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    canvas.width = 10
    canvas.height = 10

    context.fillStyle = 'white'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#cccccc'
    context.fillRect(0, 0, canvas.width / 2, canvas.height / 2)
    context.fillRect(
      canvas.width / 2, canvas.height / 2,
      canvas.width, canvas.height
    )

    this._transparentPatternCanvas = canvas
  }

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

  renderWithBEM () {
    return (<div bem='$b:colorPicker $e:alpha'>
      <canvas bem='e:canvas' ref='canvas' />
      <DraggableComponent
        onStart={this._onKnobDragStart}
        onDrag={this._onKnobDrag}>
        <div bem='e:knob $b:knob m:transparent' style={this._getKnobStyle()}></div>
      </DraggableComponent>
    </div>)
  }
}
