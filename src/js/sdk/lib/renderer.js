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
import Operations from '../operations/operations'
import Exif from './exif'
import RotationOperation from '../operations/rotation-operation'
import FlipOperation from '../operations/flip-operation'

/**
 * @class
 * @param {String} renderer
 * @param {Object} options
 * @param {Image} [options.image] - The source image
 * @param {HTMLElement} [options.container] - Specifies where the UI should be
 *                                          added to. If none is given, the UI
 *                                          will automatically be disabled.
 */
export default class Renderer {
  constructor (renderer, options) {
    // `options` is required
    if (typeof options === 'undefined') {
      throw new Error('No options given.')
    }

    // Set default options
    options = Utils.defaults(options, {
      versionCheck: true,
      image: null
    })

    /**
     * @type {Object}
     * @private
     */
    this._options = options

    /**
     * The stack of {@link Operation} instances that will be used
     * to render the final Image
     * @type {Array.<ImglyKit.Operation>}
     */
    this.operationsStack = []

    /**
     * The registered operations
     * @type {Object.<String, ImglyKit.Operation>}
     */
    this._registeredOperations = {}

    // Register the default operations
    this._registerOperations()

    if (typeof window !== 'undefined' && this._options.versionCheck) {
      const { version } = require('../../../../package.json')
      this._versionChecker = new VersionChecker(version)
    }
  }

  /**
   * Renders the image
   * @param  {ImglyKit.RenderType} [renderType=ImglyKit.RenderType.DATAURL] - The output type
   * @param  {ImglyKit.ImageFormat} [imageFormat=ImglyKit.ImageFormat.PNG] - The output image format
   * @param  {string} [dimensions] - The final dimensions of the image
   * @param  {Number} [quality] - The image quality, between 0 and 1
   * @return {Promise}
   */
  render (renderType, imageFormat, dimensions, quality) {
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

  }

  /**
   * Returns the asset path for the given filename
   * @param  {String} asset
   * @return {String}
   */
  getAssetPath (asset) {
    var isBrowser = typeof window !== 'undefined'
    if (isBrowser) {
      /* istanbul ignore next */
      return this._options.assetsUrl + '/' + asset
    } else {
      var path = require('path')
      return path.resolve(this._options.assetsUrl, asset)
    }
  }

  /**
   * Registers all default operations
   * @private
   */
  _registerOperations () {
    for (let operationName in Operations) {
      this.registerOperation(Operations[operationName])
    }
  }

  /**
   * Registers the given operation
   * @param {ImglyKit.Operation} operation - The operation class
   */
  registerOperation (operation) {
    this._registeredOperations[operation.prototype.identifier] = operation
    if (this.ui) {
      this.ui.addOperation(operation)
    }
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
   * Runs the UI, if present
   */
  run () {
    if (typeof this.ui !== 'undefined') {
      this.ui.run()
    }
  }

  /**
   * Checks whether the renderer has an image as input
   * @return {Boolean}
   */
  hasImage () {
    return !!this._options.image
  }

  get registeredOperations () {
    return this._registeredOperations
  }
}
