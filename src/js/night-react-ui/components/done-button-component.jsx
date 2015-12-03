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

import { ReactBEM, BaseComponent } from '../globals'

export default class DoneButtonComponent extends BaseComponent {
  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    return (<bem specifier='$b:controls'>
      <div bem='e:cell m:button m:withBorderLeft m:narrow'>
        <div bem='$e:button m:narrow' onClick={this.props.onClick}>
          <img bem='e:icon' src={this._getAssetPath(`controls/tick@2x.png`, true)} />
        </div>
      </div>
    </bem>)
  }
}
