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
const block = BEM.block('splashScreen')

export default class WebcamComponent extends React.Component {
  render () {
    const rowElement = block.element('row')
    const cellElement = block.element('cell')
    const rowClassName = Classnames(
      rowElement.str,
      rowElement.modifier('upload').str
    )
    const cellClassName = Classnames(
      cellElement.str,
      cellElement.modifier('upload').str
    )

    return (<div className={rowClassName}>
      <div className={cellClassName}>

      </div>
    </div>)
  }
}
