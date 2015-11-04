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

import { React, ReactBEM, BaseComponent, Utils, Vector2 } from '../globals'
import DraggableComponent from './draggable-component'
const NATIVE_SCROLLBAR_HEIGHT = 25

export default class ScrollbarComponent extends BaseComponent {
  constructor () {
    super()

    this._isDragging = false
    this._bindAll(
      '_onButtonDragStart',
      '_onButtonDrag',
      '_onButtonDragStop',
      '_onBarDragStart',
      '_onBarDrag',
      '_onBarDragStop',
      '_onListScroll'
    )
    this.state = {
      buttonWidth: 0,
      buttonLeft: 0,
      buttonVisible: false
    }
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called after the component has been mounted
   */
  componentDidMount () {
    const { root, list } = this.refs
    this._node = root
    this._list = list
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

  // -------------------------------------------------------------------------- EVENTS

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
   * Gets called when the user presses a mouse button on the bar
   * @private
   */
  _onButtonDragStart (e) {
    this._isDragging = true
    this._initialButtonPosition = this.state.buttonLeft || 0
  }

  /**
   * Gets called while the user drags the button
   * @param {Vector2} diff
   * @private
   */
  _onButtonDrag (diff) {
    const buttonLeft = this._initialButtonPosition + diff.x
    this._setButtonLeft(buttonLeft)
  }

  /**
   * Gets called when the user releases the button
   * @private
   */
  _onButtonDragStop () {
    this._isDragging = false
  }

  /**
   * Gets called when the user starts dragging the bar
   * @param  {Event} e
   * @private
   */
  _onBarDragStart (e) {
    const mousePosition = Utils.getEventPosition(e)
    this._initialPosition = mousePosition.clone()
    const boundingRect = this._node.getBoundingClientRect()
    const elementOffset = new Vector2(
      boundingRect.left,
      boundingRect.top
    )

    const relativePosition = mousePosition
      .clone()
      .subtract(elementOffset)
    this._setButtonLeft(relativePosition.x - this.state.buttonWidth / 2)

    document.addEventListener('mousemove', this._onBarDrag)
    document.addEventListener('touchmove', this._onBarDrag)
    document.addEventListener('mouseup', this._onBarDragStop)
    document.addEventListener('touchend', this._onBarDragStop)
  }

  /**
   * Gets called while the user drags the bar
   * @param  {Event} e
   * @private
   */
  _onBarDrag (e) {
    const mousePosition = Utils.getEventPosition(e)

    const boundingRect = this._node.getBoundingClientRect()
    const elementOffset = new Vector2(
      boundingRect.left,
      boundingRect.top
    )

    const relativePosition = mousePosition
      .clone()
      .subtract(elementOffset)
    this._setButtonLeft(relativePosition.x - this.state.buttonWidth / 2)
  }

  /**
   * Gets called when the user releases the bar
   * @private
   */
  _onBarDragStop () {
    document.removeEventListener('mousemove', this._onBarDrag)
    document.removeEventListener('touchmove', this._onBarDrag)
    document.removeEventListener('mouseup', this._onBarDragStop)
    document.removeEventListener('touchend', this._onBarDragStop)
  }

  // -------------------------------------------------------------------------- MISC

  /**
   * Sets the button position to the given value
   * @param {Number} buttonLeft
   * @private
   */
  _setButtonLeft (buttonLeft) {
    const scrollableButtonWidth = this._node.offsetWidth - this.state.buttonWidth
    const scrollableListWidth = this._list.scrollWidth - this._list.offsetWidth

    // Clamp button position
    buttonLeft = Math.max(0, buttonLeft)
    buttonLeft = Math.min(buttonLeft, scrollableButtonWidth)

    // Set button position
    this.setState({ buttonLeft })

    // Update list scroll position
    const progress = buttonLeft / scrollableButtonWidth
    const scrollPosition = scrollableListWidth * progress
    this._list.scrollLeft = scrollPosition
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

  // -------------------------------------------------------------------------- RENDERING

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
      <div
        bem='$b:scrollbar'
        ref='root'
        style={scrollbarStyle}
        onMouseDown={this._onBarDragStart}
        onTouchStart={this._onBarDragStart}>
        <DraggableComponent
          onStart={this._onButtonDragStart}
          onDrag={this._onButtonDrag}>
            <div
              bem='e:bar'
              style={buttonStyle}
              onMouseDown={this._onButtonDown}></div>
        </DraggableComponent>
      </div>
    </div>)
  }
}
