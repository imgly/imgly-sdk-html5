/* global PhotoEditorSDK, FileReader, Image, __DOTJS_TEMPLATE */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import {
  SDKUtils, Vector2, Promise, Helpers, ImageFormat, EventEmitter,
  Utils, OperationsStack, RenderType
} from './globals'

import Canvas from './lib/canvas'
import FileLoader from './lib/file-loader'
import ImageResizer from './lib/image-resizer'
import WebcamHandler from './lib/webcam-handler'
import TopControls from './lib/top-controls'
import Scrollbar from './lib/scrollbar'

export default class NightUI extends EventEmitter {
  constructor (kit, options) {
    super()
    this._kit = kit
    this._options = SDKUtils.defaults(options, {
      assetPathResolver: null,
      language: 'en'
    })

    this._options.assets = SDKUtils.defaults(options.assets, {
      baseUrl: '/',
      resolver: null
    })

    if (kit.hasImage()) {
      this._image = kit.getImage()
    }

    this._operations = []
    this._helpers = new Helpers(this._kit, this, options)
    this._languages = {}

    this.selectOperations(null)
    this._registerLanguages()
    this.selectLanguage(this._options.language)

    this._operationsMap = {}
    this._template = __DOTJS_TEMPLATE('./templates/template.jst')
    this._registeredControls = {}
    this._history = []
    this._imageResized = false

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
      'text',
      'brush'
    ]

    this._paused = false

    this._options = SDKUtils.defaults(this._options, {
      showNewButton: !this._kit.hasImage(),
      showUploadButton: true,
      showWebcamButton: true,
      showHeader: true,
      showCloseButton: false,
      showExportButton: false,
      language: 'en',
      maxMegaPixels: 10,
      export: {}
    })

    this._options.export = SDKUtils.defaults(this._options.export, {
      type: ImageFormat.JPEG,
      quality: 0.8
    })

