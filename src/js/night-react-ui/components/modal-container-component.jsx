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
import LoadingModalComponent from './modals/loading-modal-component'
import WarningModalComponent from './modals/warning-modal-component'
import ErrorModalComponent from './modals/error-modal-component'

export default class ModalContainerComponent extends BaseComponent {
  constructor (...args) {
    super(...args)

    this._modalManager = this.props.modalManager
    this._bindAll(
      '_onModalManagerUpdate'
    )
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called when this component has been mounted
   */
  componentDidMount () {
    super.componentDidMount()

    this._modalManager.on('update', this._onModalManagerUpdate)
  }

  /**
   * Gets called when this component is about to be unmounted
   */
  componentWillUnmount () {
    super.componentWillUnmount()

    this._modalManager.off('update', this._onModalManagerUpdate)
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the modal manager updates
   * @private
   */
  _onModalManagerUpdate () {
    this.forceUpdate()
  }

  /**
   * Gets called when a modal is closed. Removes it from the manager.
   * @param  {Modal} modal
   * @private
   */
  _onModalClosed (modal) {
    this._modalManager.removeModal(modal)
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the modals
   * @return {Array.<React.Component>}
   */
  _renderModals () {
    const modals = this._modalManager.getModals()
    return modals.map((modal) => {
      let ModalComponent

      switch (modal.type) {
        case 'loading':
          ModalComponent = LoadingModalComponent
          break
        case 'warning':
          ModalComponent = WarningModalComponent
          break
        case 'error':
          ModalComponent = ErrorModalComponent
          break
      }

      return (<ModalComponent
        modal={modal}
        onClose={this._onModalClosed.bind(this, modal)} />)
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
