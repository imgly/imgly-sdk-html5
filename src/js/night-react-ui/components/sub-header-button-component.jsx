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

export default class SubHeaderButtonComponent extends BaseChildComponent {
  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const { ui } = this.context

    // Build BEM specifier
    let bem = '$e:button'
    if (this.props.style) {
      bem += ` m:${this.props.style}`
    }
    if (this.props.icon) {
      bem += ` m:withIcon`
    }

    // Build icon
    let icon = null
    if (this.props.icon) {
      icon = (<img
        bem='e:icon'
        src={ui.getHelpers().assetPath(this.props.icon, true)} />)
    }

    return (<bem specifier='$b:subHeader'>
      <div bem={bem}>
        {icon}
        <div bem='e:label'>{this.props.label || 'Button'}</div>
      </div>
    </bem>)
  }
}
