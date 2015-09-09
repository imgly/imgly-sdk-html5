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
import { React, ReactBEM, Vector2 } from '../../../globals'
import ScreenComponent from '../screen-component'
import SubHeaderComponent from '../../sub-header-component'

import OverviewControls from '../../controls/overview/'

export default class EditorScreenComponent extends ScreenComponent {
  constructor () {
    super()

    this._bindAll('switchToControls')
    this._previousControlsStack = []
    this.state = { controls: OverviewControls }
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
  }

  /**
   * Switches to the given controls
   * @param  {Component} controls
   */
  switchToControls (controls) {
    let newControls = null
    if (controls === 'back') {
      newControls = this._previousControlsStack.pop()
    } else {
      newControls = controls
      this._previousControlsStack.push(this.state.controls)
    }

    this.setState({ controls: newControls })
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const Controls = this.state.controls.controls
    return (<div bem='b:screen $b:editorScreen'>
      <SubHeaderComponent
        label={this._t('webcam.headline')}>
        <bem specifier='$b:subHeader'>
          <div bem='e:label'>
            {this._t('editor.headline')}
          </div>
        </bem>
      </SubHeaderComponent>

      <div bem='$b:canvasContainer e:row'>
        <div bem='e:cell' ref='canvasCell'>
          <canvas bem='e:canvas' ref='canvas' />
        </div>
      </div>

      <div bem='$b:controls $e:container e:row'>
        <div bem='e:cell'>
          <Controls onSwitchControls={this.switchToControls} editor={this} />
        </div>
      </div>
    </div>)
  }
}
