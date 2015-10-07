/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

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
import Helpers from '../ui/base/helpers'
import Promise from '../vendor/promise'

/**
 * @class
 * @param {String} preferredRenderer
 * @param {Object} options = {}
 * @param {Object} operationsOptions = {}
 */
export default class Renderer {
  constructor (preferredRenderer, options = {}, operationsOptions = {}) {
    this._preferredRenderer = preferredRenderer

    // Set default options
    this._options = Utils.defaults(options, {
      additionalOperations: {},
      versionCheck: true,
      image: null,
      dimensions: null,
      canvas: null,
      assets: {
        baseUrl: '/',
        resolver: null
      }
    })

    this._helpers = new Helpers(this, this._options)
    this._dimensions = this._options.dimensions && new ImageDimensions(this._options.dimensions)

    this._image = this._options.image
    this._operationsOptions = operationsOptions
    this.operationsStack = new OperationsStack()

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
        // TODO: Resize if necessary
        this._rendering = false
      })
  }

  /**
   * Exports the image
   * @param  {ImglyKit.RenderType} [renderType=ImglyKit.RenderType.DATAURL] - The output type
   * @param  {ImglyKit.ImageFormat} [imageFormat=ImglyKit.ImageFormat.PNG] - The output image format
   * @param  {Number} [quality] - The image quality, between 0 and 1
   * @return {Promise}
   */
  export (renderType, imageFormat, quality = 0.8) {
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
   */
  setImage (image) {
    this._options.image = image
    this._parseExif(image)
  }

  /**
   * Parses the exif data and fixes the orientation if necessary
   * @param {Image} image
   * @private
   */
  _parseExif (image) {
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
    this._renderer = null
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
   * Returns the Operation instance with the given identifier,
   * if it exists
   * @param {String} identifier
   * @returns {Operation}
   */
  getOperationFromStack (identifier) {
    let operation = this.operationsStack.filter((operation) => {
      return operation.identifier === identifier
    })[0]
    return operation
  }

  /**
   * Sets all operations to dirty
   */
  setAllOperationsToDirty () {
    this.operationsStack.setAllToDirty()
  }

  /**
   * Creates a renderer (canvas or webgl, depending on support)
   * @return {Promise}
   * @private
   */
  _initRenderer () {
    /* istanbul ignore if */
    if (WebGLRenderer.isSupported() && this._options.preferredRenderer !== 'canvas') {
      this._renderer = new WebGLRenderer(this._initialDimensions, this._options.canvas, this._image)
      this._webglEnabled = true
    } else if (CanvasRenderer.isSupported()) {
      this._renderer = new CanvasRenderer(this._initialDimensions, this._options.canvas, this._image)
      this._webglEnabled = false
    }

    /* istanbul ignore if */
    if (this._renderer === null) {
      throw new Error('Neither Canvas nor WebGL renderer are supported.')
    }
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

  getAssetPath (asset) {
    const { baseUrl, resolver } = this._options.assets
    let path = `${baseUrl}/${asset}`
    if (typeof resolver !== 'undefined' && resolver !== null) {
      path = resolver(path)
    }
    return path
  }

  setCanvas (canvas) { this._options.canvas = canvas }
  getRenderer () { return this._renderer }
  hasImage () { return !!this._options.image }
  getOperations () { return this._operations }
  getOptions () { return this._options }
  getOperationsOptions () { return this._operationsOptions }
  setDimensions (dimensions) {
    this._dimensions = new ImageDimensions(dimensions)
  }
}
