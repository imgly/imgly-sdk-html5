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
import Vector2 from "../../../lib/math/vector2";
import Utils from "../../../lib/utils";
import SimpleSlider from "../lib/simple-slider";
let fs = require("fs");

class TiltShiftControls extends Control {
  /**
   * A unique string that identifies this control.
   * @type {String}
   */
  get identifier () {
    return "tilt-shift";
  }

  /**
   * Entry point for this control
   */
  init () {
    this._operation = this._ui.operations["tilt-shift"];

    let controlsTemplate = fs.readFileSync(__dirname + "/../../../templates/night/operations/tilt-shift_controls.jst", "utf-8");
    this._controlsTemplate = controlsTemplate;

    let canvasControlsTemplate = fs.readFileSync(__dirname + "/../../../templates/night/operations/tilt-shift_canvas.jst", "utf-8");
    this._canvasControlsTemplate = canvasControlsTemplate;

    this._partialTemplates.push(SimpleSlider.template);
    this._currentKnob = null;
  }

  /**
   * Gets called when this control is activated
   * @override
   */
  _onEnter () {
    super._onEnter();

    // Remember initial identity state
    this._initialIdentity = this._operation.isIdentity;
    this._initialSettings = {
      start: this._operation.getStart().clone(),
      end: this._operation.getEnd().clone(),
      gradientRadius: this._operation.getGradientRadius(),
      blurRadius: this._operation.getBlurRadius()
    };

    this._operation.isIdentity = false;

    // Mouse event callbacks bound to the class context
    this._onKnobDown = this._onKnobDown.bind(this);
    this._onKnobDrag = this._onKnobDrag.bind(this);
    this._onKnobUp = this._onKnobUp.bind(this);

    let selector = ".imglykit-canvas-tilt-shift-dot";
    this._startKnob = this._canvasControls.querySelector(`${selector}[data-option="start"]`);
    this._endKnob = this._canvasControls.querySelector(`${selector}[data-option="end"]`);
    this._knobs = [this._startKnob, this._endKnob];

    this._handleKnobs();
    this._initSliders();

    this._ui.canvas.render().then(() => {
      this._updateDOM();
    });
  }

  /**
   * Initializes the slider controls
   * @private
   */
  _initSliders () {
    let canvasSize = this._ui.canvas.size;

    let blurRadiusSlider = this._controls.querySelector("#imglykit-blur-radius-slider");
    this._blurRadiusSlider = new SimpleSlider(blurRadiusSlider, {
      minValue: 0,
      maxValue: 40
    });
    this._blurRadiusSlider.on("update", this._onBlurRadiusUpdate.bind(this));
    this._blurRadiusSlider.setValue(this._initialSettings.blurRadius);

    let gradientRadiusSlider = this._controls.querySelector("#imglykit-gradient-radius-slider");
    this._gradientRadiusSlider = new SimpleSlider(gradientRadiusSlider, {
      minValue: 1,
      maxValue: Math.max(canvasSize.y, canvasSize.x)
    });
    this._gradientRadiusSlider.on("update", this._onGradientRadiusUpdate.bind(this));
    this._gradientRadiusSlider.setValue(this._initialSettings.gradientRadius);
  }

  /**
   * Gets called when the value of the blur radius slider has been updated
   * @param {Number} value
   * @private
   */
  _onBlurRadiusUpdate (value) {
    this._operation.setBlurRadius(value);
    this._ui.canvas.render();
  }

  /**
   * Gets called when the value of the gradient radius slider has been updated
   * @param {Number} value
   * @private
   */
  _onGradientRadiusUpdate (value) {
    this._operation.setGradientRadius(value);
    this._updateDOM();
    this._ui.canvas.render();
  }

  /**
   * Handles the knob dragging
   * @private
   */
  _handleKnobs () {
    for (let i = 0; i < this._knobs.length; i++) {
      let knob = this._knobs[i];
      knob.addEventListener("mousedown", (e) => {
        this._onKnobDown(knob, e);
      });
      knob.addEventListener("touchstart", (e) => {
        this._onKnobDown(knob, e);
      });
    }
  }

  /**
   * Gets called when the user starts dragging the knob
   * @param {DOMElement} knob
   * @param {Event} e
   * @private
   */
  _onKnobDown (knob, e) {
    e.preventDefault();

    this._currentKnob = knob;
    this._initialMousePosition = Utils.getEventPosition(e);

    let { option } = knob.dataset;
    let capitalized = option.charAt(0).toUpperCase() + option.slice(1);
    this._valueBeforeDrag = this._operation[`get${capitalized}`]();

    document.addEventListener("mousemove", this._onKnobDrag);
    document.addEventListener("touchmove", this._onKnobDrag);

    document.addEventListener("mouseup", this._onKnobUp);
    document.addEventListener("touchend", this._onKnobUp);
  }

  /**
   * Gets called while the user starts drags the knob
   * @param {Event} e
   * @private
   */
  _onKnobDrag (e) {
    e.preventDefault();

    let canvasSize = this._ui.canvas.size;
    let mousePosition = Utils.getEventPosition(e);
    let diff = mousePosition.subtract(this._initialMousePosition);

    let { option } = this._currentKnob.dataset;

    let capitalized = option.charAt(0).toUpperCase() + option.slice(1);

    let newPosition = this._valueBeforeDrag.clone()
      .multiply(canvasSize)
      .add(diff)
      .divide(canvasSize);
    this._operation[`set${capitalized}`](newPosition);
    this._updateDOM();
    this._ui.canvas.render();
  }

  /**
   * Gets called when the user stops dragging the knob
   * @param {Event} e
   * @private
   */
  _onKnobUp (e) {
    e.preventDefault();

    document.removeEventListener("mousemove", this._onKnobDrag);
    document.removeEventListener("touchmove", this._onKnobDrag);

    document.removeEventListener("mouseup", this._onKnobUp);
    document.removeEventListener("touchend", this._onKnobUp);
  }

  /**
   * Updates the knob
   * @private
   */
  _updateDOM () {
    let canvasSize = this._ui.canvas.size;
    let start = this._operation.getStart()
      .clone()
      .multiply(canvasSize);
    start.clamp(new Vector2(0, 0), canvasSize);

    this._startKnob.style.left = `${start.x}px`;
    this._startKnob.style.top = `${start.y}px`;

    let end = this._operation.getEnd()
      .clone()
      .multiply(canvasSize);
    end.clamp(new Vector2(0, 0), canvasSize);

    this._endKnob.style.left = `${end.x}px`;
    this._endKnob.style.top = `${end.y}px`;
  }

  /**
   * Gets called when the back button has been clicked
   * @override
   */
  _onBack () {
    if (!this._initialIdentity) {
      this._operation.set(this._initialSettings);
      this._ui.canvas.render();
    } else {
      this._operation.isIdentity = this._initialIdentity;
      this._ui.canvas.render();
    }
  }

  /**
   * Gets called when the done button has been clicked
   * @override
   */
  _onDone () {
    this._ui.addHistory(this._operation, {
      start: this._initialSettings.start.clone(),
      end: this._initialSettings.end.clone(),
      blurRadius: this._initialSettings.blurRadius,
      gradientRadius: this._initialSettings.gradientRadius
    }, this._initialIdentity);
  }
}

export default TiltShiftControls;
