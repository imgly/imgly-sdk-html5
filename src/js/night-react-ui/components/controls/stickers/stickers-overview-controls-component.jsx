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

import { ReactBEM, BaseChildComponent, Constants, Vector2 } from '../../../globals'
import ScrollbarComponent from '../../scrollbar-component'

export default class StickersOverviewControlsComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._bindAll('_onBackClick')
    this._operation = this.getSharedState('operation')
    this._stickers = this.getSharedState('stickers')

    this._availableStickers = []
    this._registerStickers()
  }

  // -------------------------------------------------------------------------- STICKERS

  /**
   * Registers the available stickers
   * @private
   */
  _registerStickers () {
    this._availableStickers = [
      'stickers/glasses-nerd.png',
      'stickers/glasses-normal.png',
      'stickers/glasses-shutter-green.png',
      'stickers/glasses-shutter-yellow.png',
      'stickers/glasses-sun.png',
      'stickers/hat-cap.png',
      'stickers/hat-cylinder.png',
      'stickers/hat-party.png',
      'stickers/hat-sheriff.png',
      'stickers/heart.png',
      'stickers/mustache-long.png',
      'stickers/mustache1.png',
      'stickers/mustache2.png',
      'stickers/mustache3.png',
      'stickers/pipe.png',
      'stickers/snowflake.png',
      'stickers/star.png'
    ]
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user clicks the back button
   * @param {Event} e
   * @private
   */
  _onBackClick (e) {
    this.props.onBack()
  }

  /**
   * Gets called when a sticker has been clicked
   * @param  {String} stickerPath
   * @private
   */
  _onStickerClick (stickerPath) {
    const sticker = this._operation.createSticker({
      path: stickerPath,
      position: new Vector2(0.5, 0.5),
      scale: new Vector2(1.0, 1.0),
      rotation: 0
    })
    this._stickers.push(sticker)
    this._operation.setDirty(true)

    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)

    // Broadcast new state
    this.setSharedState({
      selectedSticker: sticker,
      stickers: this._stickers
    })
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const ui = this.context.ui

    const listItems = this._availableStickers.map((stickerPath) => {
      return (<li
        bem='e:item'
        key={stickerPath}
        onClick={this._onStickerClick.bind(this, stickerPath)}>
        <bem specifier='$b:controls'>
          <div bem='$e:button m:withLabel'>
            <img bem='e:icon' src={ui.getHelpers().assetPath(stickerPath)} />
          </div>
        </bem>
      </li>)
    })

    return (<div bem='$b:controls e:table'>
      <div bem='e:cell m:button m:withBorderRight'>
        <div bem='$e:button' onClick={this._onBackClick}>
          <img bem='e:icon' src={ui.getHelpers().assetPath(`controls/back@2x.png`, true)} />
        </div>
      </div>
      <div bem='e:cell m:list'>
        <ScrollbarComponent>
          <ul bem='$e:list'>
            {listItems}
          </ul>
        </ScrollbarComponent>
      </div>
    </div>)
  }
}
