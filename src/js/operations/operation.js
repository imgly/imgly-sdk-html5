/* jshint unused:false */
/* jshint -W083 */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Vector2 from '../lib/math/vector2'
import Color from '../lib/color'
import Utils from '../lib/utils'
import EventEmitter from '../lib/event-emitter'
import Promise from '../vendor/promise'

/**
 * Base class for Operations. Extendable via {@link ImglyKit.Operation#extend}.
 * @class
 * @alias ImglyKit.Operation
 */
class Operation extends EventEmitter {
  constructor (kit, options) {
    super()

    this._kit = kit
    this.availableOptions = Utils.extend(this.availableOptions || {}, {
      numberFormat: { type: 'string', default: 'relative', available: ['absolute', 'relative'] }
    })
    this._dirty = true

    this._glslPrograms = {}
    this._uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = Math.random() * 16 | 0
      let v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })

    this._initOptions(options || {})
  }

  /**
   * Checks whether this Operation can be applied the way it is configured
   * @return {Promise}
   */
  validateSettings () {
    let identifier = this.identifier
    return new Promise((resolve, reject) => {
      // Check for required options
      for (let optionName in this.availableOptions) {
        let optionConfig = this.availableOptions[optionName]
        if (optionConfig.required && typeof this._options[optionName] === 'undefined') {
          return reject(new Error('Operation `' + identifier + '`: Option `' + optionName + '` is required.'))
        }
      }

      resolve()
    })
  }

  /**
   * Applies this operation
   * @param  {Renderer} renderer
   * @return {Promise}
   * @abstract
   */
  render (renderer) {
    let renderFn
    if (renderer.identifier === 'webgl') {
      /* istanbul ignore next */
      renderFn = this._renderWebGL.bind(this)
    } else {
      renderFn = this._renderCanvas.bind(this)
    }

    // Handle caching
    if (this._dirty) {
      renderFn(renderer)
      renderer.cache(this._uuid)
      this._dirty = false
    } else {
      renderer.drawCached(this._uuid)
    }
  }

  /**
   * Applies this operation using WebGL
   * @return {WebGLRenderer} renderer
   * @private
   */
  /* istanbul ignore next */
  _renderWebGL () {
    throw new Error('Operation#_renderWebGL is abstract and not implemented in inherited class.')
  }

  /**
   * Applies this operation using Canvas2D
   * @return {CanvasRenderer} renderer
   * @private
   */
  _renderCanvas () {
    throw new Error('Operation#_renderCanvas is abstract and not implemented in inherited class.')
  }

  /**
   * Goes through the available options, sets _options defaults
   * @param {Object} userOptions
   * @private
   */
  _initOptions (userOptions) {
    this._options = {}

    // Set defaults, create getters and setters
    var optionName, option, capitalized
    var self = this
    for (optionName in this.availableOptions) {
      capitalized = optionName.charAt(0).toUpperCase() + optionName.slice(1)
      option = this.availableOptions[optionName]

      // Create setter and getter
      let fn = function (optionName, option) {
        self['set' + capitalized] = function (value) {
          self._setOption(optionName, value)
        }

        // Default getter
        self['get' + capitalized] = function () {
          return self._getOption(optionName)
        }
      }
      fn(optionName, option)

      // Set default if available
      if (typeof option.default !== 'undefined') {
        this['set' + capitalized](option.default)
      }
    }

    // Overwrite options with the ones given by user
    for (optionName in userOptions) {
      // Check if option is available
      if (typeof this.availableOptions[optionName] === 'undefined') {
        throw new Error('Invalid option: ' + optionName)
      }

      // Call setter
      capitalized = optionName.charAt(0).toUpperCase() + optionName.slice(1)
      this['set' + capitalized](userOptions[optionName])
    }
  }

  /**
   * Sets the given options
   * @param {Object} options
   */
  set (options) {
    for (let optionName in options) {
      this._setOption(optionName, options[optionName], false)
    }

    this.emit('update')
  }

  /**
   * Returns the value for the given option
   * @param {String} optionName
   * @return {*}
   * @private
   */
  _getOption (optionName) {
    return this._options[optionName]
  }

  /**
   * Sets the value for the given option, validates it
   * @param {String} optionName
   * @param {*} value
   * @param {Boolean} update
   * @private
   */
  _setOption (optionName, value, update=true) {
    var optionConfig = this.availableOptions[optionName]
    var identifier = this.identifier

    if (typeof optionConfig.setter !== 'undefined') {
      value = optionConfig.setter.call(this, value)
    }

    if (typeof optionConfig.validation !== 'undefined') {
      optionConfig.validation(value)
    }

    switch (optionConfig.type) {
      // String options
      case 'string':
        if (typeof value !== 'string') {
          throw new Error('Operation `' + identifier + '`: Option `' + optionName + '` has to be a string.')
        }

        // String value restrictions
        var available = optionConfig.available
        if (typeof available !== 'undefined' && available.indexOf(value) === -1) {
          throw new Error('Operation `' + identifier + '`: Invalid value for `' + optionName + '` (valid values are: ' + optionConfig.available.join(', ') + ')')
        }

        this._options[optionName] = value
        break

      // Number options
      case 'number':
        if (typeof value !== 'number') {
          throw new Error('Operation `' + identifier + '`: Option `' + optionName + '` has to be a number.')
        }

        this._options[optionName] = value
        break

      // Boolean options
      case 'boolean':
        if (typeof value !== 'boolean') {
          throw new Error('Operation `' + identifier + '`: Option `' + optionName + '` has to be a boolean.')
        }

        this._options[optionName] = value
        break

      // Vector2 options
      case 'vector2':
        if (!(value instanceof Vector2)) {
          throw new Error('Operation `' + identifier + '`: Option `' + optionName + '` has to be an instance of ImglyKit.Vector2.')
        }

        this._options[optionName] = value.clone()

        break

      // Color options
      case 'color':
        if (!(value instanceof Color)) {
          throw new Error('Operation `' + identifier + '`: Option `' + optionName + '` has to be an instance of ImglyKit.Color.')
        }

        this._options[optionName] = value
        break

      // Object options
      case 'object':
        this._options[optionName] = value
        break

      // Array options
      case 'array':
        this._options[optionName] = value.slice(0)
        break
    }

    this._dirty = true
    if (update) {
      this.emit('update')
    }
  }

  /**
   * Gets the new dimensions
   * @param {Renderer} renderer
   * @param {Vector2} [dimensions]
   * @return {Vector2}
   * @private
   */
  getNewDimensions (renderer, dimensions) {
    let canvas = renderer.getCanvas()
    dimensions = dimensions || new Vector2(canvas.width, canvas.height)

    return dimensions
  }

  /**
   * Gets called when this operation has been marked as dirty
   * @protected
   */
  _onDirty () {

  }

  /**
   * Resets this operation
   */
  reset () {
    this._dirty = true
    this._glslPrograms = {}
  }

  /**
   * Sets this operation to dirty, so that it will re-render next time
   * @param {Boolean} dirty = true
   */
  set dirty (dirty) {
    this._dirty = dirty
    this._onDirty && this._onDirty()
  }

  /**
   * Returns the dirty state
   * @type {Boolean}
   */
  get dirty () {
    return this._dirty
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
Operation.prototype.identifier = null

/**
 * To create an {@link ImglyKit.Operation} class of your own, call this
 * method and provide instance properties and functions.
 * @function
 */
import extend from '../lib/extend'
Operation.extend = extend

export default Operation
