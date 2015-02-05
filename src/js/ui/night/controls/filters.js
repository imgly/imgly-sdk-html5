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

    // Back button
    let backButton = this._controls.querySelector(".imglykit-controls-back");
    backButton.addEventListener("click", this._onBackButtonClick.bind(this));

    // Done button
    let doneButton = this._controls.querySelector(".imglykit-controls-done");
    doneButton.addEventListener("click", this._onDoneButtonClick.bind(this));
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
    this._operation.setFilter(identifier);

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
   * The data that is available to the template
   * @type {Object}
   * @override
   */
  get context () {
    let context = super.context;
    context.filters = this._operation.filters;
    context.activeFilter = this._operation.getFilter();
    return context;
  }
}

export default FiltersControls;
