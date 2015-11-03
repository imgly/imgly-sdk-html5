/* global PhotoEditorSDK */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

const { Promise, Vector2 } = PhotoEditorSDK

export default class ImageResizer {
  constructor (image, maxPixels, maxDimensions) {
    this._image = image
    this._maxPixels = maxPixels
    this._maxDimensions = maxDimensions
  }

  /**
   * Resizes the image to match the maximum amount of pixels
   * @return {Promise}
   */
  resize () {
    let maxDimensionsReached = false

    const maxDimensions = this._maxDimensions
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        const maxPixelsDimensions = this._getDimensionsByMaxPixels()
        let dimensions = maxPixelsDimensions.clone()

        if (dimensions.x > maxDimensions ||
            dimensions.y > maxDimensions) {
          let scale = Math.min(
            maxDimensions / dimensions.x,
            maxDimensions / dimensions.y
          )
          dimensions.multiply(scale)
        }

        dimensions.floor()

        const canvas = this._createResizedImageCanvas(dimensions)
        resolve({ canvas, dimensions, maxDimensionsReached })
      }, 1000)
    })
  }

  /**
   * Creates a resized canvas with the given dimensions
   * @param  {Vector2} dimensions
   * @return {Canvas}
   * @private
   */
  _createResizedImageCanvas (dimensions) {
    const image = this._image

    const canvas = document.createElement('canvas')
    canvas.width = dimensions.x
    canvas.height = dimensions.y

    const context = canvas.getContext('2d')
    context.drawImage(image,
      0, 0,
      image.width, image.height,
      0, 0,
      dimensions.x, dimensions.y)
    return canvas
  }

  /**
   * Returns the dimensions that match the max pixel count
   * @return {Vector2}
   * @private
   */
  _getDimensionsByMaxPixels () {
    const image = this._image
    const maxPixels = this._maxPixels

    const ratioHV = image.width / image.height
    const ratioVH = image.height / image.width

    return new Vector2(
      Math.sqrt(maxPixels * ratioHV),
      Math.sqrt(maxPixels * ratioVH)
    ).floor()
  }
}
