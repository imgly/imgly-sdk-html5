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

    this._canvasDimensions = new Vector2()
    this._containerDimensions = new Vector2()

    this.state = {
      canvasPosition: new Vector2(),
      canvasOffset: new Vector2()
    }

    this._events = {
      [Constants.EVENTS.CANVAS_RENDER]: this._onCanvasUpdate
    }
  }

  // -------------------------------------------------------------------------- LIFECYCLE

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
   * Gets called after this component has been mounted
   */
  componentDidMount () {
    super.componentDidMount()

    const { kit } = this.context
    this._canvas = React.findDOMNode(this.refs.canvas)
    kit.setCanvas(this._canvas)

    this._updateDimensions()

    this._onCanvasUpdate()
      .then(() => {
        this.props.onFirstRender && this.props.onFirstRender()
      })
  }

  /**
   * Gets called after this component has been updated
   */
  componentDidUpdate (prevProps, newProps) {
    this._updateDimensions()
  }

  // -------------------------------------------------------------------------- DRAGGING

  /**
   * Gets called when the user starts dragging the canvas
   * @param {React.SyntheticEvent} e
   * @private
   */
  _onDragStart (e) {
    if (!this.props.dragEnabled) return

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

  // -------------------------------------------------------------------------- POSITIONING

  /**
   * Clamps and updates the canvas positioning offset
   * @param {Vector2} [offset]
   * @private
   */
  _updateOffset (offset = this.state.canvasOffset) {
    const minOffset = this._containerDimensions
      .clone()
      .subtract(this._canvasDimensions)
      .divide(2)
    const maxOffset = this._canvasDimensions
      .clone()
      .subtract(this._containerDimensions)
      .divide(2)
      .clamp(new Vector2(0, 0), null)

    offset.clamp(minOffset, maxOffset)

    this.setState({ canvasOffset: offset })
  }

  /**
   * Repositions the canvas
   * @private
   */
  _repositionCanvas () {
    const canvasPosition = this._containerDimensions
      .clone()
      .divide(2)
      .subtract(this._canvasDimensions.divide(2))

    this.setState({ canvasPosition })
  }

  // -------------------------------------------------------------------------- MISC

  /**
   * Returns the default zoom level
   * @return {Number}
   */
  getDefaultZoom () {
    const { kit } = this.context

    const outputDimensions = kit.getInputDimensions()
    const defaultDimensions = SDKUtils.resizeVectorToFit(outputDimensions, this._containerDimensions)

    // Since default and native dimensions have the same ratio, we can take either x or y here
    return defaultDimensions
      .divide(outputDimensions)
      .x
  }

  /**
   * Updates the stored canvas and container dimensions
   * @private
   */
  _updateDimensions () {
    const canvas = this.refs.canvas.getDOMNode()
    this._canvasDimensions = new Vector2(canvas.offsetWidth, canvas.offsetHeight)

    const canvasCell = this.refs.canvasCell.getDOMNode()
    this._containerDimensions = new Vector2(canvasCell.offsetWidth, canvasCell.offsetHeight)
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the dimensions or zoom has been changed
   * @param {Number} zoom = this.props.zoom
   * @param {Function} [callback]
   * @private
   */
  _onCanvasUpdate (zoom = this.props.zoom, callback) {
    const { kit } = this.context

    let rendererDimensions = this._containerDimensions
    if (zoom !== null) {
      rendererDimensions.clone()
        .multiply(zoom)
        .floor()
    }
    kit.setDimensions(`${rendererDimensions.x}x${rendererDimensions.y}`)

    return kit.render()
      .then(() => {
        this._updateDimensions()
        this._repositionCanvas()
        this._updateOffset()
        callback && callback()
      })
  }

  // -------------------------------------------------------------------------- GETTERS

  /**
   * Returns the current output dimensions
   * @return {Vector2}
   */
  getOutputDimensions () {
    const { kit } = this.context
    return kit.getOutputDimensions()
  }

  /**
   * Returns the initial dimensions for the current settings
   * @return {Vector2}
   */
  getInitialDimensions () {
    const { kit } = this.context
    return kit.getInitialDimensions()
  }

  /**
   * Returns the current canvas dimensions
   * @return {Vector2}
   */
  getDimensions () {
    return this._canvasDimensions
  }

  /**
   * Returns the current canvas container dimensions
   * @return {Vector2}
   */
  getContainerDimensions () {
    return this._containerDimensions
  }

  // -------------------------------------------------------------------------- RENDERING

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
    let canvasContent = null
    let containerContent = null
    if (this.props.largeCanvasControls) {
      containerContent = this.props.children
    } else {
      canvasContent = this.props.children
    }

    return (
      <div bem='$b:canvas e:container e:row'>
        <div bem='e:container e:cell' ref='canvasCell'>
          <div
            bem='$e:canvas'
            className={this.props.dragEnabled ? 'is-draggable' : null}
            onTouchStart={this._onDragStart}
            onMouseDown={this._onDragStart}
            style={this._getDraggableStyle()}>
            <canvas ref='canvas' />
            {canvasContent}
          </div>
          {containerContent}
        </div>
      </div>
    )
  }
}
