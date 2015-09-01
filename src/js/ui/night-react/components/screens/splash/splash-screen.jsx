/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */
import { React, BEM, Classnames } from '../../../globals'
import SplashScreenUploadComponent from './upload-component'
import SplashScreenWebcamComponent from './webcam-component'

const screenBlock = BEM.block('screen')
const splashScreenBlock = BEM.block('splashScreen')

export default class SplashScreen extends React.Component {
  constructor (kit, options) {
    super()

    this._kit = kit
    this._options = options
  }

  render () {
    const className = Classnames(screenBlock.str, splashScreenBlock.str)
    const rowElement = splashScreenBlock.element('row')
    const cellElement = splashScreenBlock.element('cell')
    const rowWithContentClass = Classnames(
      rowElement.str,
      rowElement.modifier('withContent').str
    )
    const orElement = splashScreenBlock.element('or')
    const orCellElement = orElement.element('cell')

    const orLineClassName = Classnames(orCellElement.str, orCellElement.modifier('line').str)
    const orTextClassName = Classnames(orCellElement.str, orCellElement.modifier('text').str)

    return (<div className={className}>
      <SplashScreenUploadComponent />

      <div className={Classnames(rowElement.str, rowElement.modifier('or').str)}>
        <div className={cellElement.str}>
          <div className={orElement.str}>
            <div className={orLineClassName}></div>
            <div className={orTextClassName}>or</div>
            <div className={orLineClassName}></div>
          </div>
        </div>
      </div>

      <SplashScreenWebcamComponent />
    </div>)
  }
}
