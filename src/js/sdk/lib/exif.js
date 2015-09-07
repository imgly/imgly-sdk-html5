/*!
 * Based on https://github.com/exif-js/exif-js by Jacob Seidelin
 * Licensed under MIT
 */

/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Base64 from './base64'

const EXIF_TAGS = {
  0x0100 : 'ImageWidth',
  0x0101 : 'ImageHeight',
  0x8769 : 'ExifIFDPointer',
  0x8825 : 'GPSInfoIFDPointer',
  0xA005 : 'InteroperabilityIFDPointer',
  0x0102 : 'BitsPerSample',
  0x0103 : 'Compression',
  0x0106 : 'PhotometricInterpretation',
  0x0112 : 'Orientation',
  0x0115 : 'SamplesPerPixel',
  0x011C : 'PlanarConfiguration',
  0x0212 : 'YCbCrSubSampling',
  0x0213 : 'YCbCrPositioning',
  0x011A : 'XResolution',
  0x011B : 'YResolution',
  0x0128 : 'ResolutionUnit',
  0x0111 : 'StripOffsets',
  0x0116 : 'RowsPerStrip',
  0x0117 : 'StripByteCounts',
  0x0201 : 'JPEGInterchangeFormat',
  0x0202 : 'JPEGInterchangeFormatLength',
  0x012D : 'TransferFunction',
  0x013E : 'WhitePoint',
  0x013F : 'PrimaryChromaticities',
  0x0211 : 'YCbCrCoefficients',
  0x0214 : 'ReferenceBlackWhite',
  0x0132 : 'DateTime',
  0x010E : 'ImageDescription',
  0x010F : 'Make',
  0x0110 : 'Model',
  0x0131 : 'Software',
  0x013B : 'Artist',
  0x8298 : 'Copyright'
}

const DATA_JPEG_PREFIX = 'data:image/jpeg;base64,'
const JPEG_REGEX = new RegExp(`^${DATA_JPEG_PREFIX}`, 'i')

import ArrayStream from './array-stream'

export default class Exif {
  constructor (buf) {
    this._buf = buf
    this._stream = new ArrayStream(this._buf)
    this._stream.setHead(0)

    this._segments = this._sliceIntoSegments(this._buf)
    this._exifBuffer = this._getExifBuffer()
    this._exifStream = new ArrayStream(this._exifBuffer)
    this._parseExif()
  }

  getTags () { return this._tags }
  getTagData () { return this._tagData }

  /**
   * Restores the exif tags into the given data url
   * @return {String} base64String
   */
  restoreExifTags (base64String) {
    // First, make the given string a data array
    const raw = base64String.replace(DATA_JPEG_PREFIX, '')
    const data = Base64.decode(raw)

    const segments = this._sliceIntoSegments(data)
    const [ segmentStart, segmentEnd ] = segments[1]
    const dataBefore = data.slice(0, segmentStart)
    const dataAfter = data.slice(segmentStart)

    let newData = dataBefore.concat(this._exifBuffer)
    newData = newData.concat(dataAfter)

    // Make it a base64 string again
    return DATA_JPEG_PREFIX + Base64.encode(newData)
  }

  /**
   * Overwrites the orientation with the given 16 bit integer
   * @param {Number} orientation
   */
  setOrientation (orientation) {
    if (this._tagData.Orientation) {
      const { entryOffset } = this._tagData.Orientation
      // Replace value in buffer
      this._exifStream.setHead(entryOffset + 8)
      this._exifStream.writeInt16(orientation)
    }
  }

  /**
   * Checks whether the given base64 data url is a jpeg image
   * @param  {String}  base64String
   * @return {Boolean}
   */
  static isJPEG (base64String) {
    return JPEG_REGEX.test(base64String)
  }

  /**
   * Creates a new instance of Exif from the given base64-encoded
   * string
   * @param  {String} base64String
   * @return {Exif}
   */
  static fromBase64String (base64String) {
    const raw = base64String.replace(DATA_JPEG_PREFIX, '')
    const data = Base64.decode(raw)
    return new Exif(data)
  }

  /**
   * Parses the exif tags
   * @return {Object}
   * @private
   */
  _parseExif () {
    this._exifStream.setHead(0)
    // Skip marker
    this._exifStream.readInt16()
    // Skip length
    this._exifStream.readInt16()

    const header = this._exifStream.readString(4)
    if (header !== 'Exif') {
      return
    }

    // Skip 2 bytes
    this._exifStream.readInt16()

    const tiffOffset = this._exifStream.getHead()

    // Find endian type
    let bigEndian = false
    const endian = this._exifStream.readInt16()
    if (endian === 0x4949) {
      bigEndian = false
    } else if (endian === 0x4d4d) {
      bigEndian = true
    } else {
      throw new Error('Invalid TIFF data: No endian type found')
    }

    if (this._exifStream.readInt16(!bigEndian) !== 0x002A) {
      throw new Error('Invalid TIFF data: No 0x002A')
    }

    const firstIFDOffset = this._exifStream.readInt32(!bigEndian)
    if (firstIFDOffset < 8) {
      throw new Error('Invalid TIFF data: First IFD offset < 8')
    }

    const ifdOffset = tiffOffset + firstIFDOffset
    const tags = this._readTags(this._exifStream, tiffOffset, ifdOffset, bigEndian)
    this._tags = tags.tags
    this._tagData = tags.tagData
  }

