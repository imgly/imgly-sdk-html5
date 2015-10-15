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

export default class OverviewControlsComponent extends BaseChildComponent {
  constructor () {
    super()
  }

  /**
   * Gets called when an item has been clicked
   * @param  {Event} e
   * @private
   */
  _onItemClick (controls) {
    this.props.onSwitchControls(controls)
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const ui = this.context.ui
    const listItems = ui.getSelectedControls()
      .map((control) => {
        return (<li
          bem='e:item'
          key={control.identifier}
          onClick={this._onItemClick.bind(this, control)}>
            <bem specifier='$b:controls'>
              <div bem='$e:button m:withLabel'>
                <img bem='e:icon' src={ui.getHelpers().assetPath(control.icon, true)} />
                <div bem='e:label'>{this._t(control.label)}</div>
              </div>
            </bem>
        </li>)
      })

    return (<div bem='$b:controls e:table'>
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
