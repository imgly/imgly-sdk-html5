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
import ColorPicker from '../lib/color-picker'
import Vector2 from '../../../lib/math/vector2'
import Utils from '../../../lib/utils'

class TextControl extends Control {
  /**
   * Entry point for this control
   */
  init () {
    let controlsTemplate = __DOTJS_TEMPLATE('../../../templates/night/operations/text_controls.jst')
    this._controlsTemplate = controlsTemplate

    let canvasControlsTemplate = __DOTJS_TEMPLATE('../../../templates/night/operations/text_canvas.jst')
    this._canvasControlsTemplate = canvasControlsTemplate

    this._partialTemplates.fgColorPicker = ColorPicker.template
    this._partialTemplates.fgColorPicker.additionalContext = {
      id: 'imglykit-text-foreground-color-picker'
    }

    this._partialTemplates.bgColorPicker = ColorPicker.template
    this._partialTemplates.bgColorPicker.additionalContext = {
      id: 'imglykit-text-background-color-picker'
    }

    this._fonts = []
    this._addFonts()
  }

  _renderControls () {
    this._partialTemplates.fgColorPicker.additionalContext.label = this._ui.translate('controls.text.foreground')
    this._partialTemplates.bgColorPicker.additionalContext.label = this._ui.translate('controls.text.background')
    super._renderControls()
  }

  /**
   * Gets called when this control is activated
   * @override
   */
  _onEnter () {
    this._operationExistedBefore = !!this._ui.operations.text
    this._operation = this._ui.getOrCreateOperation('text')

    // Don't render initially
    this._ui.removeOperation('text')

    let canvasSize = this._ui.canvas.size

    this._initialSettings = {
      lineHeight: this._operation.getLineHeight(),
      fontSize: this._operation.getFontSize(),
      fontFamily: this._operation.getFontFamily(),
      fontWeight: this._operation.getFontWeight(),
      color: this._operation.getColor(),
      position: this._operation.getPosition(),
      text: this._operation.getText() || '',
      maxWidth: this._operation.getMaxWidth(),
      backgroundColor: this._operation.getBackgroundColor()
    }

    this._settings = {
      lineHeight: this._initialSettings.lineHeight,
      fontSize: this._initialSettings.fontSize,
      fontFamily: this._initialSettings.fontFamily,
      fontWeight: this._initialSettings.fontWeight,
      color: this._initialSettings.color.clone(),
      position: this._initialSettings.position.clone().multiply(canvasSize),
      text: this._initialSettings.text,
      maxWidth: this._initialSettings.maxWidth * canvasSize.x,
      backgroundColor: this._initialSettings.backgroundColor.clone()
    }

    // Remember zoom level and zoom to fit the canvas
    this._initialZoomLevel = this._ui.canvas.zoomLevel

    this._container = this._canvasControls.querySelector('.imglykit-canvas-text')
    this._textarea = this._canvasControls.querySelector('textarea')
    this._textarea.focus()

    this._moveKnob = this._canvasControls.querySelector('.imglykit-crosshair')
    this._resizeKnob = this._canvasControls.querySelector('.imglykit-knob')

    // If the text has been edited before, subtract the knob width and padding
    if (this._operationExistedBefore) {
      this._settings.position.x -= 2
      this._settings.position.y -= 2
    }

    this._onTextareaKeyUp = this._onTextareaKeyUp.bind(this)
    this._onResizeKnobDown = this._onResizeKnobDown.bind(this)
    this._onResizeKnobDrag = this._onResizeKnobDrag.bind(this)
    this._onResizeKnobUp = this._onResizeKnobUp.bind(this)
    this._onMoveKnobDown = this._onMoveKnobDown.bind(this)
    this._onMoveKnobDrag = this._onMoveKnobDrag.bind(this)
    this._onMoveKnobUp = this._onMoveKnobUp.bind(this)
    this._onForegroundColorUpdate = this._onForegroundColorUpdate.bind(this)
    this._onBackgroundColorUpdate = this._onBackgroundColorUpdate.bind(this)

    this._initColorPickers()
    this._renderListItems()
    this._handleListItems()
    this._handleTextarea()
    this._handleResizeKnob()
    this._handleMoveKnob()

    // Resize asynchronously to render a frame
    setTimeout(() => {
      this._resizeTextarea()
    }, 1)

    this._ui.canvas.zoomToFit()
      .then(() => {
        this._applySettings()
      })
  }

