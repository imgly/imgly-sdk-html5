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

import { ReactBEM } from '../../../globals'
import ControlsComponent from '../controls-component'
import ScrollbarComponent from '../../scrollbar-component'

import BrightnessControls from './brightness/'
import SaturationControls from './saturation/'
import ContrastControls from './contrast/'

const ITEMS = [
  BrightnessControls,
  SaturationControls,
  ContrastControls
]

export default class AdjustmentsControlsComponent extends ControlsComponent {
  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user clicks one of the three buttons
   * @param {Object} controlsItem
   * @param {Event} e
   * @private
   */
  _onButtonClick (controlsItem, e) {
    this.props.editor.switchToControls(controlsItem)
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the list items
   * @return {Array.<ReactBEM.Element>}
   * @private
   */
  _renderListItems () {
    const { ui } = this.context
    return ITEMS
      .filter((item) => item.isSelectable(this.context.ui))
      .map((item) => {
        return (<li
          bem='e:item'
          key={item.identifier}>
          <bem specifier='$b:controls'>
            <div bem='$e:button m:withLabel' onClick={this._onButtonClick.bind(this, item)}>
              <img bem='e:icon' src={ui.getHelpers().assetPath(`controls/adjustments/${item.identifier}@2x.png`, true)} />
              <div bem='e:label'>{this._t(`controls.adjustments.${item.identifier}`)}</div>
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