    this._initOperations()
    this.run()
  }

  _initOperations () {
    this._availableOperations = this._kit.getOperations()
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

  /**
   * A unique string that represents this UI
   * @type {String}
   */
  get identifier () {
    return 'night'
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
   * Prepares the UI for use
   */
  run () {
    this._fixOperationsStack()
    this._registerControls()

    this._loadLanguage()

    this._attach()

    let { container } = this._options

    this.hideFlashMessage = this.hideFlashMessage.bind(this)

    this._controlsContainer = container.querySelector('.imglykit-controls')
    this._canvasControlsContainer = container.querySelector('.imglykit-canvas-controls')
    this._overviewControlsContainer = container.querySelector('.imglykit-controls-overview')
    this._loadingOverlay = container.querySelector('.imglykit-loadingOverlay')
    this._loadingSpan = container.querySelector('.imglykit-loadingOverlay span')
    this._flashOverlay = container.querySelector('.imglykit-flashOverlay')
    this._flashHeadline = this._flashOverlay.querySelector('.imglykit-flashOverlay-headline')
    this._flashText = this._flashOverlay.querySelector('.imglykit-flashOverlay-text')
    this._flashCloseButton = this._flashOverlay.querySelector('.imglykit-flashOverlay-close')
    this._flashCloseButton.addEventListener('click', this.hideFlashMessage)

    this._handleOverview()

    if (this._kit.hasImage()) {
      this._resizeImageIfNecessary()
      this._initCanvas()
    }

    if (this.context.renderSplashScreen) {
      this._initFileLoader()
      if (this._options.showWebcamButton) {
        this._handleWebcamButton()
      }
    }

    if (this.context.renderWebcam) {
      this._initWebcam()
    }

    this._initTopControls()
    this._initControls()

    if (this._kit.hasImage) {
      this.showZoom()
    }

    if (this._options.showCloseButton) {
      this._handleCloseButton()
    }

    if (this._topControls) {
      this._topControls.updateExportButton()
    }

    if (this._canvas) {
      this._canvas.run()
    }
  }

  _loadLanguage () {
    this._language = this._languages[this._options.language]
    if (!this._language) {
      const availableLanguages = Object.keys(this._languages).join(', ')
      throw new Error(`Unknown language '${this._options.language}'. Available languages are: ${availableLanguages}`)
    }
  }

  /**
   * The SDK automatically adds Rotation and Flip operations for images
   * that have the wrong rotation (in the Exif tags). Since we have a specific
   * operation order for this UI, we need to place them correctly
   * @private
   */
  _fixOperationsStack () {
    const { operationsStack } = this._kit
    const newStack = new OperationsStack()
    const stack = operationsStack.getStack()
    for (let i = 0; i < stack.length; i++) {
      const operation = operationsStack.get(i)
      if (!operation) continue
      const { identifier } = operation
      const indexInStack = this._preferredOperationOrder.indexOf(identifier)
      newStack.set(indexInStack, operation)
      this._operationsMap[identifier] = operation
    }
    this._kit.operationsStack = newStack
  }

  /**
   * Initializes the webcam
   * @private
   */
  _initWebcam () {
    this._webcam = new WebcamHandler(this._kit, this)
    this._webcam.on('image', this._onWebcamImageTaken.bind(this))
  }

  /**
   * Gets called when the webcam image has been taken
   * @param {Image} image
   * @private
   */
  _onWebcamImageTaken (image) {
    this._options.startWithWebcam = false
    this._setImage(image)
  }

  /**
   * Handles the webcam button
   * @private
   */
  _handleWebcamButton () {
    const { container } = this._options
    const webcamButton = container.querySelector('.imglykit-splash-row--camera')
    webcamButton.addEventListener('click', () => {
      this._options.startWithWebcam = true
      this.run()
    })
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
    const reader = new FileReader()
    reader.onload = (() => {
      return (e) => {
        const data = e.target.result
        const image = new Image()

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
   * @param {Exif} [exif]
   * @private
   */
  _setImage (image, exif = null) {
    this._image = image
    this._kit.setImage(image, exif)
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

    this._topControls.on('new', () => {
      this._kit.reset()
      this._canvas = null
      this._operations = []
      this._operationsMap = {}
      this._kit.operationsStack = new OperationsStack()
      this._history = []
      this._kit.setImage(null)
      this.run()
    })

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
   * Resizes the image to fit the maximum texture size
   * @private
   */
  _resizeImageIfNecessary () {
    const imageDimensions = new Vector2(this._image.width, this._image.height)
    const megaPixels = (imageDimensions.x * imageDimensions.y) / 1000000

    if (megaPixels > this._options.maxMegaPixels) {
      // Dimensions exceed `maxMegaPixels`. Calculate new size
      const pixelsCount = this._options.maxMegaPixels * 1000000
      const ratioHV = imageDimensions.x / imageDimensions.y
      const ratioVH = imageDimensions.y / imageDimensions.x
      const newDimensions = new Vector2(
        Math.sqrt(pixelsCount * ratioHV),
        Math.sqrt(pixelsCount * ratioVH)
      ).floor()

      this.emit('resized', {
        reason: 'MAX_MEGA_PIXELS',
        dimensions: newDimensions.clone()
      })

      this.displayFlashMessage(
        this.translate('generic.warning_headline'),
        this.translate('warnings.image_resized',
          this._options.maxMegaPixels,
          newDimensions.x,
          newDimensions.y),
        'warning'
      )
      this._imageResized = true

      const resizedImage = ImageResizer.resize(this._image, newDimensions)

      // Flag as jpeg image so that the resulting image will
      // also include exif data
      resizedImage.src = 'data:image/jpeg;base64,'

      // Copy already parsed exif data, since the one we just
      // created does not have any
      this._setImage(resizedImage, this._kit.exif)
    }
  }

  /**
   * Inititializes the canvas
   * @private
   */
  _initCanvas () {
    this._canvas = new Canvas(this._kit, this, this._options)
    this._canvas.on('zoom', () => {
      this._topControls.updateZoomLevel()
    })
    this._canvas.on('error', (e) => {
      this.emit('error', e)
      this.displayErrorMessage(e.code || e.message)
    })
    this._canvas.on('resized', (payload) => {
      this.emit('resized', payload)
    })
  }

  /**
   * Displays the given error key
   * @param {String} key
   */
  displayErrorMessage (key) {
    const err = this.translate(`errors.${key}`)
    this.displayFlashMessage('An error has occurred!', `${err} (${key})`, 'error')
  }

  /**
   * Displays a flash message with the given title and type
   * @param {String} message
   * @param {String} message
   * @param {String} type = 'notice'
   */
  displayFlashMessage (headline, message, type = 'notice') {
    this._flashText.textContent = message
    this._flashHeadline.textContent = headline
    this._flashOverlay.style.display = 'block'

    this._flashOverlay.className = `imglykit-flashOverlay imglykit-flashOverlay--${type}`
  }

  /**
   * Hides the flash message
   */
  hideFlashMessage () {
    this._flashOverlay.style.display = 'none'
  }

  /**
   * Returns or creates an instance of the operation with the given identifier
   * @param {String} identifier
   */
  getOrCreateOperation (identifier) {
    const registeredOperations = this._kit.getOperations()
    let { operationsStack } = this._kit
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
      operationsStack.set(index, operationInstance)

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

    this._kit.operationsStack.remove(operation)
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
    this.registerControl('brush', 'brush', require('./controls/brush-control'))
  }

  /**
   * Register all default languages
   * @private
   */
  _registerLanguages () {
    this.registerLanguage('en', require('./lang/en.json'))
    this.registerLanguage('de', require('./lang/de.json'))
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
      const identifier = listItem.getAttribute('data-identifier')
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
        .catch((e) => {
          console.log(e)
        })
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
    return {
      operations: this._operations,
      helpers: this._helpers,
      options: this._options,
      controls: this._registeredControls,
      renderSplashScreen: !this._kit.hasImage() && !this._options.startWithWebcam,
      renderControls: this._kit.hasImage(),
      renderWebcam: this._options.startWithWebcam
    }
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
   * @returns {Object} The history item
   */
  addHistory (operation, options, existent) {
    const historyItem = { operation, options, existent }
    this._history.push(historyItem)
    this._topControls.updateUndoButton()

    this.emit('history-add', historyItem)

    return historyItem
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
    let promise = Promise.resolve()
    if (lastItem) {
      this.emit('history-undo', lastItem)

      let { operation, existent, options } = lastItem
      if (!existent) {
        this.removeOperation(operation.constructor.identifier)
      } else {
        operation = this.getOrCreateOperation(operation.constructor.identifier)
        operation.set(options)
      }
      promise = this.canvas.zoomToFit(true)
    }
    this._topControls.updateUndoButton()

    // Make sure the current control represents the new value
    promise.then(() => {
      if (this._currentControl) {
        this._currentControl.update()
      }
    })
  }

  /**
   * Exports the current image with the default settings
   */
  export () {
    this.displayLoadingMessage(this.translate('generic.exporting') + '...')

    let renderType = RenderType.DATAURL

    // Check if msToBlob is available
    let canvas = document.createElement('canvas')
    if (typeof canvas.msToBlob !== 'undefined') {
      renderType = RenderType.MSBLOB
    }

    setTimeout(() => {
      const previousDimensions = this._kit.getDimensions()
      this._kit.setDimensions(null)
      this._kit.export(renderType,
        this._options.export.type,
        this._options.export.quality)
        .then((data) => {
          switch (renderType) {
            case RenderType.DATAURL:
              const url = SDKUtils.createBlobURIFromDataURI(data)
              let link = document.createElement('a')
              const extension = this._options.export.type.split('/').pop()
              link.download = `imglykit-export.${extension}`
              link.href = url
              document.body.appendChild(link)
              link.click()
              // Cleanup the DOM
              document.body.removeChild(link)
              break
            case RenderType.MSBLOB:
              navigator.msSaveBlob(data, 'imglykit-export.png')
              break
          }

          this._kit.setDimensions(previousDimensions)
          this._kit.render()
          this.hideLoadingMessage()
        })
    }, 1000)
  }

  /**
   * Sets the current language to the one with the given key
   * @param  {string} key
   */
  selectLanguage (key) {
    this._language = this._languages[key]
  }

  /**
   * Displays the given message inside the loading overlay
   * @param {String} message
   */
  displayLoadingMessage (message) {
    this._loadingSpan.textContent = message
    this._loadingOverlay.style.display = 'block'
  }

  /**
   * Hides the loading message
   */
  hideLoadingMessage () {
    this._loadingOverlay.style.display = 'none'
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
   * Checks whether the operation with the given identifier is selected
   * @param {String} identifier
   * @returns {Boolean}
   */
  isOperationSelected (identifier) {
    let operationIdentifiers = this._operations.map((operation) => {
      return operation.identifier
    })
    return operationIdentifiers.indexOf(identifier) !== -1
  }

  /**
   * Selects the enabled operations
   * @param {ImglyKit.Selector}
   */
  selectOperations (selector) {
    const registeredOperations = this._kit.getOperations()
    let operationIdentifiers = Object.keys(registeredOperations)

    let selectedOperations = SDKUtils.select(operationIdentifiers, selector)
    this._operations = selectedOperations.map((identifier) => {
      return registeredOperations[identifier]
    })
  }

  /**
   * The undo history
   * @type {Array.<Object>}
   */
  get history () {
    return this._history
  }

  get options () {
    return this._options
  }

  /**
   * The file loader
   * @type {FileLoader}
   */
  get fileLoader () {
    return this._fileLoader
  }

  /**
   * Has the image been resized initially?
   * @type {Boolean}
   */
  get imageResized () {
    return this._imageResized
  }

  /**
   * The DOM container
   * @type {DOMElement}
   */
  get container () {
    return this._options.container
  }

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

  get image () {
    return this._kit.getImage()
  }
}

NightUI.Control = require('./controls/control')

// Extend PhotoEditorSDK object
PhotoEditorSDK.UI = PhotoEditorSDK.UI || {}
PhotoEditorSDK.UI.Night = NightUI
