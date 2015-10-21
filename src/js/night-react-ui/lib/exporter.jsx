/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { RenderType, Utils } from '../globals'
import FileDownloader from './file-downloader'

export default class Exporter {
  constructor (kit, options, download) {
    this._kit = kit
    this._options = options
    this._download = download
  }

  /**
   * Exports the image / data url
   * @return {Promise}
   */
  export () {
    const renderType = this._getRenderType()

    // Let the SDK render the whole image (don't limit dimensions)
    const previousDimensions = this._kit.getDimensions()
    this._kit.setDimensions(null)

    // Let the SDK render
    return this._kit.export(renderType, this._options.format)
      .then((data) => {
        if (this._download) {
          this._downloadData(renderType, data)
        }
        return data
      })
      .then((output) => {
        // Reset renderer
        this._kit.reset()
        this._kit.setDimensions(previousDimensions)
        this._kit.render()

        return output
      })
  }

  /**
   * Downloads the data using the given render type
   * @param  {RenderType} renderType
   * @param  {String} data
   * @private
   */
  _downloadData (renderType, data) {
    switch (renderType) {
      case RenderType.DATAURL:
        FileDownloader.downloadDataURL(data)
        break
      case RenderType.MSBLOB:
        FileDownloader.downloadMSBlob(data)
        break
    }
  }

  /**
   * Returns the render type for this export
   * @return {RenderType}
   * @private
   */
  _getRenderType () {
    const options = this._options
    if (options.type !== RenderType.IMAGE || !this._download) {
      return options.type
    } else {
      if (Utils.supportsMSBlob()) {
        return RenderType.MSBLOB
      } else {
        return RenderType.DATAURL
      }
    }
  }
}
