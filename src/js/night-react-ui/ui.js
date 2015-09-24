/* global PhotoEditorSDK */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { SDKUtils, EventEmitter, Constants } from './globals'

import Polyglot from 'node-polyglot'
import Helpers from './helpers'
import React from 'react'
import EditorComponent from './components/editor-component'
import OverviewControlsComponent from './components/controls/overview/overview-controls-component'

export default class NightReactUI extends EventEmitter {
  constructor (kit, options) {
    super()

    this._mediator = new EventEmitter()
    this._kit = kit
    this._options = options
    this._helpers = new Helpers(this._kit, this._options)
    this._operationsMap = {}
    this._operationsStack = this._kit.operationsStack

    this._preferredOperationOrder = [
      // First, all operations that affect the image dimensions
      'rotation',
      'crop',
      'flip',

      // Then color operations (first filters, then fine-tuning)
      'filters',
      'contrast',
      'brightness',
      'saturation',

      // Then post-processing
      'radial-blur',
      'tilt-shift',
      'frames',
      'stickers',
      'text'
    ]

    this._initOptions()
    this._initLanguage()
    this._initOperations()
    this._initControls()
  }

  /**
   * Checks whether the operation with the given identifier is selected
   * @param  {String}  name
   * @return {Boolean}
   */
  isOperationSelected (name) {
    return this._selectedOperations.indexOf(name) !== -1
  }

  /**
   * Initializes the available and selected controls
   * @private
   */
  _initOperations () {
    this._availableOperations = this._kit.getOperations()
    this._selectedOperations = []

    let operationIdentifiers = this._options.operations
    if (!(operationIdentifiers instanceof Array)) {
      operationIdentifiers = operationIdentifiers
        .replace(/\s+?/ig, '')
        .split(',')
    }

    for (let identifier in this._availableOperations) {
      if (this._options.operations === 'all' ||
          operationIdentifiers.indexOf(identifier) !== -1) {
        this._selectedOperations.push(identifier)
      }
    }
  }

  /**
   * Initializes the available and selected controls
   * @private
   */
  _initControls () {
    this._overviewControls = OverviewControlsComponent
    this._availableControls = SDKUtils.extend({
      filters: require('./components/controls/filters/'),
      orientation: require('./components/controls/orientation/'),
      adjustments: require('./components/controls/adjustments/'),
      crop: require('./components/controls/crop/'),
      blur: require('./components/controls/blur/'),
      frames: require('./components/controls/frames/'),
      stickers: require('./components/controls/stickers/'),
      text: require('./components/controls/text/')
    }, this._options.additionalControls)

    this._selectedControls = []
    for (let identifier in this._availableControls) {
      const controls = this._availableControls[identifier]
      if (controls.isSelectable(this)) {
        this._selectedControls.push(controls)
      }
    }
  }

  /**
   * Initializes the internationalization
   * @private
   */
  _initLanguage () {
    this._languages = {
      de: require('./lang/de.json'),
      en: require('./lang/en.json')
    }
    this._language = new Polyglot({
      locale: this._options.language,
      phrases: this._languages[this._options.language]
    })
  }

  /**
   * Initializes the default options
   * @return {[type]} [description]
   */
  _initOptions () {
    this._options = SDKUtils.defaults(this._options, {
      language: 'en',
      operations: 'all',
      assets: {},
      extensions: {}
    })

    this._options.extensions = SDKUtils.defaults(this._options.extensions || {}, {
      languages: [],
      operations: [],
      controls: []
    })

    this._options.assets = SDKUtils.defaults(this._options.assets || {}, {
      baseUrl: '/',
      resolver: null
    })
  }

  /**
   * Checks whether the kit has an image
   * @return {Boolean}
   */
  hasImage () {
    return this._kit.hasImage()
  }

  /**
   * A unique string that represents this UI
   * @type {String}
   */
  get identifier () {
    return 'night-react'
  }

  /**
   * Creates a <style> block in <head> that specifies the web fonts
   * that we use in this UI. We're doing this in JS because the assets
   * path is dynamic.
   * @private
   */
  _registerWebFonts () {
    const regularFontPath = this._helpers.assetPath('fonts/montserrat-regular.woff', true)
    const lightFontPath = this._helpers.assetPath('fonts/montserrat-light.woff', true)

    const css = `
      // Injected by PhotoEditorSDK
      @font-face {
        font-family: "__pesdk_Montserrat";
        src: url('${regularFontPath}') format('woff');
        font-weight: normal;
        font-style: normal;
      }

      @font-face {
        font-family: "__pesdk_Montserrat";
        src: url('${lightFontPath}') format('woff');
        font-weight: 100;
        font-style: normal;
      }
    `

    const style = document.createElement('style')
    style.innerHTML = css

    const head = document.getElementsByTagName('head')[0]
    head.appendChild(style)
  }

  /**
   * Main entry point for the UI
   * @private
   */
  run () {
    this._registerWebFonts()

    // Container has to be position: relative
    this._options.container.style.position = 'relative'

    return React.render(<EditorComponent
      ui={this}
      kit={this._kit}
      mediator={this._mediator}
      operationsStack={this._operationsStack}
      options={this._options} />, this._options.container)
  }

  /**
   * Returns the translation for `key`
   * @param  {String} key
   * @param  {Object} [interpolationOptions]
   * @return {String}
   */
  translate (key, interpolationOptions) {
    return this._language.t(key, interpolationOptions)
  }

  /**
   * If the operation with the given identifier already exists, it returns
   * the existing operation. Otherwise, it creates and returns a new one.
   * @param  {String} identifier
   * @param  {Object} options
   * @return {PhotoEditorSDK.Operation}
   */
  getOrCreateOperation (identifier, options = {}) {
    if (this._operationsMap[identifier]) {
      return this._operationsMap[identifier]
    } else {
      const Operation = this._availableOperations[identifier]
      const operation = new Operation(this._kit, options)
      operation.on('update', () => {
        this._mediator.emit(Constants.EVENTS.OPERATION_UPDATED, operation)
      })
      const index = this._preferredOperationOrder.indexOf(identifier)
      this._operationsStack.set(index, operation)
      this._operationsMap[identifier] = operation
      return operation
    }
  }

  /**
   * Returns the operation with the given identifier
   * @param  {String} identifier
   * @return {PhotoEditorSDK.Operation}
   */
  getOperation (identifier) {
    return this._operationsMap[identifier]
  }

  /**
   * Checks whether an operation with the given identifier exists
   * @param {String} identifier
   * @return {Boolean}
   */
  operationExists (identifier) {
    return !!this._operationsMap[identifier]
  }

  getSelectedOperations () { return this._selectedOperations }
  getSelectedControls () { return this._selectedControls }
  getHelpers () { return this._helpers }
}

PhotoEditorSDK.UI = PhotoEditorSDK.UI || {}
PhotoEditorSDK.UI.NightReact = NightReactUI
