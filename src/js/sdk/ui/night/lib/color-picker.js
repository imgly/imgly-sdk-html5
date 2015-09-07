/* global __DOTJS_TEMPLATE, Image */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import EventEmitter from '../../../lib/event-emitter'
import Utils from '../../../lib/utils'
import Color from '../../../lib/color'
import Vector2 from '../../../lib/math/vector2'

class ColorPicker extends EventEmitter {
  constructor (ui, element) {
    super()

    this._ui = ui
    this._element = element
    this._visible = false
    this._loaded = false

    this._overlay = this._element.querySelector('.imglykit-color-picker-overlay')
    this._currentColorCanvas = this._element.querySelector('.imglykit-color-picker-color')

    this._alphaCanvas = this._element.querySelector('canvas.imglykit-color-picker-alpha')
    this._alphaKnob = this._element.querySelector('.imglykit-color-picker-alpha-container .imglykit-transparent-knob')

    this._hueCanvas = this._element.querySelector('canvas.imglykit-color-picker-hue')
    this._hueKnob = this._element.querySelector('.imglykit-color-picker-hue-container .imglykit-transparent-knob')

    this._saturationCanvas = this._element.querySelector('canvas.imglykit-color-picker-saturation')
    this._saturationKnob = this._element.querySelector('.imglykit-color-picker-saturation-container .imglykit-transparent-knob')

    this._transparencyImage = new Image()
    this._transparencyImage.src = ui.helpers.assetPath('ui/night/transparency.png')
    this._transparencyImage.addEventListener('load', this._onTransparencyImageLoad.bind(this))

    this._onAlphaCanvasDown = this._onAlphaCanvasDown.bind(this)
    this._onAlphaCanvasDrag = this._onAlphaCanvasDrag.bind(this)
    this._onAlphaCanvasUp = this._onAlphaCanvasUp.bind(this)
    this._onHueCanvasDown = this._onHueCanvasDown.bind(this)
    this._onHueCanvasDrag = this._onHueCanvasDrag.bind(this)
    this._onHueCanvasUp = this._onHueCanvasUp.bind(this)

    this._onSaturationCanvasDown = this._onSaturationCanvasDown.bind(this)
    this._onSaturationCanvasDrag = this._onSaturationCanvasDrag.bind(this)
    this._onSaturationCanvasUp = this._onSaturationCanvasUp.bind(this)

    this._onElementClick = this._onElementClick.bind(this)

    this._handleToggle()
    this._handleAlphaKnob()
    this._handleHueKnob()
    this._handleSaturationKnob()
  }

  _onTransparencyImageLoad () {
    this._loaded = true
    this._render()
  }

  /**
   * The partial template string
   * @type {String}
   */
  static get template () {
    return __DOTJS_TEMPLATE('../../../templates/night/generics/color-picker_control.jst')
  }

  /**
   * Handles the toggling of the overlay
   * @private
   */
  _handleToggle () {
    this._element.addEventListener('click', this._onElementClick)
  }

  /**
   * Gets called when the element has been clicked
   * @param {Event} e
   * @private
   */
  _onElementClick (e) {
    if (e.target === this._element || e.target === this._currentColorCanvas) {
      if (this._visible) {
        this.hide()
        this.emit('hide')
      } else {
        this.show()
        this.emit('show')
      }
    }
  }

  /**
   * Hides the color picker
   */
  hide () {
    Utils.classList(this._overlay).remove('imglykit-visible')
    this._visible = false
  }

  /**
   * Shows the color picker
   */
  show () {
    Utils.classList(this._overlay).add('imglykit-visible')
    this._visible = true
  }

  /**
   * Sets the given value
   * @param {Number} value
   */
  setValue (value) {
    this._value = value.clone()
    let [h, s, v] = this._value.toHSV()
    this._hsvColor = {h, s, v}
    this._positionKnobs()
    this._render()
  }

  /**
   * Updates the knob positions to represent the current HSV color
   * @private
   */
  _positionKnobs () {
    this._positionAlphaKnob()
    this._positionHueKnob()
    this._positionSaturationKnob()
  }

  /**
   * Positions the alpha knob according to the current alpha value
   * @private
   */
  _positionAlphaKnob () {
    let canvas = this._alphaCanvas
    let canvasSize = new Vector2(canvas.width, canvas.height)

    let left = this._value.a * canvasSize.x
    this._alphaKnob.style.left = `${left}px`
  }

  /**
   * Positions the hue knob according to the current hue value
   * @private
   */
  _positionHueKnob () {
    let canvas = this._hueCanvas
    let canvasSize = new Vector2(canvas.width, canvas.height)

    let top = this._hsvColor.h * canvasSize.y
    this._hueKnob.style.top = `${top}px`
  }

