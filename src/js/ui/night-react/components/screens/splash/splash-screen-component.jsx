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
import ScreenComponent from './screen-component'
import SplashScreenUploadComponent from './upload-component'
import SplashScreenWebcamComponent from './webcam-component'

export default class SplashScreenComponent extends ScreenComponent {
  constructor () {
    super()

    this._bindAll('_onWebcamClick', '_onImage')
  }

  /**
   * Gets called when the WebcamComponent has received a click
   * @private
   */
  _onWebcamClick () {
    this.props.editor.switchToWebcamScreen()
  }

  /**
   * Gets called when the UploadComponent has received an image file
   * @param  {image} image
   * @private
   */
  _onImage (image) {
    this.props.editor.setImage(image)
  }

  renderWithBEM () {
    return (<div bem='b:screen b:splashScreen'>
      <SplashScreenWebcamComponent onClick={this._onWebcamClick} />
      <SplashScreenUploadComponent onImage={this._onImage} />
    </div>)
  }
}
