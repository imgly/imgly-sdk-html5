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
import Matrix from '../lib/math/matrix'
import Sticker from './stickers/sticker'
import Promise from '../vendor/promise'

import StickersWebGLRenderer from './stickers/webgl-renderer'

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
    var canvas = renderer.getCanvas()
    var context = renderer.getContext()

    var canvasSize = new Vector2(canvas.width, canvas.height)
    var scaledPosition = this._options.position.clone()

    if (this._options.numberFormat === 'relative') {
      scaledPosition.multiply(canvasSize)
    }

    var size = new Vector2(image.width, image.height)
    if (typeof this._options.size !== 'undefined') {
      size.copy(this._options.size)

      if (this._options.numberFormat === 'relative') {
        size.multiply(canvasSize)
      }
    }

    context.drawImage(image,
      0, 0,
      image.width, image.height,
      scaledPosition.x, scaledPosition.y,
      size.x, size.y)
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
