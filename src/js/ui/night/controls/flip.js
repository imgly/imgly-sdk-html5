"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Control from "./control";
let fs = require("fs");

class FlipControls extends Control {
  /**
   * Entry point for this control
   */
  init () {
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
    }
  }

  _onListItemClick (item) {
    let { direction } = item.dataset;
    if (direction === "horizontal") {
      let currentHorizontal = this._operation.getHorizontal();
      this._operation.setHorizontal(!currentHorizontal);
    } else if (direction === "vertical") {
      let currentVertical = this._operation.getVertical();
      this._operation.setVertical(!currentVertical);
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
