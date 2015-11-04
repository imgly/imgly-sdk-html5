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

class FiltersControl extends Control {
  /**
   * Entry point for this control
   */
  init () {
    this._options = this._ui.options.controlsOptions.filters || {}

    let controlsTemplate = __DOTJS_TEMPLATE('../templates/operations/filters_controls.jst')
    this._controlsTemplate = controlsTemplate

    this._filters = []
    this._initFilters()
  }

  /**
   * Initializes the available filters
   * @private
   */
  _initFilters () {
    const filtersMap = window.PhotoEditorSDK.Filters
    let filters = []
    for (let key in filtersMap) {
      filters.push(filtersMap[key])
    }
    const additionalFilters = this._options.filters || []
    this._filters = filters.concat(additionalFilters)
  }

  /**
   * Renders the controls
   * @private
   * @internal We need to access information from the operation when
   *           rendering, which is why we have to override this function
   */
  _renderAllControls (...args) {
    this._operationExistedBefore = !!this._ui.operations.filters
    this._operation = this._ui.getOrCreateOperation('filters')

    super._renderAllControls(...args)
  }

  /**
   * Gets called when this control is activated
   * @override
   */
  _onEnter () {
    this._historyItem = null
    this._initialFilter = this._operation.getFilter()
    this._defaultFilter = this._operation.availableOptions.filter.default

    let listItems = this._controls.querySelectorAll('li')
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
   * Gets called when the user hits the back button
   * @override
   */
  _onBack () {
    let currentFilter = this._operation.getFilter()
    if (currentFilter === this._defaultFilter) {
      this._ui.removeOperation('filters')
    }
    this._ui.canvas.render()
  }

  /**
   * Gets called when the user clicked a list item
   * @private
   */
  _onListItemClick (item) {
    this._deactivateAllItems()

    const index = item.getAttribute('data-index')
    this._operation.setFilter(this._filters[index])
    this._ui.canvas.render()

    Utils.classList(item).add('imglykit-controls-item-active')

    let currentFilter = this._operation.getFilter()
    if (currentFilter !== this._initialFilter && !this._historyItem) {
      this._historyItem = this._ui.addHistory(this._operation, {
        filter: this._initialFilter
      }, this._operationExistedBefore)
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
   * The data that is available to the template
   * @type {Object}
   * @override
   */
  get context () {
    return {
      filters: this._filters,
      activeFilter: this._operation.getFilter()
    }
  }
}

/**
 * A unique string that identifies this control.
 * @type {String}
 */
FiltersControl.prototype.identifier = 'filters'

export default FiltersControl
