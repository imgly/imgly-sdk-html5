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
import { React, ReactBEM, BaseChildComponent, Utils } from '../globals'

export default class SliderComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onKnobDown',
      '_onKnobDrag',
      '_onKnobUp'
    )

    this.state = {
      value: this.props.value || 0,
      sliderPosition: 0,
      foregroundLeft: 0,
      foregroundWidth: 0
    }
  }

  /**
   * Gets called when the user starts dragging the knob
   * @param  {Event} e
   * @private
   */
  _onKnobDown (e) {
    this._initialSliderPosition = this.state.sliderPosition
    this._initialPosition = Utils.getEventPosition(e)
    document.addEventListener('mousemove', this._onKnobDrag)
    document.addEventListener('touchmove', this._onKnobDrag)
    document.addEventListener('mouseup', this._onKnobUp)
    document.addEventListener('touchend', this._onKnobUp)
  }

  /**
   * Gets called while the user drags the knob
   * @param  {Event} e
   * @private
   */
  _onKnobDrag (e) {
    const position = Utils.getEventPosition(e)
    const diff = position.clone()
      .subtract(this._initialPosition)

    const barWidth = React.findDOMNode(this.refs.bar).offsetWidth

    let newSliderPosition = this._initialSliderPosition + diff.x
    newSliderPosition = Math.max(0, Math.min(newSliderPosition, barWidth))
    const progress = newSliderPosition / barWidth
    let newValue = this.props.minValue + (this.props.maxValue - this.props.minValue) * progress

    this._setValue(newValue)
  }

  /**
   * Gets called when the user releases the knob
   * @param  {Event} e
   * @private
   */
  _onKnobUp (e) {
    document.removeEventListener('mousemove', this._onKnobDrag)
    document.removeEventListener('touchmove', this._onKnobDrag)
  }

  /**
   * Decides whether or not this slider should have a middle dot on the bar
   * @private
   */
  _displayMiddleDot () {
    return this.props.minValue !== 0
  }

  /**
   * Gets called after the component has been mounted
   */
  componentDidMount () {
    // Trigger a re-render to position the knob
    this._setValue(this.state.value)
  }

  /**
   * Sets the value to the given value, updates the slider position
   * @param {Number} value
   * @private
   */
  _setValue (value) {
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

    this.props.onChange && this.props.onChange(value)
  }

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

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const middleDot =
      this._displayMiddleDot() ? <div bem='e:middleDot'></div> : null

    const knobProps = {
      style: this._getKnobStyle(),
      onMouseDown: this._onKnobDown,
      onTouchStart: this._onKnobDown
    }

    const foregroundProps = {
      style: this._getForegroundStyle()
    }

    const componentBem = '$b:slider' + (this.props.style ? ' m:' + this.props.style : '')
    return (<div bem={componentBem}>
      <div bem='$e:bar' ref='bar'>
        <div bem='$e:background' />
        <div bem='$e:foreground' {...foregroundProps}/>
        <div bem='e:knob b:knob m:slider' {...knobProps}></div>
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
