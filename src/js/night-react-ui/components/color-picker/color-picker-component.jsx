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

import { ReactBEM, BaseChildComponent, Utils, Constants } from '../../globals'
import ColorPickerOverlayComponent from './overlay-component'

export default class ColorPickerComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._value = this.props.initialValue.clone()
    this._bindAll(
      '_onButtonClick',
      '_onValueChange',
      '_onColorPickerOpen'
    )

    this._events = {
      [Constants.EVENTS.COLORPICKER_OPEN]: this._onColorPickerOpen
    }

    this.state = {
      overlayVisible: false
    }

    this._transparentPatternCanvas = Utils.createTransparentPatternCanvas()
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called when this component has been mounted
   */
  componentDidMount () {
    super.componentDidMount()
    this._renderColor()
  }

  /**
   * Gets called after this component has been updated
   */
  componentDidUpdate () {
    this._renderColor()
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when a colorpicker has been opened. If it is not the same
   * color picker as this, this one gets closed. This makes sure that there
   * is only one color picker open at a time
   * @param  {ColorPickerComponent} colorPicker
   * @private
   */
  _onColorPickerOpen (colorPicker) {
    if (colorPicker === this) return
    this.setState({ overlayVisible: false })
  }

  /**
   * Gets called when the color picker button has been clicked
   * @param  {Event} e
   * @private
   */
  _onButtonClick (e) {
    e.preventDefault()
    e.stopPropagation()

    if (!this.state.overlayVisible) {
      this._emitEvent(Constants.EVENTS.COLORPICKER_OPEN, this)
    }

    this.setState({ overlayVisible: !this.state.overlayVisible })
  }

  /**
   * Gets called when the value changes
   * @param  {Color} value
   * @private
   */
  _onValueChange (value) {
    this._value = value
    this._renderColor()
    this.forceUpdate()

    this.props.onChange && this.props.onChange(value)
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

    const pattern = context.createPattern(this._transparentPatternCanvas, 'repeat')
    context.fillStyle = pattern
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.fillStyle = this._value.toRGBA()
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    let Overlay = null
    if (this.state.overlayVisible) {
      Overlay = (<ColorPickerOverlayComponent
        initialValue={this._value}
        onChange={this._onValueChange} />)
    }

    return (<bem specifier='$b:controls'>
      <div bem='$e:button m:withLabel' onClick={this._onButtonClick}>
        <canvas bem='b:colorPicker e:preview' ref='canvas' />
        <div bem='e:label'>{this.props.label || this._t('generic.color')}</div>
        {Overlay}
      </div>
    </bem>)
  }
}
