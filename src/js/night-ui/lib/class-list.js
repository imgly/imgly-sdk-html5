/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

export default class ClassList {
  constructor (el) {
    this._el = el
  }

  add (className) {
    const classNames = this._el.className.split(' ')
    classNames.push(className)
    this._el.className = classNames.join(' ')
  }

  remove (className) {
    let classNames = this._el.className.split(' ')
    classNames = classNames.filter((cl) => cl !== className)
    this._el.className = classNames.join(' ')
  }
}
