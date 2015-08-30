/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */
import { React, BEM, Classnames } from '../../globals'

const screenBlock = BEM.block('screen')
const splashScreenBlock = BEM.block('splashScreen')

export default class SplashScreen extends React.Component {
  constructor (kit, options) {
    super()

    this._kit = kit
    this._options = options
  }

  render () {
    const className = Classnames(screenBlock(), splashScreenBlock())
    return (<div className={className}>

    </div>)
  }
}
