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

class FramesControls extends Control {
  /**
   * Entry point for this control
   */
  init () {
    super();

    let controlsTemplate = fs.readFileSync(__dirname + "/../../../templates/night/operations/frames_controls.jst", "utf-8");
    this._controlsTemplate = controlsTemplate;
    this._partialTemplates.push(Slider.template);
  }

  /**
   * Gets called when this control is activated
   * @override
   */
  _onEnter () {
    super();

    // Remember initial identity state
    this._initialIdentity = this._operation.isIdentity;

    this._initialOptions = {
      thickness: this._operation.getThickness(),
      color: this._operation.getColor()
    };

    this._operation.isIdentity = false;
    this._ui.canvas.render();

    // Init slider
    let sliderElement = this._controls.querySelector(".imglykit-slider");
    this._slider = new Slider(sliderElement, {
      minValue: 0.0,
      maxValue: 0.5
    });
    this._slider.on("update", this._onUpdate.bind(this));
    this._slider.setValue(this._initialOptions.thickness);

    let color = this._operation.getColor();
  }

  /**
   * Gets called when the back button has been clicked
   * @override
   */
  _onBack () {
    if (!this._initialIdentity) {
      this._operation.set(this._initialOptions);
    } else {
      this._operation.isIdentity = this._initialIdentity;
      this._ui.canvas.render();
    }
  }

  /**
   * Gets called when the value has been updated
   * @override
   */
  _onUpdate (value) {
    this._operation.setThickness(value);
  }
}

export default FramesControls;
