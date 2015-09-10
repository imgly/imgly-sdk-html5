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

import { SDKUtils, React, ReactBEM, Vector2, BaseChildComponent } from '../../../globals'

export default class CanvasComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this.state = {
      canvasPosition: new Vector2()
    }
  }

  /**
   * Returns the default zoom level
   * @return {Number}
   */
  getDefaultZoom () {
    const canvasCell = React.findDOMNode(this.refs.canvasCell)
    const containerDimensions = new Vector2(canvasCell.offsetWidth, canvasCell.offsetHeight)
    const nativeDimensions = this.context.renderer.getNativeDimensions()
    const defaultDimensions = SDKUtils.resizeVectorToFit(nativeDimensions, containerDimensions)
    return defaultDimensions.divide(nativeDimensions).x
  }

  /**
   * Gets called when the dimensions or zoom has been changed
   * @param {Number} zoom = this.props.zoom
   * @private
   */
  _onCanvasUpdate (zoom = this.props.zoom) {
    const { renderer } = this.context
    const canvasCell = React.findDOMNode(this.refs.canvasCell)

    let containerDimensions = new Vector2(canvasCell.offsetWidth, canvasCell.offsetHeight)
    if (zoom !== null) {
      containerDimensions = renderer.getNativeDimensions()
        .multiply(zoom)
        .floor()
    }
    renderer.setDimensions(`${containerDimensions.x}x${containerDimensions.y}`)

    return renderer.render()
      .then(() => {
        this._repositionCanvas()
      })
  }

  /**
   * Gets called after this component has been mounted
   */
  componentDidMount () {
    const { renderer } = this.context
    this._canvas = React.findDOMNode(this.refs.canvas)
    renderer.setCanvas(this._canvas)

    this._onCanvasUpdate()
      .then(() => {
        this.props.onFirstRender && this.props.onFirstRender()
      })
  }

  /**
   * Gets called when the component has received new properties
   * @param {Object} nextProps
   */
  componentWillReceiveProps (nextProps) {
    if (nextProps.zoom !== this.props.zoom) {
      this._onCanvasUpdate(nextProps.zoom)
    }
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
      top: this.state.canvasPosition.y,
      left: this.state.canvasPosition.x
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
          <div bem='$e:canvas m:draggable' style={this._getDraggableStyle()}>
            <canvas ref='canvas' />
          </div>
        </div>
      </div>
    )
  }
}
