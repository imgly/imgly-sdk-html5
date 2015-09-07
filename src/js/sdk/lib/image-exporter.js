/* global Image */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */
import { RenderType, ImageFormat } from '../constants'
import Utils from './utils'
import Promise from '../vendor/promise'
import Exif from './exif'

/**
 * @class
 * @alias ImglyKit.ImageExporter
 * @private
 */
class ImageExporter {

  static validateSettings (renderType, imageFormat) {
    var settings = {
      renderType: renderType,
      imageFormat: imageFormat
    }

    // Validate RenderType
    if ((typeof settings.renderType !== 'undefined' && settings.renderType !== null) &&
        Utils.values(RenderType).indexOf(settings.renderType) === -1) {
      throw new Error('Invalid render type: ' + settings.renderType)
    } else if (typeof renderType === 'undefined') {
      settings.renderType = RenderType.DATAURL
    }

    // Validate ImageFormat
    if ((typeof settings.imageFormat !== 'undefined' && settings.imageFormat !== null) &&
        Utils.values(ImageFormat).indexOf(settings.imageFormat) === -1) {
      throw new Error('Invalid image format: ' + settings.imageFormat)
    } else if (typeof imageFormat === 'undefined') {
      settings.imageFormat = ImageFormat.PNG
    }

    // Render type 'buffer' only available in node
    if (settings.renderType === RenderType.BUFFER &&
        typeof process === 'undefined') {
      throw new Error('Render type \'buffer\' is only available when using node.js')
    }

    return settings
  }

  /**
   * Exports the image from the given canvas with the given options
   * @param  {ImglyKit} kit
   * @param  {Image} image
   * @param  {Canvas} canvas
   * @param  {ImglyKit.RenderType} renderType
   * @param  {ImglyKit.ImageFormat} imageFormat
   * @param  {Number} quality = 0.8
   * @return {Promise}
   */
  static export (kit, image, canvas, renderType, imageFormat, quality=0.8) {
    return new Promise((resolve, reject) => {
      let result
      if (renderType === RenderType.IMAGE ||
          renderType === RenderType.DATAURL) {
        if (typeof window === 'undefined') {
          // Quality not supported in node environment / node-canvas
          result = canvas.toDataURL(imageFormat)
        } else {
          result = canvas.toDataURL(imageFormat, quality)
        }

        // When image's `src` attribute is a jpeg data url, we can restore
        // the exif information
        if (Exif.isJPEG(image.src) && Exif.isJPEG(result)) {
          const { exif } = kit
          if (exif) {
            result = exif.restoreExifTags(result)
          }
        }
      }

      if (renderType === RenderType.IMAGE) {
        let outputImage

        /* istanbul ignore else  */
        if (typeof window === 'undefined') {
          // Not a browser environment
          var CanvasImage = require('canvas').Image
          outputImage = new CanvasImage()
        } else {
          outputImage = new Image()
        }

        outputImage.src = result
        resolve(outputImage)
      } else if (renderType === RenderType.DATAURL) {
        resolve(result)
      } else if (renderType === RenderType.BUFFER) {
        resolve(canvas.toBuffer())
      } else if (renderType === RenderType.MSBLOB) {
        resolve(canvas.msToBlob())
      } else if (renderType === RenderType.BLOB) {
        canvas.toBlob((blob) => {
          resolve(blob)
        }, imageFormat, quality)
      }
    })
  }
}

export default ImageExporter
