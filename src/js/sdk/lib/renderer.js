/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import RenderImage from './render-image'
import ImageExporter from './image-exporter'
import VersionChecker from './version-checker'
import Utils from './utils'
import Operations from '../operations/'
import Exif from './exif'
import RotationOperation from '../operations/rotation-operation'
import FlipOperation from '../operations/flip-operation'

/**
 * @class
 * @param {String} renderer
 * @param {Object} options = {}
 * @param {Object} operationsOptions = {}
 */
export default class Renderer {
  constructor (renderer, options = {}, operationsOptions = {}) {
    this._preferredRenderer = renderer

    // Set default options
    this._options = Utils.defaults(options, {
      additionalOperations: {},
      versionCheck: true,
      image: null,
      dimensions: null,
      canvas: null
    })

    this._operationsOptions = operationsOptions

    /**
     * The stack of {@link Operation} instances that will be used
     * to render the final Image
     * @type {Array.<ImglyKit.Operation>}
     */
    this.operationsStack = []

    this._registerOperations()

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
    this._ensureRenderImage()
    return this._renderImage.render()
  }

  /**
   * Makes sure that a render image exists
   * @private
   */
  _ensureRenderImage () {
    if (!this._renderImage) {
      this._renderImage = new RenderImage(
        this._options.canvas,
        this._options.image,
        this.operationsStack,
        this._options.dimensions,
        this._preferredRenderer)
    }
  }

  /**
   * Returns the dimensions of the image after all operations
   * have been applied
   * @returns {Vector2}
   */
  getNativeDimensions () {
    this._ensureRenderImage()
    return this._renderImage.getNativeDimensions()
  }

  /**
   * Exports the image
   * @param  {ImglyKit.RenderType} [renderType=ImglyKit.RenderType.DATAURL] - The output type
   * @param  {ImglyKit.ImageFormat} [imageFormat=ImglyKit.ImageFormat.PNG] - The output image format
   * @param  {string} [dimensions] - The final dimensions of the image
   * @param  {Number} [quality] - The image quality, between 0 and 1
   * @return {Promise}
   */
  export (renderType, imageFormat, dimensions, quality) {
    var settings = ImageExporter.validateSettings(renderType, imageFormat)

    renderType = settings.renderType
    imageFormat = settings.imageFormat

    // Create a RenderImage
    var renderImage = new RenderImage(
      this._options.image,
      this.operationsStack,
      dimensions,
      this._options.renderer)

    // Set all operations to dirty, since we have another webgl renderer
    for (let i = 0; i < this.operationsStack.length; i++) {
      let operation = this.operationsStack[i]
      if (!operation) { continue }
      operation.dirty = true
    }

    // Initiate image rendering
    return renderImage.render()
      .then(() => {
        var canvas = renderImage.getRenderer().getCanvas()
        return ImageExporter.export(this, this._options.image, canvas, renderType, imageFormat, quality)
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
      } catch(e) {}
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
    this._renderImage = null
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

  setDimensions (dimensions) {
    this._options.dimensions = dimensions
    if (this._renderImage) {
      this._renderImage.setDimensions(dimensions)
    }
  }

  setOperationsStack (operationsStack) {
    this.operationsStack = operationsStack
    if (this._renderImage) {
      this._renderImage.setOperationsStack(operationsStack)
    }
  }

  setCanvas (canvas) { this._options.canvas = canvas }
  hasImage () { return !!this._options.image }
  getOperations () { return this._operations }
  getOptions () { return this._options }
  getOperationsOptions () { return this._operationsOptions }
}
