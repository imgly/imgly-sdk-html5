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
import ButtonComponent from '../../button-component'
const block = BEM.block('splashScreen')

export default class WebcamComponent extends BaseChildComponent {
  render () {
    const rowElement = block.element('row')
    const cellElement = block.element('cell')
    const rowClassName = Classnames(
      rowElement.str,
      rowElement.modifier('withContent').str,
      rowElement.modifier('webcam').str
    )
    const cellModifier = cellElement.modifier('webcam')
    const cellClassName = Classnames(
      cellElement.str,
      cellModifier.str
    )

    const imageClassName = cellElement.element('image').str
    const descriptionClassName = cellElement.element('description').str
    const buttonClassName = cellElement.element('button').str

    return (<div className={rowClassName}>
      <div className={cellClassName}>
        <img
          className={imageClassName}
          src={this._getAssetPath('splash/shutter@2x.png', true)} />
        <ButtonComponent
          className={buttonClassName}
          onClick={this._onClick}>
          {this._t('splash.webcam.button')}
        </ButtonComponent>
        <div className={descriptionClassName}>
          {this._t('splash.webcam.description')}
        </div>
      </div>
    </div>)
  }
}
