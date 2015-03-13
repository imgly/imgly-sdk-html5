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
let fs = require("fs");

class CropControl extends Control {
  /**
   * A unique string that identifies this control.
   * @type {String}
   */
  get identifier () {
    return "crop";
  }

  /**
   * Entry point for this control
   */
  init () {
    this._availableRatios = {};
    this._ratios = {};

    let controlsTemplate = fs.readFileSync(__dirname + "/../../../templates/night/operations/crop_controls.jst", "utf-8");
    this._controlsTemplate = controlsTemplate;

    let canvasControlsTemplate = fs.readFileSync(__dirname + "/../../../templates/night/operations/crop_canvas.jst", "utf-8");
    this._canvasControlsTemplate = canvasControlsTemplate;

    // Mouse event callbacks bound to the class context
    this._onKnobDown = this._onKnobDown.bind(this);
    this._onKnobDrag = this._onKnobDrag.bind(this);
    this._onKnobUp = this._onKnobUp.bind(this);
    this._onCenterDown = this._onCenterDown.bind(this);
    this._onCenterDrag = this._onCenterDrag.bind(this);
    this._onCenterUp = this._onCenterUp.bind(this);

    this._addDefaultRatios();

    // Select all ratios per default
    this.selectRatios(null);
  }

  /**
   * Selects the ratios
   * @param {Selector} selector
   */
  selectRatios (selector) {
    this._ratios = {};

    let ratioIdentifiers = Object.keys(this._availableRatios);

    let selectedRatios = Utils.select(ratioIdentifiers, selector);
    for (let i = 0; i < selectedRatios.length; i++) {
      let identifier = selectedRatios[i];
      this._ratios[identifier] = this._availableRatios[identifier];
    }

    if (this._active) {
      this._renderControls();
    }
  }

  /**
   * Adds the default ratios
   * @private
   */
  _addDefaultRatios () {
    this.addRatio("custom", "*", true);
    this.addRatio("square", "1");
    this.addRatio("4-3", "1.33");
    this.addRatio("16-9", "1.77");
  }

  /**
   * Adds a ratio with the given identifier
   * @param {String} identifier
   * @param {Number} ratio
   * @param {Boolean} selected
   */
  addRatio (identifier, ratio, selected) {
    this._availableRatios[identifier] = { ratio, selected };
  }

  /**
   * Gets called when this control is activated
   * @override
   */
  _onEnter () {
    super._onEnter();

    this._operationExistedBefore = !!this._ui.operations.crop;
    this._operation = this._ui.getOrCreateOperation("crop");

    this._defaultStart = new Vector2(0.1, 0.1);
    this._defaultEnd = new Vector2(0.9, 0.9);

    this._initialOptions = {
      start: this._operation.getStart(),
      end: this._operation.getEnd()
    };

    this._start = this._initialOptions.start || this._defaultStart;
    this._end = this._initialOptions.end || this._defaultEnd;

    // Minimum size in pixels
    this._minimumSize = new Vector2(50, 50);

    this._initialZoomLevel = this._ui.canvas.zoomLevel;
    this._ui.canvas.zoomToFit(false);

    let prefix = ".imglykit-canvas-crop";
    let container = this._canvasControls;
    let knobsContainer = container.querySelector(`${prefix}-knobs`);

    // Store initial settings for "back" button
    this._initialStart = this._operation.getStart().clone();
    this._initialEnd = this._operation.getEnd().clone();

    // Make sure we see the whole input image
    this._operation.set({
      start: new Vector2(0, 0),
      end: new Vector2(1, 1)
    });

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

    this._handleControls();
    this._handleKnobs();
    this._handleCenter();

    // Resume the rendering
    this._ui.canvas.render()
      .then(() => {
        this._updateDOM();
      });
  }

  /**
   * Handles the ratio controls
   * @private
   */
  _handleControls () {
    let listItems = this._controls.querySelectorAll("ul > li");
    this._ratioItems = Array.prototype.slice.call(listItems);

    for (let i = 0; i < this._ratioItems.length; i++) {
      let item = this._ratioItems[i];
      let { selected, ratio, identifier } = item.dataset;
      if (typeof selected !== "undefined" && !this._operationExistedBefore) {
        this._setRatio(identifier, ratio, false);
        this._selectRatio(item);
      }

      item.addEventListener("click", (e) => {
        e.preventDefault();
        this._onRatioClick(item);
      });
    }
  }

  /**
   * Gets called when the given ratio has been selected
   * @param {DOMElement} item
   * @private
   */
  _onRatioClick (item) {
    this._unselectAllRatios();
    this._selectRatio(item);
  }

