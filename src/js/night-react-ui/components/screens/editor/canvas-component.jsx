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
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    return (
      <div bem='$b:canvas $e:container e:row'>
        <div bem='e:cell' ref='canvasCell'>
          <canvas ref='canvas' />
        </div>
      </div>
    )
  }
}
