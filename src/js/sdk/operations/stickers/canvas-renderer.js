/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Vector2 from '../../lib/math/vector2'
import StackBlur from '../../vendor/stack-blur'

export default class StickersCanvasRenderer {
  constructor (operation, renderer) {
    this._operation = operation
    this._renderer = renderer
    this._textures = {}
    this._lastAdjustments = {}
    this._lastScale = {}
  }

  /**
   * Renders the stickers operation using canvas2d
   * @return {Promise}
   */
  render () {
    const stickers = this._operation.getStickers()
    let promise = Promise.resolve()
    stickers.forEach((sticker) => {
      promise = promise.then(() => {
        return this._renderSticker(sticker)
      })
    })
    return promise
      .then(() => {
        this._renderFinal
      })
  }

  /**
   * Renders the given sticker
   * @param  {Sticker} sticker
   * @return {Promise}
   * @private
   */
  _renderSticker (sticker) {
    return this._createTexture(sticker)
      .then(() => this._applyAdjustments(sticker))
      .then(() => this._applyBlur(sticker))
      .then(() => this._renderFinal(sticker))
      .then(() => {
        const stickerAdjustments = sticker.getAdjustments()
        this._lastAdjustments[sticker.id] = stickerAdjustments.serializeOptions()
        this._lastScale[sticker.id] = sticker.getScale().clone()
      })
  }

  /**
   * Creates a texture (canvas) for the given sticker
   * @param  {Sticker} sticker
   * @return {Promise}
   * @private
   */
  _createTexture (sticker) {
    if (!this._textures[sticker.id]) {
      this._textures[sticker.id] = this._renderer.createCanvas()
    }

    const stickerAdjustments = sticker.getAdjustments()
    const canvas = this._textures[sticker.id]
    const outputCanvas = this._renderer.getCanvas()

    if (!this._needsRerender(sticker)) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const image = sticker.getImage()
      const stickerScale = sticker.getScale()
      const blurRadius = stickerAdjustments.getBlur() * outputCanvas.width

      // Calculate sticker dimensions (real dimensions * scale)
      const stickerDimensions = new Vector2(image.width, image.height)
        .multiply(stickerScale)

      // Resize canvas
      const canvasDimensions = stickerDimensions.clone()
        .add(blurRadius * 2, blurRadius * 2)
      canvas.width = canvasDimensions.x
      canvas.height = canvasDimensions.y

      // Calculate sticker position
      const stickerPosition = canvasDimensions.clone()
        .divide(2)
        .subtract(
          stickerDimensions.clone()
            .divide(2)
        )

      // Draw sticker image to canvas
      const context = canvas.getContext('2d')
      context.drawImage(image,
        0, 0,
        image.width, image.height,
        stickerPosition.x, stickerPosition.y,
        stickerDimensions.x, stickerDimensions.y)

      resolve()
    })
  }

  /**
   * Applies the adjustments (brightness, saturation, contrast) to
   * the given sticker
   * @param  {Sticker} sticker
   * @return {Promise}
   * @private
   */
  _applyAdjustments (sticker) {
    const canvas = this._textures[sticker.id]
    const context = canvas.getContext('2d')

    if (!this._needsRerender(sticker)) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      const { data } = imageData

      const stickerAdjustments = sticker.getAdjustments()
      const saturation = stickerAdjustments.getSaturation()
      const brightness = stickerAdjustments.getBrightness()
      const contrast = stickerAdjustments.getContrast()

      for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
          const index = (canvas.width * y + x) * 4

          // Apply brightness
          data[index] = data[index] + brightness * 255
          data[index + 1] = data[index + 1] + brightness * 255
          data[index + 2] = data[index + 2] + brightness * 255

          // Apply saturation
          const luminance = data[index] * 0.2125 + data[index + 1] * 0.7154 + data[index + 2] * 0.0721
          data[index] = luminance * (1 - saturation) + (data[index] * saturation)
          data[index + 1] = luminance * (1 - saturation) + (data[index + 1] * saturation)
          data[index + 2] = luminance * (1 - saturation) + (data[index + 2] * saturation)

          // Apply contrast
          data[index] = (data[index] - 127) * contrast + 127
          data[index + 1] = (data[index + 1] - 127) * contrast + 127
          data[index + 2] = (data[index + 2] - 127) * contrast + 127
        }
      }

      context.putImageData(imageData, 0, 0)
      resolve()
    })
  }

  /**
   * Applies the blur for the given sticker
   * @param  {Sticker} sticker
   * @return {Promise}
   * @private
   */
  _applyBlur (sticker) {
    const canvas = this._textures[sticker.id]
    const context = canvas.getContext('2d')

    if (!this._needsRerender(sticker)) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      const blurRadius = sticker.getAdjustments().getBlur() * canvas.width

      StackBlur.stackBlurCanvasRGBA(imageData, 0, 0, canvas.width, canvas.height, blurRadius)

      context.putImageData(imageData, 0, 0)
      resolve()
    })
  }

  /**
   * Renders the sticker texture to the output canvas
   * @param  {Sticker} sticker
   * @return {Promise}
   * @private
   */
  _renderFinal (sticker) {
    const canvas = this._textures[sticker.id]
    return new Promise((resolve, reject) => {
      const outputCanvas = this._renderer.getCanvas()
      const outputContext = this._renderer.getContext()

      const parentScale = this._renderer.getScale()
      const canvasDimensions = new Vector2(outputCanvas.width, outputCanvas.height)
      const drawDimensions = new Vector2(canvas.width, canvas.height)
        .multiply(parentScale)
      const stickerPosition = sticker.getPosition()
        .clone()
        .multiply(canvasDimensions)
      const stickerRotation = sticker.getRotation()

      outputContext.save()
      outputContext.translate(stickerPosition.x, stickerPosition.y)

      let scaleX = 1
      let scaleY = 1
      if (sticker.getFlipHorizontally()) {
        scaleX = -1
      }

      if (sticker.getFlipVertically()) {
        scaleY = -1
      }

      outputContext.rotate(stickerRotation)
      outputContext.scale(scaleX, scaleY)
      outputContext.drawImage(canvas,
        -drawDimensions.x / 2,
        -drawDimensions.y / 2,
        drawDimensions.x,
        drawDimensions.y)
      outputContext.restore()
      resolve()
    })
  }

  /**
   * Checks if the given sticker has changed from the last render
   * @param  {Sticker} sticker
   * @return {Boolean}
   * @private
   */
  _needsRerender (sticker) {
    const stickerAdjustments = sticker.getAdjustments()
    const stickerScale = sticker.getScale()
    const lastAdjustments = this._lastAdjustments[sticker.id]
    const lastScale = this._lastScale[sticker.id]

    const adjustmentsChanged = !stickerAdjustments.optionsEqual(lastAdjustments) ||
      lastAdjustments === null
    const scaleChanged = (lastScale && !stickerScale.equals(lastScale)) || !lastScale

    return adjustmentsChanged || scaleChanged
  }
}
