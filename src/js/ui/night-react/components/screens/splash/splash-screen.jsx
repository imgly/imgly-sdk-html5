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
import SplashScreenUploadComponent from './upload-component'
import SplashScreenWebcamComponent from './webcam-component'

export default class SplashScreenComponent extends BaseChildComponent {
  renderWithBEM () {
    return (<div bem='b:screen b:splashScreen'>
      <SplashScreenWebcamComponent />
      <SplashScreenUploadComponent />
    </div>)
  }
}
