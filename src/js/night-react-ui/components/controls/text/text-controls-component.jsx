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

const ALIGNMENTS = [
  'left',
  'center',
  'right'
]

import { ReactBEM, BaseChildComponent, Constants } from '../../../globals'
import ScrollbarComponent from '../../scrollbar-component'
import FontSizeSliderComponent from './font-size-slider-component'
import FontPreviewComponent from './font-preview-component'
import FontComponent from './font-component'

export default class TextControlsComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onBackClick',
      '_onFontSizeChange',
      '_onFontChange',
      '_onAlignmentClick'
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

  /**
   * Gets called when the font family or weight has been changed
   * @param  {Object} font
   * @private
   */
  _onFontChange (font) {
    const selectedText = this.getSharedState('selectedText')
    selectedText.setFontFamily(font.fontFamily)
    selectedText.setFontWeight(font.fontWeight)
    this.forceSharedUpdate()
  }

  /**
   * Gets called when the user clicks the alignment button
   * @param  {Event} e
   * @private
   */
  _onAlignmentClick (e) {
    const selectedText = this.getSharedState('selectedText')
    const alignment = selectedText.getAlignment()

    const currentIndex = ALIGNMENTS.indexOf(alignment)
    const nextIndex = (currentIndex + 1) % ALIGNMENTS.length
    const newAlignment = ALIGNMENTS[nextIndex]

    selectedText.setAlignment(newAlignment)
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
      case 'size':
        return this._renderFontSizeOverlayControl()
      case 'font':
        return this._renderFontFamilyOverlayControl()
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
  _renderSizeItem () {
    const selectedText = this.getSharedState('selectedText')
    if (!selectedText) return

    const { kit } = this.context
    const canvasDimensions = kit.getOutputDimensions()

    const fontSize = Math.round(selectedText.getFontSize() * canvasDimensions.y)
    const className = this.state.mode === 'size' ? 'is-active' : null

    return (<li
      bem='e:item'
      key='size'>
      <bem specifier='$b:controls'>
        <div
          bem='$e:button m:withLabel'
          className={className}
          onClick={this._switchToMode.bind(this, 'size')}>
            <div bem='b:fontSize e:text'>{fontSize}</div>
            <div bem='e:label'>{this._t(`controls.text.size`)}</div>
        </div>
      </bem>
    </li>)
  }

  // -------------------------------------------------------------------------- FONT FAMILY

  /**
   * Renders the font family overlay control
   * @return {ReactBEM.Element}
   * @private
   */
  _renderFontFamilyOverlayControl () {
    const selectedText = this.getSharedState('selectedText')
    if (!selectedText) return

    const fonts = [
      { fontFamily: 'Helvetica', fontWeight: 'normal' },
      { fontFamily: 'Verdana', fontWeight: 'normal' },
      { fontFamily: 'Times New Roman', fontWeight: 'normal'},
      { fontFamily: 'Impact', fontWeight: 'normal' }
    ]

    return (<FontComponent
      fontFamily={selectedText.getFontFamily()}
      fontWeight={selectedText.getFontWeight()}
      fonts={fonts}
      onChange={this._onFontChange} />)
  }

  /**
   * Renders the font list item
   * @return {Component}
   * @private
   */
  _renderFontItem () {
    const selectedText = this.getSharedState('selectedText')
    if (!selectedText) return

    const className = this.state.mode === 'font' ? 'is-active' : null
    return (<li
      bem='e:item'
      key='font'>
      <bem specifier='$b:controls'>
        <div
          bem='$e:button m:withLabel'
          className={className}
          onClick={this._switchToMode.bind(this, 'font')}>
            <FontPreviewComponent
              fontFamily={selectedText.getFontFamily()}
              fontWeight={selectedText.getFontWeight()} />
            <div bem='e:label'>{this._t(`controls.text.font`)}</div>
        </div>
      </bem>
    </li>)
  }

  // -------------------------------------------------------------------------- ALIGNMENT

  /**
   * Renders the text alignment list item
   * @return {Component}
   * @private
   */
  _renderAlignmentItem () {
    const { ui } = this.context

    const selectedText = this.getSharedState('selectedText')
    if (!selectedText) return

    const alignment = selectedText.getAlignment()

    return (<li
      bem='e:item'
      key='alignment'>
      <bem specifier='$b:controls'>
        <div
          bem='$e:button m:withLabel'
          onClick={this._onAlignmentClick}>
            <img bem='e:icon' src={ui.getHelpers().assetPath(`controls/text/align_${alignment}@2x.png`, true)} />
            <div bem='e:label'>{this._t(`controls.text.alignment`)}</div>
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
      this._renderSizeItem(),
      this._renderFontItem(),
      this._renderAlignmentItem()
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
