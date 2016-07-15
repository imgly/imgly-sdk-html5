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

class TiltShiftControl extends Control {
  /**
   * Entry point for this control
   */
  init () {
    let controlsTemplate = __DOTJS_TEMPLATE('../../../templates/night/operations/tilt-shift_controls.jst')
    this._controlsTemplate = controlsTemplate

    let canvasControlsTemplate = __DOTJS_TEMPLATE('../../../templates/night/operations/tilt-shift_canvas.jst')
    this._canvasControlsTemplate = canvasControlsTemplate

    this._partialTemplates.slider = SimpleSlider.template
    this._partialTemplates.slider.additionalContext = { id: 'imglykit-blur-radius-slider' }
    this._currentKnob = null
  }

  /**
   * Gets called when this control is activated
   * @override
   */
  _onEnter () {
    this._operationExistedBefore = !!this._ui.operations['tilt-shift']
    this._operation = this._ui.getOrCreateOperation('tilt-shift')

    this._initialSettings = {
      start: this._operation.getStart().clone(),
      end: this._operation.getEnd().clone(),
      gradientRadius: this._operation.getGradientRadius(),
      blurRadius: this._operation.getBlurRadius()
    }

    // Mouse event callbacks bound to the class context
    this._onPositionKnobDown = this._onPositionKnobDown.bind(this)
    this._onPositionKnobDrag = this._onPositionKnobDrag.bind(this)
    this._onPositionKnobUp = this._onPositionKnobUp.bind(this)
    this._onGradientKnobDown = this._onGradientKnobDown.bind(this)
    this._onGradientKnobDrag = this._onGradientKnobDrag.bind(this)
    this._onGradientKnobUp = this._onGradientKnobUp.bind(this)

    // Find DOM elements
    let selector = '.imglykit-canvas-tilt-shift-dot'
    this._positionKnob = this._canvasControls.querySelector(`${selector}[data-option='position']`)
    this._gradientKnob = this._canvasControls.querySelector(`${selector}[data-option='gradient']`)
    this._rect = this._canvasControls.querySelector('.imglykit-canvas-tilt-shift-rect')

    // Initialization
    this._initSliders()

    this._ui.canvas.render()
      .then(() => {
        this._handleKnobs()
        this._updateDOM()
      })
  }

  /**
   * Initializes the slider controls
   * @private
   */
  _initSliders () {
    let blurRadiusSlider = this._controls.querySelector('#imglykit-blur-radius-slider')
    this._blurRadiusSlider = new SimpleSlider(blurRadiusSlider, {
      minValue: 0,
      maxValue: 40
    })
    this._blurRadiusSlider.on('update', this._onBlurRadiusUpdate.bind(this))
    this._blurRadiusSlider.setValue(this._initialSettings.blurRadius)
  }

  /**
   * Gets called when the value of the blur radius slider has been updated
   * @param {Number} value
   * @private
   */
  _onBlurRadiusUpdate (value) {
    this._operation.setBlurRadius(value)
    this._ui.canvas.render()
    this._highlightDoneButton()
  }

  /**
   * Handles the knob dragging
   * @private
   */
  _handleKnobs () {
    // Add event listeners
    this._positionKnob.addEventListener('mousedown', this._onPositionKnobDown)
    this._positionKnob.addEventListener('touchstart', this._onPositionKnobDown)
    this._gradientKnob.addEventListener('mousedown', this._onGradientKnobDown)
    this._gradientKnob.addEventListener('touchstart', this._onGradientKnobDown)

    let canvasSize = this._ui.canvas.size
    let { start, end } = this._initialSettings
    start = start.clone().multiply(canvasSize)
    end = end.clone().multiply(canvasSize)

    let dist = end.clone().subtract(start)
    let middle = start.clone().add(dist.clone().divide(2))

    let totalDist = Math.sqrt(Math.pow(dist.x, 2) + Math.pow(dist.y, 2))
    let factor = dist.clone().divide(totalDist).divide(2)

    // Calculate initial knob position (middle of start and end)
    this._knobPosition = middle.clone()

    // Calculate initial gradient knob position
    let gradientRadius = this._initialSettings.gradientRadius
    this._gradientKnobPosition = middle.clone()
      .add(-gradientRadius * factor.y, gradientRadius * factor.x)

    this._updateStartAndEnd()
    this._updateDOM()

    this._ui.canvas.render()
  }

  /**
   * Calculate start and end positions using the knob positions
   * @private
   */
  _updateStartAndEnd () {
    let canvasSize = this._ui.canvas.size

    // Calculate distance between gradient and position knob
    let diff = this._gradientKnobPosition.clone()
      .subtract(this._knobPosition)

    let start = this._knobPosition.clone()
      .add(-diff.y, diff.x)
      .divide(canvasSize)
    let end = this._knobPosition.clone()
      .add(diff.y, -diff.x)
      .divide(canvasSize)

    this._operation.set({ start, end })
  }

  /**
   * Gets called when the user starts dragging the position knob
   * @param {Event} e
   * @private
   */
  _onPositionKnobDown (e) {
    e.preventDefault()

    this._initialMousePosition = Utils.getEventPosition(e)
    this._initialPosition = this._knobPosition.clone()
    this._initialDistanceToGradientKnob = this._gradientKnobPosition.clone()
      .subtract(this._initialPosition)

    document.addEventListener('mousemove', this._onPositionKnobDrag)
    document.addEventListener('touchmove', this._onPositionKnobDrag)

    document.addEventListener('mouseup', this._onPositionKnobUp)
    document.addEventListener('touchend', this._onPositionKnobUp)
  }

