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

export default class UploadComponent extends BaseChildComponent {
  constructor () {
    super()
    this._bindAll('_onClick')
  }

  _onClick (e) {

  }

  render () {
    const rowElement = block.element('row')
    const cellElement = block.element('cell')
    const rowClassName = Classnames(
      rowElement.str,
      rowElement.modifier('withContent').str,
      rowElement.modifier('upload').str
    )
    const cellModifier = cellElement.modifier('upload')
    const cellClassName = Classnames(
      cellElement.str,
      cellModifier.str
    )

    const imageClassName = cellElement.element('image').str
    const descriptionClassName = cellElement.element('description').str
    const buttonClassName = cellElement.element('button').str
    const orClassName = cellModifier.element('or').str

    return (<div className={rowClassName}>
      <div className={cellClassName}>
        <div className={orClassName}>{this._t('splash.or')}</div>
        <img
          className={imageClassName}
          src={this._getAssetPath('splash/add-photo@2x.png', true)} />
        <ButtonComponent
          className={buttonClassName}
          onClick={this._onClick}>
            {this._t('splash.upload.button')}
        </ButtonComponent>
        <div className={descriptionClassName}>
          {this._t('splash.upload.description')}
        </div>
      </div>
    </div>)
  }
}