  /**
   * Reads the TIFF tags from the stream
   * @param  {ArrayBuffer} stream
   * @param  {Number} tiffStart The position where tiff data starts
   * @param  {Number} ifdStart  The position where the IFD starts
   * @param  {Boolean} bigEndian
   * @return {Object}
   * @private
   */
  _readTags (stream, tiffStart, ifdStart, bigEndian) {
    stream.setHead(ifdStart)
    const entriesCount = stream.readInt16(!bigEndian)
    let tags = {}
    let tagData = []

    for (let i = 0; i < entriesCount; i++) {
      const entryOffset = ifdStart + i*12 + 2
      stream.setHead(entryOffset)
      let tag = stream.readInt16(!bigEndian)
      let type
      let numValues
      let valueOffset
      if (EXIF_TAGS[tag]) {
        tag = EXIF_TAGS[tag]
        type = stream.readInt16(!bigEndian)
        numValues = stream.readInt32(!bigEndian)
        valueOffset = stream.readInt32(!bigEndian) + tiffStart
        let value = null

        switch (type) {
          case 1: // byte, 8-bit unsigned int
          case 7: // undefined, 8-bit byte, value depending on field
            if (numValues === 1) {
              value = stream.readInt8(!bigEndian)
            } else {
              value = []
              for (let i = 0; i < numValues; i++) {
                value.push(stream.readInt8(!bigEndian))
              }
            }
            break
          case 2: // 8-bit ascii char
            stream.setHead(numValues > 4 ? valueOffset : (entryOffset + 8))
            value = stream.readString(numValues)
            break
          case 3: // short
            stream.setHead(numValues > 2 ? valueOffset : (entryOffset + 8))
            if (numValues === 1) {
              value = stream.readInt16(!bigEndian)
            } else {
              value = []
              for (let i = 0; i < numValues; i++) {
                value.push(stream.readInt16(!bigEndian))
              }
            }
            break
          case 4: // long
          case 9: // slong
            stream.setHead(numValues > 1 ? valueOffset : (entryOffset + 8))
            if (numValues === 1) {
              value = stream.readInt32(!bigEndian)
            } else {
              value = []
              for (let i = 0; i < numValues; i++) {
                value.push(stream.readInt32(!bigEndian))
              }
            }
            break
          case 5: // rational (two long values, first numerator, second denominator)
          case 10: // rational (two slongs)
            stream.setHead(valueOffset)
            if (numValues === 1) {
              const numerator = stream.readInt32(!bigEndian)
              const denominator = stream.readInt32(!bigEndian)
              value = numerator / denominator
            } else {
              value = []
              for (let i = 0; i < numValues; i++) {
                const numerator = stream.readInt32(!bigEndian)
                const denominator = stream.readInt32(!bigEndian)
                const val = numerator / denominator
                value.push(val)
              }
            }
            break
        }

        tags[tag] = value
        tagData[tag] = {
          value,
          numValues,
          entryOffset,
          valueOffset,
          type
        }
      }
    }

    return { tags, tagData }
  }

  /**
   * Returns a new buffer containing the Exif segment
   * @return {Array}
   * @private
   */
  _getExifBuffer () {
    const segments = this._segments
    for (let i = 0; i < segments.length; i++) {
      const [offset, end] = segments[i]
      this._stream.setHead(offset)
      const marker = this._stream.peekInt16()
      if (marker === 0xffe1) {
        return this._buf.slice(offset, end)
      }
    }
    return false
  }

  /**
   * Slices the array into segments
   * @param  {Array.<Number>} buf
   * @return {Array}
   * @private
   */
  _sliceIntoSegments (buf) {
    let stream = new ArrayStream(buf)
    let segments = []
    while (stream.getHead() < buf.length) {
      const marker = stream.readInt16()
      if (marker === 0xffd8) { continue } // SOI
      if (marker === 0xffda) { break } // SOS Marker

      if (marker >= 0xff00 && marker <= 0xffff) {
        // Marker (FF-XX-HL-LL)
        const length = stream.readInt16()
        const end = stream.getHead() + length - 2
        segments.push([stream.getHead() - 4, end])
        stream.setHead(end)
      } else {
        throw new Error('Invalid marker: 0x' + marker.toString(16))
      }
    }

    this._stream.setHead(0)

    return segments
  }

  dispose () {
    this._buf = []
    this._exifBuffer = []
    this._segments = []
  }
}
