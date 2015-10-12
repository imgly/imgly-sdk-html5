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

import { ReactBEM, BaseChildComponent } from '../../../globals'
import ScrollbarComponent from '../../scrollbar-component'

import StickersOverviewControlsComponent from './edit/overview-component-component'

export default class StickersEditControlsComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._bindAll('switchToControls')

    this._previousControlsStack = []
    this.state = {
      controls: StickersOverviewControlsComponent
    }
  }

  // -------------------------------------------------------------------------- CONTROLS

  /**
   * Switches to the given controls
   * @param  {React.Component} controls
   */
  switchToControls (controls) {
    let newControls = null
    if (controls === 'back') {
      newControls = this._previousControlsStack.pop()

      // No controls on stack, switch back on a higher level
      if (!newControls) {
        return this.props.onBack('back')
      }
    } else {
      newControls = controls
      this._previousControlsStack.push(this.state.controls)
    }

    this.setState({
      controls: newControls
    })
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const Controls = this.state.controls

    return (<Controls
      onSwitchControls={this.switchToControls}
      sharedState={this.props.sharedState} />
    )
  }
}
