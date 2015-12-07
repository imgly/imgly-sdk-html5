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

import BaseArtControlsComponent from '../base-art-controls-component'

const ITEMS = [
  { identifier: 'tableau', i18nKey: 'identity', options: { filter: 'identity' } },
  { identifier: 'tableau', i18nKey: 'watercolor', options: { filter: 'water-color' } },
  { identifier: 'tableau', i18nKey: 'oil', options: { filter: 'oil' } },
  { identifier: 'brush-mark', i18nKey: 'brush1', options: { imageURL: 'art/Test_04.jpg' } },
  { identifier: 'brush-mark', i18nKey: 'brush2', options: { imageURL: 'art/Test_03.jpg' } }
]

export default class PaintControlsComponent extends BaseArtControlsComponent {
  constructor (...args) {
    super(...args)
    this._items = ITEMS
  }
}
