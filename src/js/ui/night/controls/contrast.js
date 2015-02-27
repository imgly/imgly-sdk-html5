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

class ContrastControls extends Control {
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
    this._operation = this._ui.operationsMap.contrast;

    let controlsTemplate = fs.readFileSync(__dirname + "/../../../templates/night/operations/contrast_controls.jst", "utf-8");
    this._controlsTemplate = controlsTemplate;
    this._partialTemplates.push(Slider.template);
  }

  /**
   * Gets called when this control is activated
   * @override
   */
  _onEnter () {
    super._onEnter();

    let sliderElement = this._controls.querySelector(".imglykit-slider");
    this._slider = new Slider(sliderElement, {
      minValue: 0,
      maxValue: 2
    });
    this._slider.on("update", this._onUpdate.bind(this));

    // Initially set value
    let contrast = this._operation.getContrast();
    this._initialContrast = contrast;
    this._slider.setValue(contrast);
  }

  /**
   * Gets called when the back button has been clicked
   * @override
   */
  _onBack () {
    super._onBack();
    this._operation.setContrast(this._initialContrast);
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

export default ContrastControls;