  /**
   * Unselects all ratio control items
   * @private
   */
  _unselectAllRatios () {
    for (let i = 0; i < this._ratioItems.length; i++) {
      let item = this._ratioItems[i];
      item.classList.remove("imglykit-controls-item-active");
    }
  }

  /**
   * Activates the given ratio control item
   * @param {DOMElement} item
   * @private
   */
  _selectRatio (item) {
    item.classList.add("imglykit-controls-item-active");
    let { ratio, identifier } = item.dataset;
    this._setRatio(identifier, ratio);
  }

  /**
   * Sets the given ratio
   * @param {String} identifier
   * @param {String} ratio
   * @param {Boolean} resize
   * @private
   */
  _setRatio (identifier, ratio, resize=true) {
    let canvasSize = this._ui.canvas.size;
    this._selectedRatio = identifier;

    if (ratio === "*") {
      this._ratio = null;
      this._start = new Vector2(0.1, 0.1);
      this._end = new Vector2(0.9, 0.9);
    } else {
      if (ratio === "original") {
        this._ratio = canvasSize.x / canvasSize.y;
      } else {
        ratio = parseFloat(ratio);
        this._ratio = ratio;
      }

      if (resize) {
        if (canvasSize.x / canvasSize.y <= this._ratio) {
          this._start.x = 0.1;
          this._end.x = 0.9;
          let height = 1 / canvasSize.y * (canvasSize.x / this._ratio * 0.8);
          this._start.y = (1 - height) / 2;
          this._end.y = 1 - this._start.y;
        } else {
          this._start.y = 0.1;
          this._end.y = 0.9;
          let width = 1 / canvasSize.x * (this._ratio * canvasSize.y * 0.8);
          this._start.x = (1 - width) / 2;
          this._end.x = 1 - this._start.x;
        }
      }
    }

    this._updateDOM();
  }

