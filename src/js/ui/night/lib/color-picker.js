"use strict";
/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import EventEmitter from "../../../lib/event-emitter";
import Utils from "../../../lib/utils";
import _ from "lodash";

let fs = require("fs");

class ColorPicker extends EventEmitter {
  constructor (ui, element) {
    super();

    this._ui = ui;
    this._element = element;
    this._currentColorCanvas = this._element.querySelector(".imglykit-color-picker-color");

    this._transparencyImage = new Image();
    this._transparencyImage.src = ui.helpers.assetPath("ui/night/transparency.png");
    this._transparencyImage.addEventListener("load", this._renderCurrentColor.bind(this));
  }

  /**
   * The partial template string
   * @type {String}
   */
  static get template () {
    return fs.readFileSync(__dirname + "/../../../templates/night/generics/color-picker_control.jst", "utf-8");
  }

  /**
   * Sets the given value
   * @param {Number} value
   */
  setValue (value) {
    this._value = value;
    this._renderCurrentColor();
  }

  /**
   * Renders the currently selected color on the controls canvas
   * @private
   */
  _renderCurrentColor () {
    let canvas = this._currentColorCanvas;
    let context = canvas.getContext("2d");

    let pattern = context.createPattern(this._transparencyImage, "repeat");

    context.rect(0, 0, canvas.width, canvas.height);
    context.fillStyle = pattern;
    context.fill();

    context.fillStyle = this._value.toRGBA();
    context.fill();
  }
}

export default ColorPicker;
