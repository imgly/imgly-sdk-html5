/* global PhotoEditorSDK */
/*!
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import {
  SDKUtils, EventEmitter, Constants, Utils, RenderType, BaseComponent,
  React, ReactDOM, ReactBEM, SharedState
} from './globals'

import Helpers from './helpers'
import EditorComponent from './components/editor-component'
import OverviewControlsComponent from './components/controls/overview/overview-controls-component'
import ScrollbarComponent from './components/scrollbar-component'
import Exporter from './lib/exporter'
import ModalManager from './lib/modal-manager'

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

      // Then art operations
      'tableau',
      'street',

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
      'text',
      'watermark'
    ]

    this._handleRendererErrors()
    this._initOptions()
    this._initLanguage()
    this._initOperations()
    this._initControls()

    this.run()
  }

  /**
   * Main entry point for the UI
   * @private
   */
  run () {
    this._registerWebFonts()

    // Container has to be position: relative
    this._options.container.style.position = 'relative'

    this._render()

    if (this._options.watermark) {
      this.getOrCreateOperation('watermark', {
        image: this._options.watermark
      })
    }
  }

  /**
   * Handles error events emitted by the renderer
   * @private
   */
  _handleRendererErrors () {
    this._kit.on('error', (e) => {
      ModalManager.instance.displayError(
        this.translate(`errors.${e}.title`),
        this.translate(`errors.${e}.text`)
      )
    })
  }

  /**
   * Renders the UI
   * @private
   */
  _render () {
    const component = (<EditorComponent
      ui={this}
      kit={this._kit}
      mediator={this._mediator}
      operationsStack={this._operationsStack}
      options={this._options} />)

    if (this._options.renderReturnsComponent) {
      return component
    } else {
      ReactDOM.render(component, this._options.container)
    }
  }

  /**
   * Exports an image
   * @param {Boolean} download = false
   * @return {Promise}
   */
  export (download = false) {
    const options = this._options.export
    const exporter = new Exporter(this._kit, options, download)
    return exporter.export()
      .then((output) => {
        this.emit('export', output)
        return output
      })
  }

  // -------------------------------------------------------------------------- INITIALIZATION

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
      focus: require('./components/controls/focus/'),
      frames: require('./components/controls/frames/'),
      stickers: require('./components/controls/stickers/'),
      text: require('./components/controls/text/'),
      art: require('./components/controls/art/')
    }, this._options.additionalControls)

    this._selectedControls = []
    for (let identifier in this._availableControls) {
      const controls = this._availableControls[identifier]
      if (!controls.isSelectable || controls.isSelectable(this)) {
        this._selectedControls.push(controls)
      }
    }
    this._selectedControls.sort((a, b) => {
      let sortA = this._options.controlsOrder.indexOf(a.identifier)
      let sortB = this._options.controlsOrder.indexOf(b.identifier)
      if (sortA === -1) sortA = this._selectedControls.length
      if (sortB === -1) sortB = this._selectedControls.length
      return sortB < sortA ? 1 : -1
    })
  }

  /**
   * Initializes the default options
   * @private
   */
  _initOptions () {
    this._options = SDKUtils.defaults(this._options, {
      language: 'en',
      operations: 'all',
      title: 'PhotoEditor SDK',
      maxMegaPixels: 10,
      responsive: false,
      webcam: true,
      assets: {},
      extensions: {},
      controlsOrder: [
        'filters', 'orientation', 'adjustments', 'crop', 'focus', 'frames', 'stickers', 'text'
      ],
      controlsOptions: {},
      showNewButton: true
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

    this._options.export = SDKUtils.defaults(this._options.export || {}, {
      showButton: true,
      format: 'image/png',
      type: RenderType.IMAGE,
      download: true
    })
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

  // -------------------------------------------------------------------------- I18N

  /**
   * Initializes the internationalization
   * @private
   */
  _initLanguage () {
    this._languages = {
      de: require('./lang/de.json'),
      en: require('./lang/en.json')
    }
    this._language = this._languages[this._options.language]
  }

  /**
   * Returns the translation for `key`
   * @param  {String} key
   * @param  {Object} [interpolationOptions]
   * @return {String}
   */
  translate (key, interpolationOptions) {
    return Utils.translate(this._language, key, interpolationOptions)
  }

  // -------------------------------------------------------------------------- PUBLIC OPERATIONS API

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
      operation.on('updated', () => {
        this._mediator.emit(Constants.EVENTS.OPERATION_UPDATED, operation)
      })
      const index = this._preferredOperationOrder.indexOf(identifier)
      this._operationsStack.set(index, operation)
      this._operationsMap[identifier] = operation
      return operation
    }
  }

  /**
   * Removes the given operation from the stack
   * @param  {Operation} operation
   */
  removeOperation (operation) {
    let removedOperationIndex = null
    const identifier = operation.constructor.identifier
    const stack = this._operationsStack.getStack()

    if (this._operationsMap[identifier]) {
      for (let i = 0; i < stack.length; i++) {
        const operation = stack[i]
        if (operation &&
            operation.constructor.identifier === identifier) {
          this._operationsStack.removeAt(i)
          delete this._operationsMap[identifier]
          removedOperationIndex = i
          break
        }
      }
    }

    // Set all following operations to dirty, since they might
    // have cached stuff drawn by the removed operation
    if (removedOperationIndex !== null) {
      for (let i = removedOperationIndex + 1; i < stack.length; i++) {
        const operation = stack[i]
        if (!operation) continue
        operation.setDirty(true)
      }
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

  /**
   * Checks whether the operation with the given identifier is selected
   * @param  {String}  name
   * @return {Boolean}
   */
  isOperationSelected (name) {
    return this._selectedOperations.indexOf(name) !== -1
  }

  getSelectedOperations () { return this._selectedOperations }
  getSelectedControls () { return this._selectedControls }
  getAvailableControls () { return this._availableControls }
  getHelpers () { return this._helpers }

  /**
   * Checks whether the kit has an image
   * @return {Boolean}
   */
  hasImage () { return this._kit.hasImage() }

  /**
   * Returns the resolved asset path for the given asset name
   * @param  {String} asset
   * @return {String}
   */
  getAssetPath (asset) {
    const { baseUrl, resolver } = this._options.assets
    let path = `${baseUrl}/${asset}`
    if (typeof resolver !== 'undefined' && resolver !== null) {
      path = resolver(path)
    }
    return path
  }
}

/**
 * A unique string that represents this UI
 * @type {String}
 */
NightReactUI.prototype.identifier = 'night-react'

// Export extendable stuff
NightReactUI.BaseComponent = BaseComponent
NightReactUI.React = React
NightReactUI.ReactBEM = ReactBEM
NightReactUI.SharedState = SharedState
NightReactUI.Constants = Constants
NightReactUI.Utils = Utils
NightReactUI.ScrollbarComponent = ScrollbarComponent
NightReactUI.ModalManager = ModalManager

NightReactUI.Component = class extends React.Component {
  constructor (...args) {
    super(...args)

    this._kit = new PhotoEditorSDK.Renderer('webgl', {
      image: this.props.image
    })

    this._ui = new NightReactUI(this._kit, this.props)
  }

  /**
   * Renders this component
   * @return {React.Component}
   */
  render () {
    return this._ui.render()
  }
}

// Extend PhotoEditorSDK object
PhotoEditorSDK.UI = PhotoEditorSDK.UI || {}
PhotoEditorSDK.UI.NightReact = NightReactUI
