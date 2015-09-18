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
import { ReactBEM, Constants } from '../../../globals'
import ScreenComponent from '../screen-component'
import SubHeaderComponent from '../../sub-header-component'
import CanvasComponent from './canvas-component'
import ZoomComponent from './zoom-component'

import OverviewControls from '../../controls/overview/'

export default class EditorScreenComponent extends ScreenComponent {
  constructor () {
    super()

    this._bindAll(
      'switchToControls',
      '_onFirstCanvasRender',
      '_onZoomIn',
      '_onZoomOut'
    )

    this._previousControlsStack = []
    this.state = {
      zoom: null,
      controls: OverviewControls
    }
  }

  /**
   * We only know the canvas dimensions after the first rendering has been done.
   * On the first render, we should set the initial zoom level
   * @private
   */
  _onFirstCanvasRender () {
    const canvasComponent = this.refs.canvas
    this.setState({ zoom: canvasComponent.getDefaultZoom() })
  }

  /**
   * Gets called when the user clicked the zoom in button
   * @private
   */
  _onZoomIn () {
    const canvasComponent = this.refs.canvas
    const defaultZoom = canvasComponent.getDefaultZoom()

    let newZoom = this.state.zoom
    newZoom += 0.1
    newZoom = Math.min(defaultZoom * 2, newZoom)

    this.setState({ zoom: newZoom })
  }

  /**
   * Gets called when the user clicked the zoom out button
   * @private
   */
  _onZoomOut () {
    const canvasComponent = this.refs.canvas
    const defaultZoom = canvasComponent.getDefaultZoom()

    let newZoom = this.state.zoom
    newZoom -= 0.1
    newZoom = Math.max(defaultZoom, newZoom)

    this.setState({ zoom: newZoom })
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
    const CanvasControls = this.state.controls.canvasControls
    const Controls = this.state.controls.controls

    let canvasControls = null
    if (CanvasControls) {
      canvasControls = <CanvasControls editor={this} />
    }

    return (<div bem='b:screen $b:editorScreen'>
      <SubHeaderComponent
        label={this._t('webcam.headline')}>
        <bem specifier='$b:subHeader'>
          <ZoomComponent
            zoom={this.state.zoom}
            onZoomIn={this._onZoomIn}
            onZoomOut={this._onZoomOut} />
        </bem>
      </SubHeaderComponent>

      <CanvasComponent
        ref='canvas'
        onFirstRender={this._onFirstCanvasRender}
        zoom={this.state.zoom}>
        {canvasControls}
      </CanvasComponent>

      <div bem='$b:controls $e:container e:row'>
        <div bem='e:cell'>
          <Controls onSwitchControls={this.switchToControls} editor={this} />
        </div>
      </div>
    </div>)
  }
}
