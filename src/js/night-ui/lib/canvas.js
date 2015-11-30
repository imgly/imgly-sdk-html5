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
  EventEmitter, Utils, Vector2, SDKUtils, OperationsStack
} from '../globals'

class Canvas extends EventEmitter {
  constructor (kit, ui, options) {
    super()

    this._kit = kit
    this._ui = ui
    this._options = options

    let { container } = this._ui
    this._canvasContainer = container.querySelector('.pesdk-canvas-container')
    this._canvasInnerContainer = container.querySelector('.pesdk-canvas-inner-container')
    this._canvas = this._canvasContainer.querySelector('canvas')
    this._image = this._options.image
    this._roundZoomBy = 0.1
    this._isFirstRender = true

    // Mouse event callbacks bound to the class context
    this._dragOnMousedown = this._dragOnMousedown.bind(this)
    this._dragOnMousemove = this._dragOnMousemove.bind(this)
    this._dragOnMouseup = this._dragOnMouseup.bind(this)
  }

  /**
   * Initializes the renderer, sets the zoom level and initially
   * renders the operations stack
   */
  run () {
    this._kit.setCanvas(this._canvas)

    // Calculate the initial zoom level
    this._zoomLevel = this._getInitialZoomLevel()
    this._size = null

    this.render()
    this._centerCanvas()
    this._handleDrag()
  }

  getProcessedDimensions () {
    const stack = this.sanitizedStack

    let size = new Vector2(this._image.width, this._image.height)
    stack.forEach((operation) => {
      size = operation.getNewDimensions(this._renderer, size)
    })

    return size
  }

  /**
   * Renders the current operations stack
   */
  render () {
    const dimensions = this._kit.getInitialDimensions()
    if (this._zoomLevel !== null) {
      dimensions
        .multiply(this._zoomLevel)
        .floor()
    }

    this._setCanvasSize(dimensions)
    this._kit.setDimensions(`${dimensions.x}x${dimensions.y}`)

    return this._kit.render()
      .then(() => {
        this._storeCanvasSize()
        this._updateContainerSize()
        this._updateCanvasMargins()
        this._applyBoundaries()
      })
  }

  /**
   * Sets the image to the given one
   * @param {Image} image
   */
  setImage (image) {
    this._image = image
    this.reset()
    this.render()
    this._centerCanvas()
  }

  /**
   * Increase zoom level
   */
  zoomIn () {
    this._isInitialZoom = false

    let zoomLevel = Math.round(this._zoomLevel * 100)
    let roundZoomBy = Math.round(this._roundZoomBy * 100)
    let initialZoomLevel = Math.round(this._getInitialZoomLevel() * 100)

    // Round up if needed
    if (zoomLevel % roundZoomBy !== 0) {
      zoomLevel = Math.ceil(zoomLevel / roundZoomBy) * roundZoomBy
    } else {
      zoomLevel += roundZoomBy
    }

    zoomLevel = Math.min(initialZoomLevel * 2, zoomLevel)
    return this.setZoomLevel(zoomLevel / 100)
  }

  /**
   * Decrease zoom level
   */
  zoomOut () {
    this._isInitialZoom = false

    let zoomLevel = Math.round(this._zoomLevel * 100)
    let roundZoomBy = Math.round(this._roundZoomBy * 100)
    let initialZoomLevel = Math.round(this._getInitialZoomLevel() * 100)

    // Round up if needed
    if (zoomLevel % roundZoomBy !== 0) {
      zoomLevel = Math.floor(zoomLevel / roundZoomBy) * roundZoomBy
    } else {
      zoomLevel -= roundZoomBy
    }

    zoomLevel = Math.max(initialZoomLevel, zoomLevel)
    return this.setZoomLevel(zoomLevel / 100)
  }

  /**
   * Resizes and positions the canvas
   * @param {Vector2} [size]
   * @private
   */
  _setCanvasSize (size) {
    size = size || new Vector2(this._canvas.width, this._canvas.height)
    size = size.clone().floor()

    if (this._canvas.width === size.x &&
        this._canvas.height === size.y) {
      return
    }

    this._canvas.width = size.x
    this._canvas.height = size.y

    this._storeCanvasSize()
    this._updateContainerSize()
  }

