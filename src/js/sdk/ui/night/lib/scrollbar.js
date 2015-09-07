/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Utils from '../../../lib/utils'
import Vector2 from '../../../lib/math/vector2'

const maxScrollbarWidth = 18

/**
 * Our custom scroll bar
 */
class Scrollbar {
  /**
   * @param {DOMElement} container
   */
  constructor (container) {
    this._container = container
    this._isDragging = false
    this._isHovering = false

    if (!this._browserSupported()) {
      return
    }

    this._appendDOM()
    this._resizeButton()
    this._updateValues()

    this._onButtonDown = this._onButtonDown.bind(this)
    this._onButtonMove = this._onButtonMove.bind(this)
    this._onButtonUp = this._onButtonUp.bind(this)

    this._onContainerEnter = this._onContainerEnter.bind(this)
    this._onContainerLeave = this._onContainerLeave.bind(this)

    this._onBackgroundClick = this._onBackgroundClick.bind(this)

    this._container.addEventListener('mouseenter', this._onContainerEnter)
    this._container.addEventListener('mouseleave', this._onContainerLeave)
    this._container.addEventListener('mousemove', this._onContainerEnter)
    this._dom.button.addEventListener('mousedown', this._onButtonDown)
    this._dom.button.addEventListener('touchstart', this._onButtonDown)
    this._dom.background.addEventListener('click', this._onBackgroundClick)
    this._list.addEventListener('scroll', this._onListScroll.bind(this))

    this._onListScroll()
  }

  /**
   * Checks whether this feature is supported in the current browser
   * @return {Boolean}
   * @private
   */
  _browserSupported () {
    const IEMatch = navigator.appVersion.match(/MSIE ([\d.]+)/)
    if (IEMatch && parseFloat(IEMatch[1]) <= 9) {
      return false
    }
    return true
  }

  /**
   * Gets called when the user clicks the scrollbar background
   * @param {Event} e
   * @private
   */
  _onBackgroundClick (e) {
    e.preventDefault()
    if (e.target !== this._dom.background) return

    let position = Utils.getEventPosition(e)
    let backgroundOffset = this._dom.background.getBoundingClientRect()
    backgroundOffset = new Vector2(backgroundOffset.left, backgroundOffset.top)

    let relativePosition = position.clone()
      .subtract(backgroundOffset)

    relativePosition.x -= this._values.button.width * 0.5

    this._setButtonPosition(relativePosition.x)
  }

  /**
   * Gets called when the user enters the list with the mouse
   * @private
   */
  _onContainerEnter () {
    this._isHovering = true
    this.show()
  }

  /**
   * Gets called when the user leaves the list with the mouse
   * @private
   */
  _onContainerLeave () {
    this._isHovering = false
    this.hide()
  }

  /**
   * Shows the scrollbar
   */
  show () {
    if (!this._browserSupported()) return
    if (!this._isScrollingNecessary) return
    Utils.classList(this._dom.background).add('visible')
  }

  /**
   * Hides the scrollbar
   */
  hide () {
    if (!this._browserSupported()) return
    if (this._isDragging) return
    Utils.classList(this._dom.background).remove('visible')
  }

  /**
   * Updates the size values
   * @private
   */
  _updateValues () {
    this._values = {
      list: {
        totalWidth: this._list.scrollWidth,
        visibleWidth: this._list.offsetWidth,
        scrollableWidth: this._list.scrollWidth - this._list.offsetWidth
      },
      button: {
        width: this._dom.button.offsetWidth,
        scrollableWidth: this._dom.background.offsetWidth - this._dom.button.offsetWidth
      }
    }
  }

  /**
   * Gets called when the user starts dragging the button
   * @param {Event} event
   * @private
   */
  _onButtonDown (event) {
    event.preventDefault()

    this._isDragging = true

    this._initialMousePosition = Utils.getEventPosition(event)
    this._initialButtonPosition = this._buttonPosition || 0

    document.addEventListener('mousemove', this._onButtonMove)
    document.addEventListener('touchmove', this._onButtonMove)
    document.addEventListener('mouseup', this._onButtonUp)
    document.addEventListener('touchend', this._onButtonUp)
  }

