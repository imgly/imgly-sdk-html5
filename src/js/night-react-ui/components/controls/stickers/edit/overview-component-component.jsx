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

import { ReactBEM, BaseChildComponent } from '../../../../globals'
import ScrollbarComponent from '../../../scrollbar-component'

import AdjustmentsControls from './adjustments-controls-component'
import BlurControls from './blur-controls-component'
import FlipControls from './flip-controls-component'

const CONTROLS = [
  AdjustmentsControls,
  BlurControls,
  FlipControls
]

export default class StickersEditControlsComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._bindAll('_onBackClick')
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user clicks the back button
   * @param  {Event} e
   * @private
   */
  _onBackClick (e) {
    this.props.onSwitchControls('back')
  }

  /**
   * Gets called when the user clicks on the given item
   * @param  {React.Component} controls
   * @private
   */
  _onItemClick (controls) {
    this.props.onSwitchControls(controls)
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const { ui } = this.context
    const listItems = CONTROLS
      .map((control, i) => {
        return (<li
          bem='e:item'
          key={i}
          onClick={this._onItemClick.bind(this, control)}>
            <bem specifier='$b:controls'>
              <div bem='$e:button m:withLabel'>
                <img bem='e:icon' src={ui.getHelpers().assetPath(`controls/overview/${control.identifier}@2x.png`, true)} />
                <div bem='e:label'>{this._t(`controls.stickers.${control.identifier}`)}</div>
              </div>
            </bem>
        </li>)
      })

    return (<div bem='$b:controls e:table'>
      <div bem='e:cell m:button m:withBorderRight'>
        <div bem='$e:button' onClick={this._onBackClick}>
          <img bem='e:icon' src={ui.getHelpers().assetPath(`controls/back@2x.png`, true)} />
        </div>
      </div>
      <div bem='e:cell m:list'>
        <ScrollbarComponent>
          <ul bem='$e:list'>
            {listItems}
          </ul>
        </ScrollbarComponent>
      </div>
    </div>)
  }
}
