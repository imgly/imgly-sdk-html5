/* global HTMLElement */
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
import Vector2 from './math/vector2'
import ClassList from './class-list'

/**
 * Provides utility functions for internal use
 * @class
 * @alias ImglyKit.Utils
 * @private
 */
class Utils {

  /**
   * Checks if the given object is an Array
   * @param  {Object}  object
   * @return {Boolean}
   */
  static isArray (object) {
    return Object.prototype.toString.call(object) === '[object Array]'
  }

  /**
   * Returns the items selected by the given selector
   * @param  {Array} items
   * @param  {ImglyKit~Selector} selector - The selector
   * @return {Array} The selected items
   */
  static select (items, selector=null) {
    if (selector === null) {
      return items
    }

    // Turn string parameter into an array
    if (typeof selector === 'string') {
      selector = selector.split(',').map(function (identifier) {
        return identifier.trim()
      })
    }

    // Turn array parameter into an object with `only`
    if (Utils.isArray(selector)) {
      selector = { only: selector }
    }

    if (typeof selector.only !== 'undefined') {
      if (typeof selector.only === 'string') {
        selector.only = selector.only.split(',').map(function (identifier) {
          return identifier.trim()
        })
      }

      // Select only the given identifiers
      return items.filter(function (item) {
        return selector.only.indexOf(item) !== -1
      })
    } else if (typeof selector.except !== 'undefined') {
      if (typeof selector.except === 'string') {
        selector.except = selector.except.split(',').map(function (identifier) {
          return identifier.trim()
        })
      }

      // Select all but the given identifiers
      return items.filter(function (item) {
        return selector.except.indexOf(item) === -1
      })
    }

    throw new Error('Utils#select failed to filter items.')
  }

  /**
   * Returns the given object's values as an array
   * @param {Object} object
   * @returns {Array<*>}
   */
  static values (object) {
    var values = []
    for (var key in object) {
      values.push(object[key])
    }
    return values
  }

  /**
   * Checks if the given object is a DOM element
   * @param  {Object}  o
   * @return {Boolean}
   */
  /* istanbul ignore next */
  static isDOMElement (o) {
    return (
      typeof HTMLElement === 'object' ? o instanceof HTMLElement :
      o && typeof o === 'object' && o !== null && o.nodeType === 1 && typeof o.nodeName === 'string'
    )
  }

  /**
   * Gets the x and y position for the given event.
   * @param {Event} e
   * @return {Vector2}
   */
  static getEventPosition (e) {
    let x = e.clientX
    let y = e.clientY
    if (e.type.indexOf('touch') !== -1) {
      x = e.touches[0].clientX
      y = e.touches[0].clientY
    }
    return new Vector2(x, y)
  }

  /**
   * Checks if th given event is a touch event
   * @param  {Event}  e
   * @return {Boolean}
   */
  static isTouchEvent (e) {
    return (e.type.indexOf('touch') !== -1)
  }

  /**
   * Resizes the given vector to fit inside the given max size while maintaining
   * the aspect ratio
   * @param  {Vector2} vector
   * @param  {Vector2} max
   * @return {Vector2}
   */
  static resizeVectorToFit (vector, max) {
    const scale = Math.min(max.x / vector.x, max.y / vector.y)
    const newSize = vector.clone()
      .multiply(scale)
    return newSize
  }

  /**
   * Assigns own enumerable properties of source object(s) to the destination
   * object for all destination properties that resolve to undefined. Once a
   * property is set, additional values of the same property are ignored.
   * @param  {Object} object
   * @param  {Object} ...sources
   * @return {Object}
   */
  static defaults (object, ...sources) {
    // Shallow clone
    let newObject = {}
    for (let key in object) {
      newObject[key] = object[key]
    }

    // Clone sources
    for (let i = 0; i < sources.length; i++) {
      const source = sources[i]
      for (let key in source) {
        if (typeof newObject[key] === 'undefined') {
          newObject[key] = source[key]
        }
      }
    }

    return newObject
  }

  /**
   * Assigns own enumerable properties of source object(s) to the destination
   * object. Subsequent sources overwrite property assignments of previous
   * sources.
   * @param {Object} object
   * @param {Object} ...sources
   * @return {Object}
   */
  static extend (object, ...sources) {
    // Shallow clone
    let newObject = {}
    for (let key in object) {
      newObject[key] = object[key]
    }

    // Extend sources
    for (let i = 0; i < sources.length; i++) {
      const source = sources[i]
      for (let key in source) {
        newObject[key] = source[key]
      }
    }

    return newObject
  }

  /**
   * Gets the property value at `path` of `object`
   * @param  {Object} object
   * @param  {String} key
   * @param  {?} [defaultValue]
   * @return {?}
   */
  static fetch (object, path, defaultValue) {
    // Replace indexes with property accessors
    path = path.replace(/\[(\w+)\]/g, '.$1')
    // Strip leading dot (when path begins with [0] for example)
    path = path.replace(/^\./, '')

    const pathSegments = path.split('.')
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i]
      object = object[segment]
      if (!object) {
        break
      }
    }

    if (typeof object === 'undefined') {
      object = defaultValue
    }

    return object
  }

  /**
   * Creates a Blob URI from the given Data URI
   * @param {String} data
   */
  static createBlobURIFromDataURI (data) {
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

  /**
   * Returns a `ClassList` instance for the given element
   * @param  {DOMElement} el
   * @return {ClassList}
   */
  static classList (el) {
    return new ClassList(el)
  }

  static requestAnimationFrame (cb) {
    const fallback = function (callback) {
      setTimeout(callback, 1000 / 60)
    }

    if (typeof window === 'undefined') {
      return fallback(cb)
    }

    return (window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            fallback)(cb)
  }
}

export default Utils
