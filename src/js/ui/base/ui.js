/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */
import Utils from '../../lib/utils'
import EventEmitter from '../../lib/event-emitter'
import Helpers from './helpers'

class BaseUI extends EventEmitter {
  constructor (kit, options) {
    super()

    this._kit = kit
    this._options = options
    this._options.ui = this._options.ui || {}
    this._operations = []
    this._helpers = new Helpers(this.kit, this, options)
    this._languages = {}
    this.selectOperations(null)
  }

  /**
   * Prepares the UI for use
   */
  run () {
    this._attach()
  }

  /**
   * Registers a language
   * @param  {String} identifier
   * @param  {Object} object
   */
  registerLanguage (identifier, object) {
    this._languages[identifier] = object
  }

  /**
   * Returns the translation for `key`
   * @param  {String} key
   * @param  {Array.<String>} args
   * @return {String}
   */
  translate (key, ...args) {
    let str = Utils.fetch(this._language, key, 'translation-missing')
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      str = str.replace(`$${i + 1}`, arg)
    }
    return str
  }

  /**
   * A unique string that represents this UI
   * @type {String}
   */
  get identifier () {
    return null
  }

  /**
   * Renders and attaches the UI HTML
   * @private
   */
  _attach () {
    if (this._options.container === null) {
      throw new Error('BaseUI#attach: No container set.')
    }

    let html = this._render()
    this._options.container.innerHTML = html

    // Container has to be position: relative
    this._options.container.style.position = 'relative'
  }

  /**
   * Renders the template
   * @private
   */
  _render () {
    if (typeof this._template === 'undefined') {
      throw new Error('BaseUI#_render: No template set.')
    }

    return this._template(this.context)
  }

  /**
   * Selects the enabled operations
   * @param {ImglyKit.Selector}
   */
  selectOperations (selector) {
    let { registeredOperations } = this._kit
    let operationIdentifiers = Object.keys(registeredOperations)

    let selectedOperations = Utils.select(operationIdentifiers, selector)
    this._operations = selectedOperations.map((identifier) => {
      return registeredOperations[identifier]
    })
  }

  /**
   * Adds the given operation to the available operations
   * @param {Operation} operation
   */
  addOperation (operation) {
    this._operations.push(operation)
  }

  /**
   * Checks whether the operation with the given identifier is selected
   * @param {String} identifier
   * @returns {Boolean}
   */
  isOperationSelected (identifier) {
    let operationIdentifiers = this._operations.map((operation) => {
      return operation.prototype.identifier
    })
    return operationIdentifiers.indexOf(identifier) !== -1
  }

  /**
   * The data that is passed to the template renderer
   * @type {Object}
   */
  get context () {
    return {
      operations: this._operations,
      helpers: this._helpers,
      options: this._options
    }
  }

  /**
   * The DOM container
   * @type {DOMElement}
   */
  get container () {
    return this._options.container
  }

  /**
   * The selected / active operations
   * @type {Array.<ImglyKit.Operation>}
   */
  get operations () {
    return this._operations
  }

  /**
   * The options
   * @type {Object}
   */
  get options () {
    return this._options
  }

  /**
   * The canvas object
   * @type {Canvas}
   */
  get canvas () {
    return this._canvas
  }

  /**
   * The helpers
   * @type {Helpers}
   */
  get helpers () {
    return this._helpers
  }

  /**
   * The image
   * @type {Image}
   */
  get image () {
    return this._options.image
  }
}

export default BaseUI
