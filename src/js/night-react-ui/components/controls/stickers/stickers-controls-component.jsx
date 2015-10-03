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

import { ReactBEM, BaseChildComponent, Constants, Vector2, Promise } from '../../../globals'
import ScrollbarComponent from '../../scrollbar-component'

export default class StickersControlsComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._bindAll('_onBackClick')
    this._operation = this.getSharedState('operation')
    this._stickers = this.getSharedState('stickers')
    this._stickersMap = this._operation.getAvailableStickers()

    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called when this component has been mounted
   */
  componentDidMount () {
    super.componentDidMount()

    const selectedSticker = this.getSharedState('selectedSticker')
    if (!selectedSticker) {
      this._onStickerClick(Object.keys(this._stickersMap)[0])
    }
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user clicks the back button
   * @param {Event} e
   * @private
   */
  _onBackClick (e) {
    this.props.onSwitchControls('back')
  }

  /**
   * Gets called when a sticker has been clicked
   * @param  {String} identifier
   * @private
   */
  _onStickerClick (identifier) {
    let selectedSticker = this.getSharedState('selectedSticker')

    this._loadStickerAndStoreDimensions(identifier)
      .then(() => {
        // If no selected sticker exists, clicking a sticker
        // creates a new one. If one exists, it changes the
        // sticker name.
        if (!selectedSticker) {
          selectedSticker = {
            name: identifier,
            position: new Vector2(0.5, 0.5),
            scale: new Vector2(1.0, 1.0),
            rotation: 0
          }
          this._stickers.push(selectedSticker)
        } else {
          selectedSticker.name = identifier
        }

        // Broadcast new state
        this.setSharedState({
          selectedSticker,
          stickers: this._stickers
        })
      })
  }

  // -------------------------------------------------------------------------- MISC

  /**
   * Loads the sticker with the given identifier and stores
   * its dimensions in the shared state
   * @param  {String} identifier
   * @return {Promise}
   * @private
   */
  _loadStickerAndStoreDimensions (identifier) {
    const { kit } = this.context
    return new Promise((resolve, reject) => {
      let image = new Image()

      image.addEventListener('load', () => {
        const stickerDimensions = this.getSharedState('stickerDimensions')
        stickerDimensions[identifier] = new Vector2(
          image.width,
          image.height
        )
        this.setState({ stickerDimensions }, false)
        resolve()
      })

      image.src = kit.getAssetPath(this._stickersMap[identifier])
    })
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const ui = this.context.ui
    const selectedSticker = this.getSharedState('selectedSticker')

    const listItems = Object.keys(this._stickersMap).map((identifier) => {
      let itemClassName
      if (selectedSticker && selectedSticker.name === identifier) {
        itemClassName = 'is-active'
      }

      return (<li
        bem='e:item'
        key={identifier}
        onClick={this._onStickerClick.bind(this, identifier)}>
        <bem specifier='$b:controls'>
          <div bem='$e:button m:withLabel' className={itemClassName}>
            <img bem='e:icon' src={ui.getHelpers().assetPath(this._stickersMap[identifier])} />
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
