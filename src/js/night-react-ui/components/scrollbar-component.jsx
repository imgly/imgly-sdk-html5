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
const NATIVE_SCROLLBAR_HEIGHT = 18

export default class ScrollbarComponent extends BaseChildComponent {
  constructor () {
    super()

    this._bindAll(
      '_onButtonDown',
      '_onButtonMove',
      '_onButtonUp'
    )
    this.state = { buttonWidth: 0, buttonLeft: 0, buttonVisible: false }
  }

  /**
   * Gets called when the user presses a mouse button on the bar
   * @param {Event} e
   * @private
   */
  _onButtonDown (e) {
    e.preventDefault()

    this._initialMousePosition = Utils.getEventPosition(e)
    this._initialButtonPosition = this.state.buttonLeft || 0
    document.addEventListener('mousemove', this._onButtonMove)
    document.addEventListener('touchmove', this._onButtonMove)
    document.addEventListener('mouseup', this._onButtonUp)
    document.addEventListener('touchend', this._onButtonUp)
  }

  /**
   * Gets called when the user drags the button
   * @param {Event} e
   * @private
   */
  _onButtonMove (e) {
    e.preventDefault()

    const mousePosition = Utils.getEventPosition(e)
    const diff = mousePosition.clone()
      .subtract(this._initialMousePosition)
    const buttonLeft = this._initialButtonPosition + diff.x
    this._setButtonLeft(buttonLeft)
  }

  /**
   * Sets the button position to the given value
   * @param {Number} buttonLeft
   * @private
   */
  _setButtonLeft (buttonLeft) {
    // Clamp button position
    buttonLeft = Math.max(0, buttonLeft)
    buttonLeft = Math.min(buttonLeft, this._node.offsetWidth - this.state.buttonWidth)

    // Set button position
    this.setState({ buttonLeft })

    // Update list scroll position
    const progress = buttonLeft / this._parentNode.scrollWidth
    const scrollPosition = this._parentNode.scrollWidth * progress
    this._parentNode.scrollLeft = scrollPosition
  }

  /**
   * Gets called when the user releases the button
   * @param {Event} e
   * @private
   */
  _onButtonUp (e) {
    e.preventDefault()
    document.removeEventListener('mousemove', this._onButtonMove)
    document.removeEventListener('touchmove', this._onButtonMove)
    document.removeEventListener('mouseup', this._onButtonUp)
    document.removeEventListener('touchend', this._onButtonUp)
  }

  /**
   * Updates the button position and size
   * @param {Function} cb
   * @private
   */
  _updateButtonWidth (cb) {
    let buttonWidth = 0
    let buttonVisible = false

    const parentWidth = this._parentNode.offsetWidth
    const parentScrollWidth = this._parentNode.scrollWidth
    buttonWidth = parentWidth / parentScrollWidth * parentWidth
    buttonVisible = parentScrollWidth > parentWidth

    this.setState({ buttonWidth, buttonVisible }, cb)
  }

  /**
   * Gets called after the component has been mounted
   */
  componentDidMount () {
    const root = React.findDOMNode(this.refs.root)
    this._node = root
    this._parentNode = root.parentNode
    this._parentNodeDefaultHeight = this._parentNode.clientHeight

    this._updateButtonWidth(() => {
      let parentNodeHeight = this._parentNodeDefaultHeight
      if (this.state.buttonVisible) {
        parentNodeHeight += NATIVE_SCROLLBAR_HEIGHT
      }
      this._parentNode.style.height = `${parentNodeHeight}px`
    })
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const barStyle = {
      left: this.state.buttonLeft,
      width: this.state.buttonWidth,
      display: this.state.buttonVisible ? 'block' : 'none'
    }

    return (<div bem='$b:scrollbar' ref='root'>
      <div
        bem='e:bar'
        style={barStyle}
        onMouseDown={this._onButtonDown}></div>
    </div>)
  }
}
