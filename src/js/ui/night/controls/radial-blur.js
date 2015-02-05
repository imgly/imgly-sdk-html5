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

class RadialBlurControls extends Control {
  /**
   * Entry point for this control
   */
  init () {
    super();

    let controlsTemplate = fs.readFileSync(__dirname + "/../../../templates/night/operations/radial-blur_controls.jst", "utf-8");
    this._controlsTemplate = controlsTemplate;

    let canvasControlsTemplate = fs.readFileSync(__dirname + "/../../../templates/night/operations/radial-blur_canvas.jst", "utf-8");
    this._canvasControlsTemplate = canvasControlsTemplate;
  }

  /**
   * Gets called when this control is activated
   * @override
   */
  _onEnter () {
    super();

    // Remember initial identity state
    this._initialIdentity = this._operation.isIdentity;
    this._initialSettings = {
      position: this._operation.getPosition().clone(),
      gradientRadius: this._operation.getGradientRadius(),
      blurRadius: this._operation.getBlurRadius()
    };

    this._operation.isIdentity = false;
    this._ui.canvas.render();

    // Mouse event callbacks bound to the class context
    this._onKnobDown = this._onKnobDown.bind(this);
    this._onKnobDrag = this._onKnobDrag.bind(this);
    this._onKnobUp = this._onKnobUp.bind(this);

    this._knob = this._canvasControls.querySelector(".imglykit-canvas-radial-blur-dot");
    this._handleKnob();
    this._updateDOM();
  }

  /**
   * Handles the knob dragging
   * @private
   */
  _handleKnob () {
    this._knob.addEventListener("mousedown", this._onKnobDown);
    this._knob.addEventListener("touchstart", this._onKnobDown);
  }

  /**
   * Gets called when the user starts dragging the knob
   * @param {Event} e
   * @private
   */
  _onKnobDown (e) {
    e.preventDefault();

    this._initialMousePosition = Utils.getEventPosition(e);
    this._initialPosition = this._operation.getPosition().clone();

    document.addEventListener("mousemove", this._onKnobDrag);
    document.addEventListener("touchmove", this._onKnobDrag);

    document.addEventListener("mouseup", this._onKnobUp);
    document.addEventListener("touchend", this._onKnoUp);
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

    let newPosition = this._initialPosition.clone()
      .multiply(canvasSize)
      .add(diff)
      .divide(canvasSize);
    this._operation.setPosition(newPosition);
    this._updateDOM();
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
    let position = this._operation.getPosition()
      .clone()
      .multiply(canvasSize);

    this._knob.style.left = `${position.x}px`;
    this._knob.style.top = `${position.y}px`;
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
}

export default RadialBlurControls;
