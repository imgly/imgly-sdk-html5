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

import { React, ReactBEM, BaseComponent } from '../../globals'

export default class ScreenComponent extends BaseComponent {
  renderWithBEM () {
    return <div />
  }
}

ScreenComponent.propTypes = {
  // TODO: Why does .element not work?
  editor: React.PropTypes.any
}
