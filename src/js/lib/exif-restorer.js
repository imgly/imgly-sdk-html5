/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 *
 * Extracted from MinifyJpeg (Copyright (c) 2014 Hiroaki Matoba, MIT License):
 * https://github.com/hMatoba/MinifyJpeg
 */

import Base64 from './base64'

const DATA_JPEG_PREFIX = 'data:image/jpeg;base64,'

export default class ExifRestorer {
  static restore (originalData, newData) {
    // Only for jpeg
    if (!originalData.match(DATA_JPEG_PREFIX)) {
      return newData
    }

    let rawImage = Base64.decode(originalData.replace(DATA_JPEG_PREFIX, ''))
    let segments = this._sliceIntoSegments(rawImage)

    let image = this._exifManipulation(newData, segments)

    return DATA_JPEG_PREFIX + Base64.encode(image)
  }

  static _exifManipulation (data, segments) {
    let exifArray = this._getExifArray(segments)
    let newImageArray = this._insertExif(data, exifArray)
    let buffer = new Uint8Array(newImageArray)
    return buffer
  }

  static _getExifArray (segments) {
    let seg
    for (let i = 0; i < segments.length; i++) {
      seg = segments[i]
      if (seg[0] === 255 && seg[1] === 225) {
        return seg
      }
    }
    return []
  }

  static _insertExif (data, exifArray) {
    let imageData = data.replace(DATA_JPEG_PREFIX, '')
    let buf = Base64.decode(imageData)
    let separatePoint = buf.indexOf(255, 3)
    let mae = buf.slice(0, separatePoint)
    let ato = buf.slice(separatePoint)
    let array = mae

    array = array.concat(exifArray)
    array = array.concat(ato)
    return array
  }

  static _sliceIntoSegments (data) {
    let head = 0
    let segments = []

    while (1) {
      if (data[head] === 255 && data[head + 1] === 218) { break }

      if (data[head] === 255 && data[head + 1] === 216) {
        head += 2
      } else {
        let length = data[head + 2] * 256 + data[head + 3]
        let endPoint = head + length + 2
        let seg = data.slice(head, endPoint)
        segments.push(seg)
        head = endPoint
      }

      if (head > data.length) { break }
    }

    return segments
  }
}
