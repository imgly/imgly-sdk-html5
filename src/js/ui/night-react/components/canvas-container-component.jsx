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

export default class CanvasContainerComponent extends BaseChildComponent {
  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    return (<div bem='$b:canvasContainer e:row'>
      <div bem='e:cell'>
        {this.props.children}
      </div>
    </div>)
  }
}

CanvasContainerComponent.propTypes = {
  children: React.PropTypes.any
}
