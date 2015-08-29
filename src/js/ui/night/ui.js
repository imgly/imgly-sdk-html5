/* global FileReader, Image, __DOTJS_TEMPLATE */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import _ from 'lodash'
import UI from '../base/ui'
import Canvas from './lib/canvas'
import FileLoader from './lib/file-loader'
import TopControls from './lib/top-controls'
import Scrollbar from './lib/scrollbar'
import { RenderType, ImageFormat } from '../../constants'

class NightUI extends UI {
  constructor (...args) {
    super(...args)

    this._operationsMap = {}
    this._template = __DOTJS_TEMPLATE('../../templates/night/template.jst')
    this._registeredControls = {}
    this._history = []

    // The `Night` UI has a fixed operation order
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

    this._paused = false

    this._options.ui = _.defaults(this._options.ui, {
      showNewButton: !this._options.image,
      showHeader: true,
      showCloseButton: false,
      showExportButton: false,
      export: {}
    })

    this._options.ui.export = _.defaults(this._options.ui.export, {
      type: ImageFormat.JPEG,
      quality: 0.8
    })
  }

  /**
   * A unique string that represents this UI
   * @type {String}
   */
  get identifier () {
    return 'night'
  }

  /**
   * Prepares the UI for use
   */
  run () {
    this._registerControls()

    super.run()

    let { container } = this._options

    this._controlsContainer = container.querySelector('.imglykit-controls')
    this._canvasControlsContainer = container.querySelector('.imglykit-canvas-controls')
    this._overviewControlsContainer = container.querySelector('.imglykit-controls-overview')
    this._loadingOverlay = container.querySelector('.imglykit-loadingOverlay')
    this._loadingSpan = container.querySelector('.imglykit-loadingOverlay span')

    this._handleOverview()

    if (this._options.image) {
      this._initCanvas()
    }

    if (this.context.renderSplashScreen) {
      this._initFileLoader()
    }

    this._initTopControls()
    this._initControls()

    if (this._options.image) {
      this.showZoom()
    }

    if (this._options.ui.showCloseButton) {
      this._handleCloseButton()
    }

    if (this._topControls) {
      this._topControls.updateExportButton()
    }
  }

  /**
   * Initializes the file loader
   * @private
   */
  _initFileLoader () {
    this._fileLoader = new FileLoader(this._kit, this)
    this._fileLoader.on('file', this._onFileLoaded.bind(this))
  }

  /**
   * Gets called when the user loaded a file using the FileLoader
   * @param {File} file
   * @private
   */
  _onFileLoaded (file) {
    let reader = new FileReader()
    reader.onload = (() => {
      return (e) => {
        let data = e.target.result
        let image = new Image()

        image.addEventListener('load', () => {
          this._setImage(image)
        })

        image.src = data
      }
    })(file)
    reader.readAsDataURL(file)
  }

  /**
   * Sets the image option and starts rendering
   * @param {Image} image
   * @private
   */
  _setImage (image) {
    this._options.image = image
    this.run()
  }

  /**
   * Initializes the top controls
   * @private
   */
  _initTopControls () {
    if (!this.context.renderControls) return

    this._topControls = new TopControls(this._kit, this)
    this._topControls.run()

    this._topControls.on('undo', () => {
      this.undo()
    })

    this._topControls.on('export', () => {
      this.export()
    })

    // Pass zoom in event
    this._topControls.on('zoom-in', () => {
      this._canvas.zoomIn()
        .then(() => {
          if (this._currentControl) {
            this._currentControl.onZoom()
          }
        })
    })

    // Pass zoom out event
    this._topControls.on('zoom-out', () => {
      this._canvas.zoomOut()
        .then(() => {
          if (this._currentControl) {
            this._currentControl.onZoom()
          }
        })
    })
  }

  /**
   * Inititializes the canvas
   * @private
   */
  _initCanvas () {
    this._canvas = new Canvas(this._kit, this, this._options)
    this._canvas.run()
    this._canvas.on('zoom', () => {
      this._topControls.updateZoomLevel()
    })
  }

  /**
   * Selects the enabled operations
   * @param {ImglyKit.Selector}
   */
  selectOperations (selector) {
    super.selectOperations(selector)
  }

