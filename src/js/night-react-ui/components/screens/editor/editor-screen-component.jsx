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
import { ReactBEM, Constants, SDKUtils, SharedState } from '../../../globals'
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
      '_onZoomOut',
      '_zoom',
      '_undoZoom',
      '_onDisableFeatures',
      '_onEnableFeatures'
    )

    this._previousControlsStack = []
    this.state = {
      zoom: null,
      controls: OverviewControls,
      zoomEnabled: true,
      dragEnabled: true
    }

    this._events = {
      [Constants.EVENTS.CANVAS_ZOOM]: this._zoom,
      [Constants.EVENTS.CANVAS_UNDO_ZOOM]: this._undoZoom,
      [Constants.EVENTS.EDITOR_DISABLE_FEATURES]: this._onDisableFeatures,
      [Constants.EVENTS.EDITOR_ENABLE_FEATURES]: this._onEnableFeatures
    }
  }

  // -------------------------------------------------------------------------- FEATURES

  /**
   * Gets called when a EDITOR_DISABLE_FEATURES event is emitted
   * @param {Array.<String>} features
   */
  _onDisableFeatures (features) {
    let { zoomEnabled, dragEnabled } = this.state
    if (features.indexOf('zoom') !== -1) {
      zoomEnabled = false
    }
    if (features.indexOf('drag') !== -1) {
      dragEnabled = false
    }
    this.setState({ zoomEnabled, dragEnabled })
  }

  /**
   * Gets called when a EDITOR_ENABLE_FEATURES event is emitted
   * @param {Array.<String>} features
   */
  _onEnableFeatures (features) {
    let { zoomEnabled, dragEnabled } = this.state
    if (features.indexOf('zoom') !== -1) {
      zoomEnabled = true
    }
    if (features.indexOf('drag') !== -1) {
      dragEnabled = true
    }
    this.setState({ zoomEnabled, dragEnabled })
  }

  // -------------------------------------------------------------------------- ZOOM

  /**
   * Undos the last zoom
   * @param {Function} [callback]
   * @private
   */
  _undoZoom (callback) {
    if (!this._previousZoomState) return

    const canvasComponent = this.refs.canvas
    const { zoom, canvasState } = this._previousZoomState

    // Couldn't come up with something clean here :(
    canvasComponent.setState(canvasState)
    this._previousZoomState = null
    this.setState({ zoom }, callback)
  }

  /**
   * Zooms to the given level
   * @param {Number|String} zoom
   * @param {Function} [callback]
   * @private
   */
  _zoom (zoom, callback) {
    const canvasComponent = this.refs.canvas

    let newZoom = zoom
    if (zoom === 'auto') {
      newZoom = canvasComponent.getDefaultZoom()
    }

    this._previousZoomState = SDKUtils.extend({
      zoom: this.state.zoom,
      canvasState: SDKUtils.clone(canvasComponent.state)
    }, canvasComponent.state)

    this.setState({ zoom: newZoom }, callback)
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

  // -------------------------------------------------------------------------- MISC

  /**
   * Returns the canvas dimensions
   * @return {Vector2}
   */
  getCanvasDimensions () {
    return this.refs.canvas.getDimensions()
  }

  /**
   * Returns the output dimensions
   * @return {Vector2}
   */
  getOutputDimensions () {
    return this.refs.canvas.getOutputDimensions()
  }

  /**
   * Returns the initial dimensions for the current settings
   * @return {Vector2}
   */
  getInitialDimensions () {
    return this.refs.canvas.getInitialDimensions()
  }

  /**
   * We only know the canvas dimensions after the first rendering has been done.
   * On the first render, we should set the initial zoom level
   * @private
   */
  _onFirstCanvasRender () {
    this._zoom('auto')
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

    const initialState = newControls.getInitialSharedState &&
      newControls.getInitialSharedState(this.context)
    const sharedState = new SharedState(initialState)

    this.setState({
      controls: newControls,
      sharedState
    })
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const CanvasControls = this.state.controls.canvasControls
    const Controls = this.state.controls.controls

    let controls, canvasControls

    if (Controls) {
      controls = (<Controls
        onSwitchControls={this.switchToControls}
        editor={this}
        sharedState={this.state.sharedState} />)
    }

    if (CanvasControls) {
      canvasControls = (<CanvasControls
        onSwitchControls={this.switchToControls}
        editor={this}
        sharedState={this.state.sharedState} />)
    }

    return (<div bem='b:screen $b:editorScreen'>
      <SubHeaderComponent
        label={this._t('webcam.headline')}>
        <bem specifier='$b:subHeader'>
          <ZoomComponent
            zoom={this.state.zoom}
            onZoomIn={this._onZoomIn}
            onZoomOut={this._onZoomOut}
            zoomEnabled={this.state.zoomEnabled} />
        </bem>
      </SubHeaderComponent>

      <CanvasComponent
        ref='canvas'
        onFirstRender={this._onFirstCanvasRender}
        zoom={this.state.zoom}
        dragEnabled={this.state.dragEnabled}
        largeControls={this.state.controls.largeCanvasControls}>
        {canvasControls}
      </CanvasComponent>

      <div bem='$b:controls $e:container e:row'>
        <div bem='e:cell'>
          {controls}
        </div>
      </div>
    </div>)
  }
}
