"use strict";
/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Control from "./control";
import Symbol from "es6-symbol";
let fs = require("fs");

class FlipControls extends Control {
  /**
   * A unique string that identifies this control.
   * @type {String}
   */
  get identifier () {
    return "flip";
  }

  /**
   * Entry point for this control
   */
  init () {
    this._operation = this._ui.operationsMap.flip;

    let controlsTemplate = fs.readFileSync(__dirname + "/../../../templates/night/operations/flip_controls.jst", "utf-8");
    this._controlsTemplate = controlsTemplate;
  }

  /**
   * Gets called when this control is activated
   */
  _onEnter () {
    this._initialHorizontal = this._operation.getHorizontal();
    this._initialVertical = this._operation.getVertical();

    let listItems = this._controls.querySelectorAll("li");
    this._listItems = Array.prototype.slice.call(listItems);

    // Listen to click events
    for (let listItem of this._listItems) {
      listItem.addEventListener("click", () => {
        this._onListItemClick(listItem);
      });

      let { direction }  = listItem.dataset;
      if (direction === "horizontal" && this._operation.getHorizontal()) {
        this._toggleItem(listItem, true);
      } else if (direction === "vertical" && this._operation.getVertical()) {
        this._toggleItem(listItem, true);
      }
    }
  }

  /**
   * Gets called when the user clicked a list item
   * @private
   */
  _onListItemClick (item) {
    let { direction } = item.dataset;
    let active = false;

    if (direction === "horizontal") {
      let currentHorizontal = this._operation.getHorizontal();
      this._operation.setHorizontal(!currentHorizontal);
      active = !currentHorizontal;
    } else if (direction === "vertical") {
      let currentVertical = this._operation.getVertical();
      this._operation.setVertical(!currentVertical);
      active = !currentVertical;
    }

    this._toggleItem(item, active);
  }

  /**
   * Toggles the active state of the given item
   * @param {DOMElement} item
   * @param {Boolean} active
   * @private
   */
  _toggleItem (item, active) {
    let activeClass = "imglykit-controls-item-active";
    if (active) {
      item.classList.add(activeClass);
    } else {
      item.classList.remove(activeClass);
    }
  }

  /**
   * Gets called when the back button has been clicked
   * @override
   */
  _onBack () {
    this._operation.setHorizontal(this._initialHorizontal);
    this._operation.setVertical(this._initialVertical);
  }
}

export default FlipControls;
