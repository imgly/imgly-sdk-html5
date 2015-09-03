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

import { React, ReactBEM, BaseChildComponent } from '../globals'

export default class SubHeaderComponent extends BaseChildComponent {
  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    let cancelButton
    if (this.props.cancelButton) {
      cancelButton = <div bem='e:cancelButton' onClick={this.props.onCancel}>
        Cancel
      </div>
    }

    return (<div bem='$b:subHeader e:row'>
      <div bem='e:cell'>
        {cancelButton}
        <div bem='e:label'>{this.props.label}</div>
      </div>
    </div>)
  }
}

SubHeaderComponent.propTypes = {
  label: React.PropTypes.string,
  cancelButton: React.PropTypes.bool,
  onCancel: React.PropTypes.func
}
