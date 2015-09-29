/* global __DOTJS_TEMPLATE */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Control from './control'
import Vector2 from '../../../lib/math/vector2'
import Utils from '../../../lib/utils'
import SimpleSlider from '../lib/simple-slider'
import ColorPicker from '../lib/color-picker'
import Color from '../../../lib/color'

class BrushControl extends Control {
  /**
   * Entry point for this control
   */
  init () {
    let controlsTemplate = __DOTJS_TEMPLATE('../../../templates/night/operations/brush_controls.jst')
    this._controlsTemplate = controlsTemplate

    let canvasControlsTemplate = __DOTJS_TEMPLATE('../../../templates/night/operations/brush_canvas.jst')
    this._canvasControlsTemplate = canvasControlsTemplate

    this._partialTemplates.slider = SimpleSlider.template
    this._partialTemplates.colorPicker = ColorPicker.template

    this._displayThickness = false
    this._painting = false
  }

  /**
   * Renders the controls
   */
  _renderControls () {
    this._partialTemplates.colorPicker.additionalContext = { label: this._ui.translate('controls.brush.color') }
    super._renderControls()
  }

  /**
   * Gets called when this control is activated
   * @override
   */
  _onEnter () {
    super._onEnter()
    this._handleThicknessButton()
    this._setupCanvas()
    this._setupOperation()
    this._setupOptions()
    this._bindEventHandlers()
    this._setupContainer()
    this._setupSlider()
    this._initCurrentValues()
    this._setupColorPicker()

    this._initialZoomLevel = this._ui.canvas.zoomLevel
    this._ui.canvas.zoomToFit()

    this._setupCursor()
  }

  /**
   * Handles the thickness button
   * @private
   */
  _handleThicknessButton () {
    if (this._displayThickness) return

    this._thicknessButton = this._controlsContainer.querySelector('#imglykit-thickness-button')
    this._thicknessButton.addEventListener('click', this._onThicknessButtonClick.bind(this))
  }

  /**
   * Gets called when the thickness button has been clicked
   * @param  {Event} e
   * @private
   */
  _onThicknessButtonClick (e) {
    e.preventDefault()
    this._displayThickness = true
    this.enter()
  }

  /**
   * This method sets the inital values for thickness and color.
   * It will retrieve them from the opteration unless it has no values yet.
   * In that case it will default some vales
   */
  _initCurrentValues () {
    this._currentThickness = this._currentThickness || this._operation.getLastThickness()
    this._currentColor = this._currentColor || this._operation.getLastColor()
  }

  /**
   * Sets up the cursor
   */
  _setupCursor () {
    this._cursor = this._canvasControls.querySelector('#imglykit-brush-cursor')
    this._setCursorSize(this._currentThickness * this._getLongerSideSize())
    this._setCursorColor(this._currentColor)
  }

  /**
   * Sets the initital options up
   */
  _setupOptions () {
    this._initialOptions = {
      paths: this._operation.getPaths().slice(0)
    }
  }

  /**
   * Sets up the canvas
   * @private
   */
  _setupCanvas () {
    const { canvas } = this._ui
    this._canvas = this._canvasControls.querySelector('canvas')
    this._canvas.width = canvas.size.x
    this._canvas.height = canvas.size.y
  }

  /**
   * Sets up the operation
   */
  _setupOperation () {
    this._operationExistedBefore = !!this._ui.operations.brush
    this._operation = this._ui.getOrCreateOperation('brush')
  }

  /**
   * Sets up the container, adds events, etc
   */
  _setupContainer () {
    this._container = this._canvasControls.querySelector('.imglykit-canvas-brush-container')
    this._container.addEventListener('mousedown', this._onMouseDown)
    this._container.addEventListener('touchstart', this._onMouseDown)
    this._container.addEventListener('mouseup', this._onMouseUp)
    this._container.addEventListener('touchend', this._onMouseUp)
    document.addEventListener('mousemove', this._onMouseMove)
    document.addEventListener('touchmove', this._onMouseMove)
    this._container.addEventListener('mouseleave', this._onMouseLeave)
  }

  /**
   * Bind event handlers
   */
  _bindEventHandlers () {
    this._onMouseDown = this._onMouseDown.bind(this)
    this._onMouseUp = this._onMouseUp.bind(this)
    this._onMouseMove = this._onMouseMove.bind(this)
    this._onMouseLeave = this._onMouseLeave.bind(this)
  }

  /**
   * Sets up the slider used to change the brush size
   */
  _setupSlider () {
    if (!this._displayThickness) return

    let sliderElement = this._controls.querySelector('.imglykit-slider')
    this._slider = new SimpleSlider(sliderElement, {
      minValue: 0.01,
      maxValue: 0.2
    })
    this._onThicknessUpdate = this._onThicknessUpdate.bind(this)
    this._slider.on('update', this._onThicknessUpdate)
    this._slider.setValue(this._currentThickness)
  }

  /**
   * Sets up the color picker used to change the brush color
   */
  _setupColorPicker () {
    if (this._displayThickness) return

    let colorPickerElement = this._controls.querySelector('.imglykit-color-picker')
    this._colorPicker = new ColorPicker(this._ui, colorPickerElement)
    this._colorPicker.on('update', this._onColorUpdate.bind(this))
    this._colorPicker.setValue(this._currentColor)
  }