  /**
   * Updates the cropping divs for the current operation settings
   * @private
   */
  _updateDOM () {
    let canvasSize = this._ui.canvas.size;
    let startAbsolute = this._start.clone()
      .multiply(canvasSize);
    let endAbsolute = this._end.clone()
      .multiply(canvasSize);
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
    e.stopPropagation();

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
    let maxHeight = canvasSize.y;

    let width, height, maximum, minimum;

    switch (corner) {
      case "top-left":
        absoluteStart.add(mouseDiff);
        maximum = absoluteEnd.clone()
          .subtract(this._minimumSize);
        absoluteStart.clamp(null, maximum);
        break;
      case "top-right":
        absoluteEnd.x += mouseDiff.x;
        absoluteStart.y += mouseDiff.y;
        absoluteEnd.x = Math.max(absoluteStart.x + this._minimumSize.x, absoluteEnd.x);
        absoluteStart.y = Math.min(absoluteEnd.y - this._minimumSize.y, absoluteStart.y);
        break;
      case "bottom-right":
        absoluteEnd.add(mouseDiff);
        minimum = absoluteStart.clone()
          .add(this._minimumSize);
        absoluteEnd.clamp(minimum);
        maxHeight = canvasSize.y - absoluteStart.y;
        break;
      case "bottom-left":
        absoluteStart.x += mouseDiff.x;
        absoluteEnd.y += mouseDiff.y;
        absoluteStart.x = Math.min(absoluteEnd.x - this._minimumSize.x, absoluteStart.x);
        absoluteEnd.y = Math.max(absoluteStart.y + this._minimumSize.y, absoluteEnd.y);
        break;
    }

    this._start.copy(absoluteStart).divide(canvasSize);
    this._end.copy(absoluteEnd).divide(canvasSize);

    this._start.clamp(0, 1);
    this._end.clamp(0, 1);

    /**
     * Calculate boundaries
     */
    if (this._ratio !== null) {
      switch (corner) {
        case "top-left":
          width = (this._end.x - this._start.x) * canvasSize.x;
          height = width / this._ratio;
          this._start.y = this._end.y - height / canvasSize.y;

          if (this._start.y <= 0) {
            this._start.y = 0;
            height = (this._end.y - this._start.y) * canvasSize.y;
            width = height * this._ratio;
            this._start.x = this._end.x - width / canvasSize.x;
          }
          break;
        case "top-right":
          width = (this._end.x - this._start.x) * canvasSize.x;
          height = width / this._ratio;
          this._start.y = this._end.y - height / canvasSize.y;

          if (this._start.y <= 0) {
            this._start.y = 0;
            height = (this._end.y - this._start.y) * canvasSize.y;
            width = height * this._ratio;
            this._end.x = this._start.x + width / canvasSize.x;
          }
          break;
        case "bottom-right":
          width = (this._end.x - this._start.x) * canvasSize.x;
          height = width / this._ratio;
          this._end.y = this._start.y + height / canvasSize.y;

          // If boundaries are exceeded, calculate width by maximum height
          if (this._end.y >= 1) {
            this._end.y = 1;
            height = (this._end.y - this._start.y) * canvasSize.y;
            width = height * this._ratio;
            this._end.x = this._start.x + width / canvasSize.x;
          }
          break;
        case "bottom-left":
          width = (this._end.x - this._start.x) * canvasSize.x;
          height = width / this._ratio;
          this._end.y = this._start.y + height / canvasSize.y;

          if (this._end.y >= 1) {
            this._end.y = 1;
            height = (this._end.y - this._start.y) * canvasSize.y;
            width = height * this._ratio;
            this._start.x = this._end.x - width / canvasSize.x;
          }
          break;
      }
    }

    this._updateDOM();
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
   * Handles the center dragging
   * @private
   */
  _handleCenter () {
    this._areas.centerCenter.addEventListener("mousedown", this._onCenterDown);
    this._areas.centerCenter.addEventListener("touchstart", this._onCenterDown);
  }

  /**
   * Gets called when the user presses the center area
   * @param {Event} e
   * @private
   */
  _onCenterDown (e) {
    this._initialMousePosition = Utils.getEventPosition(e);

    // Remember the current values
    this._startBeforeDrag = this._start.clone();
    this._endBeforeDrag = this._end.clone();

    document.addEventListener("mousemove", this._onCenterDrag);
    document.addEventListener("touchmove", this._onCenterDrag);
    document.addEventListener("mouseup", this._onCenterUp);
    document.addEventListener("touchend", this._onCenterUp);
  }

  /**
   * Gets called when the user presses the center area and moves his mouse
   * @param {Event} e
   * @private
   */
  _onCenterDrag (e) {
    let mousePosition = Utils.getEventPosition(e);
    let mouseDiff = mousePosition.subtract(this._initialMousePosition);
    let canvasSize = this._ui.canvas.size;

    // Get the crop size
    let cropSize = this._endBeforeDrag.clone()
      .subtract(this._startBeforeDrag);
    let absoluteCropSize = cropSize.clone()
      .multiply(canvasSize);

    // Get the absolute initial values
    let absoluteStart = this._startBeforeDrag.clone().multiply(canvasSize);
    let absoluteEnd = this._endBeforeDrag.clone().multiply(canvasSize);

    // Add the mouse position difference
    absoluteStart.add(mouseDiff);

    // Clamp the value
    let maxStart = canvasSize.clone()
      .subtract(absoluteCropSize);
    absoluteStart.clamp(new Vector2(0, 0), maxStart);

    // End position does not change (relative to start)
    absoluteEnd.copy(absoluteStart).add(absoluteCropSize);

    // Set the final values
    this._start.copy(absoluteStart).divide(canvasSize);
    this._end.copy(absoluteEnd).divide(canvasSize);

    this._updateDOM();
  }

  /**
   * Gets called when the user releases the center area
   * @param {Event} e
   * @private
   */
  _onCenterUp (e) {
    document.removeEventListener("mousemove", this._onCenterDrag);
    document.removeEventListener("touchmove", this._onCenterDrag);
    document.removeEventListener("mouseup", this._onCenterUp);
    document.removeEventListener("touchend", this._onCenterUp);
  }

  /**
   * Gets called when the back button has been clicked
   * @override
   */
  _onBack () {
    this._ui.canvas.setZoomLevel(this._initialZoomLevel, false);

    if (this._operationExistedBefore) {
      this._operation.set({
        start: this._initialStart,
        end: this._initialEnd
      });
    } else {
      this._ui.removeOperation("crop");
    }
    this._ui.canvas.render();
  }

  /**
   * Gets called when the done button has been clicked
   * @protected
   */
  _onDone () {
    this._operation.set({
      start: this._start,
      end: this._end
    });
    this._ui.canvas.zoomToFit(true);

    this._ui.addHistory(this._operation, {
      start: this._initialStart.clone(),
      end: this._initialEnd.clone()
    }, this._operationExistedBefore);
  }

  /**
   * The data that is available to the template
   * @type {Object}
   * @override
   */
  get context () {
    let context = super.context;
    context.ratios = this._ratios;
    return context;
  }

  /**
   * The selected ratio identifier
   * @type {String}
   */
  get selectedRatio () {
    return this._selectedRatio;
  }
}

export default CropControl;
