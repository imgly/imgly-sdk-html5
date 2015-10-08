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
import { React, BaseChildComponent, Utils, Vector2 } from '../globals'

export default class DraggableComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onDragStart',
      '_onDragMove',
      '_onDragEnd'
    )
  }

  // -------------------------------------------------------------------------- DRAGGING

  /**
   * Gets called when the user stars dragging the child
   * @param {Event} e
   * @private
   */
  _onDragStart (e) {
    if (this.props.disabled) return

    e.nativeEvent.preventDefault()
    e.nativeEvent.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()

    this._initialMousePosition = Utils.getEventPosition(e)

    document.addEventListener('mousemove', this._onDragMove)
    document.addEventListener('touchmove', this._onDragMove)
    document.addEventListener('mouseup', this._onDragEnd)
    document.addEventListener('touchend', this._onDragEnd)

    const element = this.refs.element.getDOMNode()
    const boundingRect = element.getBoundingClientRect()
    const elementOffset = new Vector2(
      boundingRect.left,
      boundingRect.top
    )

    const relativePosition = this._initialMousePosition
      .clone()
      .subtract(elementOffset)
    this.props.onStart && this.props.onStart(relativePosition, e)
  }

  /**
   * Gets called while the user drags the child
   * @param {Event} e
   * @private
   */
  _onDragMove (e) {
    e.preventDefault()
    e.stopPropagation()

    const mousePosition = Utils.getEventPosition(e)
    const mouseDiff = mousePosition.clone().subtract(this._initialMousePosition)

    this.props.onDrag && this.props.onDrag(mouseDiff, e)
  }

  /**
   * Gets called when the user stops dragging the child
   * @param {Event} e
   * @private
   */
  _onDragEnd (e) {
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()

    document.removeEventListener('mousemove', this._onDragMove)
    document.removeEventListener('touchmove', this._onDragMove)
    document.removeEventListener('mouseup', this._onDragEnd)
    document.removeEventListener('touchend', this._onDragEnd)

    this.props.onStop && this.props.onStop(e)
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {React.Element}
   */
  render () {
    if (!this.props.children || this.props.children instanceof Array) {
      throw new Error('DraggableComponent expects exactly one child.')
    }

    return React.cloneElement(this.props.children, {
      onMouseDown: this._onDragStart,
      onTouchStart: this._onDragStart,
      ref: 'element'
    })
  }
}
