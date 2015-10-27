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
import Vector2 from './math/vector2'
import CanvasRenderer from '../renderers/canvas-renderer'
import WebGLRenderer from '../renderers/webgl-renderer'
import Utils from './utils'

/**
 * Handles the image rendering process
 * @class
 * @alias ImglyKit.RenderImage
 * @param {Image} image
 * @param {Array.<ImglyKit.Operation>} operationsStack
 * @param {string} dimensions
 * @param {string} preferredRenderer
 * @private
 */
class RenderImage extends EventEmitter {
  constructor (image, operationsStack, dimensions, preferredRenderer) {
    super()

    /**
     * @type {Object}
     * @private
     */
    this._options = {
      preferredRenderer: preferredRenderer
    }

    /**
     * @type {Boolean}
     * @private
     * @default false
     */
    this._webglEnabled = false

    /**
     * @type {Renderer}
     * @private
     */
    this._renderer = null

    /**
     * @type {Image}
     * @private
     */
    this._image = image

    /**
     * @type {Array.<ImglyKit.Operation>}
     * @private
     */
    this._stack = operationsStack

    /**
     * @type {ImglyKit.ImageDimensions}
     * @private
     */
    this._dimensions = new ImageDimensions(dimensions)

    /**
     * @type {Vector2}
     * @private
     */
    this._initialDimensions = new Vector2(this._image.width, this._image.height)

    this._initRenderer()
  }

  /**
   * Creates a renderer (canvas or webgl, depending on support)
   * @return {Promise}
   * @private
   */
  _initRenderer () {
    /* istanbul ignore if */
    if (WebGLRenderer.isSupported() && this._options.preferredRenderer !== 'canvas') {
      this._renderer = new WebGLRenderer(this._initialDimensions, null, this._image)
      this._webglEnabled = true
    } else if (CanvasRenderer.isSupported()) {
      this._renderer = new CanvasRenderer(this._initialDimensions, null, this._image)
      this._webglEnabled = false
    }

    /* istanbul ignore if */
    if (this._renderer === null) {
      throw new Error('Neither Canvas nor WebGL renderer are supported.')
    }

    this._renderer.on('error', (err) => this.emit('error', err))
  }

  /**
   * Renders the image
   * @return {Promise}
   */
  render () {
    const stack = this.sanitizedStack
    const initialDimensions = this._renderer.getInitialDimensionsForStack(stack, this._dimensions)
    this._renderer.resizeTo(initialDimensions)
    this._renderer.drawImage(this._image)

    let validationPromises = []
    for (let i = 0; i < stack.length; i++) {
      let operation = stack[i]
      validationPromises.push(operation.validateSettings())
    }

    return Promise.all(validationPromises)
      .then(() => {
        let promise = Promise.resolve()
        for (let i = 0; i < stack.length; i++) {
          let operation = stack[i]
          promise = promise.then(() => {
            return new Promise((resolve, reject) => {
              Utils.requestAnimationFrame(() => {
                operation.render(this._renderer)
                resolve()
              })
            })
          })
        }
        return promise
      })
      .then(() => {
        return this._renderer.renderFinal()
      })
      .then(() => {
        return this._renderer.postRender(this._dimensions)
      })
  }

  /**
   * Returns the renderer
   * @return {Renderer}
   */
  getRenderer () {
    return this._renderer
  }

  /**
   * Returns the operations stack without falsy values
   * @type {Array.<Operation>}
   */
  get sanitizedStack () {
    let sanitizedStack = []
    for (let i = 0; i < this._stack.length; i++) {
      let operation = this._stack[i]
      if (!operation) continue
      sanitizedStack.push(operation)
    }
    return sanitizedStack
  }
}

export default RenderImage
