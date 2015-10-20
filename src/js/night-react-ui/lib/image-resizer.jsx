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
  constructor (image, maxPixels) {
    this._image = image
    this._maxPixels = maxPixels
  }

  /**
   * Resizes the image to match the maximum amount of pixels
   * @return {Promise}
   */
  resize () {
    const image = this._image
    const maxPixels = this._maxPixels
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        const ratioHV = image.width / image.height
        const ratioVH = image.height / image.width

        const dimensions = new Vector2(
          Math.sqrt(maxPixels * ratioHV),
          Math.sqrt(maxPixels * ratioVH)
        ).floor()

        const canvas = document.createElement('canvas')
        canvas.width = dimensions.x
        canvas.height = dimensions.y

        const context = canvas.getContext('2d')
        context.drawImage(image,
          0, 0,
          image.width, image.height,
          0, 0,
          dimensions.x, dimensions.y)

        resolve({ canvas, dimensions })
      }, 1000)
    })
  }
}
