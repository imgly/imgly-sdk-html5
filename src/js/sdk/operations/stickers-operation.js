/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Operation from './operation'
import Vector2 from '../lib/math/vector2'
import Sticker from './stickers/sticker'

import StickersWebGLRenderer from './stickers/webgl-renderer'
import StickersCanvasRenderer from './stickers/canvas-renderer'

/**
 * An operation that can draw text on the canvas
 *
 * @class
 * @alias ImglyKit.Operations.StickersOperation
 * @extends ImglyKit.Operation
 */
class StickersOperation extends Operation {
  constructor (...args) {
    super(...args)

    this._renderers = {}
  }

  /**
   * Returns a serialized version of the given option
   * @param {String} optionName
   * @return {*} optionName
   * @private
   */
  _serializeOption (optionName) {
    // Since `stickers` is an array of configurables, we need
    // to serialize them as well
    if (optionName === 'stickers') {
      return this._options.stickers.map((sticker) => {
        return sticker.serializeOptions()
      })
    }
    return super._serializeOption(optionName)
  }

  /**
   * Creates a new sticker object and returns it
   * @param  {Object} options
   * @return {Sticker}
   */
  createSticker (options) {
    return new Sticker(this, options)
  }

  /**
   * Renders this operation using WebGL
   * @param  {WebGLRenderer} renderer
   * @private
   */
  /* istanbul ignore next */
  _renderWebGL (renderer) {
    if (!this._renderers[renderer.id]) {
      this._renderers[renderer.id] = new StickersWebGLRenderer(this, renderer)
    }

    return this._renderers[renderer.id].render()
  }

  /**
   * Crops the image using Canvas2D
   * @param  {CanvasRenderer} renderer
   * @param  {Image} image
   * @private
   */
  _renderCanvas (renderer, image) {
    if (!this._renderers[renderer.id]) {
      this._renderers[renderer.id] = new StickersCanvasRenderer(this, renderer)
    }

    return this._renderers[renderer.id].render()
  }

  /**
   * Returns the sticker at the given position on the canvas
   * @param  {BaseRenderer} renderer
   * @param  {Vector2} position
   * @return {Object}
   */
  getStickerAtPosition (renderer, position) {
    const canvas = renderer.getCanvas()
    const canvasDimensions = new Vector2(canvas.width, canvas.height)
    const parentScale = renderer.getScale()

    let intersectingSticker = null
    this._options.stickers.slice(0).reverse()
      .forEach((sticker) => {
        if (intersectingSticker) return

        const stickerPosition = sticker.getPosition()
        const stickerRotation = sticker.getRotation()
        const stickerImage = sticker.getImage()
        const stickerScale = sticker.getScale()

        const absoluteStickerPosition = stickerPosition
          .clone()
          .multiply(canvasDimensions)
        const relativeClickPosition = position
          .clone()
          .subtract(absoluteStickerPosition)
        const clickDistance = relativeClickPosition.len()
        const radians = Math.atan2(
          relativeClickPosition.y,
          relativeClickPosition.x
        )
        const newRadians = radians - stickerRotation

        const x = Math.cos(newRadians) * clickDistance
        const y = Math.sin(newRadians) * clickDistance

        const stickerDimensions = new Vector2(
            stickerImage.width,
            stickerImage.height
          )
          .multiply(stickerScale)
          .multiply(parentScale, parentScale)

        if (x > -0.5 * stickerDimensions.x &&
            x < 0.5 * stickerDimensions.x &&
            y > -0.5 * stickerDimensions.y &&
            y < 0.5 * stickerDimensions.y) {
          intersectingSticker = sticker
        }

      })
    return intersectingSticker
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
StickersOperation.identifier = 'stickers'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
StickersOperation.prototype.availableOptions = {
  stickers: {
    type: 'array', default: [],
    setter: function (stickers) {
      stickers = stickers.map((sticker, i) => {
        if (sticker instanceof Sticker) return sticker

        // Update stickers if they already exist
        if (this._options.stickers[i]) {
          this._options.stickers[i].set(sticker)
          return this._options.stickers[i]
        }

        return new Sticker(this, sticker)
      })
      return stickers
    }
  }
}

export default StickersOperation
