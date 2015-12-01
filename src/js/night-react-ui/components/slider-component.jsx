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
import { React, ReactBEM, BaseChildComponent } from '../globals'
import DraggableComponent from './draggable-component'

export default class SliderComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onKnobDragStart',
      '_onKnobDrag',
      '_onBarDragStart',
      '_onBarDrag',
      '_onMiddleDotDragStart'
    )

    this.state = {
      value: this.props.value || 0,
      sliderPosition: 0,
      foregroundLeft: 0,
      foregroundWidth: 0
    }
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called after the component has been mounted
   */
  componentDidMount () {
    // Trigger a re-render to position the knob
    this._setValue(this.state.value, false)
  }

  /**
   * Gets called when this component receives new props
   * @param  {Object} props
   */
  componentWillReceiveProps (props) {
    if (props.value !== this.state.value) {
      this._setValue(props.value, false)
    }
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user presses a mouse button on the middle dot
   * @private
   */
  _onMiddleDotDragStart () {
    const newValue = this.props.minValue + (this.props.maxValue - this.props.minValue) / 2
    this._setValue(newValue)
  }

  /**
   * Gets called when the user starts dragging the knob
   * @param  {Vector2} position
   * @private
   */
  _onKnobDragStart (position) {
    this._initialSliderPosition = this.state.sliderPosition
    this._initialPosition = position
  }

  /**
   * Gets called while the user drags the knob
   * @param  {Vector2} diff
   * @private
   */
  _onKnobDrag (diff) {
    const barWidth = React.findDOMNode(this.refs.bar).offsetWidth

    let newSliderPosition = this._initialSliderPosition + diff.x
    newSliderPosition = Math.max(0, Math.min(newSliderPosition, barWidth))
    const progress = newSliderPosition / barWidth
    let newValue = this.props.minValue + (this.props.maxValue - this.props.minValue) * progress

    this._setValue(newValue)
  }

  /**
   * Gets called when the user starts dragging the bar
   * @param  {Vector2} position
   * @private
   */
  _onBarDragStart (position) {
    this._initialPosition = position.clone()

    const barWidth = React.findDOMNode(this.refs.bar).offsetWidth
    const progress = position.x / barWidth
    const newValue = this.props.minValue + (this.props.maxValue - this.props.minValue) * progress
    this._setValue(newValue)
  }

  /**
   * Gets called while the user drags the bar
   * @param  {Vector2} diff
   * @private
   */
  _onBarDrag (diff) {
    const position = this._initialPosition.clone()
      .add(diff)

    const barWidth = React.findDOMNode(this.refs.bar).offsetWidth
    const progress = position.x / barWidth
    const newValue = this.props.minValue + (this.props.maxValue - this.props.minValue) * progress
    this._setValue(newValue)
  }

  // -------------------------------------------------------------------------- STYLING

  /**
   * Returns the style for the knob (position)
   * @return {Object}
   * @private
   */
  _getKnobStyle () {
    return { left: this.state.sliderPosition }
  }

  /**
   * Returns the style for the foreground bar
   * @return {Object}
   * @private
   */
  _getForegroundStyle () {
    return {
      left: this.state.foregroundLeft,
      width: this.state.foregroundWidth
    }
  }

  // -------------------------------------------------------------------------- MISC

  /**
   * Decides whether or not this slider should have a middle dot on the bar
   * @private
   */
  _displayMiddleDot () {
    return this.props.middleDot !== false
  }

  /**
   * Sets the value to the given value, updates the slider position
   * @param {Number} value
   * @param {Boolean} emitChange = true
   * @private
   */
  _setValue (value, emitChange = true) {
    value = Math.round(value)
    const { minValue, maxValue } = this.props
    const progress = (value - minValue) / (maxValue - minValue)

    // Calculate slider position
    const barWidth = React.findDOMNode(this.refs.bar).offsetWidth
    const sliderPosition = barWidth * progress

    // Calculate foreground position and width
    let foregroundWidth = progress * barWidth
    let foregroundLeft = 0
    if (this._displayMiddleDot()) {
      foregroundWidth = Math.abs(progress - 0.5) * barWidth
      foregroundLeft = progress < 0.5 ?
        (barWidth * 0.5 - foregroundWidth) :
        '50%'
    }

    this.setState({ value, sliderPosition, foregroundWidth, foregroundLeft })

    if (emitChange) {
      this.props.onChange && this.props.onChange(value)
    }
  }

  /**
   * Builds a display value from the given props
   * @param {Number} value
   * @return {String}
   * @private
   */
  _buildValue (value) {
    if (this.props.positiveValuePrefix && value >= 0) {
      value = `${this.props.positiveValuePrefix}${value}`
    }

    if (this.props.valueUnit) {
      value += this.props.valueUnit
    }

    return value
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    let middleDot = null
    if (this._displayMiddleDot()) {
      middleDot = (
        <DraggableComponent
          onStart={this._onMiddleDotDragStart}>
            <div bem='e:middleDot'></div>
        </DraggableComponent>
      )
    }

    const foregroundProps = {
      style: this._getForegroundStyle()
    }

    const componentBem = '$b:slider' + (this.props.style ? ' m:' + this.props.style : '')
    return (<div bem={componentBem}>
      <div bem='$e:bar' ref='bar'>
        <DraggableComponent
          onStart={this._onBarDragStart}
          onDrag={this._onBarDrag}>
            <div>
              <div bem='$e:background' />
              <div bem='$e:foreground' {...foregroundProps}/>
              <DraggableComponent
                onStart={this._onKnobDragStart}
                onDrag={this._onKnobDrag}>
                  <div bem='e:knob b:knob m:slider' style={this._getKnobStyle()}></div>
              </DraggableComponent>
            </div>
        </DraggableComponent>
        {middleDot}
      </div>
      <div bem='$e:labels'>
        <div bem='e:label m:lowerBoundary'>{this._buildValue(this.props.minValue)}</div>
        <div bem='e:label m:value'>{this.props.label} {this._buildValue(this.state.value)}</div>
        <div bem='e:label m:upperBoundary'>{this._buildValue(this.props.maxValue)}</div>
      </div>
    </div>)
  }
}
