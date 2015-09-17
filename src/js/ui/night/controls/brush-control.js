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
    this._prepareOperation()
    this._prepareOptions()
    this._prepareContainer()
    this._prepareSlider()
    this._prepareColorPicker()
    this._initialZoomLevel = this._ui.canvas.zoomLevel
    this._ui.canvas.zoomToFit()
    this._setCursorSize(this._initialOptions.thickness * this._getLongerSideSize())
    this._setCursorColor()
    this._redrawPath()
  }

  /**
   * Sets the initital options up
   */
  _prepareOptions () {
    this._initialOptions = {
      color: this._operation.getColor(),
      thickness: this._operation.getThickness(),
      controlPoints: this._operation.getControlPoints().slice(0),
      buttonStatus: this._operation.getButtonStatus().slice(0)
    }
  }

  /**
   * Sets up the operation
   */
  _prepareOperation () {
    this._operationExistedBefore = !!this._ui.operations.brush
    this._operation = this._ui.getOrCreateOperation('brush')
  }

  /**
   * Sets up the container, adds events, etc
   */
  _prepareContainer () {
    this._onMouseDown = this._onMouseDown.bind(this)
    this._onMouseUp = this._onMouseUp.bind(this)
    this._onMouseMove = this._onMouseMove.bind(this)
    this._onMouseLeave = this._onMouseLeave.bind(this)

    this._container = this._canvasControls.querySelector('.imglykit-canvas-brush-container')
    this._container.addEventListener('mousedown', this._onMouseDown)
    this._container.addEventListener('touchstart', this._onMouseDown)
    this._container.addEventListener('mouseup', this._onMouseUp)
    this._container.addEventListener('touchend', this._onMouseUp)
    this._container.addEventListener('mousemove', this._onMouseMove)
    this._container.addEventListener('touchmove', this._onMouseMove)
    this._container.addEventListener('mouseleave', this._onMouseLeave)
  }

  /**
   * Sets up the slider used to change the brush size
   */
  _prepareSlider () {
    let sliderElement = this._controls.querySelector('.imglykit-slider')
    this._slider = new SimpleSlider(sliderElement, {
      minValue: 1,
      maxValue: 30
    })
    this._onThicknessUpdate = this._onThicknessUpdate.bind(this)
    this._slider.on('update', this._onThicknessUpdate)
    this._slider.setValue(this._initialOptions.thickness * this._getLongerSideSize())
  }

  /**
   * Sets up the color picker used to change the brush color
   */
  _prepareColorPicker () {
    let colorPickerElement = this._controls.querySelector('.imglykit-color-picker')
    this._colorPicker = new ColorPicker(this._ui, colorPickerElement)
    this._colorPicker.on('update', this._onColorUpdate.bind(this))
    this._colorPicker.setValue(this._initialOptions.color)
  }

  /**
   * Gets called when the back button has been clicked
   * @override
   */
  _onBack () {
    this._ui.canvas.setZoomLevel(this._initialZoomLevel, false)
    console.log(this._operationExistedBefore)
    if (this._operationExistedBefore) {
      this._resetOperationSettings()
    } else {
      this._ui.removeOperation('brush')
    }
    this._ui.canvas.render()
  }

  /**
   * Resets the operation options to the initial options
   */
  _resetOperationSettings () {
    this._operation.setControlPoints(this._initialOptions.controlPoints)
    this._operation.setButtonStatus(this._initialOptions.buttonStatus)
    this._operation.setColor(this._initialOptions.color)
    this._operation.setThickness(this._initialOptions.thickness)
  }

  /**
   * Gets called when the done button has been clicked
   * @protected
   */
  _onDone () {
    this._ui.canvas.setZoomLevel(this._initialZoomLevel, false)
    this._ui.addHistory(this, {
      color: this._initialOptions.color,
      thickness: this._initialOptions.thickness,
      controlPoints: this._initialOptions.controlPoints,
      buttonStatus: this._initialOptions.buttonStatus
    }, this._operationExistedBefore)
  }

  /**
   * The data that is available to the template
   * @type {Object}
   * @override
   */
  get context () {
    let context = super.context
    // Extend context like this...
    context.myVariable = 'myValue'
    return context
  }

  /**
   * Gets called when the user presses the mouse button.
   * Here the painting phase is started
   * @param  {Event} e
   */
  _onMouseDown (e) {
    e.preventDefault()
    var mousePosition = this._getRelativeMousePositionFromEvent(e)
    this._painting = true
    this._addControlPoint(mousePosition, false)
    this._redrawPath()
    this._highlightDoneButton()
  }

  /**
   * Gets called the the users releases the mouse button.
   * Here the painting phase is stopped
   * @param  {Event} e
   */
  _onMouseUp (e) {
    this._painting = false
  }

  /**
   * Gets called when the user drags the mouse.
   * If this happends while the mouse button is pressed,
   * the visited points get added to the path
   * @param  {Event} e
   */
  _onMouseMove (e) {
    var mousePosition = this._getRelativeMousePositionFromEvent(e)
    this._moveCursorTo(mousePosition)
    this._showCursor()
    if (this._painting) {
      this._addControlPoint(mousePosition, true)
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
    this._painting = false
    this._hideCursor()
  }

  /**
   * Adds a control point to the path.
   * Also the status of the mouse button, i.e. pressed or not, will be logged
   * @param {Vector2} position
   * @param {Boolean} mouseButtonPressed = false
   */
  _addControlPoint (position, mouseButtonPressed = false) {
    var controlPoints = this._operation.getControlPoints()
    controlPoints.push(position)
    this._operation.setControlPoints(controlPoints)

    var buttonStatus = this._operation.getButtonStatus()
    buttonStatus.push(mouseButtonPressed)
    this._operation.setButtonStatus(buttonStatus)
  }

  /**
   * Triggers a path-redraw
   */
  _redrawPath () {
    this._ui.canvas.render()
  }

  /**
   * Calculates the mouse position, relative to the upper-left corner
   * of the canvas
   * @param  {Event} e
   * @return {Vector2} The Mouse Position
   */
  _getRelativeMousePositionFromEvent (e) {
    var clientRect = this._container.getBoundingClientRect()
    var offset = new Vector2(clientRect.left, clientRect.top + document.body.scrollTop)
    var absolutePosition = Utils.getEventPosition(e).subtract(offset)
    return absolutePosition.divide(this._ui.canvas.size)
  }

  /**
   * Gets called when the thickness has been changed
   * @override
   */
  _onThicknessUpdate (value) {
    this._operation.setThickness(value / this._getLongerSideSize())
    this._ui.canvas.render()
    this._highlightDoneButton()
  this._setCursorSize(this._operation.getThickness() * this._getLongerSideSize())
  }

  /**
   * Gets called when the color has been changed
   * @override
   */
  _onColorUpdate (value) {
    this._operation.setColor(value)
    this._ui.canvas.render()
    this._highlightDoneButton()
    this._setCursorColor(value)
  }

  /**
   * Returns the longer size of the ui canvas
   * @return {Number}
   */
  _getLongerSideSize () {
    return this._ui.canvas.size.x > this._ui.canvas.size.y ? this._ui.canvas.size.x : this._ui.canvas.size.y
  }

  /**
   * Moves our custom cursor to the specified position
   * @param  {Vector2} position
   */
  _moveCursorTo (position) {
    let myCursor = this._canvasControls.querySelector('#mycursor')
    let halfThickness = this._operation.getThickness() * this._getLongerSideSize() / 2.0
    myCursor.style.left = position.x * this._ui.canvas.size.x - halfThickness + 'px'
    myCursor.style.top = position.y * this._ui.canvas.size.y - halfThickness + 'px'
  }

  /**
   * Sets the curser size
   * @param {Float} size
   */
  _setCursorSize (size) {
    let myCursor = this._canvasControls.querySelector('#mycursor')
    myCursor.style.width = size + 'px'
    myCursor.style.height = size + 'px'
  }

  /**
   * Shows the cursor
   */
  _showCursor () {
    let myCursor = this._canvasControls.querySelector('#mycursor')
    myCursor.style.display = 'block'
  }

  /**
   * Hides the cursor
   */
  _hideCursor () {
    let myCursor = this._canvasControls.querySelector('#mycursor')
    myCursor.style.display = 'none'
  }

  /**
   * Sets the cursor color
   */
  _setCursorColor () {
    let myCursor = this._canvasControls.querySelector('#mycursor')
    console.log(this._operation.getColor())
    myCursor.style.background = this._operation.getColor().toHex()
  }
}

/**
 * A unique string that identifies this control.
 * @type {String}
 */
BrushControl.prototype.identifier = 'brush'

export default BrushControl
