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

import { React, ReactBEM, Vector2, BaseChildComponent } from '../../../globals'

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
    const canvasDimensions = new Vector2(this._canvas.width, this._canvas.height)
    const nativeDimensions = this.context.renderer.getNativeDimensions()
    return canvasDimensions.divide(nativeDimensions).x
  }

  /**
   * Gets called after this component has been mounted
   */
  componentDidMount () {
    this._canvas = React.findDOMNode(this.refs.canvas)
    const { renderer } = this.context

    const canvasCell = React.findDOMNode(this.refs.canvasCell)
    let containerDimensions = new Vector2(canvasCell.offsetWidth, canvasCell.offsetHeight)
    if (this.props.zoom !== null) {
      containerDimensions = containerDimensions.multiply(this.props.zoom)
    }
    renderer.setDimensions(`${containerDimensions.x}x${containerDimensions.y}`)
    renderer.setCanvas(this._canvas)
    renderer.render()
      .then(() => {
        this._repositionCanvas()

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
