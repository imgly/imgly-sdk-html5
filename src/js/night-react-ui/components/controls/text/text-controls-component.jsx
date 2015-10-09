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

import { ReactBEM, BaseChildComponent, Constants, Vector2 } from '../../../globals'

export default class TextControlsComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onBackClick'
    )
    this._texts = this.getSharedState('texts')
    this._operation = this.getSharedState('operation')

    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called after this component has been mouned
   */
  componentDidMount () {
    super.componentDidMount()

    if (!this.getSharedState('selectedText')) {
      const text = this._operation.createText({
        text: 'Text',
        maxWidth: 0.5,
        anchor: new Vector2(0.5, 0),
        pivot: new Vector2(0.5, 0)
      })
      this._texts.push(text)

      // Broadcast new state
      this.setSharedState({
        selectedText: text,
        texts: this._texts
      })
    }
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user clicks the back button
   * @param {Event} e
   * @private
   */
  _onBackClick (e) {
    this.props.onSwitchControls('back')
  }

  /**
   * Gets called when the shared state has changed
   * @param  {Object} newState
   */
  sharedStateDidChange (newState) {
    if ('selectedText' in newState) {
      this.forceUpdate()
    }
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const selectedText = this.getSharedState('selectedText')
    return (<div />)
  }
}
