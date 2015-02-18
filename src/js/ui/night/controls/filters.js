"use strict";
/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Symbol from "es6-symbol";
import Control from "./control";
let fs = require("fs");

class FiltersControls extends Control {
  /**
   * Entry point for this control
   */
  init () {
    let controlsTemplate = fs.readFileSync(__dirname + "/../../../templates/night/operations/filters_controls.jst", "utf-8");
    this._controlsTemplate = controlsTemplate;

    this._filters = {};
    this._addDefaultFilters();
  }

  /**
   * Gets called when this control is activated
   * @override
   */
  _onEnter () {
    this._initialFilter = this._operation.getFilter();

    let listItems = this._controls.querySelectorAll("li");
    this._listItems = Array.prototype.slice.call(listItems);

    // Listen to click events
    for (let listItem of this._listItems) {
      listItem.addEventListener("click", () => {
        this._onListItemClick(listItem);
      });
    }
  }

  /**
   * Gets called when the user hits the back button
   * @override
   */
  _onBack () {
    this._operation.setFilter(this._initialFilter);
  }

  /**
   * Gets called when the user clicked a list item
   * @private
   */
  _onListItemClick (item) {
    this._deactivateAllItems();

    let { identifier } = item.dataset;
    this._operation.setFilter(this._filters[identifier]);

    item.classList.add("imglykit-controls-item-active");
  }

  /**
   * Deactivates all list items
   * @private
   */
  _deactivateAllItems () {
    for (let listItem of this._listItems) {
      listItem.classList.remove("imglykit-controls-item-active");
    }
  }

  /**
   * Registers all the known filters
   * @private
   */
  _addDefaultFilters () {
    this.addFilter(require("../../../operations/filters/identity-filter"));
    this.addFilter(require("../../../operations/filters/k1-filter"));
    this.addFilter(require("../../../operations/filters/k2-filter"));
    this.addFilter(require("../../../operations/filters/k6-filter"));
    this.addFilter(require("../../../operations/filters/kdynamic-filter"));
    this.addFilter(require("../../../operations/filters/fridge-filter"));
    this.addFilter(require("../../../operations/filters/breeze-filter"));
    this.addFilter(require("../../../operations/filters/orchid-filter"));
    this.addFilter(require("../../../operations/filters/chest-filter"));
    this.addFilter(require("../../../operations/filters/front-filter"));
    this.addFilter(require("../../../operations/filters/fixie-filter"));
    this.addFilter(require("../../../operations/filters/x400-filter"));
    this.addFilter(require("../../../operations/filters/bw-filter"));
    this.addFilter(require("../../../operations/filters/bwhard-filter"));
    this.addFilter(require("../../../operations/filters/lenin-filter"));
    this.addFilter(require("../../../operations/filters/quozi-filter"));
    this.addFilter(require("../../../operations/filters/pola669-filter"));
    this.addFilter(require("../../../operations/filters/pola-filter"));
    this.addFilter(require("../../../operations/filters/food-filter"));
    this.addFilter(require("../../../operations/filters/glam-filter"));
    this.addFilter(require("../../../operations/filters/celsius-filter"));
    this.addFilter(require("../../../operations/filters/texas-filter"));
    this.addFilter(require("../../../operations/filters/morning-filter"));
    this.addFilter(require("../../../operations/filters/lomo-filter"));
    this.addFilter(require("../../../operations/filters/gobblin-filter"));
    this.addFilter(require("../../../operations/filters/mellow-filter"));
    this.addFilter(require("../../../operations/filters/sunny-filter"));
    this.addFilter(require("../../../operations/filters/a15-filter"));
    this.addFilter(require("../../../operations/filters/semired-filter"));
  }

  /**
   * Registers the given filter
   * @param  {class} filter
   * @private
   */
  addFilter (filter) {
    this._filters[filter.identifier] = filter;
  }

  /**
   * The data that is available to the template
   * @type {Object}
   * @override
   */
  get context () {
    let context = super.context;
    context.filters = this._filters;
    context.activeFilter = this._operation.getFilter();
    return context;
  }
}

export default FiltersControls;
