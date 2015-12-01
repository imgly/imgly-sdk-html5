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

import { ReactBEM, BaseComponent, Constants } from '../../../globals'
import StickersOverviewControlsComponent from './stickers-overview-controls-component'
import StickersEditControlsComponent from './stickers-edit-controls-component'

export default class StickersControlsComponent extends BaseComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onBackClick',
      '_onSubComponentBack'
    )
    this._operation = this.getSharedState('operation')
    this._initiallyHadSticker = this.getSharedState('selectedSticker')

    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called when this component has been mounted
   */
  componentDidMount () {
    super.componentDidMount()

    // Reset zoom to fit the container
    this._emitEvent(Constants.EVENTS.CANVAS_ZOOM, 'auto', () => {
      // Disable zoom and drag while we're cropping
      this._emitEvent(Constants.EVENTS.EDITOR_DISABLE_FEATURES, ['zoom', 'drag'])
    })
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user clicks the back button
   * @param {Event} e
   * @private
   */
  _onBackClick (e) {
    this._switchBack()
  }

  /**
   * Gets called when the back button in the subcomponent is clicked
   * @private
   */
  _onSubComponentBack () {
    const selectedSticker = this.getSharedState('selectedSticker')
    if (selectedSticker && !this._initiallyHadSticker) {
      this.setSharedState({ selectedSticker: null })
    } else {
      this._switchBack()
    }
  }

  /**
   * Gets called when the shared state has changed
   * @param  {Object} newState
   */
  sharedStateDidChange (newState) {
    if ('selectedSticker' in newState) {
      this.forceUpdate()
    }
  }

  // -------------------------------------------------------------------------- MISC

  /**
   * Gets called when the user switches back
   * @private
   */
  _switchBack () {
    this.props.onSwitchControls('back')
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const selectedSticker = this.getSharedState('selectedSticker')

    let ControlsComponent = StickersOverviewControlsComponent
    if (selectedSticker) {
      ControlsComponent = StickersEditControlsComponent
    }

    return (<ControlsComponent
      selectedSticker={selectedSticker}
      onBack={this._onSubComponentBack}
      options={this.props.options}
      sharedState={this.props.sharedState}
      editor={this.props.editor} />)
  }
}
