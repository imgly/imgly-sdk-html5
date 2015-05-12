/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Control from './control'
let fs = require('fs')

class FlipControl extends Control {
  /**
   * Entry point for this control
   */
  init () {
    let controlsTemplate = fs.readFileSync(__dirname + '/../../../templates/night/operations/flip_controls.jst', 'utf-8')
    this._controlsTemplate = controlsTemplate
  }

  /**
   * Gets called when this control is activated
   */
  _onEnter () {
    this._operationExistedBefore = !!this._ui.operations.flip
    this._operation = this._ui.getOrCreateOperation('flip')

    this._initialHorizontal = this._operation.getHorizontal()
    this._initialVertical = this._operation.getVertical()

    let listItems = this._controls.querySelectorAll('li')
    this._listItems = Array.prototype.slice.call(listItems)

    // Listen to click events
    for (let i = 0; i < this._listItems.length; i++) {
      let listItem = this._listItems[i]
      listItem.addEventListener('click', () => {
        this._onListItemClick(listItem)
      })

      let { direction } = listItem.dataset
      if (direction === 'horizontal' && this._operation.getHorizontal()) {
        this._toggleItem(listItem, true)
      } else if (direction === 'vertical' && this._operation.getVertical()) {
        this._toggleItem(listItem, true)
      }
    }
  }

  /**
   * Gets called when the user clicked a list item
   * @private
   */
  _onListItemClick (item) {
    let { direction } = item.dataset
    let active = false

    if (direction === 'horizontal') {
      let currentHorizontal = this._operation.getHorizontal()
      this._operation.setHorizontal(!currentHorizontal)
      this._ui.canvas.render()
      active = !currentHorizontal
    } else if (direction === 'vertical') {
      let currentVertical = this._operation.getVertical()
      this._operation.setVertical(!currentVertical)
      this._ui.canvas.render()
      active = !currentVertical
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
    let activeClass = 'imglykit-controls-item-active'
    if (active) {
      item.classList.add(activeClass)
    } else {
      item.classList.remove(activeClass)
    }
  }

  /**
   * Gets called when the back button has been clicked
   * @override
   */
  _onBack () {
    let currentVertical = this._operation.getVertical()
    let currentHorizontal = this._operation.getHorizontal()

    if (this._initialVertical !== currentVertical || this._initialHorizontal !== currentHorizontal) {
      this._ui.addHistory(this._operation, {
        vertical: this._initialVertical,
        horizontal: this._initialHorizontal
      }, this._operationExistedBefore)
    }

    if (!currentVertical && !currentHorizontal) {
      this._ui.removeOperation('flip')
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
