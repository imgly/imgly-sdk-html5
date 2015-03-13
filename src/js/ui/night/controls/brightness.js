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

class BrightnessControls extends Control {
  /**
   * A unique string that identifies this control.
   * @type {String}
   */
  get identifier () {
    return "brightness";
  }

  /**
   * The entry point for this control
   */
  init () {
    let controlsTemplate = fs.readFileSync(__dirname + "/../../../templates/night/operations/brightness_controls.jst", "utf-8");
    this._controlsTemplate = controlsTemplate;
    this._partialTemplates.push(Slider.template);
  }

  /**
   * Gets called when this control is activated
   * @override
   */
  _onEnter () {
    this._operationExistedBefore = !!this._ui.operations.brightness;
    this._operation = this._ui.getOrCreateOperation("brightness");

    // Initially set value
    let brightness = this._operation.getBrightness();
    this._initialBrightness = brightness;

    let sliderElement = this._controls.querySelector(".imglykit-slider");
    this._slider = new Slider(sliderElement, {
      minValue: -1,
      maxValue: 1,
      defaultValue: brightness
    });
    this._slider.on("update", this._onUpdate.bind(this));

    this._initialIdentity = this._operation.isIdentity;
  }

  /**
   * Gets called when the back button has been clicked
   * @override
   */
  _onBack () {
    super._onBack();

    if (this._operationExistedBefore) {
      this._operation.setBrightness(this._initialBrightness);
    } else {
      this._ui.removeOperation("brightness");
    }

    this._ui.canvas.render();
  }

  /**
   * Gets called when the value has been updated
   * @override
   */
  _onUpdate (value) {
    this._operation.setBrightness(value);
    this._ui.canvas.render();
  }

  /**
   * Gets called when the done button has been clicked
   * @override
   */
  _onDone () {
    this._ui.addHistory(this._operation, {
      brightness: this._initialBrightness
    }, this._operationExistedBefore);
  }
}

export default BrightnessControls;