  /**
   * Updates the canvas container size
   * @private
   */
  _updateContainerSize () {
    let size = this._size
    this._canvasInnerContainer.style.width = `${size.x}px`
    this._canvasInnerContainer.style.height = `${size.y}px`
  }

  /**
   * Remembers the canvas size
   * @comment This was introduced because the canvas size was not always
   *          correct due to some race conditions. Now that promises work
   *          properly, do we still need this?
   * @private
   */
  _storeCanvasSize () {
    this._size = new Vector2(this._canvas.width, this._canvas.height)
  }

  /**
   * Centers the canvas inside the container
   * @private
   */
  _centerCanvas () {
    let position = this._maxSize
      .divide(2)

    this._canvasInnerContainer.style.left = `${position.x}px`
    this._canvasInnerContainer.style.top = `${position.y}px`

    this._updateCanvasMargins()
  }

  /**
   * Updates the canvas margins so that they are the negative half width
   * and height of the canvas
   * @private
   */
  _updateCanvasMargins () {
    let canvasSize = new Vector2(this._canvas.width, this._canvas.height)
    let margin = canvasSize
      .divide(2)
      .multiply(-1)
    this._canvasInnerContainer.style.marginLeft = `${margin.x}px`
    this._canvasInnerContainer.style.marginTop = `${margin.y}px`
  }

  /**
   * Sets the zoom level, re-renders the canvas and
   * repositions it
   * @param {Number} zoomLevel
   * @param {Boolean} render = true
   * @param {Boolean} isInitialZoom = false
   * @private
   */
  setZoomLevel (zoomLevel, render = true, isInitialZoom = false) {
    this._zoomLevel = zoomLevel
    this._isInitialZoom = isInitialZoom

    if (render) {
      this.setAllOperationsToDirty()
      return this.render()
        .then(() => {
          this._updateCanvasMargins()
          this._applyBoundaries()
          this.emit('zoom') // will be redirected to top controls
        })
    } else {
      this._updateCanvasMargins()
      this._applyBoundaries()
      this.emit('zoom') // will be redirected to top controls
    }
  }

  /**
   * Sets all operations to dirty
   */
  setAllOperationsToDirty () {
    let { operationsStack } = this._kit
    for (let i = 0; i < operationsStack.length; i++) {
      let operation = operationsStack[i]
      if (!operation) continue
      operation.dirty = true
    }
  }

  /**
   * Resets all operations
   */
  resetAllOperations () {
    let { operationsStack } = this._kit
    for (let i = 0; i < operationsStack.length; i++) {
      let operation = operationsStack[i]
      if (!operation) continue
      operation.reset()
    }
  }

  /**
   * Gets the initial zoom level so that the image fits the maximum
   * canvas size
   * @private
   */
  _getInitialZoomLevel () {
    const initialDimensions = this._kit.getInitialDimensions()
    const defaultDimensions = SDKUtils.resizeVectorToFit(initialDimensions, this._maxSize)
    return defaultDimensions
      .divide(initialDimensions)
      .x
  }

  /**
   * Replaces the canvas with the given canvas, updates margins etc
   * @param {DOMElement} canvas
   * @private
   */
  _setCanvas (canvas) {
    let canvasParent = this._canvas.parentNode
    canvasParent.removeChild(this._canvas)
    this._canvas = canvas
    canvasParent.appendChild(this._canvas)

    this._updateCanvasMargins()
    this._applyBoundaries()
    this._updateContainerSize()
  }

  /**
   * Handles the dragging
   * @private
   */
  _handleDrag () {
    this._canvas.addEventListener('mousedown', this._dragOnMousedown)
    this._canvas.addEventListener('touchstart', this._dragOnMousedown)
  }

  /**
   * Gets called when the user started touching / clicking the canvas
   * @param {Event} e
   * @private
   */
  _dragOnMousedown (e) {
    if (e.type === 'mousedown' && e.button !== 0) return
    e.preventDefault()

    let canvasX = parseInt(this._canvasInnerContainer.style.left, 10)
    let canvasY = parseInt(this._canvasInnerContainer.style.top, 10)

    document.addEventListener('mousemove', this._dragOnMousemove)
    document.addEventListener('touchmove', this._dragOnMousemove)

    document.addEventListener('mouseup', this._dragOnMouseup)
    document.addEventListener('touchend', this._dragOnMouseup)

    // Remember initial position
    this._initialMousePosition = Utils.getEventPosition(e)
    this._initialCanvasPosition = new Vector2(canvasX, canvasY)
  }