  /**
   * Returns or creates an instance of the operation with the given identifier
   * @param {String} identifier
   */
  getOrCreateOperation (identifier) {
    let { operationsStack, registeredOperations } = this._kit
    let Operation = registeredOperations[identifier]

    if (typeof this._operationsMap[identifier] === 'undefined') {
      // Create operation
      let operationInstance = new Operation(this._kit)
      this._operationsMap[identifier] = operationInstance

      // Find index in preferred operation order
      let index = this._preferredOperationOrder.indexOf(identifier)
      if (index === -1) {
        index = this._preferredOperationOrder.length
      }
      operationsStack[index] = operationInstance

      return operationInstance
    } else {
      return this._operationsMap[identifier]
    }
  }

  /**
   * Removes the operation with the given identifier from the stack
   * @param {String} identifier
   */
  removeOperation (identifier) {
    if (!this._operationsMap[identifier]) return

    let operation = this._operationsMap[identifier]
    delete this._operationsMap[identifier]

    let index = this._kit.operationsStack.indexOf(operation)
    this._kit.operationsStack.splice(index, 1)
  }

  /**
   * Registers all default operation controls
   * @private
   */
  _registerControls () {
    this.registerControl('filters', 'filters', require('./controls/filters-control'))
    this.registerControl('rotation', 'rotation', require('./controls/rotation-control'))
    this.registerControl('flip', 'flip', require('./controls/flip-control'))
    this.registerControl('brightness', 'brightness', require('./controls/brightness-control'))
    this.registerControl('contrast', 'contrast', require('./controls/contrast-control'))
    this.registerControl('saturation', 'saturation', require('./controls/saturation-control'))
    this.registerControl('crop', 'crop', require('./controls/crop-control'))
    this.registerControl('radial-blur', 'radial-blur', require('./controls/radial-blur-control'))
    this.registerControl('tilt-shift', 'tilt-shift', require('./controls/tilt-shift-control'))
    this.registerControl('frames', 'frames', require('./controls/frames-control'))
    this.registerControl('stickers', 'stickers', require('./controls/stickers-control'))
    this.registerControl('text', 'text', require('./controls/text-control'))
  }

  /**
   * Handles the overview button click events
   * @private
   */
  _handleOverview () {
    if (!this.context.renderControls) return

    let itemsList = this._overviewControlsContainer.querySelector('ul')
    if (!itemsList.parentNode === this._overviewControlsContainer) { return }
    let listItems = [].filter.call(itemsList.querySelectorAll('li'),
      (el) => el.parentNode === itemsList)

    // Add click events to all items
    for (let i = 0; i < listItems.length; i++) {
      let listItem = listItems[i]
      let { identifier } = listItem.dataset
      listItem.addEventListener('click', () => {
        this.switchToControl(identifier)
      })
    }
  }

  /**
   * Enables the overview controls
   * @private
   */
  _enableControls () {
    let itemsList = this._overviewControlsContainer.querySelector('ul')
    if (!itemsList.parentNode === this._overviewControlsContainer) { return }
    let listItems = [].filter.call(itemsList.querySelectorAll('li'),
      (el) => el.parentNode === itemsList)

    // Add click events to all items
    for (let i = 0; i < listItems.length; i++) {
      let listItem = listItems[i]
      listItem.removeAttribute('data-disabled')
    }
  }

  /**
   * Gets called when an overview button has been clicked
   * @private
   */
  switchToControl (identifier) {
    if (this.context.controlsDisabled) return
    this._overviewControlsContainer.style.display = 'none'

    this._scrollbar.remove()

    if (this._currentControl) {
      this._currentControl.leave()
    }

    this._currentControl = this._registeredControls[identifier]
    this._currentControl.enter()
    this._currentControl.once('back', this._switchToOverview.bind(this))
  }

  /**
   * Switches back to the overview controls
   * @private
   */
  _switchToOverview () {
    if (this._currentControl) {
      this._currentControl.leave()
    }

    this._currentControl = null
    this._overviewControlsContainer.style.display = ''

    this._initScrollbar()
  }

  /**
   * Registers the controls for an operation
   * @param {String} identifier
   * @param {String} operationIdentifier
   * @param {Control} ControlClass
   */
  registerControl (identifier, operationIdentifier, ControlClass) {
    if (!this.isOperationSelected(operationIdentifier)) return

    let instance = new ControlClass(this._kit, this)
    this._registeredControls[identifier] = instance
  }

  /**
   * Initializes the registered controls
   * @private
   */
  _initControls () {
    for (let identifier in this._registeredControls) {
      let control = this._registeredControls[identifier]
      control.setContainers(this._controlsContainer, this._canvasControlsContainer)
      control.init()
    }

    this._initScrollbar()
  }

