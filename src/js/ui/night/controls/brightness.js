"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import SliderControl from "./slider-control";
let fs = require("fs");

class BrightnessControls extends SliderControl {
  /**
   * Entry point for this control
   */
  init () {
    super();

    let controlsTemplate = fs.readFileSync(__dirname + "/../../../templates/night/operations/brightness_controls.jst", "utf-8");
    this._controlsTemplate = controlsTemplate;

    // Value boundaries
    this._minValue = -1;
    this._maxValue = 1;
  }

  /**
   * Gets called when the value has been updated
   * @override
   */
  _onUpdate (value) {
    this._operation.setBrightness(value);
  }

  /**
   * Gets called when this control is activated
   * @override
   */
  _onEnter () {
    super();

    // Initially set value
    let brightness = this._operation.getBrightness();
    this._initialBrightness = brightness;
    this._setSliderValue(brightness);
  }

  /**
   * Gets called when the back button has been clicked
   * @override
   */
  _onBack () {
    super();
    this._operation.setBrightness(this._initialBrightness);
  }
}

export default BrightnessControls;
