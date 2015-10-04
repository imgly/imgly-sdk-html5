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

import { ReactBEM, BaseChildComponent, Utils, Vector2 } from '../../../globals'

export default class OverviewCanvasControlsComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)
    this._bindAll('_onClick')
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user clicks somewhere on the canvas
   * @param  {Event} e
   * @private
   */
  _onClick (e) {
    const container = this.refs.container.getDOMNode()
    const containerRect = container.getBoundingClientRect()
    const containerPosition = new Vector2(
      containerRect.left,
      containerRect.top
    )
    const position = Utils.getEventPosition(e)
      .subtract(containerPosition)

    const { ui } = this.context
    const controls = ui.getSelectedControls()

    // Check if any of the controls responds to a click
    // at the given position
    let found = false
    controls.forEach((control) => {
      if (found) return

      const clickResponse = control.clickAtPosition &&
        control.clickAtPosition(position, this.context)
      if (clickResponse) {
        // Responds to click, switch to the controls
        this.props.onSwitchControls(control, clickResponse)
        found = true
      }
    })
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    return (<div
      bem='$b:canvasControls e:container m:full'
      ref='container'
      onClick={this._onClick} />)
  }
}
