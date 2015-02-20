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

class RotationControls extends Control {
  /**
   * A unique string that identifies this control.
   * @type {String}
   */
  get identifier () {
    return "rotation";
  }

  /**
   * Entry point for this control
   */
  init () {
    this._operation = this._ui.operationsMap["crop-rotation"];

    let controlsTemplate = fs.readFileSync(__dirname + "/../../../templates/night/operations/rotation_controls.jst", "utf-8");
    this._controlsTemplate = controlsTemplate;
  }

  /**
   * Gets called when this control is activated
   */
  _onEnter () {
    this._initialDegrees = this._operation.getDegrees();

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
    let { degrees } = item.dataset;
    degrees = parseInt(degrees);

    let currentDegrees = this._operation.getDegrees();
    this._operation.setDegrees(currentDegrees + degrees);
  }

  /**
   * Gets called when the back button has been clicked
   * @override
   */
  _onBack () {
    this._operation.setDegrees(this._initialDegrees);
  }
}

export default RotationControls;