  /**
   * Gets called when the back button has been clicked
   * @private
   */
  _onBackButtonClick () {
    if (this._displayThickness) {
      this._displayThickness = false
      return this.enter()
    }

    super._onBackButtonClick()
  }

  /**
   * Gets called when the back button has been clicked
   * @override
   */
  _onBack () {
    if (!this._operationExistedBefore && !this._operation.getPaths().length) {
      this._ui.removeOperation('brush')
    } else {
      this._operation.dirty = true
    }
    this._ui.canvas.setZoomLevel(this._initialZoomLevel)
  }

  /**
   * Resets the operation options to the initial options
   */
  _resetOperationSettings () {
    this._operation.setPaths(this._initialOptions.paths)
  }

  /**
   * Gets called when the user presses the mouse button.
   * Here the painting phase is started
   * @param  {Event} e
   */
  _onMouseDown (e) {
    const paths = this._operation.getPaths().slice(0)
    this._operationExistedBeforeDraw = !!paths.length
    this._optionsBeforeDraw = { paths }

    if (Utils.isTouchEvent(e)) {
      this._showCursor()
    }
    this._startPaint(e)
  }

  /**
   * start painting
   * @param  {Event} event
   */
  _startPaint (event) {
    event.preventDefault()
    var mousePosition = this._getRelativeMousePositionFromEvent(event)
    this._painting = true

    this._currentPath = this._operation.createPath(
      this._currentThickness,
      this._currentColor
    )
    this._currentPath.addControlPoint(mousePosition)

    this._redrawPath()
  }

  /**
   * Gets called the the users releases the mouse button.
   * Here the painting phase is stopped
   * @param  {Event} e
   */
  _onMouseUp (e) {
    if (Utils.isTouchEvent(e)) {
      this._hideCursor()
    }
    this._stopPaint()
    this._ui.addHistory(this, {
      paths: this._optionsBeforeDraw.paths
    }, this._operationExistedBeforeDraw)
  }

  /**
   * Stops the paint phase
   */
  _stopPaint () {
    this._painting = false
  }

  /**
   * Redraws the current path
   * @private
   */
  _redrawPath () {
    this._operation.renderBrushCanvas(this._canvas, this._canvas)
  }

  /**
   * Gets called when the user drags the mouse.
   * If this happends while the mouse button is pressed,
   * the visited points get added to the path
   * @param  {Event} e
   */
  _onMouseMove (e) {
    var mousePosition = this._getRelativeMousePositionFromEvent(e)
    if (!Utils.isTouchEvent(e)) {
      this._moveCursorTo(mousePosition)
      this._showCursor()
    }
    if (this._painting) {
      this._currentPath.addControlPoint(mousePosition)
      this._redrawPath()
    }
  }

  /**
   * Gets called when the user leaves the canvas.
   * This will also stop the painting phase
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  _onMouseLeave (e) {
    this._hideCursor()
  }

  /**
   * Calculates the mouse position, relative to the upper-left corner
   * of the canvas
   * @param  {Event} e
   * @return {Vector2} The Mouse Position
   */
  _getRelativeMousePositionFromEvent (e) {
    var clientRect = this._container.getBoundingClientRect()
    var offset = new Vector2(clientRect.left, clientRect.top)
    var absolutePosition = Utils.getEventPosition(e)
      .subtract(offset)
    return absolutePosition.divide(this._ui.canvas.size)
  }

  /**
   * Gets called when the thickness has been changed
   * @override
   */
  _onThicknessUpdate (value) {
    this._currentThickness = value
    this._setCursorSize(this._currentThickness * this._getLongerSideSize())
  }

  /**
   * Gets called when the color has been changed
   * @override
   */
  _onColorUpdate (value) {
    this._currentColor = value
    this._setCursorColor(value)
  }

  /**
   * Returns the longer size of the ui canvas
   * @return {Number}
   */
  _getLongerSideSize () {
    const { size } = this._ui.canvas
    return Math.max(size.x, size.y)
  }

  /**
   * Moves our custom cursor to the specified position
   * @param  {Vector2} position
   */
  _moveCursorTo (position) {
    let halfThickness = this._currentThickness * this._getLongerSideSize() / 2.0
    this._cursor.style.left = position.x * this._ui.canvas.size.x - halfThickness + 'px'
    this._cursor.style.top = position.y * this._ui.canvas.size.y - halfThickness + 'px'
  }

  /**
   * Sets the curser size
   * @param {Float} size
   */
  _setCursorSize (size) {
    this._cursor.style.width = size + 'px'
    this._cursor.style.height = size + 'px'
  }

  /**
   * Sets the cursor color
   * @param {Color} color
   */
  _setCursorColor (color) {
    this._cursor.style.background = color.toHex()
  }

  /**
   * Shows the cursor
   */
  _showCursor () {
    this._cursor.style.display = 'block'
  }

  /**
   * Hides the cursor
   */
  _hideCursor () {
    this._cursor.style.display = 'none'
  }

  /**
   * The data that is available to the template
   * @abstract
   */
  get context () {
    return {
      displayThickness: this._displayThickness
    }
  }
}

/**
 * A unique string that identifies this control.
 * @type {String}
 */
BrushControl.prototype.identifier = 'brush'

export default BrushControl
