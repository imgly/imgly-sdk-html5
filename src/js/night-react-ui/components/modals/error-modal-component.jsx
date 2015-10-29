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

import { React, ReactBEM, BaseChildComponent } from '../../globals'

export default class ErrorModalComponent extends BaseChildComponent {
  renderWithBEM () {
    const modal = this.props.modal

    const modalElement = (<div bem='e:modal m:error'>
      <div bem='e:title'>{modal.title}</div>
      <div bem='e:text'>{modal.text}</div>
      <div bem='e:button b:button m:inline' onClick={this.props.onClose}>OK</div>
    </div>)

    const content = modal.overlay ?
      (<div bem='e:overlay'>{modalElement}</div>) :
      modalElement

    return (
      <bem specifier='$b:modals'>
        {content}
      </bem>
    )
  }
}

ErrorModalComponent.propTypes = {
  modal: React.PropTypes.object
}
