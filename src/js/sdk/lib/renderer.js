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
import ImageDimensions from './image-dimensions'
import ImageExporter from './image-exporter'
import VersionChecker from './version-checker'
import Utils from './utils'
import Vector2 from './math/vector2'
import Operations from '../operations/'
import Exif from './exif'
import RotationOperation from '../operations/rotation-operation'
import FlipOperation from '../operations/flip-operation'
import OperationsStack from './operations-stack'
import WebGLRenderer from '../renderers/webgl-renderer'
import CanvasRenderer from '../renderers/canvas-renderer'
import { RenderType, ImageFormat } from '../constants'

/**
 * @class
 * @param {String} preferredRenderer
 * @param {Object} options = {}
 * @param {Object} operationsOptions = {}
 */
export default class Renderer extends EventEmitter {
  constructor (preferredRenderer, options = {}, operationsOptions = {}) {
    super()
    this._onRendererError = this._onRendererError.bind(this)
    this._onOperationUpdate = this._onOperationUpdate.bind(this)

    this._preferredRenderer = preferredRenderer

    // Set default options
    this._options = Utils.defaults(options, {
      additionalOperations: {},
      versionCheck: true,
      image: null,
      dimensions: null,
      canvas: null
    })

    this._dimensions = this._options.dimensions && new ImageDimensions(this._options.dimensions)

    this._image = this._options.image
    this._operationsOptions = operationsOptions
    this.setOperationsStack(new OperationsStack())

    this._checkForUpdates()
    this._registerOperations()
  }

  /**
   * Checks for version updates
   * @private
   */
  _checkForUpdates () {
    if (typeof window !== 'undefined' && this._options.versionCheck) {
      const { version } = require('../../../../package.json')
      this._versionChecker = new VersionChecker(version)
    }
  }

  /**
   * Creates an operation with the given identifier
   * @param {String} identifier
   * @param {Object} options = {}
   * @param {Boolean} addToStack = true
   * @returns {Operation}
   */
  createOperation (identifier, options = {}, addToStack = true) {
    const Operation = this._operations[identifier]
    if (!Operation) {
      throw new Error(`No operation with identifier \`${identifier}\` found.`)
    }

    const operation = new Operation(this, options)
    if (addToStack) {
      this.operationsStack.push(operation)
    }
    return operation
  }

  /**
   * Renders the image
   * @return {Promise}
   */
  render () {
    if (!this._renderer) this._initRenderer()

    const stack = this.operationsStack
    stack.updateDirtiness()

    this._renderer.preRender()
    return stack.validateSettings()
      .then(() => {
        const dimensions = this.getOutputDimensions()
        this._renderer.resizeTo(dimensions)
      })
      .then(() => {
        return this._renderer.drawImage(this._image)
      })
      .then(() => {
        return stack.render(this._renderer)
      })
      .then(() => {
        return this._renderer.renderFinal()
      })
      .then(() => {
        this._rendering = false
      })
  }

  /**
   * Exports the image
   * @param  {PhotoEditorSDK.RenderType} [renderType=PhotoEditorSDK.RenderType.DATAURL] - The output type
   * @param  {PhotoEditorSDK.ImageFormat} [imageFormat=PhotoEditorSDK.ImageFormat.PNG] - The output image format
   * @param  {Number} [quality=0.8] - The image quality, between 0 and 1
   * @return {Promise}
   */
  export (renderType = RenderType.DATAURL, imageFormat = ImageFormat.PNG, quality = 0.8) {
    return ImageExporter.validateSettings(renderType, imageFormat)
      .then(() => {
        return this.render()
      })
      .then(() => {
        return ImageExporter.export(
          this,
          this._image,
          this._renderer.getCanvas(),
          renderType,
          imageFormat,
          quality)
      })
  }

  /**
   * Sets the image and parses the exif data
   * @param {Image} image
   * @param {Exif} exif = null
   */
  setImage (image, exif = null) {
    this._options.image = image
    this._image = image
    if (!exif) {
      this._parseExif(image)
    } else {
      this._exif = exif
    }
  }

  /**
   * Returns the current image
   * @return {Image}
   */
  getImage () {
    return this._image
  }

