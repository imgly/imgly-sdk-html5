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
    this._controlsTemplate = [this._sliderTemplate, controlsTemplate].join("\r\n");
  }

  /**
   * Gets called when this control is activated
   */
  _onEnter () {
    super();
  }

  /**
   * Gets called when the back button has been clicked
   * @override
   */
  _onBack () {
    super();
  }
}

export default BrightnessControls;
