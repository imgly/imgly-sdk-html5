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

import { Utils } from '../globals'
import Control from './control'

class FlipControl extends Control {
  /**
   * Entry point for this control
   */
  init () {
    let controlsTemplate = __DOTJS_TEMPLATE('../templates/operations/flip_controls.jst')
    this._controlsTemplate = controlsTemplate
  }

  /**
   * Gets called when this control is activated
   */
  _onEnter () {
    this._historyItem = null
    this._operationExistedBefore = !!this._ui.operations.orientation
    this._operation = this._ui.getOrCreateOperation('orientation')

    this._initialOptions = this._operation.serializeOptions()
    this._initialHorizontal = this._operation.getFlipHorizontally()
    this._initialVertical = this._operation.getFlipVertically()

    let listItems = this._controls.querySelectorAll('li')
    this._listItems = Array.prototype.slice.call(listItems)

    // Listen to click events
    for (let i = 0; i < this._listItems.length; i++) {
      let listItem = this._listItems[i]
      listItem.addEventListener('click', () => {
        this._onListItemClick(listItem)
      })

      const direction = listItem.getAttribute('data-direction')
      if (direction === 'horizontal' && this._operation.getFlipHorizontally()) {
        this._toggleItem(listItem, true)
      } else if (direction === 'vertical' && this._operation.getFlipVertically()) {
        this._toggleItem(listItem, true)
      }
    }
  }

  /**
   * Gets called when the user clicked a list item
   * @private
   */
  _onListItemClick (item) {
    const direction = item.getAttribute('data-direction')
    let active = false

    let currentHorizontal = this._operation.getFlipHorizontally()
    let currentVertical = this._operation.getFlipVertically()

    if (direction === 'horizontal') {
      this._operation.setFlipHorizontally(!currentHorizontal)
      currentHorizontal = !currentHorizontal
      this._ui.canvas.render()
      active = !currentHorizontal
    } else if (direction === 'vertical') {
      this._operation.setFlipVertically(!currentVertical)
      currentVertical = !currentVertical
      this._ui.canvas.render()
      active = !currentVertical
    }

    if ((this._initialVertical !== currentVertical ||
      this._initialHorizontal !== currentHorizontal) &&
      !this._historyItem) {
      this._historyItem = this._ui.addHistory(this._operation, {
        flipVertically: this._initialVertical,
        flipHorizontally: this._initialHorizontal
      }, this._operationExistedBefore)
    }

    this._toggleItem(item, active)
  }

  /**
   * Toggles the active state of the given item
   * @param {DOMElement} item
   * @param {Boolean} active
   * @private
   */
  _toggleItem (item, active) {
    let activeClass = 'pesdk-controls-item-active'
    if (active) {
      Utils.classList(item).add(activeClass)
    } else {
      Utils.classList(item).remove(activeClass)
    }
  }

  /**
   * Gets called when the back button has been clicked
   * @override
   */
  _onBack () {
    if (this._operation.optionsEqual(this._initialOptions)) {
      this._ui.removeOperation('orientation')
    }

    this._ui.canvas.render()
  }
}

/**
 * A unique string that identifies this control.
 * @type {String}
 */
FlipControl.prototype.identifier = 'flip'

export default FlipControl
