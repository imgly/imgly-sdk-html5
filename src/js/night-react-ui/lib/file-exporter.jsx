/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Base64 } from '../globals'

export default class FileExporter {
  /**
   * Exports the given data url
   * @param  {String} data
   * @param  {String} baseName = 'photoeditorsdk-export'
   */
  static exportDataURL (data, baseName = 'photoeditorsdk-export') {
    const url = this.createBlobURLFromDataURL(data)
    const extension = this.getExtensionFromDataURL(data)

    let link = document.createElement('a')
    link.download = `${baseName}.${extension}`
    link.href = url
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * Exports the given data url using msBlob
   * @param  {String} data
   * @param  {String} baseName = 'photoeditorsdk-export'
   */
  static exportMSBlob (data, baseName = 'photoeditorsdk-export') {
    navigator.msSaveBlob(data, `${baseName}.png`)
  }

  /**
   * Returns the file extension by reading the given data url
   * @param  {String} data
   * @return {String}
   */
  static getExtensionFromDataURL (data) {
    const mimeString = data.split(',')[0].split(':')[1].split(';')[0]
    return mimeString.split('/').pop()
  }

  /**
   * Creates a Blob URI from the given Data URI
   * @param {String} data
   */
  static createBlobURLFromDataURL (data) {
    if (!window.Blob || !window.URL || !ArrayBuffer || !Uint8Array) {
      return data
    }

    const rawData = Base64.decode(data.split(',')[1])
    const mimeString = data.split(',')[0].split(':')[1].split(';')[0]

    // write the bytes of the string to an ArrayBuffer
    const arrayBuffer = new ArrayBuffer(rawData.length)
    const intArray = new Uint8Array(arrayBuffer)
    for (let i = 0; i < rawData.length; i++) {
      intArray[i] = rawData[i]
    }

    // write the ArrayBuffer to a blob, and you're done
    const blob = new window.Blob([arrayBuffer], {
      type: mimeString
    })
    return window.URL.createObjectURL(blob)
  }
}
