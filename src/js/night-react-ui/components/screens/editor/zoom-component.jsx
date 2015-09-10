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

export default class ZoomComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    return (
      <div bem='$b:editorScreen $e:zoom'>

        <div bem='$e:button m:zoomOut' onClick={this.props.onZoomOut}>
          <img bem='e:image' src={this._getAssetPath('controls/minus@2x.png', true)} />
        </div>

        <div bem='e:label'>
          Zoom<br />
          {Math.round(this.props.zoom * 100)}%
        </div>

        <div bem='$e:button m:zoomIn' onClick={this.props.onZoomIn}>
          <img bem='e:image' src={this._getAssetPath('controls/plus@2x.png', true)} />
        </div>

      </div>
    )
  }
}
