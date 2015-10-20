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

export default class LoadingModalComponent extends BaseChildComponent {
  renderWithBEM () {
    const modal = this.props.modal
    return (
      <bem specifier='$b:modals'>
        <div bem='e:overlay'>
          <div bem='e:modal m:loading'>
            <div bem='e:text'>{modal.text}</div>
          </div>
        </div>
      </bem>
    )
  }
}

LoadingModalComponent.propTypes = {
  modal: React.PropTypes.object
}
