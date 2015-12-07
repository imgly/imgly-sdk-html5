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

import { React, ReactBEM, BaseComponent } from '../../globals'

export default class WarningModalComponent extends BaseComponent {
  renderWithBEM () {
    const modal = this.props.modal
    return (
      <bem specifier='$b:modals'>
        <div bem='e:modal m:warning'>
          <div bem='e:title'>{modal.title}</div>
          <div bem='e:text'>{modal.text}</div>
          <div bem='e:button b:button m:inline' onClick={this.props.onClose}>OK</div>
        </div>
      </bem>
    )
  }
}

WarningModalComponent.propTypes = {
  modal: React.PropTypes.object
}
