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
import Vector2 from "../../../lib/math/vector2";
import _ from "lodash";

let fs = require("fs");

class Slider extends EventEmitter {
  constructor (element, options) {
    super();

    this._element = element;
    this._options = _.defaults(options, {
      minValue: 0,
      maxValue: 1,
      defaultValue: 0
    });

    this._value = this._options.defaultValue;

    this._sliderElement = this._element.querySelector(".imglykit-slider-slider");
    this._dotElement = this._element.querySelector(".imglykit-slider-dot");
    this._centerDotElement = this._element.querySelector(".imglykit-slider-center-dot");
    this._fillElement = this._element.querySelector(".imglykit-slider-fill");
    this._backgroundElement = this._element.querySelector(".imglykit-slider-background");

    // Mouse event callbacks bound to class context
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onCenterDotClick = this._onCenterDotClick.bind(this);
    this._onBackgroundClick = this._onBackgroundClick.bind(this);

    this._backgroundElement.addEventListener("click", this._onBackgroundClick);
    this._fillElement.addEventListener("click", this._onBackgroundClick);

    this._handleDot();
  }

  /**
   * The partial template string
   * @type {String}
   */
  static get template () {
    return fs.readFileSync(__dirname + "/../../../templates/night/generics/slider_control.jst", "utf-8");
  }

  /**
   * Sets the given value
   * @param {Number} value
   */
  setValue (value) {
    this._value = value;

    let { maxValue, minValue } = this._options;

    // Calculate the X position
    let valueRange = maxValue - minValue;
    let percentage = (value - minValue) / valueRange;
    let sliderWidth = this._sliderElement.offsetWidth;
    this._setX(sliderWidth * percentage);
  }

  /**
   * Sets the slider position to the given X value and resizes
   * the fill div
   * @private
   */
  _setX (x) {
    this._xPosition = x;
    this._dotElement.style.left = `${x}px`;

    // X position relative to center to simplify calculations
    let halfSliderWidth = this._sliderElement.offsetWidth / 2;
    let relativeX = x - halfSliderWidth;

    // Update style
    this._fillElement.style.width = `${Math.abs(relativeX)}px`;
    if (relativeX < 0) {
      this._fillElement.style.left = halfSliderWidth - Math.abs(relativeX) + "px";
    } else {
      this._fillElement.style.left = halfSliderWidth + "px";
    }
  }

  /**
   * Handles the dot dragging
   * @private
   */
  _handleDot () {
    this._dotElement.addEventListener("mousedown", this._onMouseDown);
    this._dotElement.addEventListener("touchstart", this._onMouseDown);

    if (this._centerDotElement) {
      this._centerDotElement.addEventListener("click", this._onCenterDotClick);
    }
  }

  /**
   * Gets called when the user clicks the center button. Resets to default
   * settings.
   * @private
   */
  _onCenterDotClick () {
    this.setValue(this._options.defaultValue);
    this.emit("update", this._value);
  }

  /**
   * Gets called when the user clicks on the slider background
   * @param {Event} e
   * @private
   */
  _onBackgroundClick (e) {
    let position = Utils.getEventPosition(e);
    let sliderOffset = this._sliderElement.getBoundingClientRect();
    sliderOffset = new Vector2(sliderOffset.left, sliderOffset.y);

    let relativePosition = position.clone()
      .subtract(sliderOffset);

    this._setX(relativePosition.x);
    this._updateValue();
  }

  /**
   * Gets called when the user presses a mouse button on the slider dot
   * @private
   */
  _onMouseDown (e) {
    if (e.type === "mousedown" && e.button !== 0) return;
    e.preventDefault();

    let mousePosition = Utils.getEventPosition(e);

    document.addEventListener("mousemove", this._onMouseMove);
    document.addEventListener("touchmove", this._onMouseMove);

    document.addEventListener("mouseup", this._onMouseUp);
    document.addEventListener("touchend", this._onMouseUp);

    // Remember initial position
    let dotPosition = this._dotElement.getBoundingClientRect();
    let sliderPosition = this._sliderElement.getBoundingClientRect();

    this._initialSliderX = dotPosition.left - sliderPosition.left;
    this._initialMousePosition = mousePosition;
  }

  /**
   * Gets called when the user drags the mouse
   * @private
   */
  _onMouseMove (e) {
    e.preventDefault();

    let mousePosition = Utils.getEventPosition(e);
    let mouseDiff = mousePosition.subtract(this._initialMousePosition);

    // Add half width of the dot for negative margin compensation
    let halfDotWidth = this._dotElement.offsetWidth * 0.5;
    let newSliderX = this._initialSliderX + mouseDiff.x + halfDotWidth;

    // X boundaries
    let sliderWidth = this._sliderElement.offsetWidth;
    newSliderX = Math.max(0, Math.min(newSliderX, sliderWidth));

    this._setX(newSliderX);
    this._updateValue();
  }

  /**
   * Updates the value using the slider position
   * @private
   */
  _updateValue () {
    let sliderWidth = this._sliderElement.offsetWidth;

    // Calculate the new value
    let { minValue, maxValue } = this._options;
    let percentage = this._xPosition / sliderWidth;
    let value = minValue + (maxValue - minValue) * percentage;
    this.emit("update", value);
  }

  /**
   * Gets called when the user does not press the mouse button anymore
   * @private
   */
  _onMouseUp () {
    document.removeEventListener("mousemove", this._onMouseMove);
    document.removeEventListener("touchmove", this._onMouseMove);

    document.removeEventListener("mouseup", this._onMouseUp);
    document.removeEventListener("touchend", this._onMouseUp);
  }
}

export default Slider;
