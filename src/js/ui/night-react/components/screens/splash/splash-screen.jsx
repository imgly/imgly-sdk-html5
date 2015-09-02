/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */
import { React, BEM, Classnames, BaseChildComponent } from '../../../globals'
import SplashScreenUploadComponent from './upload-component'
import SplashScreenWebcamComponent from './webcam-component'

const screenBlock = BEM.block('screen')
const splashScreenBlock = BEM.block('splashScreen')

export default class SplashScreenComponent extends BaseChildComponent {
  render () {
    const className = Classnames(screenBlock.str, splashScreenBlock.str)
    const rowElement = splashScreenBlock.element('row')
    const cellElement = splashScreenBlock.element('cell')

    return (<div className={className}>
      <SplashScreenWebcamComponent />
      <SplashScreenUploadComponent />
    </div>)
  }
}
