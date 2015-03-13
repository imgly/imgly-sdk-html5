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
   * A unique string that identifies this control.
   * @type {String}
   */
  get identifier () {
    return "saturation";
  }

  /**
   * Entry point for this control
   */
  init () {
    let controlsTemplate = fs.readFileSync(__dirname + "/../../../templates/night/operations/saturation_controls.jst", "utf-8");
    this._controlsTemplate = controlsTemplate;
    this._partialTemplates.push(Slider.template);
  }

  /**
   * Gets called when this control is activated
   * @override
   */
  _onEnter () {
    super._onEnter();

    this._operationExistedBefore = !!this._ui.operations.saturation;
    this._operation = this._ui.getOrCreateOperation("saturation");

    // Initially set value
    let saturation = this._operation.getSaturation();
    this._initialSaturation = saturation;

    let sliderElement = this._controls.querySelector(".imglykit-slider");
    this._slider = new Slider(sliderElement, {
      minValue: 0,
      maxValue: 2,
      defaultValue: saturation
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
      this._operation.setSaturation(this._initialSaturation);
    } else {
      this._ui.removeOperation("saturation");
    }
    this._ui.canvas.render();
  }

  /**
   * Gets called when the value has been updated
   * @override
   */
  _onUpdate (value) {
    this._operation.setSaturation(value);
    this._ui.canvas.render();
  }

  /**
   * Gets called when the done button has been clicked
   * @override
   */
  _onDone () {
    this._ui.addHistory(this._operation, {
      saturation: this._initialSaturation
    }, this._operationExistedBefore);
  }
}

export default SaturationControls;
