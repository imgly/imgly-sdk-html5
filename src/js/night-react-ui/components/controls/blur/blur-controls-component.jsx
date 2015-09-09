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

import RadialBlurControls from './radial-blur/'
import TiltShiftControls from './tilt-shift/'

const ITEMS = [
  RadialBlurControls,
  TiltShiftControls
]

export default class BlurControlsComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._bindAll('_onBackClick')
  }

  /**
   * Gets called when the user clicks the back button
   * @param {Event} e
   * @private
   */
  _onBackClick (e) {
    this.props.onSwitchControls('back')
  }

  /**
   * Gets called when the user clicks one of the three buttons
   * @param {Object} controlsItem
   * @param {Event} e
   * @private
   */
  _onButtonClick (controlsItem, e) {
    this.props.editor.switchToControls(controlsItem)
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const ui = this.context.ui

    const listItems = ITEMS
      .filter((item) => item.isSelectable(this.context.ui))
      .map((item) => {
        return (<li
          bem='e:item'
          key={item.identifier}>
          <bem specifier='$b:controls'>
            <div bem='$e:button m:withLabel' onClick={this._onButtonClick.bind(this, item)}>
              <img bem='e:icon' src={ui.getHelpers().assetPath(`controls/blur/${item.identifier}@2x.png`, true)} />
              <div bem='e:label'>{this._t(`controls.blur.${item.identifier}`)}</div>
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
