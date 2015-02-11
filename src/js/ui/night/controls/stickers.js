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

class StickersControl extends Control {
  /**
   * Entry point for this control
   */
  init () {
    let controlsTemplate = fs.readFileSync(__dirname + "/../../../templates/night/operations/stickers_controls.jst", "utf-8");
    this._controlsTemplate = controlsTemplate;

    let canvasControlsTemplate = fs.readFileSync(__dirname + "/../../../templates/night/operations/stickers_canvas.jst", "utf-8");
    this._canvasControlsTemplate = canvasControlsTemplate;
  }

  /**
   * Gets called when this control is activated
   * @override
   */
  _onEnter () {
    this._initialIdentity = this._operation.isIdentity;
    this._initialSettings = {
      sticker: this._operation.getSticker(),
      position: this._operation.getPosition().clone(),
      size: this._operation.getSize().clone()
    };

    // Don't render an already existing sticker as long as
    // we're editing
    this._operation.isIdentity = true;

    // Remember zoom level and zoom to fit the canvas
    this._initialZoomLevel = this._ui.canvas.zoomLevel;
    this._ui.canvas.zoomToFit();

    // Find DOM elements
    this._container = this._canvasControls.querySelector(".imglykit-canvas-stickers");
    this._stickerImage = this._canvasControls.querySelector("img");
    this._stickerImage.addEventListener("load", () => {
      this._onStickerLoad();
    });
    this._knob = this._canvasControls.querySelector("div.imglykit-knob");

    // Mouse event callbacks bound to the class context
    this._onImageDown = this._onImageDown.bind(this);
    this._onImageDrag = this._onImageDrag.bind(this);
    this._onImageUp = this._onImageUp.bind(this);
    this._onKnobDown = this._onKnobDown.bind(this);
    this._onKnobDrag = this._onKnobDrag.bind(this);
    this._onKnobUp = this._onKnobUp.bind(this);

    if (!this._initialIdentity) {
      this._applyInitialSettings();
    }

    this._handleListItems();
    this._handleImage();
    this._handleKnob();
  }

  /**
   * Handles the list item click events
   * @private
   */
  _handleListItems () {
    let listItems = this._controls.querySelectorAll("li");
    this._listItems = Array.prototype.slice.call(listItems);

    // Listen to click events
    let i = 0;
    for (let listItem of this._listItems) {
      let { identifier } = listItem.dataset;
      listItem.addEventListener("click", () => {
        this._onListItemClick(listItem);
      });

      if ((this._initialIdentity && i === 0) ||
        (!this._initialIdentity && identifier === this._initialSettings.sticker)) {
          this._onListItemClick(listItem);
      }
      i++;
    }
  }

  /**
   * Resizes and positions the sticker according to the current settings
   * @private
   */
  _applySettings () {
    this._stickerImage.style.width = `${this._size.x}px`;
    this._stickerImage.style.height = `${this._size.y}px`;

    this._container.style.left = `${this._position.x}px`;
    this._container.style.top = `${this._position.y}px`;
  }

  /**
   * Resizes and positions the image according to the initial settings
   * @private
   */
  _applyInitialSettings () {
    let canvasSize = this._ui.canvas.size;
    let position = this._initialSettings.position.clone()
      .multiply(canvasSize);
    this._container.style.left = `${position.x}px`;
    this._container.style.top = `${position.y}px`;

    let size = this._initialSettings.size.clone()
      .multiply(canvasSize);
    this._stickerImage.style.width = `${size.x}px`;
    this._stickerImage.style.height = `${size.y}px`;
  }

  /**
   * Gets called when the user hits the back button
   * @override
   */
  _onBack () {
    if (!this._initialIdentity) {
      this._operation.set(this._initialSettings);
    } else {
      this._operation.isIdentity = this._initialIdentity;
      this._ui.canvas.render();
    }

    this._ui.canvas.setZoomLevel(this._initialZoomLevel, false);
  }

