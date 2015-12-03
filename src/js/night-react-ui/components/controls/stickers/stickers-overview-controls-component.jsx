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

import { ReactBEM, Constants, Vector2 } from '../../../globals'
import ControlsComponent from '../controls-component'
import ScrollbarComponent from '../../scrollbar-component'
import ModalManager from '../../../lib/modal-manager'

export default class StickersOverviewControlsComponent extends ControlsComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onStickerMouseLeave',
      '_renderTooltipCanvas'
    )

    this._operation = this.getSharedState('operation')
    this._stickers = this.getSharedState('stickers')

    this._availableStickers = []
    this._initStickers()

    this.state = {}
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called when this component is mounted
   */
  componentDidMount () {
    super.componentDidMount()
    this._renderStickers()
  }

  // -------------------------------------------------------------------------- STICKER RENDERING

  /**
   * Renders the stickers on the canvas preview elements
   * @private
   */
  _renderStickers () {
    const stickers = this._availableStickers
    for (let i = 0; i < stickers.length; i++) {
      const stickerPaths = stickers[i]
      this._renderSticker(i, stickerPaths)
    }
  }

  /**
   * Renders the sticker on the tooltip canvas
   * @private
   */
  _renderTooltipCanvas () {
    const { hoveredSticker } = this.state
    const image = new window.Image()
    image.addEventListener('load', () => {
      if (!this.state.tooltipVisible ||
          this.state.hoveredSticker !== hoveredSticker) {
        return
      }

      const canvas = this.refs.tooltipCanvas
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight

      const context = canvas.getContext('2d')
      const scale = Math.min(canvas.width / image.width, canvas.height / image.height)
      const drawSize = new Vector2(image.width, image.height)
        .multiply(scale)
      const drawPosition = new Vector2(canvas.width, canvas.height)
        .divide(2)
        .subtract(drawSize.clone().divide(2))

      context.drawImage(image,
        0, 0,
        image.width, image.height,
        drawPosition.x, drawPosition.y,
        drawSize.x, drawSize.y)
    })

    const resolvedStickerPath = this._getAssetPath(hoveredSticker)
    image.src = resolvedStickerPath
  }

  /**
   * Renders the given sticker on the canvas with the given index
   * @param  {Number} index
   * @param  {Array.<String>} stickerPaths
   * @private
   */
  _renderSticker (index, stickerPaths) {
    const resolvedStickerPath = this._getAssetPath(stickerPaths[0])
    const canvas = this.refs[`canvas-${index}`]

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const context = canvas.getContext('2d')

    const image = new window.Image()
    image.addEventListener('load', () => {
      const scale = Math.min(canvas.width / image.width, canvas.height / image.height)
      const drawSize = new Vector2(image.width, image.height)
        .multiply(scale)
      const drawPosition = new Vector2(canvas.width, canvas.height)
        .divide(2)
        .subtract(drawSize.clone().divide(2))

      context.drawImage(image,
        0, 0,
        image.width, image.height,
        drawPosition.x, drawPosition.y,
        drawSize.x, drawSize.y)
    })
    image.src = resolvedStickerPath
  }

  // -------------------------------------------------------------------------- STICKERS

  /**
   * Initializes the available stickers
   * @private
   */
  _initStickers () {
    const additionalStickers = this.props.options.stickers || []
    const replaceStickers = !!this.props.options.replaceStickers

    const stickers = [
      'glasses-nerd.png',
      'glasses-normal.png',
      'glasses-shutter-green.png',
      'glasses-shutter-yellow.png',
      'glasses-sun.png',
      'hat-cap.png',
      'hat-cylinder.png',
      'hat-party.png',
      'hat-sheriff.png',
      'heart.png',
      'mustache-long.png',
      'mustache1.png',
      'mustache2.png',
      'mustache3.png',
      'pipe.png',
      'snowflake.png',
      'star.png'
    ].map((stickerName) =>
      [
        `stickers/small/${stickerName}`,
        `stickers/large/${stickerName}`
      ]
    )

    if (replaceStickers) {
      this._availableStickers = additionalStickers
    } else {
      this._availableStickers = stickers.concat(additionalStickers)
    }
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
   * @param  {Array.<String>} stickerPaths
   * @private
   */
  _onStickerClick (stickerPaths) {
    const largePath = stickerPaths[1]

    const resolvedStickerPath = this._getAssetPath(largePath)
    const image = new window.Image()

    let loadingModal
    let loadTimeout = setTimeout(() => {
      loadingModal = ModalManager.instance.displayLoading(this._t('loading.loading'))
    }, 100)

    image.addEventListener('load', () => {
      if (loadingModal) loadingModal.close()
      if (loadTimeout) {
        clearTimeout(loadTimeout)
        loadTimeout = null
      }

      const sticker = this._operation.createSticker({
        image,
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
    })

    image.addEventListener('error', () => {
      if (loadingModal) loadingModal.close()
      if (loadTimeout) {
        clearTimeout(loadTimeout)
        loadTimeout = null
      }

      ModalManager.instance.displayError(
        this._t('errors.imageLoadFail.title'),
        this._t('errors.imageLoadFail.text', { path: image.src })
      )
    })

    image.crossOrigin = 'Anonymous'
    image.src = resolvedStickerPath
  }

  /**
   * Gets called when the user starts hovering a sticker
   * @param  {String} stickerPath
   * @param  {Event} e
   * @private
   */
  _onStickerMouseEnter (stickerPath, e) {
    this.setState({
      tooltipVisible: true,
      hoveredSticker: stickerPath,
      hoveredStickerElement: e.currentTarget
    }, () => {
      this._renderTooltipCanvas()
      this._updateTooltipPosition()
    })
  }

  /**
   * Updates the tooltip position to match the currently hovered
   * sticker's position
   * @private
   */
  _updateTooltipPosition () {
    const el = this.state.hoveredStickerElement
    const parent = el.parentNode
    const boundingRect = el.getBoundingClientRect()
    const parentBoundingRect = parent.getBoundingClientRect()

    this.setState({
      tooltipPosition:
        boundingRect.left -
        parentBoundingRect.left +
        boundingRect.width * 0.5
    })
  }

  /**
   * Gets called when the user does no longer hover a sticker
   * @private
   */
  _onStickerMouseLeave () {
    this.setState({
      tooltipVisible: false,
      hoveredSticker: null
    })
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the list items for this control
   * @return {Array.<ReactBEM.Element>}
   * @private
   */
  _renderListItems () {
    return this._availableStickers.map((paths, i) => {
      const smallPath = paths[0]
      const largePath = paths[1]
      const { options } = this.props

      const itemEvents = options.tooltips
        ? {
          onMouseEnter: this._onStickerMouseEnter.bind(this, smallPath),
          onMouseLeave: this._onStickerMouseLeave
        }
        : null

      return (<li
        bem='e:item'
        key={largePath}
        onClick={this._onStickerClick.bind(this, [smallPath, largePath])}
        {...itemEvents}>
        <bem specifier='$b:controls'>
          <div bem='$e:button m:withLabel'>
            <canvas bem='e:canvas m:large' ref={`canvas-${i}`} />
          </div>
        </bem>
      </li>)
    })
  }

  /**
   * Renders the tooltip (if present)
   * @return {ReactBEM.Element}
   * @private
   */
  _renderTooltip () {
    const tooltipVisible = this.props.options.tooltips &&
      this.state.tooltipVisible

    const style = {
      left: this.state.tooltipPosition
    }

    return tooltipVisible
      ? (<div bem='e:cell m:empty'>
        <div bem='$b:stickersControls $e:tooltip'
          visible={this.state.tooltipVisible}
          style={style}>
          <canvas bem='e:canvas' ref='tooltipCanvas' />
        </div>
      </div>)
      : null
  }

  /**
   * Renders the controls of this component
   * @return {ReactBEM.Element}
   */
  renderControls () {
    const listItems = this._renderListItems()
    const tooltip = this._renderTooltip()

    return [tooltip, (<div bem='e:cell m:list'>
      <ScrollbarComponent>
        <ul bem='$e:list'>
          {listItems}
        </ul>
      </ScrollbarComponent>
    </div>)]
  }
}