  /**
   * Gets called when the user drags the position knob
   * @param {Event} e
   * @private
   */
  _onPositionKnobDrag (e) {
    e.preventDefault()

    let canvasSize = this._ui.canvas.size
    let mousePosition = Utils.getEventPosition(e)
    let diff = mousePosition.subtract(this._initialMousePosition)

    let newPosition = this._initialPosition.clone().add(diff)
    this._knobPosition.copy(newPosition)

    let minPosition = new Vector2().subtract(this._initialDistanceToGradientKnob)
    minPosition.clamp(new Vector2(0, 0))

    let maxPosition = canvasSize.clone().subtract(this._initialDistanceToGradientKnob)
    maxPosition.clamp(null, canvasSize)

    this._knobPosition.clamp(minPosition, maxPosition)

    this._gradientKnobPosition.copy(this._knobPosition)
      .add(this._initialDistanceToGradientKnob)

    this._updateStartAndEnd()
    this._updateDOM()
    this._ui.canvas.render()
  }

  /**
   * Gets called when the user stops dragging the position knob
   * @param {Event} e
   * @private
   */
  _onPositionKnobUp (e) {
    e.preventDefault()

    document.removeEventListener('mousemove', this._onPositionKnobDrag)
    document.removeEventListener('touchmove', this._onPositionKnobDrag)

    document.removeEventListener('mouseup', this._onPositionKnobUp)
    document.removeEventListener('touchend', this._onPositionKnobUp)
  }

  /**
   * Gets called when the user starts dragging the gradient knob
   * @param {Event} e
   * @private
   */
  _onGradientKnobDown (e) {
    e.preventDefault()

    this._initialMousePosition = Utils.getEventPosition(e)
    this._initialGradientKnobPosition = this._gradientKnobPosition.clone()

    document.addEventListener('mousemove', this._onGradientKnobDrag)
    document.addEventListener('touchmove', this._onGradientKnobDrag)

    document.addEventListener('mouseup', this._onGradientKnobUp)
    document.addEventListener('touchend', this._onGradientKnobUp)
  }

  /**
   * Gets called when the user drags the gradient knob
   * @param {Event} e
   * @private
   */
  _onGradientKnobDrag (e) {
    e.preventDefault()

    let canvasSize = this._ui.canvas.size
    let mousePosition = Utils.getEventPosition(e)
    let diff = mousePosition.subtract(this._initialMousePosition)

    this._gradientKnobPosition.copy(this._initialGradientKnobPosition).add(diff)
    this._gradientKnobPosition.clamp(new Vector2(0, 0), canvasSize)

    let distance = this._gradientKnobPosition.clone().subtract(this._knobPosition)
    let newGradientRadius = 2 * Math.sqrt(
      Math.pow(distance.x, 2) + Math.pow(distance.y, 2)
    )

    this._operation.setGradientRadius(newGradientRadius)
    this._updateStartAndEnd()
    this._updateDOM()
    this._ui.canvas.render()
  }

  /**
   * Gets called when the user stops dragging the gradient knob
   * @param {Event} e
   * @private
   */
  _onGradientKnobUp (e) {
    e.preventDefault()

    document.removeEventListener('mousemove', this._onGradientKnobDrag)
    document.removeEventListener('touchmove', this._onGradientKnobDrag)

    document.removeEventListener('mouseup', this._onGradientKnobUp)
    document.removeEventListener('touchend', this._onGradientKnobUp)
  }

  /**
   * Updates the knob
   * @private
   */
  _updateDOM () {
    let position = this._knobPosition
    this._positionKnob.style.left = `${position.x}px`
    this._positionKnob.style.top = `${position.y}px`

    let gradientPosition = this._gradientKnobPosition
    this._gradientKnob.style.left = `${gradientPosition.x}px`
    this._gradientKnob.style.top = `${gradientPosition.y}px`

    // Resize rectangle to worst case size
    let canvasSize = this._ui.canvas.size
    let gradientRadius = this._operation.getGradientRadius()
    let rectSize = new Vector2(
      Math.sqrt(Math.pow(canvasSize.x, 2) + Math.pow(canvasSize.y, 2)) * 2,
      gradientRadius
    )

    this._rect.style.width = `${rectSize.x}px`
    this._rect.style.height = `${rectSize.y}px`
    this._rect.style.marginLeft = `-${rectSize.x / 2}px`
    this._rect.style.marginTop = `-${rectSize.y / 2}px`
    this._rect.style.left = `${position.x}px`
    this._rect.style.top = `${position.y}px`

    // Rotate rectangle
    let dist = gradientPosition.clone()
      .subtract(position)
    let degrees = Math.atan2(dist.x, dist.y) * (180 / Math.PI)
    const transform = `rotate(${(-degrees).toFixed(2)}deg)`
    this._rect.style.transform = transform
    this._rect.style['-moz-transform'] = transform
    this._rect.style['-ms-transform'] = transform
    this._rect.style['-webkit-transform'] = transform
  }

  /**
   * Gets called when the back button has been clicked
   * @override
   */
  _onBack () {
    if (this._operationExistedBefore) {
      this._operation.set(this._initialSettings)
    } else {
      this._ui.removeOperation('tilt-shift')
    }
    this._ui.canvas.render()
  }

  /**
   * Gets called when the done button has been clicked
   * @override
   */
  _onDone () {
    this._ui.addHistory(this._operation, {
      start: this._initialSettings.start.clone(),
      end: this._initialSettings.end.clone(),
      blurRadius: this._initialSettings.blurRadius,
      gradientRadius: this._initialSettings.gradientRadius
    }, this._operationExistedBefore)
  }
}

/**
 * A unique string that identifies this control.
 * @type {String}
 */
TiltShiftControl.prototype.identifier = 'tilt-shift'

export default TiltShiftControl
