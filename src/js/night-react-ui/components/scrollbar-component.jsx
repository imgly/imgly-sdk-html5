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
const NATIVE_SCROLLBAR_HEIGHT = 25

export default class ScrollbarComponent extends BaseChildComponent {
  constructor () {
    super()

    this._isDragging = false
    this._bindAll(
      '_onButtonDown',
      '_onButtonMove',
      '_onButtonUp',
      '_onListScroll'
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
    this._isDragging = true

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
    const progress = buttonLeft / this._list.scrollWidth
    const scrollPosition = this._list.scrollWidth * progress
    this._list.scrollLeft = scrollPosition
  }

  /**
   * Gets called when the user releases the button
   * @param {Event} e
   * @private
   */
  _onButtonUp (e) {
    e.preventDefault()
    this._isDragging = false
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

    const parentWidth = this._list.offsetWidth
    const parentScrollWidth = this._list.scrollWidth
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
    this._list = React.findDOMNode(this.refs.list)
    this._listDefaultHeight = this._list.clientHeight

    this._updateButtonWidth(() => {
      let parentNodeHeight = this._listDefaultHeight
      if (this.state.buttonVisible) {
        parentNodeHeight += NATIVE_SCROLLBAR_HEIGHT
      }
      this._list.style.height = `${parentNodeHeight}px`
    })

    this._list.addEventListener('scroll', this._onListScroll)
  }

  /**
   * Gets called when the user scrolls the list
   * @private
   */
  _onListScroll () {
    if (this._isDragging) return
    const listScrollWidth = this._list.scrollWidth - this._list.offsetWidth
    const listScrollPosition = this._list.scrollLeft

    const backgroundScrollWidth = this._node.offsetWidth - this.state.buttonWidth
    const progress = listScrollPosition / listScrollWidth

    this.setState({
      buttonLeft: backgroundScrollWidth * progress
    })
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const buttonStyle = {
      left: this.state.buttonLeft,
      width: this.state.buttonWidth
    }
    const scrollbarStyle = {
      display: this.state.buttonVisible ? 'block' : 'none'
    }

    const child = React.cloneElement(this.props.children, {
      ref: 'list'
    })

    return (<div>
      {child}
      <div bem='$b:scrollbar' ref='root' style={scrollbarStyle}>
        <div
            bem='e:bar'
            style={buttonStyle}
            onMouseDown={this._onButtonDown}></div>
      </div>
    </div>)
  }
}