  /**
   * Initializes the color pickers
   * @private
   */
  _initColorPickers () {
    let foregroundColorPicker = this._controls.querySelector('#imglykit-text-foreground-color-picker')
    this._foregroundColorPicker = new ColorPicker(this._ui, foregroundColorPicker)
    this._foregroundColorPicker.setValue(this._operation.getColor())
    this._foregroundColorPicker.on('update', this._onForegroundColorUpdate)
    this._foregroundColorPicker.on('show', () => {
      this._backgroundColorPicker.hide()
    })

    let backgroundColorPicker = this._controls.querySelector('#imglykit-text-background-color-picker')
    this._backgroundColorPicker = new ColorPicker(this._ui, backgroundColorPicker)
    this._backgroundColorPicker.setValue(this._operation.getBackgroundColor())
    this._backgroundColorPicker.on('update', this._onBackgroundColorUpdate)
    this._backgroundColorPicker.on('show', () => {
      this._foregroundColorPicker.hide()
    })
  }

  /**
   * Renders the text on the list item canvas elements
   * @private
   */
  _renderListItems () {
    const canvasItems = this._controls.querySelectorAll('li canvas')
    this._canvasItems = Array.prototype.slice.call(canvasItems)

    for (let i = 0; i < this._canvasItems.length; i++) {
      const canvas = this._canvasItems[i]
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight

      const listItem = canvas.parentNode

      const context = canvas.getContext('2d')
      const fontFamily = listItem.getAttribute('data-name')
      const fontWeight = listItem.getAttribute('data-weight')

      context.font = `${fontWeight} 30px ${fontFamily}`
      context.textBaseline = 'middle'
      context.textAlign = 'center'
      context.fillStyle = 'white'

      context.fillText(fontFamily.substr(0, 2), canvas.width / 2, canvas.height / 2)
    }
  }

  /**
   * Handles the list item click events
   * @private
   */
  _handleListItems () {
    let listItems = this._controls.querySelectorAll('li')
    this._listItems = Array.prototype.slice.call(listItems)

    // Listen to click events
    for (let i = 0; i < this._listItems.length; i++) {
      let listItem = this._listItems[i]
      const name = listItem.getAttribute('data-name')
      listItem.addEventListener('click', () => {
        this._onListItemClick(listItem)
      })

      if ((!this._operationExistedBefore && i === 0) ||
        (this._operationExistedBefore && name === this._initialSettings.fontFamily)) {
        this._onListItemClick(listItem, false)
      }
    }
  }

  /**
   * Handles the text area key events
   * @private
   */
  _handleTextarea () {
    this._textarea.addEventListener('keyup', this._onTextareaKeyUp)
  }

  /**
   * Gets called when the user releases a key inside the text area
   * @private
   */
  _onTextareaKeyUp () {
    this._resizeTextarea()
    this._settings.text = this._textarea.value
    this._highlightDoneButton()
  }

  /**
   * Resizes the text area to fit the text inside of it
   * @private
   */
  _resizeTextarea () {
    let scrollTop = this._textarea.scrollTop

    if (!scrollTop) {
      let scrollHeight, height
      do {
        scrollHeight = this._textarea.scrollHeight
        height = this._textarea.offsetHeight
        this._textarea.style.height = `${height - 5}px`
      }
      while (scrollHeight && (scrollHeight !== this._textarea.scrollHeight))
    }

    let scrollHeight = this._textarea.scrollHeight
    this._textarea.style.height = `${scrollHeight + 20}px`
  }

  /**
   * Handles the move knob dragging
   * @private
   */
  _handleMoveKnob () {
    this._moveKnob.addEventListener('mousedown', this._onMoveKnobDown)
    this._moveKnob.addEventListener('touchstart', this._onMoveKnobDown)
  }