  /**
   * Initializes the custom scrollbar
   * @private
   */
  _initScrollbar () {
    if (!this.context.renderControls) return

    let container = this._controlsContainer.querySelector('.imglykit-controls-list').parentNode
    this._scrollbar = new Scrollbar(container)
  }

  /**
   * Handles the click event on the close button, emits a `close` event
   * when clicking
   * @private
   */
  _handleCloseButton () {
    let closeButton = this._options.container.querySelector('.imglykit-close-button')
    closeButton.addEventListener('click', (e) => {
      e.preventDefault()
      this.emit('close')
    })
  }

  /**
   * Re-renders the canvas
   */
  render () {
    if (this._canvas) {
      this._canvas.render()
    }
  }

  /**
   * An object containing all active operations
   * @type {Object.<String,Operation>}
   */
  get operations () {
    return this._operationsMap
  }

  /**
   * An object containing all registered controls
   * @type {Object.<String,Control>}
   */
  get controls () {
    return this._registeredControls
  }

  /**
   * The data that is passed to the template renderer
   * @type {Object}
   */
  get context () {
    let context = super.context
    context.controls = this._registeredControls
    context.renderSplashScreen = !this._options.image
    context.renderControls = !!this._options.image
    return context
  }

  /**
   * Pauses the UI. Operation updates will not cause a re-rendering
   * of the canvas.
   */
  pause () {
    this._paused = true
  }

  /**
   * Resumes the UI and re-renders the canvas
   * @param {Boolean} rerender = true
   */
  resume (rerender=true) {
    this._paused = false
    if (rerender) {
      this.render()
    }
  }

  /**
   * Adds the given operation and options to the history stack
   * @param {Operation} operation
   * @param {Object.<String, *>} options
   * @param {Boolean} existent
   */
  addHistory (operation, options, existent) {
    this._history.push({ operation, options, existent })
    this._topControls.updateUndoButton()
  }

  /**
   * Hides the zoom control
   */
  hideZoom () {
    this._topControls.hideZoom()
  }

  /**
   * Hides the zoom control
   */
  showZoom () {
    this._topControls.showZoom()
  }

  /**
   * Takes the last history item and applies its options
   */
  undo () {
    let lastItem = this._history.pop()
    if (lastItem) {
      let { operation, existent, options } = lastItem
      if (!existent) {
        this.removeOperation(operation.identifier)
      } else {
        operation = this.getOrCreateOperation(operation.identifier)
        operation.set(options)
      }
      this.canvas.zoomToFit(true)
    }
    this._topControls.updateUndoButton()
  }

  /**
   * Exports the current image with the default settings
   */
  export () {
    this.displayLoadingMessage('Exporting...')

    let renderType = RenderType.DATAURL

    // Check if msToBlob is available
    let canvas = document.createElement('canvas')
    if (typeof canvas.msToBlob !== 'undefined') {
      renderType = RenderType.MSBLOB
    }

    setTimeout(() => {
      this._kit.render(renderType,
        this._options.ui.export.type,
        this._options.ui.export.dimensions,
        this._options.ui.export.quality)
        .then((data) => {
          switch (renderType) {
            case RenderType.DATAURL:
              let link = document.createElement('a')
              let extension = this._options.ui.export.type.split('/').pop()
              link.download = `imglykit-export.${extension}`

              link.href = data
              document.body.appendChild(link)
              link.click()
              // Cleanup the DOM
              document.body.removeChild(link)
              break
            case RenderType.MSBLOB:
              navigator.msSaveBlob(data, 'imglykit-export.png')
              break
          }

          this.hideLoadingMessage()
        })
    }, 1000)
  }

  /**
   * Displays the given message inside the loading overlay
   * @param {String} message
   */
  displayLoadingMessage (message) {
    this._loadingSpan.innerText = message
    this._loadingOverlay.style.display = 'block'
  }

  /**
   * Hides the loading message
   */
  hideLoadingMessage () {
    this._loadingOverlay.style.display = 'none'
  }

  /**
   * The undo history
   * @type {Array.<Object>}
   */
  get history () {
    return this._history
  }

  /**
   * The file loader
   * @type {FileLoader}
   */
  get fileLoader () {
    return this._fileLoader
  }
}

NightUI.Control = require('./controls/control')

export default NightUI
