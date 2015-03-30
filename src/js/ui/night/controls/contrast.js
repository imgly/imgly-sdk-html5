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
import Slider from "../lib/slider";
let fs = require("fs");

class ContrastControl extends Control {
  /**
   * A unique string that identifies this control.
   * @type {String}
   */
  get identifier () {
    return "contrast";
  }

  /**
   * Entry point for this control
   */
  init () {
    let controlsTemplate = fs.readFileSync(__dirname + "/../../../templates/night/operations/contrast_controls.jst", "utf-8");
    this._controlsTemplate = controlsTemplate;
    this._partialTemplates.push(Slider.template);
  }

  /**
   * Gets called when this control is activated
   * @override
   */
  _onEnter () {
    this._operationExistedBefore = !!this._ui.operations.contrast;
    this._operation = this._ui.getOrCreateOperation("contrast");

    // Initially set value
    let contrast = this._operation.getContrast();
    this._initialContrast = contrast;

    let sliderElement = this._controls.querySelector(".imglykit-slider");
    this._slider = new Slider(sliderElement, {
      minValue: 0,
      maxValue: 2,
      defaultValue: contrast
    });
    this._slider.on("update", this._onUpdate.bind(this));
  }

  /**
   * Gets called when the back button has been clicked
   * @override
   */
  _onBack () {
    let currentContrast = this._operation.getContrast();

    if (this._initialContrast !== currentContrast) {
      this._ui.addHistory(this._operation, {
        contrast: this._initialContrast
      }, this._operationExistedBefore);
    }

    if (currentContrast === 1.0) {
      this._ui.removeOperation("contrast");
    }

    this._ui.canvas.render();
  }

  /**
   * Gets called when the value has been updated
   * @override
   */
  _onUpdate (value) {
    this._operation.setContrast(value);
    this._ui.canvas.render();
  }
}

export default ContrastControl;
