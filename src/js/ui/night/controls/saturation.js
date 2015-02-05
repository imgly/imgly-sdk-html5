"use strict";
/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Slider from "../lib/slider";
import Control from "./control";
let fs = require("fs");

class SaturationControls extends Control {
  /**
   * Entry point for this control
   */
  init () {
    super();

    let controlsTemplate = fs.readFileSync(__dirname + "/../../../templates/night/operations/saturation_controls.jst", "utf-8");
    this._controlsTemplate = controlsTemplate;
    this._partialTemplates.push(Slider.template);
  }

  /**
   * Gets called when this control is activated
   * @override
   */
  _onEnter () {
    super();

    let sliderElement = this._controls.querySelector(".imglykit-slider");
    this._slider = new Slider(sliderElement, {
      minValue: 0,
      maxValue: 2
    });
    this._slider.on("update", this._onUpdate.bind(this));

    // Initially set value
    let saturation = this._operation.getSaturation();
    this._initialSaturation = saturation;
    this._slider.setValue(saturation);
  }

  /**
   * Gets called when the back button has been clicked
   * @override
   */
  _onBack () {
    super();
    this._operation.setSaturation(this._initialSaturation);
  }

  /**
   * Gets called when the value has been updated
   * @override
   */
  _onUpdate (value) {
    this._operation.setSaturation(value);
  }
}

export default SaturationControls;
