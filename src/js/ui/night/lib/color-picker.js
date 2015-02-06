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

    this._alphaCanvas = this._element.querySelector("canvas.imglykit-color-picker-alpha");
    this._alphaKnob = this._element.querySelector(".imglykit-color-picker-alpha-container .imglykit-transparent-knob");

    this._transparencyImage = new Image();
    this._transparencyImage.src = ui.helpers.assetPath("ui/night/transparency.png");
    this._transparencyImage.addEventListener("load", this._render.bind(this));

    this._onAlphaKnobDown = this._onAlphaKnobDown.bind(this);
    this._onAlphaKnobDrag = this._onAlphaKnobDrag.bind(this);
    this._onAlphaKnobUp = this._onAlphaKnobUp.bind(this);

    this._handleAlphaKnob();
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
    this._render();
  }

  /**
   * Updates and renders all controls to represent the current value
   * @private
   */
  _render () {
    this._renderCurrentColor();
    this._renderTransparency();
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

  /**
   * Renders the transparency canvas with the current color
   * @private
   */
  _renderTransparency () {
    let canvas = this._alphaCanvas;
    let context = canvas.getContext("2d");

    let pattern = context.createPattern(this._transparencyImage, "repeat");
    context.rect(0, 0, canvas.width, canvas.height);
    context.fillStyle = pattern;
    context.fill();

    let gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, this._value.toHex());
    context.fillStyle = gradient;
    context.fill();

    this._updateAlphaKnob();
  }

  /**
   * Handles the dragging of the alpha knob
   * @private
   */
  _handleAlphaKnob () {
    this._alphaKnob.addEventListener("mousedown", this._onAlphaKnobDown);
    this._alphaKnob.addEventListener("touchstart", this._onAlphaKnobDown);
  }

  /**
   * Gets called when the user clicks the alpha knob
   * @param {Event} e
   * @private
   */
  _onAlphaKnobDown (e) {
    this._initialMousePosition = Utils.getEventPosition(e);
    this._alphaBeforeDrag = this._value.a;

    document.addEventListener("mousemove", this._onAlphaKnobDrag);
    document.addEventListener("touchmove", this._onAlphaKnobDrag);

    document.addEventListener("mouseup", this._onAlphaKnobUp);
    document.addEventListener("touchend", this._onAlphaKnobUp);
  }

  /**
   * Gets called when the user drags the alpha knob
   * @param {Event} e
   * @private
   */
  _onAlphaKnobDrag (e) {
    let mousePosition = Utils.getEventPosition(e);
    let diff = mousePosition.clone()
      .subtract(this._initialMousePosition);

    let alphaWidth = this._alphaCanvas.width;
    let alphaPerPixel = 1 / alphaWidth;

    let newAlpha = this._alphaBeforeDrag + alphaPerPixel * diff.x;
    this._value.a = newAlpha;

    let knobX = alphaWidth * newAlpha;
    knobX = Math.max(0, Math.min(knobX, alphaWidth));
    this._alphaKnob.style.left = `${knobX}px`;

    this._renderCurrentColor();
  }

  /**
   * Gets called when the user stops dragging the alpha knob
   * @param {Event} e
   * @private
   */
  _onAlphaKnobUp (e) {
    document.removeEventListener("mousemove", this._onAlphaKnobDrag);
    document.removeEventListener("touchmove", this._onAlphaKnobDrag);

    document.removeEventListener("mouseup", this._onAlphaKnobUp);
    document.removeEventListener("touchend", this._onAlphaKnobUp);
  }

  /**
   * Updates the alpha knob position
   * @private
   */
  _updateAlphaKnob () {
    let left = (this._value.a * 100).toFixed(2);
    this._alphaKnob.style.left = `${left}%`;
  }
}

export default ColorPicker;