  /**
   * Gets called when the user drags the button
   * @param {Event} event
   * @private
   */
  _onButtonMove (event) {
    event.preventDefault()

    let mousePosition = Utils.getEventPosition(event)
    let diff = mousePosition.clone()
      .subtract(this._initialMousePosition)
    let newButtonPosition = this._initialButtonPosition + diff.x

    this._setButtonPosition(newButtonPosition)
  }

  /**
   * Sets the button position to the given value
   * @param {Number} newButtonPosition
   * @private
   */
  _setButtonPosition (newButtonPosition) {
    // Clamp button position
    newButtonPosition = Math.max(0, newButtonPosition)
    newButtonPosition = Math.min(newButtonPosition, this._values.button.scrollableWidth)

    // Set button position
    this._buttonPosition = newButtonPosition
    this._dom.button.style.left = `${this._buttonPosition}px`

    // Update list scroll position
    let progress = newButtonPosition / this._values.button.scrollableWidth
    let scrollPosition = this._values.list.scrollableWidth * progress
    this._list.scrollLeft = scrollPosition
  }

  /**
   * Gets called when the user releases the button
   * @private
   */
  _onButtonUp () {
    this._isDragging = false

    document.removeEventListener('mousemove', this._onButtonMove)
    document.removeEventListener('touchmove', this._onButtonMove)
    document.removeEventListener('mouseup', this._onButtonUp)
    document.removeEventListener('touchend', this._onButtonUp)
  }

  /**
   * Gets called when the user scrolls the list
   * @private
   */
  _onListScroll () {
    if (this._isDragging) return

    let listScrollWidth = this._list.scrollWidth - this._list.offsetWidth
    let listScrollPosition = this._list.scrollLeft

    let backgroundScrollWidth = this._dom.background.offsetWidth - this._dom.button.offsetWidth
    let progress = listScrollPosition / listScrollWidth

    this._buttonPosition = backgroundScrollWidth * progress
    this._dom.button.style.left = `${this._buttonPosition}px`
  }

  /**
   * Resizes the button to represent the visible size of the container
   * @private
   */
  _resizeButton () {
    let listScrollWidth = this._list.scrollWidth
    let listWidth = this._list.offsetWidth

    this._buttonWidth = listWidth / listScrollWidth * listWidth
    this._dom.button.style.width = `${this._buttonWidth}px`
  }

  /**
   * Appends the DOM elements to the container
   * @private
   */
  _appendDOM () {
    let background = document.createElement('div')
    Utils.classList(background).add('imglykit-scrollbar-background')
    background.style.bottom = `${maxScrollbarWidth}px`

    let button = document.createElement('div')
    Utils.classList(button).add('imglykit-scrollbar-button')

    background.appendChild(button)
    this._container.appendChild(background)

    // Container should have position: relative
    this._container.style.position = 'relative'

    // Find the list
    this._list = this._container.querySelector('.imglykit-controls-list')
    this._dom = { background, button }

    // Resize the list and the container
    this._list.style.height = ''
    let listHeight = this._list.offsetHeight
    listHeight += maxScrollbarWidth
    this._container.style.height = `${listHeight}px`
    this._list.style.height = `${listHeight}px`
  }

  /**
   * Removes the DOM elements and event listeners
   */
  remove () {
    if (!this._browserSupported()) return

    this._dom.button.removeEventListener('mousedown', this._onButtonDown)
    this._dom.button.removeEventListener('touchstart', this._onButtonDown)

    this._dom.background.parentNode.removeChild(this._dom.background)
  }

  /**
   * Checks whether scrolling is necessary
   * @returns {Boolean}
   * @private
   */
  get _isScrollingNecessary () {
    return (this._list.scrollWidth > this._list.offsetWidth)
  }
}

export default Scrollbar
