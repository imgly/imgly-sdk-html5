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
import { ReactBEM } from '../../../globals'
import ScreenComponent from '../screen-component'
import SubHeaderComponent from '../../sub-header-component'
import CanvasContainerComponent from '../../canvas-container-component'
import WebcamComponent from './webcam-component'

export default class WebcamScreenComponent extends ScreenComponent {
  constructor () {
    super()
    this._bindAll('_onCancel', '_onWebcamReady')
  }

  /**
   * Gets called when the webcam is ready
   * @private
   */
  _onWebcamReady () {

  }

  /**
   * Gets called when the user clicks the cancel button in the subheader
   * @private
   */
  _onCancel () {
    this.props.editor.switchToSplashScreen()
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    return (<div bem='b:screen $b:webcamScreen'>
      <SubHeaderComponent
        label={this._t('webcam.headline')}
        cancelButton={true}
        onCancel={this._onCancel} />

      <CanvasContainerComponent>
        <WebcamComponent onReady={this._onWebcamReady} />
      </CanvasContainerComponent>

      <div bem='$b:controls e:row'>
        <div bem='e:cell'>
          <bem specifier='b:webcamScreen'>
            <div bem='e:shutterButton'></div>
          </bem>
        </div>
      </div>
    </div>)
  }
}
