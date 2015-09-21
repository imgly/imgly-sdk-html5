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

import { React, ReactBEM, BaseChildComponent, Vector2, Constants } from '../../../globals'

export default class CropCanvasControlsComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onOperationUpdated'
    )

    this._mounted = false
    this._operation = this.context.ui.getOrCreateOperation('crop')
    this._events = {
      [Constants.EVENTS.OPERATION_UPDATED]: this._onOperationUpdated
    }
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the given operation has been updated
   * @param {Operation} operation
   * @private
   */
  _onOperationUpdated (operation) {
    if (operation !== this._operation) return
    this.forceUpdate()
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called when this component has been mounted
   */
  componentDidMount () {
    super.componentDidMount()
    // We need to mount the component and render again to have access
    // to the rendered container dimensions
    this._mounted = true
    this.forceUpdate()
  }

  // -------------------------------------------------------------------------- RESIZING / STYLING

  /**
   * Returns the styles (width / height) for the crop areas that define the
   * crop size
   * @return {Object}
   * @private
   */
  _getAreaStyles () {
    if (!this._mounted) return {}

    const container = React.findDOMNode(this.refs.container)
    const containerDimensions = new Vector2(
      container.offsetWidth,
      container.offsetHeight
    )

    const start = this._operation.getStart().clone().multiply(containerDimensions)
    const end = this._operation.getEnd().clone().multiply(containerDimensions)
    const size = end.clone().subtract(start)

    return {
      topLeft: this._getDimensionsStyles(start.x, start.y),
      topCenter: this._getDimensionsStyles(size.x, start.y),
      centerLeft: this._getDimensionsStyles(start.x, size.y),
      center: this._getDimensionsStyles(size.x, size.y)
    }
  }

  /**
   * Returns the dimensions style (width / height) for the given dimensions
   * @param {Number} x
   * @param {Number} y
   * @return {Object}
   * @private
   */
  _getDimensionsStyles (x, y) {
    return { width: x, height: y }
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const areaStyles = this._getAreaStyles()
    return (<div bem='b:canvasControls e:container m:full' ref='container'>
      <div bem='$b:cropCanvasControls'>
        <div bem='e:row'>
          <div bem='e:cell m:dark' style={areaStyles.topLeft} />
          <div bem='e:cell m:dark' style={areaStyles.topCenter} />
          <div bem='e:cell m:dark' />
        </div>
        <div bem='e:row'>
          <div bem='e:cell m:dark' style={areaStyles.centerLeft} />
          <div bem='e:cell m:bordered' style={areaStyles.center}>
            <div bem='e:knob m:topLeft $b:knob' />
            <div bem='e:knob m:bottomRight $b:knob' />
          </div>
          <div bem='e:cell m:dark' />
        </div>
        <div bem='e:row'>
          <div bem='e:cell m:dark' />
          <div bem='e:cell m:dark' />
          <div bem='e:cell m:dark' />
        </div>
      </div>
    </div>)
  }
}
