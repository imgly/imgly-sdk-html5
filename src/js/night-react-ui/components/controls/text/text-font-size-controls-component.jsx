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

import { ReactBEM, BaseChildComponent } from '../../../globals'

export default class TextFontSizeControlsComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onMinusClick',
      '_onPlusClick'
    )

    this.state = { fontSize: this.props.value }
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user clicks the plus button
   * @private
   */
  _onPlusClick () {
    this.setState({ fontSize: this.state.fontSize + 1 })
    this.props.onChange &&
      this.props.onChange(this.state.fontSize)
  }

  /**
   * Gets called when the user clicks the minus button
   * @private
   */
  _onMinusClick () {
    this.setState({ fontSize: this.state.fontSize - 1 })
    this.props.onChange &&
      this.props.onChange(this.state.fontSize)
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    return (<div bem='$b:textFontSizeControls'>
      <div bem='$e:buttons'>
        <div bem='$e:button m:plus' onClick={this._onPlusClick}>
          <img
            bem='e:icon'
            src={this._getAssetPath('controls/text/plus@2x.png', true)} />
        </div>
        <div bem='$e:button m:minus' onClick={this._onMinusClick}>
          <img bem='e:icon' src={this._getAssetPath('controls/text/minus@2x.png', true)} />
        </div>
      </div>
      <div bem='$e:right'>
        <div bem='e:size'>{this.state.fontSize}</div>
        <div bem='e:label'>{this._t(`controls.text.fontSize`)}</div>
      </div>
    </div>)
  }
}