  /**
   * Gets called when the user drags the canvas
   * @param {Event} e
   * @private
   */
  _dragOnMousemove (e) {
    e.preventDefault()

    const newMousePosition = Utils.getEventPosition(e)
    const mouseDiff = newMousePosition
      .clone()
      .subtract(this._initialMousePosition)
    const newPosition = this._initialCanvasPosition
      .clone()
      .add(mouseDiff)

    this._canvasInnerContainer.style.left = `${newPosition.x}px`
    this._canvasInnerContainer.style.top = `${newPosition.y}px`

    this._applyBoundaries()
  }

  /**
   * Makes sure the canvas positions are within the boundaries
   * @private
   */
  _applyBoundaries () {
    let x = parseInt(this._canvasInnerContainer.style.left, 10)
    let y = parseInt(this._canvasInnerContainer.style.top, 10)
    let canvasPosition = new Vector2(x, y)

    // Boundaries
    let boundaries = this._boundaries
    canvasPosition.x = Math.min(boundaries.max.x, Math.max(boundaries.min.x, canvasPosition.x))
    canvasPosition.y = Math.min(boundaries.max.y, Math.max(boundaries.min.y, canvasPosition.y))

    this._canvasInnerContainer.style.left = `${canvasPosition.x}px`
    this._canvasInnerContainer.style.top = `${canvasPosition.y}px`
  }

  /**
   * Gets called when the user stopped dragging the canvsa
   * @param {Event} e
   * @private
   */
  _dragOnMouseup (e) {
    e.preventDefault()

    document.removeEventListener('mousemove', this._dragOnMousemove)
    document.removeEventListener('touchmove', this._dragOnMousemove)

    document.removeEventListener('mouseup', this._dragOnMouseup)
    document.removeEventListener('touchend', this._dragOnMouseup)
  }

  /**
   * The position boundaries for the canvas inside the container
   * @type {Object.<Vector2>}
   * @private
   */
  get _boundaries () {
    let canvasSize = new Vector2(this._canvas.width, this._canvas.height)
    let maxSize = this._maxSize

    let diff = canvasSize.clone().subtract(maxSize).multiply(-1)

    let boundaries = {
      min: new Vector2(diff.x, diff.y),
      max: new Vector2(0, 0)
    }

    if (canvasSize.x < maxSize.x) {
      boundaries.min.x = diff.x / 2
      boundaries.max.x = diff.x / 2
    }

    if (canvasSize.y < maxSize.y) {
      boundaries.min.y = diff.y / 2
      boundaries.max.y = diff.y / 2
    }

    let halfCanvasSize = canvasSize.clone().divide(2)
    boundaries.min.add(halfCanvasSize)
    boundaries.max.add(halfCanvasSize)
    return boundaries
  }

  /**
   * The maximum canvas size
   * @private
   */
  get _maxSize () {
    return new Vector2(this._canvasContainer.offsetWidth, this._canvasContainer.offsetHeight)
  }

  /**
   * Zooms the canvas so that it fits the container
   * @param {Boolean} render = true
   */
  zoomToFit (render = true) {
    let initialZoomLevel = this._getInitialZoomLevel()
    return this.setZoomLevel(initialZoomLevel, render, true)
  }

  /**
   * Resets the renderer
   */
  reset () {
    this._renderer.reset()
    this._kit.operationsStack = new OperationsStack()
    this._isFirstRender = true
  }

  /**
   * Returns the operations stack without falsy values
   * @type {Array.<Operation>}
   */
  get sanitizedStack () {
    let sanitizedStack = []
    for (let i = 0; i < this._kit.operationsStack.length; i++) {
      let operation = this._kit.operationsStack[i]
      if (!operation) continue
      sanitizedStack.push(operation)
    }
    return sanitizedStack
  }

  /**
   * The current zoom level
   * @type {Number}
   */
  get zoomLevel () {
    return this._zoomLevel
  }

  /**
   * The canvas size in pixels
   * @type {Vector2}
   */
  get size () {
    return this._size
  }

  /**
   * Returns the renderer
   * @return {Renderer}
   */
  get renderer () {
    return this._renderer
  }
}

export default Canvas
