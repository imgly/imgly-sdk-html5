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

import { Vector2 } from '../globals'
import Control from './control'

class RotationControl extends Control {
  /**
   * Entry point for this control
   */
  init () {
    let controlsTemplate = __DOTJS_TEMPLATE('../templates/operations/rotation_controls.jst')
    this._controlsTemplate = controlsTemplate
  }

  /**
   * Gets called when this control is activated
   */
  _onEnter () {
    this._historyItem = null

    this._operationExistedBefore = !!this._ui.operations.orientation
    this._operation = this._ui.getOrCreateOperation('orientation')
    this._operation.dirty = true
    this._cropOperation = this._ui.operations.crop

    this._initialOptions = this._operation.serializeOptions()
    this._initialDegrees = this._operation.getRotation()

    let listItems = this._controls.querySelectorAll('li')
    if (this._cropOperation) {
      if (!this._initialStart && !this._initialEnd) {
        // Store initial settings for 'back' and 'done' buttons
        this._initialStart = this._cropOperation.getStart().clone()
        this._initialEnd = this._cropOperation.getEnd().clone()
      }
    }
    this._listItems = Array.prototype.slice.call(listItems)

    // Listen to click events
    for (let i = 0; i < this._listItems.length; i++) {
      let listItem = this._listItems[i]
      listItem.addEventListener('click', () => {
        this._onListItemClick(listItem)
      })
    }
  }

  /**
   * Gets called when the given item has been clicked
   * @param {DOMObject} item
   * @private
   */
  _onListItemClick (item) {
    let degrees = item.getAttribute('data-degrees')
    degrees = parseInt(degrees, 10)

    let currentDegrees = this._operation.getRotation()

    if (!this._historyItem) {
      this._historyItem = this._ui.addHistory(this._operation, {
        rotation: this._initialDegrees
      }, this._operationExistedBefore)
    }

    this._rotateCrop(degrees)
    this._operation.setRotation(currentDegrees + degrees)
    this._ui.canvas.zoomToFit()
  }

  /**
   * Rotates the current crop options by the given degrees
   * @param {Number} degrees
   * @private
   */
  _rotateCrop (degrees) {
    if (!this._cropOperation) return

    let start = this._cropOperation.getStart().clone()
    let end = this._cropOperation.getEnd().clone()

    const _start = start.clone()
    switch (degrees) {
      case 90:
        start = new Vector2(1.0 - end.y, _start.x)
        end = new Vector2(1.0 - _start.y, end.x)
        break
      case -90:
        start = new Vector2(_start.y, 1.0 - end.x)
        end = new Vector2(end.y, 1.0 - _start.x)
        break
    }

    this._cropOperation.set({ start, end })
  }

  /**
   * Gets called when the back button has been clicked
   * @override
   */
  _onBack () {
    if (this._operation.optionsEqual(this._initialOptions)) {
      this._ui.removeOperation('orientation')
    }
  }
}

/**
 * A unique string that identifies this control.
 * @type {String}
 */
RotationControl.prototype.identifier = 'rotation'

export default RotationControl
