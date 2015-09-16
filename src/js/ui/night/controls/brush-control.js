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

class BrushControl extends Control {
  /**
   * Entry point for this control
   */
  init () {
    let controlsTemplate = __DOTJS_TEMPLATE('../../../templates/night/operations/brush_controls.jst')
    this._controlsTemplate = controlsTemplate

    let canvasControlsTemplate = __DOTJS_TEMPLATE('../../../templates/night/operations/brush_canvas.jst')
    this._canvasControlsTemplate = canvasControlsTemplate

    this._painting = false
  }

  /**
   * Gets called when this control is activated
   * @override
   */
  _onEnter () {
    super._onEnter()
    this._prepareOperation()
    this._prepareSettings()
    this._prepareContainer()
  }

  _prepareSettings () {
    this._initialSettings = {
      color: this._operation.getColor(),
      thickness: this._operation.getThickness(),
      controlPoints: this._operation.getControlPoints(),
      buttonStatus: this._operation.getButtonStatus()
    }
    this._settings = {
      color: this._initialSettings.color,
      thickness: this._initialSettings.thickness,
      buttonStatus: this._initialSettings.buttonStatus,
      controlPoints: this._initialSettings.controlPoints
    }
  }

  _prepareOperation () {
    this._operationExistedBefore = !!this._ui.operations.brush
    this._operation = this._ui.getOrCreateOperation('brush')
  }

  _prepareContainer () {
    this._onMouseDown = this._onMouseDown.bind(this)
    this._onMouseUp = this._onMouseUp.bind(this)
    this._onMouseMove = this._onMouseMove.bind(this)
    this._onMouseLeave = this._onMouseLeave.bind(this)

    this._container = this._canvasControls.querySelector('.imglykit-canvas-brush-container')
    this._container.addEventListener('mousedown', this._onMouseDown)
    this._container.addEventListener('mouseup', this._onMouseUp)
    this._container.addEventListener('mousemove', this._onMouseMove)
    this._container.addEventListener('mouseleave', this._onMouseLeave)
  }

  /**
   * Gets called when the back button has been clicked
   * @override
   */
  _onBack () {
    this._ui.canvas.setZoomLevel(this._initialZoomLevel, false)

    // When operation did not exist before, remove it when clicking 'back'
    if (!this._operationExistedBefore) {
      this._ui.removeOperation('brush')
    }
    this._ui.canvas.render()
  }

  /**
   * Gets called when the done button has been clicked
   * @protected
   */
  _onDone () {

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

  _onMouseDown (e) {
    var mousePosition = this._getRelativeMousePositionFromEvent(e)
    this._painting = true
    this._addControlPoint(mousePosition, false)
    this._redrawPath()
  }

  _onMouseUp (e) {
    this._painting = false
  }

  _onMouseMove (e) {
    if (this._painting) {
      var mousePosition = this._getRelativeMousePositionFromEvent(e)
      this._addControlPoint(mousePosition, true)
      this._redrawPath()
    }
  }

  _onMouseLeave (e) {
    this._painting = false
  }

  _addControlPoint (position, mouseButtonPressed = false) {
    this._settings.controlPoints.push(position)
    this._settings.buttonStatus.push(mouseButtonPressed)
  }

  _redrawPath () {
    this._operation.set(this._settings)
    this._ui.canvas.render()
  }

  _getRelativeMousePositionFromEvent (e) {
    var clientRect = this._container.getBoundingClientRect()
    var offset = new Vector2(clientRect.left, clientRect.top + document.body.scrollTop)
    return Utils.getEventPosition(e).subtract(offset)
  }
}

/**
 * A unique string that identifies this control.
 * @type {String}
 */
BrushControl.prototype.identifier = 'brush'

export default BrushControl
