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

import { Utils, SDKUtils, React, ReactBEM, Vector2, BaseChildComponent, Constants } from '../../../globals'

export default class CanvasComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onDragStart',
      '_onDragMove',
      '_onDragEnd',
      '_onCanvasUpdate'
    )

    this.state = {
      canvasPosition: new Vector2(),
      canvasOffset: new Vector2()
    }
    this._mounted = false

    this._events = {
      [Constants.EVENTS.CANVAS_RENDER]: this._onCanvasUpdate
    }
  }

  /**
   * Gets called when the user starts dragging the canvas
   * @param {React.SyntheticEvent} e
   * @private
   */
  _onDragStart (e) {
    this._dragStartPosition = Utils.getEventPosition(e.nativeEvent)
    this._dragInitialOffset = this.state.canvasOffset.clone()
    document.addEventListener('mousemove', this._onDragMove)
    document.addEventListener('touchmove', this._onDragMove)
    document.addEventListener('mouseup', this._onDragEnd)
    document.addEventListener('touchend', this._onDragEnd)
  }

  /**
   * Gets called while the user drags the canvas
   * @param {DOMEvent} e
   * @private
   */
  _onDragMove (e) {
    const eventPosition = Utils.getEventPosition(e)
    const diffFromStart = eventPosition
      .clone()
      .subtract(this._dragStartPosition)

    const newOffset = this._dragInitialOffset
      .clone()
      .add(diffFromStart)
    this._updateOffset(newOffset)
  }

  /**
   * Clamps and updates the canvas positioning offset
   * @param {Vector2} [offset]
   * @private
   */
  _updateOffset (offset = this.state.canvasOffset) {
    const canvasCell = React.findDOMNode(this.refs.canvasCell)
    const containerDimensions = new Vector2(canvasCell.offsetWidth, canvasCell.offsetHeight)
    const canvasDimensions = new Vector2(this._canvas.width, this._canvas.height)
    const minOffset = containerDimensions
      .clone()
      .subtract(canvasDimensions)
      .divide(2)
    const maxOffset = canvasDimensions
      .clone()
      .subtract(containerDimensions)
      .divide(2)
      .clamp(new Vector2(0, 0), null)

    offset.clamp(minOffset, maxOffset)

    this.setState({ canvasOffset: offset })
  }

  /**
   * Gets called when the user stops dragging the canvas
   * @param {DOMEvent} e
   * @private
   */
  _onDragEnd (e) {
    document.removeEventListener('mousemove', this._onDragMove)
    document.removeEventListener('touchmove', this._onDragMove)
    document.removeEventListener('mouseup', this._onDragEnd)
    document.removeEventListener('touchend', this._onDragEnd)
  }

  /**
   * Gets called when this component receives some new props
   * @param {Object} props
   */
  componentWillReceiveProps (props) {
    if (props.zoom !== this.props.zoom) {
      this.context.kit.setAllOperationsToDirty()
      this._onCanvasUpdate(props.zoom)
    }
  }

  /**
   * Returns the default zoom level
   * @return {Number}
   */
  getDefaultZoom () {
    const { kit } = this.context

    const canvasCell = React.findDOMNode(this.refs.canvasCell)
    const containerDimensions = new Vector2(canvasCell.offsetWidth, canvasCell.offsetHeight)

    const outputDimensions = kit.getOutputDimensions()
    const defaultDimensions = SDKUtils.resizeVectorToFit(outputDimensions, containerDimensions)

    // Since default and native dimensions have the same ratio, we can take either x or y here
    return defaultDimensions
      .divide(outputDimensions)
      .x
  }

  /**
   * Gets called when the dimensions or zoom has been changed
   * @param {Number} zoom = this.props.zoom
   * @private
   */
  _onCanvasUpdate (zoom = this.props.zoom) {
    const { kit, operationsStack } = this.context
    const renderer = kit.getRenderer()
    const canvasCell = React.findDOMNode(this.refs.canvasCell)

    let containerDimensions = new Vector2(canvasCell.offsetWidth, canvasCell.offsetHeight)
    if (zoom !== null) {
      containerDimensions = renderer.getInitialDimensionsForStack(operationsStack)
        .multiply(zoom)
        .floor()
    }
    kit.setDimensions(`${containerDimensions.x}x${containerDimensions.y}`)

    return kit.render()
      .then(() => {
        this._repositionCanvas()
        this._updateOffset()
      })
  }

  /**
   * Gets called after this component has been mounted
   */
  componentDidMount () {
    super.componentDidMount()

    const { kit } = this.context
    this._canvas = React.findDOMNode(this.refs.canvas)
    kit.setCanvas(this._canvas)
    this._mounted = true

    this._onCanvasUpdate()
      .then(() => {
        this.props.onFirstRender && this.props.onFirstRender()
      })
  }

  /**
   * Repositions the canvas
   * @private
   */
  _repositionCanvas () {
    const canvas = React.findDOMNode(this.refs.canvas)
    const canvasCell = React.findDOMNode(this.refs.canvasCell)
    const containerDimensions = new Vector2(canvasCell.offsetWidth, canvasCell.offsetHeight)
    const canvasDimensions = new Vector2(canvas.width, canvas.height)
    const canvasPosition = containerDimensions
      .clone()
      .divide(2)
      .subtract(canvasDimensions.divide(2))
    this.setState({ canvasPosition })
  }

  /**
   * Returns the style properties for the draggable canvas area
   * @private
   */
  _getDraggableStyle () {
    return {
      top: this.state.canvasPosition.y + this.state.canvasOffset.y,
      left: this.state.canvasPosition.x + this.state.canvasOffset.x
    }
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    return (
      <div bem='$b:canvas e:container e:row'>
        <div bem='e:container e:cell' ref='canvasCell'>
          <div
            bem='$e:canvas m:draggable'
            onTouchStart={this._onDragStart}
            onMouseDown={this._onDragStart}
            style={this._getDraggableStyle()}>
            <canvas ref='canvas' />
          </div>
          {this.props.children}
        </div>
      </div>
    )
  }
}
