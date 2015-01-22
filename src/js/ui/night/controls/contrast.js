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

class ContrastControls extends SliderControl {
  /**
   * Entry point for this control
   */
  init () {
    super();

    let controlsTemplate = fs.readFileSync(__dirname + "/../../../templates/night/operations/contrast_controls.jst", "utf-8");
    this._controlsTemplate = controlsTemplate;

    // Value boundaries
    this._minValue = 0;
    this._maxValue = 2;
  }

  /**
   * Gets called when the value has been updated
   * @override
   */
  _onUpdate (value) {
    this._operation.setContrast(value);
  }

  /**
   * Gets called when this control is activated
   * @override
   */
  _onEnter () {
    super();

    // Initially set value
    let contrast = this._operation.getContrast();
    this._initialContrast = contrast;
    this._setSliderValue(contrast);
  }

  /**
   * Gets called when the back button has been clicked
   * @override
   */
  _onBack () {
    super();
    this._operation.setContrast(this._initialContrast);
  }
}

export default ContrastControls;
