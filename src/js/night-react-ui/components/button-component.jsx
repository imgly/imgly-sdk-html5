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

import { React, ReactBEM, BaseComponent } from '../globals'

export default class ButtonComponent extends BaseComponent {
  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    return (
      <button bem='b:button' className={this.props.className} onClick={this.props.onClick}>
        {this.props.children}
      </button>
    )
  }
}

ButtonComponent.propTypes = {
  onClick: React.PropTypes.func,
  children: React.PropTypes.any.isRequired,
  className: React.PropTypes.string
}
