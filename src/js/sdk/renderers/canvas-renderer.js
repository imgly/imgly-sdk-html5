/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */
import BaseRenderer from './base-renderer'
import Vector2 from '../lib/math/vector2'
import Promise from '../vendor/promise'

/**
 * @class
 * @alias ImglyKit.CanvasRenderer
 * @extends {ImglyKit.BaseRenderer}
 * @private
 */
class CanvasRenderer extends BaseRenderer {
  /**
   * A unique string that identifies this renderer
   * @type {String}
   */
  static get identifier () {
    return 'canvas'
  }

  /**
   * Caches the current canvas content for the given identifier
   * @param {String} identifier
   */
  cache (identifier) {
    this._cache[identifier] = {
      data: this._context.getImageData(0, 0, this._canvas.width, this._canvas.height),
      size: new Vector2(this._canvas.width, this._canvas.height)
    }
  }

  /**
   * Draws the stored texture / image data for the given identifier
   * @param {String} identifier
   */
  drawCached (identifier) {
    let { data, size } = this._cache[identifier]
    this._canvas.width = size.x
    this._canvas.height = size.y
    this._context.putImageData(data, 0, 0)
  }

  /**
   * Checks whether this type of renderer is supported in the current environment
   * @abstract
   * @returns {boolean}
   */
  static isSupported () {
    var elem = this.prototype.createCanvas()
    return !!(elem.getContext && elem.getContext('2d'))
  }

  /**
   * Gets the rendering context from the Canva
   * @return {RenderingContext}
   * @abstract
   */
  _getContext () {
    /* istanbul ignore next */
    return this._canvas.getContext('2d')
  }

  /**
   * Draws the given image on the canvas
   * @param  {Image} image
   * @returns {Promis}
   */
  drawImage (image) {
    this._context.drawImage(
      image,
      0, 0,
      image.width, image.height,
      0, 0,
      this._canvas.width, this._canvas.height)
    return Promise.resolve()
  }

  /**
   * Resizes the current canvas picture to the given dimensions
   * @param  {Vector2} dimensions
   * @return {Promise}
   */
  resizeTo (dimensions) {
    dimensions = dimensions.clone().floor()
    if (this._canvas.width === dimensions.x &&
        this._canvas.height === dimensions.y) {
      return
    }

    this._canvas.width = dimensions.x
    this._canvas.height = dimensions.y

    this._outputSize = dimensions.clone()
  }

  /**
   * Returns a cloned version of the current canvas
   * @param {Boolean} copyContent = true
   * @return {Canvas}
   */
  cloneCanvas (copyContent = true) {
    var canvas = this.createCanvas()
    var context = canvas.getContext('2d')

    // Resize the canvas
    canvas.width = this._canvas.width
    canvas.height = this._canvas.height

    if (copyContent) {
      // Draw the current canvas on the new one
      context.drawImage(this._canvas, 0, 0)
    }

    return canvas
  }

  /**
   * Resets the renderer
   * @param {Boolean} resetCache = false
   * @override
   */
  reset (resetCache=false) {
    if (resetCache) {
      this._cache = []
    }
  }

  /**
   * Returns the initial dimensions before any operations have been applied
   * @param {Array.<Operation>} stack
   * @param {ImageDimensions} dimensions
   */
  getInitialDimensionsForStack (stack, dimensions) {
    // Since canvas operations resize the canvas, the initial
    // dimensions is the same as the image dimensions
    return new Vector2(this._image.width, this._image.height)
  }

  /**
   * Sets the canvas dimensions
   * @param {Vector2} dimensions
   */
  setSize (dimensions) {
    dimensions = dimensions.clone().floor()
    if (this._canvas.width === dimensions.x &&
        this._canvas.height === dimensions.y) {
      return
    }

    this._canvas.width = dimensions.x
    this._canvas.height = dimensions.y
    this._size.copy(dimensions)
  }

  /**
   * Gets called after the rendering has been done. Resizes the canvas
   * to its final size
   * @param {ImageDimensions} dimensions
   */
  postRender (dimensions) {
    const canvasDimensions = new Vector2(this._canvas.width, this._canvas.height)
    const newDimensions = dimensions.calculateFinalDimensions(canvasDimensions)
    this.resizeTo(newDimensions)
  }

  get maxTextureSize () {
    return 0
  }
}

export default CanvasRenderer