  /**
   * Gets called when the done button has been clicked
   * @protected
   */
  _onDone () {
    // Map the position and size options to 0...1 values
    let canvasSize = this._ui.canvas.size;
    let position = this._position.clone().divide(canvasSize);
    let size = this._size.clone().divide(canvasSize);

    this._ui.canvas.setZoomLevel(this._initialZoomLevel, false);

    this._operation.set({
      sticker: this._sticker,
      position: position,
      size: size
    });
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
   * Gets called when the user clicks the knob
   * @param {Event} e
   * @private
   */
  _onKnobDown (e) {
    e.preventDefault();

    this._initialMousePosition = Utils.getEventPosition(e);
    this._initialSize = this._size.clone();

    document.addEventListener("mousemove", this._onKnobDrag);
    document.addEventListener("touchmove", this._onKnobDrag);

    document.addEventListener("mouseup", this._onKnobUp);
    document.addEventListener("touchend", this._onKnobUp);
  }

  /**
   * Gets called when the user drags the knob
   * @param {Event} e
   * @private
   */
  _onKnobDrag (e) {
    e.preventDefault();

    let mousePosition = Utils.getEventPosition(e);
    let diff = mousePosition.clone()
      .subtract(this._initialMousePosition);

    let size = this._initialSize.clone();
    let ratio = size.y / size.x;
    size.x += diff.x;
    size.y = size.x * ratio;

    let minSize = new Vector2(100, ratio * 100);
    let maxSize = this._ui.canvas.size.clone()
      .subtract(this._position);
    maxSize.y = maxSize.x * ratio;
    size.clamp(minSize, maxSize);

    this._size.copy(size);

    this._applySettings();
  }

  /**
   * Gets called when the user releases the knob
   * @param {Event} e
   * @private
   */
  _onKnobUp (e) {
    document.removeEventListener("mousemove", this._onKnobDrag);
    document.removeEventListener("touchmove", this._onKnobDrag);

    document.removeEventListener("mouseup", this._onKnobUp);
    document.removeEventListener("touchend", this._onKnobUp);
  }

  /**
   * Handles the image dragging
   * @private
   */
  _handleImage () {
    this._stickerImage.addEventListener("mousedown", this._onImageDown);
    this._stickerImage.addEventListener("touchstart", this._onImageDown);
  }

  /**
   * Gets called when the user clicks the image
   * @param {Event} e
   * @private
   */
  _onImageDown (e) {
    e.preventDefault();

    this._initialMousePosition = Utils.getEventPosition(e);
    this._initialPosition = this._position.clone();

    document.addEventListener("mousemove", this._onImageDrag);
    document.addEventListener("touchmove", this._onImageDrag);

    document.addEventListener("mouseup", this._onImageUp);
    document.addEventListener("touchend", this._onImageUp);
  }

  /**
   * Gets called when the user drags the image
   * @param {Event} e
   * @private
   */
  _onImageDrag (e) {
    e.preventDefault();

    let mousePosition = Utils.getEventPosition(e);
    let diff = mousePosition.clone()
      .subtract(this._initialMousePosition);

    let position = this._initialPosition.clone();
    position.add(diff);

    let maxPosition = this._ui.canvas.size.clone()
      .subtract(this._size);
    position.clamp(new Vector2(0, 0), maxPosition);

    this._position.copy(position);

    this._applySettings();
  }

  /**
   * Gets called when the user releases the image
   * @param {Event} e
   * @private
   */
  _onImageUp (e) {
    document.removeEventListener("mousemove", this._onImageDrag);
    document.removeEventListener("touchmove", this._onImageDrag);

    document.removeEventListener("mouseup", this._onImageUp);
    document.removeEventListener("touchend", this._onImageUp);
  }

  /**
   * Gets called as soon as the sticker image has been loaded
   * @private
   */
  _onStickerLoad () {
    this._size = new Vector2(this._stickerImage.width, this._stickerImage.height);

    if (typeof this._position === "undefined") {
      this._position = new Vector2(0, 0);
    }

    this._applySettings();
  }

  /**
   * Gets called when the user clicked a list item
   * @private
   */
  _onListItemClick (item) {
    this._deactivateAllItems();

    let { identifier } = item.dataset;
    let stickerPath = this._operation.stickers[identifier];
    stickerPath = this._kit.getAssetPath(stickerPath);

    try {
      this._stickerImage.attributes.removeNamedItem("style");
    } catch (e) {}

    this._sticker = identifier;
    this._stickerImage.src = stickerPath;

    item.classList.add("imglykit-controls-item-active");
  }

  /**
   * Deactivates all list items
   * @private
   */
  _deactivateAllItems () {
    for (let listItem of this._listItems) {
      listItem.classList.remove("imglykit-controls-item-active");
    }
  }

  /**
   * The data that is available to the template
   * @type {Object}
   * @override
   */
  get context () {
    let context = super.context;
    context.stickers = this._operation.stickers;
    return context;
  }
}

export default StickersControl;
