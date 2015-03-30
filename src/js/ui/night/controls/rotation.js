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
let fs = require("fs");

class RotationControl extends Control {
  /**
   * A unique string that identifies this control.
   * @type {String}
   */
  get identifier () {
    return "rotation";
  }

  /**
   * Entry point for this control
   */
  init () {
    let controlsTemplate = fs.readFileSync(__dirname + "/../../../templates/night/operations/rotation_controls.jst", "utf-8");
    this._controlsTemplate = controlsTemplate;

    let canvasControlsTemplate = fs.readFileSync(__dirname + "/../../../templates/night/operations/rotation_canvas.jst", "utf-8");
    this._canvasControlsTemplate = canvasControlsTemplate;
  }

  /**
   * Gets called when this control is activated
   */
  _onEnter () {
    this._operationExistedBefore = !!this._ui.operations.rotation;
    this._operation = this._ui.getOrCreateOperation("rotation");

    this._cropOperation = this._ui.operations.crop;

    this._initialZoomLevel = this._ui.canvas.zoomLevel;
    this._ui.canvas.zoomToFit(false);

    if (this._cropOperation) {
      // Store initial settings for "back" and "done" buttons
      this._initialStart = this._cropOperation.getStart().clone();
      this._initialEnd = this._cropOperation.getEnd().clone();

      // Make sure we see the whole input image
      this._cropOperation.set({
        start: new Vector2(0, 0),
        end: new Vector2(1, 1)
      });
    }

    this._initialDegrees = this._operation.getDegrees();

    let listItems = this._controls.querySelectorAll("li");
    this._listItems = Array.prototype.slice.call(listItems);

    // Listen to click events
    for (let i = 0; i < this._listItems.length; i++) {
      let listItem = this._listItems[i];
      listItem.addEventListener("click", () => {
        this._onListItemClick(listItem);
      });
    }

    // Find the div areas that affect the displayed crop size
    let prefix = ".imglykit-canvas-crop";
    this._cropAreas = {
      topLeft: this._canvasControls.querySelector(`${prefix}-top-left`),
      topCenter: this._canvasControls.querySelector(`${prefix}-top-center`),
      centerLeft: this._canvasControls.querySelector(`${prefix}-center-left`),
      centerCenter: this._canvasControls.querySelector(`${prefix}-center-center`)
    };

    // Resume the rendering
    this._ui.canvas.render()
      .then(() => {
        this._showCropContainer();
        this._updateCropDOM();
      });
  }

  /**
   * Shows the crop container which is hidden initially to avoid flickering
   * when resizing after the rendering
   * @private
   */
  _showCropContainer () {
    let container = this._canvasControls.querySelector(".imglykit-canvas-crop-container");
    container.classList.remove("imglykit-canvas-crop-container-hidden");
  }

  /**
   * Gets called when the given item has been clicked
   * @param {DOMObject} item
   * @private
   */
  _onListItemClick (item) {
    let { degrees } = item.dataset;
    degrees = parseInt(degrees);

    let currentDegrees = this._operation.getDegrees();
    this._operation.setDegrees(currentDegrees + degrees);
    this._ui.canvas.zoomToFit()
      .then(() => {
        this._updateCropDOM();
      });
  }

  /**
   * Gets called when the zoom level has been changed while
   * this control is active
   */
  onZoom () {
    this._updateCropDOM();
  }

  /**
   * Updates the cropping divs for the current operation settings
   * @private
   */
  _updateCropDOM () {
    let start, end;
    if (this._cropOperation) {
      start = this._initialStart.clone();
      end = this._initialEnd.clone();
    } else {
      start = new Vector2(0, 0);
      end = new Vector2(1, 1);
    }

    let canvasSize = this._ui.canvas.size;

    let startAbsolute = start.multiply(canvasSize);
    let endAbsolute = end.multiply(canvasSize);
    let size = endAbsolute.clone().subtract(startAbsolute);

    let top = Math.max(1, startAbsolute.y);
    let left = Math.max(1, startAbsolute.x);
    let width = Math.max(1, size.x);
    let height = Math.max(1, size.y);

    // widths are defined by top left and top center areas
    this._cropAreas.topLeft.style.width = `${left}px`;
    this._cropAreas.topCenter.style.width = `${width}px`;

    // heights are defined by top left and center left areas
    this._cropAreas.topLeft.style.height = `${top}px`;
    this._cropAreas.centerLeft.style.height = `${height}px`;
  }

  /**
   * Gets called when the back button has been clicked
   * @override
   */
  _onBack () {
    let currentDegrees = this._operation.getDegrees();
    if (this._initialDegrees !== currentDegrees) {
      this._ui.addHistory(this._operation, {
        degrees: this._initialDegrees
      }, this._operationExistedBefore);
    }

    if (currentDegrees === 0) {
      this._ui.removeOperation("rotation");
    }

    if (this._cropOperation) {
      this._cropOperation.set({
        start: this._initialStart,
        end: this._initialEnd
      });
    }
    this._ui.canvas.render();
  }
}

export default RotationControl;
