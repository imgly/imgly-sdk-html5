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

class RadialBlurControl extends Control {
  /**
   * Entry point for this control
   */
  init () {
    let controlsTemplate = __DOTJS_TEMPLATE('../../../templates/night/operations/radial-blur_controls.jst')
    this._controlsTemplate = controlsTemplate

    let canvasControlsTemplate = __DOTJS_TEMPLATE('../../../templates/night/operations/radial-blur_canvas.jst')
    this._canvasControlsTemplate = canvasControlsTemplate

    this._partialTemplates.slider = SimpleSlider.template
    this._partialTemplates.slider.additionalContext = {
      id: 'imglykit-blur-radius-slider'
    }
  }

  /**
   * Gets called when this control is activated
   * @override
   */
  _onEnter () {
    this._operationExistedBefore = !!this._ui.operations['radial-blur']
    this._operation = this._ui.getOrCreateOperation('radial-blur')

    // Remember initial identity state
    this._initialSettings = {
      position: this._operation.getPosition().clone(),
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

    this._positionKnob = this._canvasControls.querySelector('#imglykit-radial-blur-position')
    this._gradientKnob = this._canvasControls.querySelector('#imglykit-radial-blur-gradient')
    this._circle = this._canvasControls.querySelector('.imglykit-canvas-radial-blur-circle')
    this._handleKnobs()
    this._initSliders()

    this._ui.canvas.render()
      .then(() => {
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
    // Initially set gradient knob position
    let canvasSize = this._ui.canvas.size
    let position = this._operation.getPosition().clone()
      .multiply(canvasSize)
    this._gradientKnobPosition = position.clone()
      .add(this._initialSettings.gradientRadius, 0)

    this._positionKnob.addEventListener('mousedown', this._onPositionKnobDown)
    this._positionKnob.addEventListener('touchstart', this._onPositionKnobDown)
    this._gradientKnob.addEventListener('mousedown', this._onGradientKnobDown)
    this._gradientKnob.addEventListener('touchstart', this._onGradientKnobDown)
  }

  /**
   * Gets called when the user starts dragging the position knob
   * @param {Event} e
   * @private
   */
  _onPositionKnobDown (e) {
    e.preventDefault()

    let canvasSize = this._ui.canvas.size

    this._initialMousePosition = Utils.getEventPosition(e)
    this._initialPosition = this._operation.getPosition().clone()
    this._gradientKnobDistance = this._gradientKnobPosition.clone()
      .subtract(this._initialPosition.clone().multiply(canvasSize))

    document.addEventListener('mousemove', this._onPositionKnobDrag)
    document.addEventListener('touchmove', this._onPositionKnobDrag)

    document.addEventListener('mouseup', this._onPositionKnobUp)
    document.addEventListener('touchend', this._onPositionKnobUp)
  }

  /**
   * Gets called while the user starts drags the position knob
   * @param {Event} e
   * @private
   */
  _onPositionKnobDrag (e) {
    e.preventDefault()

    let canvasSize = this._ui.canvas.size
    let mousePosition = Utils.getEventPosition(e)
    let diff = mousePosition.subtract(this._initialMousePosition)

    let newPosition = this._initialPosition.clone()
      .multiply(canvasSize)
      .add(diff)

    let maxPosition = canvasSize.clone()
      .subtract(this._gradientKnobDistance)
    newPosition.clamp(new Vector2(0, 0), maxPosition)

    this._gradientKnobPosition.copy(newPosition).add(this._gradientKnobDistance)

    // Translate to 0...1
    newPosition.divide(canvasSize)

    this._operation.setPosition(newPosition)
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
   * Gets called when the user starts dragging the position knob
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
   * Gets called while the user starts drags the position knob
   * @param {Event} e
   * @private
   */
  _onGradientKnobDrag (e) {
    e.preventDefault()

    let canvasSize = this._ui.canvas.size
    let mousePosition = Utils.getEventPosition(e)
    let diff = mousePosition.subtract(this._initialMousePosition)

    // Calculate new gradient knob position
    this._gradientKnobPosition = this._initialGradientKnobPosition.clone().add(diff)
    this._gradientKnobPosition.clamp(new Vector2(0, 0), canvasSize)

    // Calculate distance to position
    let position = this._operation.getPosition().clone().multiply(canvasSize)
    let distance = this._gradientKnobPosition.clone()
      .subtract(position)
    let gradientRadius = Math.sqrt(Math.pow(distance.x, 2) + Math.pow(distance.y, 2))

    // Update operation
    this._operation.setGradientRadius(gradientRadius)
    this._updateDOM()
    this._ui.canvas.render()
  }

  /**
   * Gets called when the user stops dragging the position knob
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
    let canvasSize = this._ui.canvas.size
    let position = this._operation.getPosition()
      .clone()
      .multiply(canvasSize)

    this._positionKnob.style.left = `${position.x}px`
    this._positionKnob.style.top = `${position.y}px`

    this._gradientKnob.style.left = `${this._gradientKnobPosition.x}px`
    this._gradientKnob.style.top = `${this._gradientKnobPosition.y}px`

    let circleSize = this._operation.getGradientRadius() * 2
    this._circle.style.left = `${position.x}px`
    this._circle.style.top = `${position.y}px`
    this._circle.style.width = `${circleSize}px`
    this._circle.style.height = `${circleSize}px`
    this._circle.style.marginLeft = `-${circleSize / 2}px`
    this._circle.style.marginTop = `-${circleSize / 2}px`
  }

  /**
   * Gets called when the back button has been clicked
   * @override
   */
  _onBack () {
    if (this._operationExistedBefore) {
      this._operation.set(this._initialSettings)
    } else {
      this._ui.removeOperation('radial-blur')
    }
    this._ui.canvas.render()
  }

  /**
   * Gets called when the done button has been clicked
   * @override
   */
  _onDone () {
    this._ui.addHistory(this._operation, {
      position: this._initialSettings.position.clone(),
      gradientRadius: this._initialSettings.gradientRadius,
      blurRadius: this._initialSettings.blurRadius
    }, this._operationExistedBefore)
  }
}

/**
 * A unique string that identifies this control.
 * @type {String}
 */
RadialBlurControl.prototype.identifier = 'radial-blur'

export default RadialBlurControl