  /**
   * Gets called when the user clicks the move knob
   * @private
   */
  _onMoveKnobDown (e) {
    e.preventDefault()

    this._initialMousePosition = Utils.getEventPosition(e)
    this._initialPosition = this._settings.position.clone()

    document.addEventListener('mousemove', this._onMoveKnobDrag)
    document.addEventListener('touchmove', this._onMoveKnobDrag)

    document.addEventListener('mouseup', this._onMoveKnobUp)
    document.addEventListener('touchend', this._onMoveKnobUp)
  }

  /**
   * Gets called when the user drags the move knob
   * @private
   */
  _onMoveKnobDrag (e) {
    e.preventDefault()

    let canvasSize = this._ui.canvas.size

    let mousePosition = Utils.getEventPosition(e)
    let diff = mousePosition.clone()
      .subtract(this._initialMousePosition)

    let minPosition = new Vector2(0, 0)
    let containerSize = new Vector2(
      this._container.offsetWidth,
      this._container.offsetHeight
    )
    let maxPosition = canvasSize.clone().subtract(containerSize)
    let position = this._initialPosition.clone()
      .add(diff)
      .clamp(minPosition, maxPosition)

    this._settings.position = position

    this._container.style.left = `${position.x}px`
    this._container.style.top = `${position.y}px`
  }

  /**
   * Gets called when the user releases the move knob
   * @private
   */
  _onMoveKnobUp () {
    document.removeEventListener('mousemove', this._onMoveKnobDrag)
    document.removeEventListener('touchmove', this._onMoveKnobDrag)

    document.removeEventListener('mouseup', this._onMoveKnobUp)
    document.removeEventListener('touchend', this._onMoveKnobUp)
  }

  /**
   * Handles the resize knob dragging
   * @private
   */
  _handleResizeKnob () {
    this._resizeKnob.addEventListener('mousedown', this._onResizeKnobDown)
    this._resizeKnob.addEventListener('touchstart', this._onResizeKnobDown)
  }

  /**
   * Gets called when the user clicks the resize knob
   * @param {Event} e
   * @private
   */
  _onResizeKnobDown (e) {
    e.preventDefault()

    this._initialMousePosition = Utils.getEventPosition(e)
    this._initialMaxWidth = this._settings.maxWidth

    document.addEventListener('mousemove', this._onResizeKnobDrag)
    document.addEventListener('touchmove', this._onResizeKnobDrag)

    document.addEventListener('mouseup', this._onResizeKnobUp)
    document.addEventListener('touchend', this._onResizeKnobUp)
  }

  /**
   * Gets called when the user drags the resize knob
   * @param {Event} e
   * @private
   */
  _onResizeKnobDrag (e) {
    e.preventDefault()

    let canvasSize = this._ui.canvas.size
    let mousePosition = Utils.getEventPosition(e)
    let diff = mousePosition.subtract(this._initialMousePosition)

    let position = this._settings.position.clone()
    let maxWidthAllowed = canvasSize.x - position.x

    let maxWidth = this._initialMaxWidth + diff.x
    maxWidth = Math.max(100, Math.min(maxWidthAllowed, maxWidth))
    this._settings.maxWidth = maxWidth
    this._textarea.style.width = `${maxWidth}px`

    this._resizeTextarea()
  }

  /**
   * Gets called when the user releases the resize knob
   * @param {Event} e
   * @private
   */
  _onResizeKnobUp () {
    document.removeEventListener('mousemove', this._onResizeKnobDrag)
    document.removeEventListener('touchmove', this._onResizeKnobDrag)

    document.removeEventListener('mouseup', this._onResizeKnobUp)
    document.removeEventListener('touchend', this._onResizeKnobUp)
  }

  /**
   * Gets called when the user selects another color using
   * the color picker.
   * @param {Color} value
   * @private
   */
  _onForegroundColorUpdate (value) {
    this._settings.color = value
    this._applySettings()
    this._highlightDoneButton()
  }

