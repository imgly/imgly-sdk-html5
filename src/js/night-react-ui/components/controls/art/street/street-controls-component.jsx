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
  { identifier: 'street', i18nKey: 'urban1', options: { imageURL: 'art/street/urban_01.jpg' } },
  { identifier: 'street', i18nKey: 'urban2', options: { imageURL: 'art/street/urban_02.jpg' } },
  { identifier: 'street', i18nKey: 'urban3', options: { imageURL: 'art/street/urban_03.jpg' } },
  { identifier: 'street', i18nKey: 'urban4', options: { imageURL: 'art/street/urban_04.jpg' } },
  { identifier: 'street', i18nKey: 'urban5', options: { imageURL: 'art/street/urban_05.jpg' } },
  { identifier: 'street', i18nKey: 'urban6', options: { imageURL: 'art/street/urban_06.jpg' } },
  { identifier: 'street', i18nKey: 'urban7', options: { imageURL: 'art/street/urban_07.jpg' } },
  { identifier: 'street', i18nKey: 'urban8', options: { imageURL: 'art/street/urban_08.jpg' } },
  { identifier: 'street', i18nKey: 'urban9', options: { imageURL: 'art/street/urban_09.jpg' } },
  { identifier: 'street', i18nKey: 'urban10', options: { imageURL: 'art/street/urban_10.jpg' } },
  { identifier: 'street', i18nKey: 'urban11', options: { imageURL: 'art/street/urban_11.jpg' } },
  { identifier: 'street', i18nKey: 'urban12', options: { imageURL: 'art/street/urban_12.jpg' } },
  { identifier: 'street', i18nKey: 'urban13', options: { imageURL: 'art/street/urban_13.jpg' } },
  { identifier: 'street', i18nKey: 'urban14', options: { imageURL: 'art/street/urban_14.jpg' } },
  { identifier: 'street', i18nKey: 'urban15', options: { imageURL: 'art/street/urban_15.jpg' } },
  { identifier: 'street', i18nKey: 'urban16', options: { imageURL: 'art/street/urban_16.jpg' } },
  { identifier: 'street', i18nKey: 'urban17', options: { imageURL: 'art/street/urban_17.jpg' } },
  { identifier: 'street', i18nKey: 'urban18', options: { imageURL: 'art/street/urban_18.jpg' } },
  { identifier: 'street', i18nKey: 'urban19', options: { imageURL: 'art/street/urban_19.jpg' } },
  { identifier: 'street', i18nKey: 'urban20', options: { imageURL: 'art/street/urban_20.jpg' } },
  { identifier: 'street', i18nKey: 'urban21', options: { imageURL: 'art/street/urban_21.jpg' } },
  { identifier: 'street', i18nKey: 'urban22', options: { imageURL: 'art/street/urban_22.jpg' } },
  { identifier: 'street', i18nKey: 'urban23', options: { imageURL: 'art/street/urban_23.jpg' } },
  { identifier: 'street', i18nKey: 'urban24', options: { imageURL: 'art/street/urban_24.jpg' } },
  { identifier: 'street', i18nKey: 'urban25', options: { imageURL: 'art/street/urban_25.jpg' } },
  { identifier: 'street', i18nKey: 'urban26', options: { imageURL: 'art/street/urban_26.jpg' } },
  { identifier: 'street', i18nKey: 'urban27', options: { imageURL: 'art/street/urban_27.jpg' } },
  { identifier: 'street', i18nKey: 'urban28', options: { imageURL: 'art/street/urban_28.jpg' } },
  { identifier: 'street', i18nKey: 'urban29', options: { imageURL: 'art/street/urban_29.jpg' } },
  { identifier: 'street', i18nKey: 'urban30', options: { imageURL: 'art/street/urban_30.jpg' } },
  { identifier: 'street', i18nKey: 'urban31', options: { imageURL: 'art/street/urban_31.jpg' } },
  { identifier: 'street', i18nKey: 'urban32', options: { imageURL: 'art/street/urban_32.jpg' } },
  { identifier: 'street', i18nKey: 'urban33', options: { imageURL: 'art/street/urban_33.jpg' } },
  { identifier: 'street', i18nKey: 'urban34', options: { imageURL: 'art/street/urban_34.jpg' } },
  { identifier: 'street', i18nKey: 'urban35', options: { imageURL: 'art/street/urban_35.jpg' } },
  { identifier: 'street', i18nKey: 'urban36', options: { imageURL: 'art/street/urban_36.jpg' } },
  { identifier: 'street', i18nKey: 'urban37', options: { imageURL: 'art/street/urban_37.jpg' } },
  { identifier: 'street', i18nKey: 'urban38', options: { imageURL: 'art/street/urban_38.jpg' } },
  { identifier: 'street', i18nKey: 'urban39', options: { imageURL: 'art/street/urban_39.jpg' } },
  { identifier: 'street', i18nKey: 'urban40', options: { imageURL: 'art/street/urban_40.jpg' } },
  { identifier: 'street', i18nKey: 'urban41', options: { imageURL: 'art/street/urban_41.jpg' } },
  { identifier: 'street', i18nKey: 'urban42', options: { imageURL: 'art/street/urban_42.jpg' } }
]

export default class StreetArtControlComponents extends BaseArtControlsComponent {
  constructor (...args) {
    super(...args)
    this._items = ITEMS
  }
}
