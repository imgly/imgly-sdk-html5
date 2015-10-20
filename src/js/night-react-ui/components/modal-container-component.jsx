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

import { ReactBEM, BaseChildComponent } from '../globals'
import LoadingModalComponent from './modals/loading-modal-component'
import WarningModalComponent from './modals/warning-modal-component'

export default class ModalContainerComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the modals
   * @return {Array.<React.Component>}
   */
  _renderModals () {
    const modalManager = this.props.modalManager
    const modals = modalManager.getModals()
    return modals.map((modal) => {
      let ModalComponent

      switch (modal.type) {
        case 'loading':
          ModalComponent = LoadingModalComponent
          break
        case 'warning':
          ModalComponent = WarningModalComponent
          break
      }

      return <ModalComponent modal={modal} />
    })
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    return (<div>{this._renderModals()}</div>)
  }
}
