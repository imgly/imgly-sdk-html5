/**
 * Copyright (c) FILSH Media GmbH - All Rights Reserved
 *
 * This file is part of VLIGHT.MXR.TWO
 *
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 *
 * Written by Sascha Gehlich <sascha@gehlich.us>, June 2015
 *
 * Extracted from MinifyJpeg:
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