  /**
   * Parses the exif data and fixes the orientation if necessary
   * @param {Image} image
   * @private
   */
  _parseExif (image) {
    if (!image) return
    if (Exif.isJPEG(image.src)) {
      this._exif = null
      try {
        this._exif = Exif.fromBase64String(image.src)
      } catch (e) {}
      if (!this._exif) return

      let exifTags = this._exif.getTags()

      if (exifTags && exifTags.Orientation) {
        if (exifTags.Orientation !== 1 && exifTags.Orientation !== 2) {
          // We need to rotate
          let degrees = 0
          switch (exifTags.Orientation) {
            case 7:
            case 8:
              degrees = -90
              break
            case 3:
            case 4:
              degrees = -180
              break
            case 5:
            case 6:
              degrees = 90
              break
          }

          const rotationOperation = new RotationOperation(this, { degrees: degrees })
          this.operationsStack.push(rotationOperation)
        }

        if ([2, 4, 5, 7].indexOf(exifTags.Orientation) !== -1) {
          const flipOperation = new FlipOperation(this, { horizontal: true })
          this.operationsStack.push(flipOperation)
        }

        this._exif.setOrientation(1)
      }
    }
  }

  /**
   * Resets all custom and selected operations
   */
  reset () {
    if (this._renderer) {
      this._renderer.off('error', this._onRendererError)
    }

    this._renderer = null
    this.operationsStack.clear()

    // TODO: We only need this event so that our React UI can re-create
    // the watermark operation once the renderer has been reset. Find a
    // better way to do this, this is really really dirty
    this.emit('reset')
  }

  /**
   * Registers all default operations
   * @private
   */
  _registerOperations () {
    this._operations = {}

    for (let operationName in Operations) {
      const operation = Operations[operationName]
      this._operations[operation.identifier] = operation
    }

    this._operations = Utils.extend(this._operations,
      this._options.additionalOperations)
  }

  /**
   * Sets all operations to dirty
   */
  setAllOperationsToDirty () {
    this.operationsStack.setAllToDirty()
  }

  /**
   * Gets called when the renderer emits an error
   * @param  {Error} e
   * @private
   */
  _onRendererError (e) {
    this.emit('error', e)
  }

  /**
   * Creates a renderer (canvas or webgl, depending on support)
   * @return {Promise}
   * @private
   */
  _initRenderer () {
    /* istanbul ignore if */
    if (WebGLRenderer.isSupported() && this._preferredRenderer !== 'canvas') {
      this._renderer = new WebGLRenderer(this._options.canvas, this._image)
      this._webglEnabled = true
    } else if (CanvasRenderer.isSupported()) {
      this._renderer = new CanvasRenderer(this._options.canvas, this._image)
      this._webglEnabled = false
    }

    /* istanbul ignore if */
    if (this._renderer === null) {
      throw new Error('Neither Canvas nor WebGL renderer are supported.')
    }

    this._renderer.on('error', this._onRendererError)
  }

  /**
   * Returns the output dimensions for the current stack
   * @return {Vector2}
   */
  getOutputDimensions () {
    const stack = this.operationsStack

    let dimensions = this._renderer.getOutputDimensionsForStack(stack)
    if (this._dimensions && this._dimensions.bothSidesGiven()) {
      dimensions = Utils.resizeVectorToFit(dimensions, this._dimensions.toVector())
    }
    dimensions.floor()

    return dimensions
  }

  /**
   * Returns the initial dimensions for the current stack
   * @return {Vector2}
   */
  getInitialDimensions () {
    if (!this._renderer) this._initRenderer()

    const stack = this.operationsStack
    return this._renderer.getInitialDimensionsForStack(stack)
  }

  getInputDimensions () {
    return new Vector2(this._image.width, this._image.height)
  }

  _onOperationUpdate (...args) {
    this.emit('operation-update', ...args)
  }

  setOperationsStack (operationsStack) {
    if (this.operationsStack) {
      this.operationsStack.off('operation-update', this._onOperationUpdate)
    }

    this.operationsStack = operationsStack
    this.operationsStack.on('operation-update', this._onOperationUpdate)
  }

  clone () {
    const renderer = new Renderer(
      this._preferredRenderer,
      this._options,
      this._operationsOptions)
    renderer.operationsStack = renderer.operationsStack
    renderer.setCanvas(null) // Let it create its own canvas
    return renderer
  }

  getExif () { return this._exif }
  setCanvas (canvas) {
    this._options.canvas = canvas
    this.reset()
  }
  getRenderer () {
    return this._renderer
  }
  hasImage () { return !!this._options.image }
  getOperations () { return this._operations }
  getOptions () { return this._options }
  getOperationsOptions () { return this._operationsOptions }

  getDimensions () {
    return this._dimensions
  }

  getMaxDimensions () {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) {
      return null
    } else {
      return gl.getParameter(gl.MAX_TEXTURE_SIZE)
    }
  }

  setDimensions (dimensions) {
    if (!dimensions) {
      const initialDimensions = this.getInitialDimensions().clone().round()
      dimensions = `${initialDimensions.x}x${initialDimensions.y}`
    } else if (dimensions instanceof ImageDimensions) {
      this._dimensions = dimensions
      return
    }
    this._dimensions = new ImageDimensions(dimensions)
  }
}
