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

import BrightnessControls from './adjustments/brightness-controls-component'
import SaturationControls from './adjustments/saturation-controls-component'
import ContrastControls from './adjustments/contrast-controls-component'

const ITEMS = [
  BrightnessControls,
  SaturationControls,
  ContrastControls
]

export default class StickersAdjustmentsControlsComponent extends BaseChildComponent {
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
   * Gets called when the user clicks on one of the items
   * @param  {React.Component} item
   * @private
   */
  _onItemClick (item) {
    this.props.onSwitchControls(item)
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const ui = this.context.ui

    const listItems = ITEMS
      .map((item) => {
        return (<li
          bem='e:item'
          key={item.identifier}>
          <bem specifier='$b:controls'>
            <div bem='$e:button m:withLabel' onClick={this._onItemClick.bind(this, item)}>
              <img bem='e:icon' src={ui.getHelpers().assetPath(`controls/adjustments/${item.identifier}@2x.png`, true)} />
              <div bem='e:label'>{this._t(`controls.adjustments.${item.identifier}`)}</div>
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

StickersAdjustmentsControlsComponent.identifier = 'adjustments'