  /**
   * Gets called when the user selects another color using
   * the color picker.
   * @param {Color} value
   * @private
   */
  _onBackgroundColorUpdate (value) {
    this._settings.backgroundColor = value
    this._applySettings()
    this._highlightDoneButton()
  }

  /**
   * Styles the textarea to represent the current settings
   * @private
   */
  _applySettings () {
    let textarea = this._textarea
    let settings = this._settings

    let canvasSize = this._ui.canvas.size
    let actualFontSize = settings.fontSize * canvasSize.y

    this._container.style.left = `${settings.position.x}px`
    this._container.style.top = `${settings.position.y}px`

    textarea.value = settings.text
    textarea.style.fontFamily = settings.fontFamily
    textarea.style.fontSize = `${actualFontSize}px`
    textarea.style.fontWeight = settings.fontWeight
    textarea.style.lineHeight = settings.lineHeight
    textarea.style.color = settings.color.toRGBA()
    textarea.style.backgroundColor = settings.backgroundColor.toRGBA()
    textarea.style.width = `${settings.maxWidth}px`
  }

  /**
   * Gets called when the user clicked a list item
   * @private
   */
  _onListItemClick (item, manually=true) {
    this._deactivateAllItems()

    const name = item.getAttribute('data-name')
    const weight = item.getAttribute('data-weight')
    this._settings.fontFamily = name
    this._settings.fontWeight = weight

    this._applySettings()

    Utils.classList(item).add('imglykit-controls-item-active')

    if (manually) {
      this._highlightDoneButton()
    }
  }

  /**
   * Deactivates all list items
   * @private
   */
  _deactivateAllItems () {
    for (let i = 0; i < this._listItems.length; i++) {
      let listItem = this._listItems[i]
      Utils.classList(listItem).remove('imglykit-controls-item-active')
    }
  }

  /**
   * Adds the default fonts
   * @private
   */
  _addFonts () {
    this.addFont('Helvetica', 'normal')
    this.addFont('Verdana', 'normal')
    this.addFont('Times New Roman', 'normal')
  }

  /**
   * Adds a font with the given name and weight
   * @param {String} name
   * @param {String} weight
   */
  addFont (name, weight) {
    this._fonts.push({ name, weight })
  }

  /**
   * Gets called when the done button has been clicked
   * @override
   */
  _onDone () {
    let canvasSize = this._ui.canvas.size
    let padding = new Vector2(2, 2)
    let position = this._settings.position.clone()
      .add(padding)
      .divide(canvasSize)

    this._ui.canvas.setZoomLevel(this._initialZoomLevel, false)

    this._operation = this._ui.getOrCreateOperation('text')
    this._operation.set({
      fontSize: this._settings.fontSize,
      fontFamily: this._settings.fontFamily,
      fontWeight: this._settings.fontWeight,
      color: this._settings.color,
      backgroundColor: this._settings.backgroundColor,
      position: position,
      text: this._settings.text,
      maxWidth: this._settings.maxWidth / canvasSize.x
    })
    this._ui.canvas.render()

    this._ui.addHistory(this, {
      fontFamily: this._initialSettings.fontFamily,
      fontWeight: this._initialSettings.fontWeight,
      color: this._initialSettings.color.clone(),
      backgroundColor: this._initialSettings.backgroundColor.clone(),
      position: this._initialSettings.position.clone(),
      text: this._initialSettings.text,
      maxWidth: this._initialSettings.maxWidth
    }, this._operationExistedBefore)
  }

  /**
   * Gets called when the back button has been clicked
   * @override
   */
  _onBack () {
    if (this._operationExistedBefore) {
      this._operation = this._ui.getOrCreateOperation('text')
      this._operation.set(this._initialSettings)
    } else {
      this._ui.removeOperation('text')
    }
    this._ui.canvas.setZoomLevel(this._initialZoomLevel)
  }

  /**
   * The data that is available to the template
   * @type {Object}
   * @override
   */
  get context () {
    let context = super.context
    context.fonts = this._fonts
    return context
  }
}

/**
 * A unique string that identifies this control.
 * @type {String}
 */
TextControl.prototype.identifier = 'text'

export default TextControl
