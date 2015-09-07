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
import Utils from '../../../lib/utils'

class FiltersControl extends Control {
  /**
   * Entry point for this control
   */
  init () {
    let controlsTemplate = __DOTJS_TEMPLATE('../../../templates/night/operations/filters_controls.jst')
    this._controlsTemplate = controlsTemplate

    this._availableFilters = {}
    this._filters = {}

    this._addDefaultFilters()

    // Select all filters per default
    this.selectFilters(null)
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

    const identifier = item.getAttribute('data-identifier')
    this._operation.setFilter(this._filters[identifier])
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
   * Registers all the known filters
   * @private
   */
  _addDefaultFilters () {
    this.addFilter(require('../../../operations/filters/identity-filter'))
    this.addFilter(require('../../../operations/filters/k1-filter'))
    this.addFilter(require('../../../operations/filters/k2-filter'))
    this.addFilter(require('../../../operations/filters/k6-filter'))
    this.addFilter(require('../../../operations/filters/kdynamic-filter'))
    this.addFilter(require('../../../operations/filters/fridge-filter'))
    this.addFilter(require('../../../operations/filters/breeze-filter'))
    this.addFilter(require('../../../operations/filters/orchid-filter'))
    this.addFilter(require('../../../operations/filters/chest-filter'))
    this.addFilter(require('../../../operations/filters/front-filter'))
    this.addFilter(require('../../../operations/filters/fixie-filter'))
    this.addFilter(require('../../../operations/filters/x400-filter'))
    this.addFilter(require('../../../operations/filters/bw-filter'))
    this.addFilter(require('../../../operations/filters/bwhard-filter'))
    this.addFilter(require('../../../operations/filters/lenin-filter'))
    this.addFilter(require('../../../operations/filters/quozi-filter'))
    this.addFilter(require('../../../operations/filters/pola669-filter'))
    this.addFilter(require('../../../operations/filters/pola-filter'))
    this.addFilter(require('../../../operations/filters/food-filter'))
    this.addFilter(require('../../../operations/filters/glam-filter'))
    this.addFilter(require('../../../operations/filters/celsius-filter'))
    this.addFilter(require('../../../operations/filters/texas-filter'))
    this.addFilter(require('../../../operations/filters/morning-filter'))
    this.addFilter(require('../../../operations/filters/lomo-filter'))
    this.addFilter(require('../../../operations/filters/gobblin-filter'))
    this.addFilter(require('../../../operations/filters/mellow-filter'))
    this.addFilter(require('../../../operations/filters/sunny-filter'))
    this.addFilter(require('../../../operations/filters/a15-filter'))
    this.addFilter(require('../../../operations/filters/semired-filter'))
  }

  /**
   * Registers the given filter
   * @param  {class} filter
   * @private
   */
  addFilter (filter) {
    this._availableFilters[filter.identifier] = filter
  }

  /**
   * Selects the filters
   * @param {Selector} selector
   */
  selectFilters (selector) {
    this._filters = {}

    let filterIdentifiers = Object.keys(this._availableFilters)

    let selectedFilters = Utils.select(filterIdentifiers, selector)
    for (let i = 0; i < selectedFilters.length; i++) {
      let identifier = selectedFilters[i]
      this._filters[identifier] = this._availableFilters[identifier]
    }


    if (this._active) {
      this._renderControls()
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
