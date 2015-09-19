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

export default class CropCanvasControlsComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._operation = this.context.ui.getOrCreateOperation('crop')
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    return (<div bem='b:canvasControls e:container m:full'>
      <div bem='$b:cropCanvasControls'>
        <div bem='e:row'>
          <div bem='e:cell m:dark' />
          <div bem='e:cell m:dark' />
          <div bem='e:cell m:dark' />
        </div>
        <div bem='e:row'>
          <div bem='e:cell m:dark' />
          <div bem='e:cell m:bordered' />
          <div bem='e:cell m:dark' />
        </div>
        <div bem='e:row'>
          <div bem='e:cell m:dark' />
          <div bem='e:cell m:dark' />
          <div bem='e:cell m:dark' />
        </div>
      </div>
    </div>)
  }
}