  /**
   * Positions the saturation knob according to the current saturation value
   * @private
   */
  _positionSaturationKnob () {
    let canvas = this._saturationCanvas
    let canvasSize = new Vector2(canvas.width, canvas.height)

    let left = this._hsvColor.s * canvasSize.x
    this._saturationKnob.style.left = `${left}px`
    let top = (1 - this._hsvColor.v) * canvasSize.y
    this._saturationKnob.style.top = `${top}px`
  }

  /**
   * Updates and renders all controls to represent the current value
   * @private
   */
  _render () {
    if (!this._loaded) return
    this._renderCurrentColor()
    this._renderAlpha()
    this._renderHue()
    this._renderSaturation()
  }

  /**
   * Renders the currently selected color on the controls canvas
   * @private
   */
  _renderCurrentColor () {
    let canvas = this._currentColorCanvas
    let context = canvas.getContext('2d')

    let pattern = context.createPattern(this._transparencyImage, 'repeat')
    context.rect(0, 0, canvas.width, canvas.height)
    context.fillStyle = pattern
    context.fill()

    context.fillStyle = this._value.toRGBA()
    context.fill()
  }

  /**
   * Renders the transparency canvas with the current color
   * @private
   */
  _renderAlpha () {
    let canvas = this._alphaCanvas
    let context = canvas.getContext('2d')

    let pattern = context.createPattern(this._transparencyImage, 'repeat')
    context.rect(0, 0, canvas.width, canvas.height)
    context.fillStyle = pattern
    context.fill()

    let gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height)

