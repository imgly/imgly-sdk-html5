/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import EventEmitter from './event-emitter'
import Vector2 from './math/vector2'
import Color from './color'
import Utils from './utils'

export default class Configurable extends EventEmitter {
  constructor (options = {}, additionalAvailableOptions = {}) {
    super()
    this.availableOptions = this.availableOptions || {}
    this.availableOptions = Utils.extend(this.availableOptions, additionalAvailableOptions)

    this._initOptions(options)
  }

  /**
   * Builds an error message from the given string
   * @param  {String} message
   * @return {Error}
   * @private
   */
  _buildConfigError (message) {
    let errorMessage = ''
    if (this.constructor.name) {
      errorMessage = `${this.constructor.name}: `
    }
    errorMessage += message
    return new Error(errorMessage)
  }

  /**
   * Gets called when options have been changed
   * @private
   */
  _onOptionsChange () {

  }

  /**
   * Checks whether this Operation can be applied the way it is configured
   * @return {Promise}
   */
  validateSettings () {
    return new Promise((resolve, reject) => {
      // Check for required options
      for (let optionName in this.availableOptions) {
        let optionConfig = this.availableOptions[optionName]
        if (optionConfig.required && typeof this._options[optionName] === 'undefined') {
          return reject(
            this._buildConfigError(`Option \`${optionName}\` is required.`)
          )
        }
      }

      resolve()
    })
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
          self.setOption(optionName, value)
        }

        // Default getter
        self['get' + capitalized] = function () {
          return self.getOption(optionName)
        }
      }
      fn(optionName, option)

      // Set default if available
      if (typeof option.default !== 'undefined') {
        this['set' + capitalized](option.default)
      }

      // Handle configurable initialization
      if (option.type === 'configurable') {
        this._options[optionName] = new Configurable(null, option.structure)
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
    this.emit('update', this, options)

    for (let optionName in options) {
      this.setOption(optionName, options[optionName], false)
    }
  }

  /**
   * Returns the value for the given option
   * @param {String} optionName
   * @return {*}
   * @private
   */
  getOption (optionName) {
    return this._options[optionName]
  }

  /**
   * Returns the default value for the given option
   * @param  {String} optionName
   * @return {*}
   */
  getOptionDefault (optionName) {
    const option = this.availableOptions[optionName]
    if (!option) {
      return undefined
    }
    return option.default
  }

  /**
   * Check if the current options equal the given ones
   * @param  {Object} options
   * @return {Boolean}
   */
  optionsEqual (options) {
    for (let optionName in options) {
      const value = options[optionName]
      if (!this._optionEquals(optionName, value)) {
        return false
      }
    }
    return true
  }

  /**
   * Checks if the given option has the given value
   * @param  {String} optionName
   * @param  {*} value
   * @return {Boolean}
   * @private
   */
  _optionEquals (optionName, value) {
    const optionConfig = this.availableOptions[optionName]
    if (typeof optionConfig === 'undefined') return false
    
    const optionType = optionConfig.type
    const currentValue = this._options[optionName]
    switch (optionType) {
      case 'string':
      case 'number':
      case 'boolean':
      case 'object':
      case '*':
        return currentValue === value
      case 'vector2':
      case 'color':
        return value.equals(currentValue)
      case 'configurable':
        return value.optionsEqual(value)
      case 'array':
        return this._arrayOptionEquals(optionName, value)
    }
  }

  /**
   * Checks if the given option of type `array` matches the given value
   * @param  {String} optionName
   * @param  {Array} arr
   * @return {Boolean}
   */
  _arrayOptionEquals (optionName, arr) {
    let thisArr = this._options[optionName]
    let equal = true
    for (let i = 0; i < thisArr.length; i++) {
      const thisValue = thisArr[i]
      const value = arr[i]
      if (thisValue instanceof Configurable) {
        if (typeof value === 'undefined' || !thisValue.optionsEqual(value)) {
          equal = false
          break
        }
      } else if (value !== thisValue) {
        equal = false
        break
      }
    }
    return equal
  }

  /**
   * Returns a serialized version of this configurable
   * @return {Object}
   */
  serializeOptions () {
    let options = {}
    for (let optionName in this._options) {
      options[optionName] = this._serializeOption(optionName)
    }
    return options
  }

  /**
   * Returns a serialized version of the given option
   * @param {String} optionName
   * @return {*} optionName
   * @protected
   */
  _serializeOption (optionName) {
    const optionType = this.availableOptions[optionName].type
    const value = this._options[optionName]
    switch (optionType) {
      case 'string':
      case 'number':
      case 'boolean':
      case 'object':
      case '*':
        return value
      case 'vector2':
      case 'color':
        return value.clone()
      case 'configurable':
        return value.serializeOptions()
      case 'array':
        return value.slice(0)
    }
  }

  /**
   * Sets the value for the given option, validates it
   * @param {String} optionName
   * @param {*} value
   * @param {Boolean} update
   * @private
   */
  setOption (optionName, value, update=true) {
    if (update) {
      this.emit('update', this, { [optionName]: value })
    }

    var optionConfig = this.availableOptions[optionName]

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
          throw this._buildConfigError(`Option \`${optionName}\` has to be a string.`)
        }

        // String value restrictions
        var available = optionConfig.available
        if (typeof available !== 'undefined' && available.indexOf(value) === -1) {
          throw this._buildConfigError(`Invalid value for \`${optionName}\` (valid values are: ${optionConfig.available.join(', ')})`)
        }

        this._options[optionName] = value
        break

      // Number options
      case 'number':
        if (typeof value !== 'number') {
          throw this._buildConfigError(`Option \`${optionName}\` has to be a number.`)
        }

        this._options[optionName] = value
        break

      // Boolean options
      case 'boolean':
        if (typeof value !== 'boolean') {
          throw this._buildConfigError(`Option \`${optionName}\` has to be a boolean.`)
        }

        this._options[optionName] = value
        break

      // Vector2 options
      case 'vector2':
        if (!(value instanceof Vector2)) {
          throw this._buildConfigError(`Option \`${optionName}\` has to be an instance of Vector2.`)
        }

        this._options[optionName] = value.clone()

        break

      // Color options
      case 'color':
        if (!(value instanceof Color)) {
          throw this._buildConfigError(`Option \`${optionName}\` has to be an instance of Color.`)
        }

        this._options[optionName] = value
        break

      // Object options
      case 'object':
      case '*':
        this._options[optionName] = value
        break

      // Configurable options
      case 'configurable':
        this._options[optionName].set(value)
        break

      // Array options
      case 'array':
        if (!(value instanceof Array)) {
          throw this._buildConfigError(`Option \`${optionName}\` has to be an Array.`)
        }
        this._options[optionName] = value.slice(0)
        break
    }

    this._onOptionsChange()
    if (update) {
      this.emit('updated', this, { [optionName]: value })
    }
  }
}
