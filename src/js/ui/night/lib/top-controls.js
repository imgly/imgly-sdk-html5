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

class TopControls extends EventEmitter {
  constructor (kit, ui) {
    super()

    this._kit = kit
    this._ui = ui
    this.init()
  }

  /**
   * Initializes the controls
   */
  init () {
    this._canvas = this._ui.canvas
  }

  /**
   * Initializes the controls
   */
  run () {
    let { container } = this._ui

    this._rightControls = container.querySelector('.imglykit-top-controls-right')
    this._leftControls = container.querySelector('.imglykit-top-controls-left')

    this._undoButton = container.querySelector('.imglykit-undo')
    this._zoomIn = container.querySelector('.imglykit-zoom-in')
    this._zoomOut = container.querySelector('.imglykit-zoom-out')
    this._zoomLevel = container.querySelector('.imglykit-zoom-level-num')
    this._newButton = container.querySelector('.imglykit-new')
    this._exportButton = container.querySelector('.imglykit-export')
    this._handleZoom()
    this._handleUndo()
    this._handleNew()
    this._handleExport()
  }

  /**
   * Handles the zoom controls
   * @private
   */
  _handleZoom () {
    this._zoomIn.addEventListener('click', this._onZoomInClick.bind(this))
    this._zoomOut.addEventListener('click', this._onZoomOutClick.bind(this))
  }

  /**
   * Handles the undo control
   * @private
   */
  _handleUndo () {
    this._undoButton.addEventListener('click', this._undo.bind(this))
    this._undo()
  }

  /**
   * Handles the new button
   * @private
   */
  _handleNew () {
    if (!this._newButton) return

    this._newButton.addEventListener('click', this._onNewClick.bind(this))
  }

  /**
   * Handles the export button
   * @private
   */
  _handleExport () {
    if (!this._exportButton) return

    this._exportButton.addEventListener('click', this._onExportClick.bind(this))
  }

  /**
   * Gets called when the user clicks the new button
   * @param {Event} e
   * @private
   */
  _onNewClick (e) {
    e.preventDefault()
    e.stopPropagation()
    this.emit('new')
  }

  /**
   * Gets called when the user clicks the export button
   * @param {Event} e
   * @private
   */
  _onExportClick (e) {
    e.preventDefault()
    e.stopPropagation()

    this.emit('export')
  }

  /**
   * Gets called when the user clicks the undo button
   * @private
   */
  _undo () {
    this.emit('undo')
  }

  /**
   * Updates the undo button visible state
   */
  updateUndoButton () {
    let { history } = this._ui
    if (history.length === 0) {
      this._undoButton.style.display = 'none'
    } else {
      this._undoButton.style.display = 'inline-block'
    }
  }

  /**
   * Updates the export button visible state
   */
  updateExportButton () {
    if (!this._exportButton) return

    let { image } = this._ui
    if (image) {
      this._exportButton.style.display = 'inline-block'
    } else {
      this._exportButton.style.display = 'none'
    }
  }

  /**
   * Gets called when the user clicked the zoom in button
   * @param {Event}
   * @private
   */
  _onZoomInClick (e) {
    e.preventDefault()
    e.stopPropagation()

    this.emit('zoom-in')
    this.updateZoomLevel()
  }

  /**
   * Gets called when the user clicked the zoom out button
   * @param {Event}
   * @private
   */
  _onZoomOutClick (e) {
    e.preventDefault()
    e.stopPropagation()

    this.emit('zoom-out')
    this.updateZoomLevel()
  }

  /**
   * Shows the zoom control
   */
  showZoom () {
    this._rightControls.style.display = 'inline-block'
  }

  /**
   * Hides the zoom control
   */
  hideZoom () {
    this._rightControls.style.display = 'none'
  }

  /**
   * Updates the zoom level display
   */
  updateZoomLevel () {
    let { zoomLevel } = this._canvas
    this._zoomLevel.innerHTML = Math.round(zoomLevel * 100)
  }
}

export default TopControls
