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

export default class ErrorModalComponent extends BaseComponent {
  constructor (...args) {
    super(...args)
    this._bindAll('_onClose')
  }

  _onClose () {
    this.props.modal.close()
  }

  renderWithBEM () {
    const modal = this.props.modal

    const modalElement = (<div bem='e:modal m:error'>
      <div bem='e:title'>{modal.title}</div>
      <div bem='e:text'>{modal.text}</div>
      <div bem='e:button b:button m:inline' onClick={this._onClose}>OK</div>
    </div>)

    const content = modal.overlay
      ? (<div bem='e:overlay'>{modalElement}</div>)
      : modalElement

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
