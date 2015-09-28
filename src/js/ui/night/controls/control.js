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

import Helpers from '../../base/helpers'
import EventEmitter from '../../../lib/event-emitter'
import Utils from '../../../lib/utils'
import Scrollbar from '../lib/scrollbar'

class Control extends EventEmitter {
  constructor (kit, ui, operation) {
    super()

    this._kit = kit
    this._ui = ui
    this._operation = operation
    this._helpers = new Helpers(this._kit, this._ui, this._ui.options)
    this._partialTemplates = {
      doneButton: __DOTJS_TEMPLATE('../../../templates/night/generics/done_button.jst')
    }

    this._template = __DOTJS_TEMPLATE('../../../templates/night/generics/control.jst')
    this._active = false
    this._historyItem = null

    this.init()
  }

  /**
   * Sets the containers that the control will be rendered to
   * @param {DOMElement} controlsContainer
   * @param {DOMElement} canvasControlsContainer
   */
  setContainers (controlsContainer, canvasControlsContainer) {
    this._controlsContainer = controlsContainer
    this._canvasControlsContainer = canvasControlsContainer
  }

  /**
   * The entry point for this control
   */
  init () {

  }

  /**
   * Resets the control to display the current values
   */
  update () {
    this._renderAllControls()
    this._onEnter()
  }

  /**
   * Updates the control to represent the initial values
   * @private
   */
  _setInitialValues () {

  }

  /**
   * Renders the controls
   * @private
   */
  _renderAllControls () {
    this._renderControls()
    this._renderCanvasControls()
    this._initScrollbar()

    this._handleBackAndDoneButtons()
    this._enableCanvasControls()
  }

  /**
   * Renders the controls
   * @private
   */
  _renderControls () {
    if (typeof this._controlsTemplate === 'undefined') {
      throw new Error('Control#_renderOverviewControls: Control needs to define this._controlsTemplate.')
    }

    // Render the template
    let html = this._template(this._context)

    if (typeof this._controls !== 'undefined' &&
        this._controls.parentNode !== null) {
      this._controls.parentNode.removeChild(this._controls)
    }

    // Create a wrapper
    this._controls = document.createElement('div')
    this._controls.innerHTML = html

    // Append to DOM
    this._controlsContainer.appendChild(this._controls)
  }

  /**
   * Renders the canvas controls
   * @private
   */
  _renderCanvasControls () {
    if (typeof this._canvasControlsTemplate === 'undefined') {
      return // Canvas controls are optional
    }

    // Render the template
    let html = this._canvasControlsTemplate(this._context)

    if (typeof this._canvasControls !== 'undefined' &&
        this._canvasControls.parentNode !== null) {
      this._canvasControls.parentNode.removeChild(this._canvasControls)
    }

    // Create a wrapper
    this._canvasControls = document.createElement('div')
    this._canvasControls.innerHTML = html

    // Append to DOM
    this._canvasControlsContainer.appendChild(this._canvasControls)
  }

  /**
   * Initializes the custom scrollbar
   * @private
   */
  _initScrollbar () {
    let list = this._controls.querySelector('.imglykit-controls-list')
    if (list) {
      this._scrollbar = new Scrollbar(list.parentNode)
    }
  }

  /**
   * Removes the controls from the DOM
   * @private
   */
  _removeControls () {
    this._controls.parentNode.removeChild(this._controls)
    if (this._canvasControls) {
      this._canvasControls.parentNode.removeChild(this._canvasControls)
    }

    if (this._scrollbar) this._scrollbar.remove()
  }

  /**
   * Handles the back and done buttons
   * @private
   */
  _handleBackAndDoneButtons () {
    // Back button
    this._backButton = this._controls.querySelector('.imglykit-controls-back')
    if (this._backButton) {
      this._backButton.addEventListener('click', this._onBackButtonClick.bind(this))
    }

    // Done button
    this._doneButton = this._controls.querySelector('.imglykit-controls-done')
    if (this._doneButton) {
      this._doneButton.addEventListener('click', this._onDoneButtonClick.bind(this))
    }
  }

  /**
   * Gets called when the back button has been clicked
   * @private
   */
  _onBackButtonClick () {
    this._onBack()
    this.emit('back')
  }

  /**
   * Gets called when the done button has been clicked
   * @private
   */
  _onDoneButtonClick () {
    this._onDone()
    this.emit('back')
  }

  /**
   * Highlights the done button
   * @private
   */
  _highlightDoneButton () {
    if (!this._doneButton) return
    Utils.classList(this._doneButton).add('highlighted')
  }

  /**
   * Gets called when this control is activated
   * @internal Used by the SDK, don't override.
   */
  enter () {
    this._active = true

    if (typeof this._canvasControlsTemplate !== 'undefined') {
      this._ui.hideZoom()
    }

    this._renderAllControls()
    this._onEnter()
    this._setInitialValues()
  }

  /**
   * Gets called when this control is deactivated
   * @internal Used by the SDK, don't override.
   */
  leave () {
    this._active = false

    this._ui.showZoom()

    this._removeControls()
    this._disableCanvasControls()
    this._onLeave()
  }

  _enableCanvasControls () {
    if (typeof this._canvasControlsTemplate === 'undefined') { return }
    Utils.classList(this._canvasControlsContainer).remove('imglykit-canvas-controls-disabled')
  }

  _disableCanvasControls () {
    if (typeof this._canvasControlsTemplate === 'undefined') { return }
    Utils.classList(this._canvasControlsContainer).add('imglykit-canvas-controls-disabled')
  }

  // Protected methods

  /**
   * Gets called when this control is activated.
   * @protected
   */
  _onEnter () {}

  /**
   * Gets called when this control is deactivated
   * @protected
   */
  _onLeave () {}

  /**
   * Gets called when the back button has been clicked
   * @protected
   */
  _onBack () {}

  /**
   * Gets called when the done button has been clicked
   * @protected
   */
  _onDone () {}

  /**
   * Gets called when the zoom level has been changed while
   * this control is active
   */
  onZoom () {}

  /**
   * The data that is available to the template
   * @type {Object}
   */
  get _context () {
    let context = this.context

    context = Utils.extend(context, {
      helpers: this._helpers,
      identifier: this.identifier
    })

    // Render partials before rendering control
    context.partials = {}
    for (let name in this._partialTemplates) {
      let template = this._partialTemplates[name]
      let partialContext = Utils.extend({}, context, template.additionalContext || {})
      context.partials[name] = template(partialContext)
    }
    context.partials.control = this._controlsTemplate(context)

    return context
  }

  /**
   * The data that is available to the template
   * @abstract
   */
  get context () {
    return {}
  }
}

/**
 * A unique string that identifies this control.
 * @type {String}
 */
Control.prototype.identifier = null

/**
 * To create an {@link ImglyKit.NightUI.Control} class of your own, call
 * this method and provide instance properties and functions.
 * @function
 */
import extend from '../../../lib/extend'
Control.extend = extend

export default Control
