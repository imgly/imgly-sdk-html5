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
   * Gets called after this component has been mounted
   */
  componentDidMount () {
    this._canvas = React.findDOMNode(this.refs.canvas)
    const { renderer } = this.context

    const canvasCell = React.findDOMNode(this.refs.canvasCell)
    const canvasDimensions = new Vector2(canvasCell.offsetWidth, canvasCell.offsetHeight)
    renderer.setDimensions(`${canvasDimensions.x}x${canvasDimensions.y}`)
    renderer.setCanvas(this._canvas)
    renderer.render()
      .then(() => {
        this._repositionCanvas()
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
