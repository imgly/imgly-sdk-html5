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

import { ReactBEM } from '../../../../globals'
import ControlsComponent from '../../controls-component'
import ScrollbarComponent from '../../../scrollbar-component'

import BrightnessControls from './adjustments/brightness-controls-component'
import SaturationControls from './adjustments/saturation-controls-component'
import ContrastControls from './adjustments/contrast-controls-component'
import BlurControls from './blur-controls-component'
import FlipControls from './flip-controls-component'

const CONTROLS = [
  BrightnessControls,
  SaturationControls,
  ContrastControls,
  BlurControls,
  FlipControls
]

export default class StickersEditControlsComponent extends ControlsComponent {
  // -------------------------------------------------------------------------- EVENTS

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
   * Renders the list items for this control
   * @return {Array.<ReactBEM.Element>}
   * @private
   */
  _renderListItems () {
    const { ui } = this.context
    return CONTROLS
      .map((control, i) => {
        const iconName = control.iconName || control.identifier
        return (<li
          bem='e:item'
          key={i}
          onClick={this._onItemClick.bind(this, control)}>
            <bem specifier='$b:controls'>
              <div bem='$e:button m:withLabel'>
                <img bem='e:icon' src={ui.getHelpers().assetPath(`controls/overview/${iconName}@2x.png`, true)} />
                <div bem='e:label'>{this._t(`controls.stickers.${control.identifier}`)}</div>
              </div>
            </bem>
        </li>)
      })
  }

  /**
   * Renders the controls of this component
   * @return {ReactBEM.Element}
   */
  renderControls () {
    const listItems = this._renderListItems()

    return (<div bem='e:cell m:list'>
      <ScrollbarComponent>
        <ul bem='$e:list'>
          {listItems}
        </ul>
      </ScrollbarComponent>
    </div>)
  }
}
