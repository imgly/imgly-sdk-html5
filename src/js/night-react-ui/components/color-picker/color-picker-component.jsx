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
import ColorPickerOverlayComponent from './overlay-component'

export default class ColorPickerComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._value = this.props.initialValue.clone()
    this._bindAll('_onButtonClick')

    this.state = {
      overlayVisible: false
    }
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called when this component has been mounted
   */
  componentDidMount () {
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
   * Gets called when the color picker button has been clicked
   * @param  {Event} e
   * @private
   */
  _onButtonClick (e) {
    e.preventDefault()
    e.stopPropagation()

    this.setState({ overlayVisible: !this.state.overlayVisible })
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the current color on the preview canvas
   * @private
   */
  _renderColor () {
    const canvas = this.refs.canvas.getDOMNode()
    const context = canvas.getContext('2d')

    context.clearRect(0, 0, canvas.width, canvas.height)
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
        initialValue={this._value} />)
    }

    return (<bem specifier='$b:controls'>
      <div bem='$e:button m:withLabel' onClick={this._onButtonClick}>
        <canvas bem='b:colorPicker e:preview' ref='canvas' />
        <div bem='e:label'>Color</div>
        {Overlay}
      </div>
    </bem>)
  }
}
