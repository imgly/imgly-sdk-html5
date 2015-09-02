/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { React, BEM, Classnames, BaseChildComponent } from '../globals'
const block = BEM.block('button')

export default class ButtonComponent extends BaseChildComponent {
  constructor () {
    super()
  }

  render () {
    const className = Classnames(block.str, this.props.className)
    return (<button className={className} onClick={this.props.onClick}>
      {this.props.children}
    </button>)
  }
}

ButtonComponent.propTypes = {
  onClick: React.PropTypes.func,
  children: React.PropTypes.any.isRequired,
  className: React.PropTypes.string
}