    let color = this._value.clone()
    color.a = 0
    gradient.addColorStop(0, color.toRGBA())
    gradient.addColorStop(1, this._value.toHex())
    context.fillStyle = gradient
    context.fill()
  }

  /**
   * Renders the hue canvas
   * @private
   */
  _renderHue () {
    let canvas = this._hueCanvas
    let context = canvas.getContext('2d')

    let color = new Color()
    for (let y = 0; y < canvas.height; y++) {
      let ratio = y / canvas.height
      color.fromHSV(ratio, 1, 1)

      context.strokeStyle = color.toRGBA()
      context.beginPath()
      context.moveTo(0, y)
      context.lineTo(canvas.width, y)
      context.stroke()
    }
  }

  /**
   * Renders the saturation canvas
   * @private
   */
  _renderSaturation () {
    let canvas = this._saturationCanvas
    let context = canvas.getContext('2d')

    let imageData = context.getImageData(0, 0, canvas.width, canvas.height)

    let color = new Color(1, 0, 0, 1)
    for (let y = 0; y < canvas.height; y++) {
      let value = (canvas.height - y) / canvas.height
      for (let x = 0; x < canvas.width; x++) {
        let saturation = x / canvas.width
        color.fromHSV(this._hsvColor.h, saturation, value)
        let {r, g, b, a} = color

        let index = (y * canvas.width + x) * 4

        imageData.data[index] = r * 255
        imageData.data[index + 1] = g * 255
        imageData.data[index + 2] = b * 255
        imageData.data[index + 3] = a * 255
      }
    }

    context.putImageData(imageData, 0, 0)
  }

  /**
   * Handles the dragging of the alpha knob
   * @private
   */
  _handleAlphaKnob () {
    this._alphaCanvas.addEventListener('mousedown', this._onAlphaCanvasDown)
    this._alphaCanvas.addEventListener('touchstart', this._onAlphaCanvasDown)
  }

  /**
   * Gets called when the user clicks the alpha knob
   * @param {Event} e
   * @private
   */
  _onAlphaCanvasDown (e) {
    e.preventDefault()

    this._onAlphaCanvasDrag(e)

    document.addEventListener('mousemove', this._onAlphaCanvasDrag)
    document.addEventListener('touchmove', this._onAlphaCanvasDrag)

    document.addEventListener('mouseup', this._onAlphaCanvasUp)
    document.addEventListener('touchend', this._onAlphaCanvasUp)
  }

  /**
   * Gets called when the user drags the alpha knob
   * @param {Event} e
   * @private
   */
  _onAlphaCanvasDrag (e) {
    e.preventDefault()

    // Calculate relative mouse position on canvas
    let canvas = this._alphaCanvas
    let canvasSize = new Vector2(canvas.width, canvas.height)
    let mousePosition = Utils.getEventPosition(e)
    let { left, top } = canvas.getBoundingClientRect()
    let offset = new Vector2(left, top)
    let relativePosition = mousePosition.subtract(offset)
    relativePosition.clamp(new Vector2(0, 0), canvasSize)

    // Update knob css positioning
    this._alphaKnob.style.left = `${relativePosition.x}px`

    // Update alpha value
    this._value.a = relativePosition.x / canvasSize.x
    this._updateColor()
  }

  /**
   * Gets called when the user stops dragging the alpha knob
   * @param {Event} e
   * @private
   */
  _onAlphaCanvasUp () {
    document.removeEventListener('mousemove', this._onAlphaCanvasDrag)
    document.removeEventListener('touchmove', this._onAlphaCanvasDrag)

    document.removeEventListener('mouseup', this._onAlphaCanvasUp)
    document.removeEventListener('touchend', this._onAlphaCanvasUp)
  }

  /**
   * Handles the dragging of the hue knob
   * @private
   */
  _handleHueKnob () {
    this._hueCanvas.addEventListener('mousedown', this._onHueCanvasDown)
    this._hueCanvas.addEventListener('touchstart', this._onHueCanvasDown)
  }

  /**
   * Gets called when the user clicks the canvas knob
   * @param {Event} e
   * @private
   */
  _onHueCanvasDown (e) {
    e.preventDefault()

    this._onHueCanvasDrag(e)

    document.addEventListener('mousemove', this._onHueCanvasDrag)
    document.addEventListener('touchmove', this._onHueCanvasDrag)

    document.addEventListener('mouseup', this._onHueCanvasUp)
    document.addEventListener('touchend', this._onHueCanvasUp)
  }

  /**
   * Gets called when the user drags the hue knob
   * @param {Event} e
   * @private
   */
  _onHueCanvasDrag (e) {
    e.preventDefault()

    let canvas = this._hueCanvas
    let canvasSize = new Vector2(canvas.width, canvas.height)

    // Calculate relative mouse position on canvas
    let mousePosition = Utils.getEventPosition(e)
    let { left, top } = canvas.getBoundingClientRect()
    let offset = new Vector2(left, top)
    let relativePosition = mousePosition.subtract(offset)
    relativePosition.clamp(new Vector2(0, 0), canvasSize)

    // Update saturaiton knob css positioning
    this._hueKnob.style.top = `${relativePosition.y}px`

    // Update saturation and value
    relativePosition.divide(canvasSize)
    this._hsvColor.h = relativePosition.y
    this._updateColor()
  }

  /**
   * Gets called when the user stops dragging the alpha knob
   * @param {Event} e
   * @private
   */
  _onHueCanvasUp () {
    document.removeEventListener('mousemove', this._onHueCanvasDrag)
    document.removeEventListener('touchmove', this._onHueCanvasDrag)

    document.removeEventListener('mouseup', this._onHueCanvasUp)
    document.removeEventListener('touchend', this._onHueCanvasUp)
  }

  /**
   * Handles the dragging of the saturation knob
   * @private
   */
  _handleSaturationKnob () {
    this._saturationCanvas.addEventListener('mousedown', this._onSaturationCanvasDown)
    this._saturationCanvas.addEventListener('touchstart', this._onSaturationCanvasDown)
  }

  /**
   * Gets called when the user clicks the saturation canvas
   * @param {Event} e
   * @private
   */
  _onSaturationCanvasDown (e) {
    e.preventDefault()

    this._onSaturationCanvasDrag(e)

    document.addEventListener('mousemove', this._onSaturationCanvasDrag)
    document.addEventListener('touchmove', this._onSaturationCanvasDrag)

    document.addEventListener('mouseup', this._onSaturationCanvasUp)
    document.addEventListener('touchend', this._onSaturationCanvasUp)
  }

  /**
   * Gets called when the user drags the saturation knob
   * @param {Event} e
   * @private
   */
  _onSaturationCanvasDrag (e) {
    e.preventDefault()

    let canvas = this._saturationCanvas
    let canvasSize = new Vector2(canvas.width, canvas.height)

    // Calculate relative mouse position on canvas
    let mousePosition = Utils.getEventPosition(e)
    let { left, top } = canvas.getBoundingClientRect()
    let offset = new Vector2(left, top)
    let relativePosition = mousePosition.subtract(offset)
    relativePosition.clamp(0, canvas.width)

    // Update saturaiton knob css positioning
    this._saturationKnob.style.left = `${relativePosition.x}px`
    this._saturationKnob.style.top = `${relativePosition.y}px`

    // Update saturation and value
    relativePosition.divide(canvasSize)
    this._hsvColor.s = relativePosition.x
    this._hsvColor.v = 1 - relativePosition.y
    this._updateColor()
  }

  /**
   * Gets called when the user stops dragging the saturation knob
   * @param {Event} e
   * @private
   */
  _onSaturationCanvasUp () {
    document.removeEventListener('mousemove', this._onSaturationCanvasDrag)
    document.removeEventListener('touchmove', this._onSaturationCanvasDrag)

    document.removeEventListener('mouseup', this._onSaturationCanvasUp)
    document.removeEventListener('touchend', this._onSaturationCanvasUp)
  }

  /**
   * Updates the attached color, emits the `update` event and triggers
   * a render
   * @private
   */
  _updateColor () {
    this._value.fromHSV(this._hsvColor.h, this._hsvColor.s, this._hsvColor.v)
    this.emit('update', this._value)
    this._render()
  }
}

export default ColorPicker
