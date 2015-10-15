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

import { ReactBEM, BaseChildComponent, Vector2, Constants } from '../../../globals'
import DraggableComponent from '../../draggable-component.jsx'

export default class StickerCanvasControlsComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onRemoveClick',
      '_onStickerDrag',
      '_onKnobDragStart',
      '_onKnobDrag',
      '_onCanvasClick'
    )

    this._operation = this.getSharedState('operation')
    this._stickers = this.getSharedState('stickers')
    this._selectedSticker = this.getSharedState('selectedSticker')
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called when this component has been rendered
   */
  componentDidMount () {
    super.componentDidMount()
    this._loadExistingStickers()
  }

  /**
   * Gets called when the shared state did change
   * @param {Object} newState
   */
  sharedStateDidChange (newState) {
    if (newState.stickers) {
      newState.stickers.forEach((sticker) => {
        this._loadStickerAndStoreDimensions(sticker.getPath())
          .then(() => this.forceUpdate())
      })
    }
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user clicks the remove button
   * @param  {Event} e
   * @private
   */
  _onRemoveClick (e) {
    const selectedSticker = this.getSharedState('selectedSticker')
    if (!selectedSticker) return

    const stickers = this.getSharedState('stickers')
    const index = stickers.indexOf(selectedSticker)
    if (index !== -1) {
      stickers.splice(index, 1)
      this._stickers = stickers
      this._selectedSticker = null
      this._operation.setDirty(true)
      this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
      this.setSharedState({
        stickers,
        selectedSticker: null
      })
    }
  }

  /**
   * Gets called when the user clicks somewhere on the canvas
   * @param  {Event} e
   * @private
   */
  _onCanvasClick (e) {
    if (e.target !== this.refs.container.getDOMNode()) return
    if (!this.getSharedState('selectedSticker')) return

    this._emitEvent(Constants.EVENTS.CANVAS_RENDER, undefined, () => {
      this.props.onSwitchControls('back')
    })
  }

  /**
   * Gets called when the user starts dragging a sticker
   * @param  {Object} sticker
   * @param  {Vector2} position
   * @param  {Event} e
   * @private
   */
  _onStickerDragStart (sticker, position, e) {
    const selectedSticker = this.getSharedState('selectedSticker')
    if (selectedSticker !== sticker) {
      this.setSharedState({ selectedSticker: sticker })
    }
    this._selectedSticker = sticker
    this._initialPosition = sticker.getPosition().clone()
  }

  /**
   * Gets called while the user drags a sticker
   * @param  {Vector2} offset
   * @param  {Event} e
   * @private
   */
  _onStickerDrag (offset, e) {
    const { kit } = this.context
    const canvasDimensions = kit.getOutputDimensions()
    const relativeOffset = offset.divide(canvasDimensions)

    const newPosition = this._initialPosition
      .clone()
      .add(relativeOffset)

    this._operation.setDirty(true)
    this._selectedSticker.setPosition(newPosition)
    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
    this.forceUpdate()
  }

  /**
   * Gets called when the user starts dragging a knob
   * @param  {Vector2} position
   * @param  {Event} e
   * @private
   */
  _onKnobDragStart (position, e) {
    const selectedSticker = this.getSharedState('selectedSticker')
    this._initialPosition = this._getDragKnobPosition()
    this._initialScale = selectedSticker.getScale().clone()
  }

  /**
   * Gets called while the user drags a sticker
   * @param  {Vector2} offset
   * @param  {Event} e
   * @private
   */
  _onKnobDrag (offset, e) {
    const selectedSticker = this.getSharedState('selectedSticker')
    const stickerPosition = this._getAbsoluteStickerPosition(selectedSticker)
    const newKnobPosition = this._initialPosition
      .clone()
      .add(offset)

    const halfDimensions = this._getStickerDimensions(selectedSticker)
      .divide(2)

    // Calculate new rotation and scale from new knob position
    const knobDistanceFromCenter = newKnobPosition
      .clone()
      .subtract(stickerPosition)

    const initialDistanceFromCenter = this._initialPosition
      .clone()
      .subtract(stickerPosition)

    const radians = Math.atan2(
      knobDistanceFromCenter.y,
      knobDistanceFromCenter.x
    ) - Math.atan2(halfDimensions.y, halfDimensions.x)

    const newScale = this._initialScale
      .clone()
      .multiply(
        knobDistanceFromCenter.len() / initialDistanceFromCenter.len()
      )

    selectedSticker.getScale().set(newScale.x, newScale.x)
    selectedSticker.setRotation(radians)
    this._operation.setDirty(true)
    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
    this.forceUpdate()
  }

  // -------------------------------------------------------------------------- STYLING

  /**
   * Builds the style object for the given sticker
   * @param  {Object} sticker
   * @return {Object}
   * @private
   */
  _getStickerStyle (sticker) {
    const stickerDimensions = this._getStickerDimensions(sticker)
    const stickerPosition = this._getAbsoluteStickerPosition(sticker)
      .subtract(stickerDimensions.clone().divide(2))

    const degrees = sticker.getRotation() * 180 / Math.PI
    const transform = `rotate(${degrees.toFixed(2)}deg)`

    return {
      top: stickerPosition.y,
      left: stickerPosition.x,
      width: stickerDimensions.x,
      height: stickerDimensions.y,
      WebkitTransform: transform,
      msTransform: transform,
      MozTransform: transform,
      OTransform: transform
    }
  }

  /**
   * Calculates the drag knob position
   * @return {Vector2}
   * @private
   */
  _getDragKnobPosition () {
    const selectedSticker = this.getSharedState('selectedSticker')
    const stickerPosition = this._getAbsoluteStickerPosition(selectedSticker)
    const stickerRotation = selectedSticker.getRotation()

    // Calculate sin and cos for rotation
    const sin = Math.sin(stickerRotation || 0)
    const cos = Math.cos(stickerRotation || 0)

    // Calculate sticker dimensions
    const halfDimensions = this._getStickerDimensions(selectedSticker)
      .divide(2)

    // Calculate knob position
    return stickerPosition.clone()
      .add(
        halfDimensions.x * cos - halfDimensions.y * sin,
        halfDimensions.x * sin + halfDimensions.y * cos
      )
  }

  /**
   * Returns the style object for the drag knob
   * @return {Object}
   * @private
   */
  _getDragKnobStyle () {
    const knobPosition = this._getDragKnobPosition()

    return {
      left: knobPosition.x,
      top: knobPosition.y
    }
  }

  /**
   * Returns the style object for the remove knob
   * @return {Object}
   * @private
   */
  _getRemoveKnobStyle () {
    const selectedSticker = this.getSharedState('selectedSticker')
    const stickerPosition = this._getAbsoluteStickerPosition(selectedSticker)
    const stickerRotation = selectedSticker.getRotation()

    // Calculate sin and cos for rotation
    const sin = Math.sin(stickerRotation || 0)
    const cos = Math.cos(stickerRotation || 0)

    // Calculate sticker dimensions
    const halfDimensions = this._getStickerDimensions(selectedSticker)
      .divide(2)

    // Calculate knob position
    const knobPosition = stickerPosition.clone()
      .subtract(
        halfDimensions.x * cos - halfDimensions.y * sin,
        halfDimensions.x * sin + halfDimensions.y * cos
      )

    return {
      left: knobPosition.x,
      top: knobPosition.y
    }
  }

  // -------------------------------------------------------------------------- LOADING

  /**
   * Loads all sticker images needed for existing sticker items
   * @return {Promise}
   * @private
   */
  _loadExistingStickers () {
    return this._stickers
      .map((sticker) => {
        return this._loadStickerAndStoreDimensions(sticker.getPath())
          .then(() => this.forceUpdate())
      })
  }

  /**
   * Loads the sticker with the given identifier and stores
   * its dimensions in the shared state
   * @param  {String} stickerPath
   * @return {Promise}
   * @private
   */
  _loadStickerAndStoreDimensions (stickerPath) {
    if (stickerPath in this.getSharedState('stickerDimensions')) {
      return Promise.resolve()
    }

    const { kit } = this.context
    return new Promise((resolve, reject) => {
      let image = new window.Image()

      image.addEventListener('load', () => {
        const stickerDimensions = this.getSharedState('stickerDimensions')
        stickerDimensions[stickerPath] = new Vector2(
          image.width,
          image.height
        )
        this.setState({ stickerDimensions })
        resolve()
      })

      image.addEventListener('error', (e) => {
        reject(e)
      })

      image.src = kit.getAssetPath(stickerPath)
    })
  }

  /**
   * Checks if the given sticker has been loaded
   * @param  {Object} sticker
   * @return {Boolean}
   * @private
   */
  _stickerLoaded (sticker) {
    const stickerDimensions = this.getSharedState('stickerDimensions')
    return sticker.getPath() in stickerDimensions
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the sticker items
   * @return {Array.<ReactBEM.Element>}
   * @private
   */
  _renderStickerItems () {
    const selectedSticker = this.getSharedState('selectedSticker')

    return this._stickers
      .filter((sticker) => this._stickerLoaded(sticker))
      .map((sticker, i) => {
        const stickerStyle = this._getStickerStyle(sticker)
        const isSelected = selectedSticker === sticker
        const className = isSelected ? 'is-selected' : null

        return (<DraggableComponent
          onStart={this._onStickerDragStart.bind(this, sticker)}
          onDrag={this._onStickerDrag}>
          <div
            bem='$e:sticker'
            style={stickerStyle}
            className={className}
            key={`sticker-${i}`}>

          </div>
        </DraggableComponent>)
      })
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const { ui } = this.context
    const selectedSticker = this.getSharedState('selectedSticker')
    const stickerItems = this._renderStickerItems()

    let knobs
    if (selectedSticker && this._stickerLoaded(selectedSticker)) {
      knobs = [
        (<DraggableComponent
          onStart={this._onKnobDragStart}
          onDrag={this._onKnobDrag}>
          <div bem='e:knob $b:knob' style={this._getDragKnobStyle()}>
            <img bem='e:icon' src={ui.getHelpers().assetPath('controls/knobs/resize-diagonal-down@2x.png', true)} />
          </div>
        </DraggableComponent>),
        (
          <div bem='e:knob $b:knob' style={this._getRemoveKnobStyle()} onClick={this._onRemoveClick}>
            <img bem='e:icon' src={ui.getHelpers().assetPath('controls/knobs/remove@2x.png', true)} />
          </div>
        )]
    }

    return (<div
      bem='b:canvasControls e:container m:full'
      ref='root'
      onClick={this._onCanvasClick}>
        <div
          bem='$b:stickersCanvasControls'
          ref='container'>
          {stickerItems}
          {knobs}
        </div>
      </div>)
  }

  // -------------------------------------------------------------------------- MATH HELPERS

  /**
   * Calculates the absolute sticker position on the canvas
   * @param  {Object} sticker
   * @return {Vector2}
   * @private
   */
  _getAbsoluteStickerPosition (sticker) {
    const { kit } = this.context
    const canvasDimensions = kit.getOutputDimensions()
    return sticker.getPosition()
      .clone()
      .multiply(canvasDimensions)
  }

  /**
   * Calculates the sticker dimensions
   * @param  {Object} sticker
   * @return {Vector2}
   * @private
   */
  _getStickerDimensions (sticker) {
    const stickerDimensions = this.getSharedState('stickerDimensions')
    return stickerDimensions[sticker.getPath()]
      .clone()
      .multiply(sticker.getScale())
  }
}
