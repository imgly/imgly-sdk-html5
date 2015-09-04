/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

export default class ArrayStream {
  constructor (buf) {
    this._head = 0
    this._buf = buf
  }

  getHead () {
    return this._head
  }

  setHead (head) {
    this._head = head
  }

  peekInt8 () {
    return this._buf[this._head]
  }

  peekInt16 (littleEndian = false) {
    const a = this._buf[this._head]
    const b = this._buf[this._head + 1]
    if (!littleEndian) {
      return (a << 8) + b
    } else {
      return (b << 8) + a
    }
  }

  peekInt24 (littleEndian = false) {
    const a = this._buf[this._head]
    const b = this._buf[this._head + 1]
    const c = this._buf[this._head + 2]
    if (!littleEndian) {
      return (a << 16) + (b << 8) + c
    } else {
      return (c << 16) + (b << 8) + a
    }
  }

  peekInt32 (littleEndian = false) {
    const a = this._buf[this._head]
    const b = this._buf[this._head + 1]
    const c = this._buf[this._head + 2]
    const d = this._buf[this._head + 3]
    if (!littleEndian) {
      return (a << 32) + (b << 16) + (c << 8) + d
    } else {
      return (d << 32) + (c << 16) + (b << 8) + a
    }
  }

  writeInt16 (num) {
    this._buf[this._head] = num >> 8 // upper
    this._buf[this._head + 1] = num & 0xff // lower
  }

  readInt8 () {
    const num = this.peekInt8()
    this._head += 1
    return num
  }

  readInt16 (littleEndian = false) {
    const num = this.peekInt16(littleEndian)
    this._head += 2
    return num
  }

  readInt24 (littleEndian = false) {
    const num = this.peekInt24(littleEndian)
    this._head += 3
    return num
  }

  readInt32 (littleEndian = false) {
    const num = this.peekInt32(littleEndian)
    this._head += 4
    return num
  }

  readString (length) {
    let str = ''
    for (let i = 0; i < length; i++) {
      const character = this.readInt8()
      str += String.fromCharCode(character)
    }
    return str
  }
}
