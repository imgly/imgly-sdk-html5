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

import { ReactBEM, BaseChildComponent, Constants } from '../../../globals'
import ScrollbarComponent from '../../scrollbar-component'
import FontSizeSliderComponent from './font-size-slider-component'

export default class TextControlsComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onBackClick',
      '_onFontSizeChange'
    )
    this._texts = this.getSharedState('texts')
    this._operation = this.getSharedState('operation')

    this.state = { mode: null }

    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user clicks the back button
   * @param {Event} e
   * @private
   */
  _onBackClick (e) {
    this._operation.setTexts(this._texts)
    this.props.onSwitchControls('back')
    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
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

  /**
   * Gets called when the font size has been changed
   * @param  {Number} fontSize
   * @private
   */
  _onFontSizeChange (fontSize) {
    const { kit } = this.context
    const canvasDimensions = kit.getOutputDimensions()

    const selectedText = this.getSharedState('selectedText')
    selectedText.setFontSize(fontSize / canvasDimensions.y)
    this.forceSharedUpdate()
  }

  // -------------------------------------------------------------------------- MODES

  /**
   * Switches to the given mode
   * @param  {String} mode
   * @private
   */
  _switchToMode (mode) {
    if (mode === this.state.mode) mode = null

    this.setState({ mode })
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the overlay control depending on the currentm ode
   * @return {ReactBEM.Element}
   * @private
   */
  _renderOverlayControl () {
    switch (this.state.mode) {
      case 'fontSize':
        return this._renderFontSizeOverlayControl()
      default:
        return null
    }
  }

  // -------------------------------------------------------------------------- FONT SIZE

  /**
   * Renders the font size overlay control (slider)
   * @return {ReactBEM.Element}
   * @private
   */
  _renderFontSizeOverlayControl () {
    const selectedText = this.getSharedState('selectedText')
    if (!selectedText) return

    const { kit } = this.context
    const canvasDimensions = kit.getOutputDimensions()

    const fontSize = Math.round(selectedText.getFontSize() * canvasDimensions.y)
    return (<FontSizeSliderComponent
      value={fontSize}
      onChange={this._onFontSizeChange} />)
  }

  /**
   * Renders the font size list item
   * @return {Component}
   * @private
   */
  _renderFontSizeItem () {
    const selectedText = this.getSharedState('selectedText')
    if (!selectedText) return

    const { kit } = this.context
    const canvasDimensions = kit.getOutputDimensions()

    const fontSize = Math.round(selectedText.getFontSize() * canvasDimensions.y)
    const className = this.state.mode === 'fontSize' ? 'is-active' : null

    return (<li
        bem='e:item'
        key='fontSize'>
        <bem specifier='$b:controls'>
          <div
            bem='$e:button m:withLabel'
            className={className}
            onClick={this._switchToMode.bind(this, 'fontSize')}>
              <div bem='b:fontSize e:text'>{fontSize}</div>
              <div bem='e:label'>{this._t(`controls.text.fontSize`)}</div>
          </div>
        </bem>
      </li>)
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const { ui } = this.context

    const listItems = [
      this._renderFontSizeItem()
    ]

    const overlayControl = this._renderOverlayControl()

    return (<div bem='$b:controls'>
      {overlayControl}
      <div bem='e:table'>
        <div bem='e:cell m:button m:withBorderRight'>
          <div bem='$e:button' onClick={this._onBackClick}>
            <img bem='e:icon' src={ui.getHelpers().assetPath(`controls/back@2x.png`, true)} />
          </div>
        </div>
        <div bem='e:cell m:list'>
          <ScrollbarComponent ref='scrollbar'>
            <ul bem='$e:list'>
              {listItems}
            </ul>
          </ScrollbarComponent>
        </div>
      </div>
    </div>)
  }
}
