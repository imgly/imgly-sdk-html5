"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Control from "./control";
import Vector2 from "../../../lib/math/vector2";
import Utils from "../../../lib/utils";
let fs = require("fs");

class CropControls extends Control {
  /**
   * Entry point for this control
   */
  init () {
    super();

    let controlsTemplate = fs.readFileSync(__dirname + "/../../../templates/night/operations/crop_controls.jst", "utf-8");
    this._controlsTemplate = controlsTemplate;

    let canvasControlsTemplate = fs.readFileSync(__dirname + "/../../../templates/night/operations/crop_canvas.jst", "utf-8");
    this._canvasControlsTemplate = canvasControlsTemplate;

    this._start = null;
    this._end = null;

    this._defaultStart = new Vector2(0.1, 0.1);
    this._defaultEnd = new Vector2(0.9, 0.9);

    this._onKnobDown = this._onKnobDown.bind(this);
    this._onKnobDrag = this._onKnobDrag.bind(this);
    this._onKnobUp = this._onKnobUp.bind(this);
  }

  /**
   * Gets called when this control is activated
   * @override
   */
  _onEnter () {
    super();

    let prefix = ".imglykit-canvas-crop";
    let container = this._canvasControls;
    let knobsContainer = container.querySelector(`${prefix}-knobs`);

    // Store initial settings for "back" button
    this._initialStart = this._operation.getStart().clone();
    this._initialEnd = this._operation.getEnd().clone();

    // Default cropping settings
    if (this._start === null) this._start = this._defaultStart.clone();
    if (this._end === null) this._end = this._defaultEnd.clone();

    // Make sure we see the whole input image
    this._operation.setStart(new Vector2(0, 0));
    this._operation.setEnd(new Vector2(1, 1));

    // Find all 4 knobs
    this._knobs = {
      topLeft: knobsContainer.querySelector("[data-corner=top-left]"),
      topRight: knobsContainer.querySelector("[data-corner=top-right]"),
      bottomLeft: knobsContainer.querySelector("[data-corner=bottom-left]"),
      bottomRight: knobsContainer.querySelector("[data-corner=bottom-right]")
    };

    // Find the div areas that affect the displayed crop size
    this._areas = {
      topLeft: this._canvasControls.querySelector(`${prefix}-top-left`),
      topCenter: this._canvasControls.querySelector(`${prefix}-top-center`),
      centerLeft: this._canvasControls.querySelector(`${prefix}-center-left`),
      centerCenter: this._canvasControls.querySelector(`${prefix}-center-center`)
    };

    this._updateCropping();
    this._handleKnobs();
  }

  /**
   * Updates the cropping divs for the current operation settings
   * @private
   */
  _updateCropping () {
    let startAbsolute = this._start.clone()
      .multiply(this._ui.canvas.size);
    let endAbsolute = this._end.clone()
      .multiply(this._ui.canvas.size);
    let size = endAbsolute.clone()
      .subtract(startAbsolute);

    let top = Math.max(1, startAbsolute.y);
    let left = Math.max(1, startAbsolute.x);
    let width = Math.max(1, size.x);
    let height = Math.max(1, size.y);

    // widths are defined by top left and top center areas
    this._areas.topLeft.style.width = `${left}px`;
    this._areas.topCenter.style.width = `${width}px`;

    // heights are defined by top left and center left areas
    this._areas.topLeft.style.height = `${top}px`;
    this._areas.centerLeft.style.height = `${height}px`;
  }

  /**
   * Handles the knob dragging
   * @private
   */
  _handleKnobs () {
    for (let identifier in this._knobs) {
      let knob = this._knobs[identifier];
      knob.addEventListener("mousedown", (e) => {
        this._onKnobDown(e, knob);
      });
      knob.addEventListener("touchstart", (e) => {
        this._onKnobDown(e, knob);
      });
    }
  }

  /**
   * Gets called when the user presses a knob
   * @param {Event} e
   * @param {DOMElement} knob
   * @private
   */
  _onKnobDown (e, knob) {
    e.preventDefault();

    this._currentKnob = knob;
    this._initialMousePosition = Utils.getEventPosition(e);

    // Remember the current values
    this._startBeforeDrag = this._start.clone();
    this._endBeforeDrag = this._end.clone();

    document.addEventListener("mousemove", this._onKnobDrag);
    document.addEventListener("touchmove", this._onKnobDrag);
    document.addEventListener("mouseup", this._onKnobUp);
    document.addEventListener("touchend", this._onKnobUp);
  }

  /**
   * Gets called whe the user drags a knob
   * @param {Event} e
   * @private
   */
  _onKnobDrag (e) {
    e.preventDefault();

    let mousePosition = Utils.getEventPosition(e);
    let mouseDiff = mousePosition.subtract(this._initialMousePosition);
    let corner = this._currentKnob.dataset.corner;
    let canvasSize = this._ui.canvas.size;

    let absoluteStart = this._startBeforeDrag.clone()
      .multiply(canvasSize);
    let absoluteEnd = this._endBeforeDrag.clone()
      .multiply(canvasSize);

    switch (corner) {
      case "top-left":
        absoluteStart.add(mouseDiff);
        break;
      case "top-right":
        absoluteEnd.x += mouseDiff.x;
        absoluteStart.y += mouseDiff.y;
        break;
      case "bottom-right":
        absoluteEnd.add(mouseDiff);
        break;
      case "bottom-left":
        absoluteStart.x += mouseDiff.x;
        absoluteEnd.y += mouseDiff.y;
        break;
    }

    this._start.copy(absoluteStart).divide(canvasSize);
    this._end.copy(absoluteEnd).divide(canvasSize);

    this._start.clamp(0, 1);
    this._end.clamp(0, 1);

    this._updateCropping();
  }

  /**
   * Gets called whe the user releases a knob
   * @param {Event} e
   * @private
   */
  _onKnobUp (e) {
    this._currentKnob = null;
    document.removeEventListener("mousemove", this._onKnobDrag);
    document.removeEventListener("touchmove", this._onKnobDrag);
    document.removeEventListener("mouseup", this._onKnobUp);
    document.removeEventListener("touchend", this._onKnobUp);
  }

  /**
   * Gets called when the back button has been clicked
   * @override
   */
  _onBack () {
    super();
  }
}

export default CropControls;
