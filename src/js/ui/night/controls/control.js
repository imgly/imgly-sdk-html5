"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import dot from "dot";
import Helpers from "../../base/helpers";
import EventEmitter from "../../../lib/event-emitter";

class Control extends EventEmitter {
  constructor (kit, ui, operation, controlsContainer, canvasControlsContainer) {
    super();

    this._kit = kit;
    this._ui = ui;
    this._operation = operation;
    this._controlsContainer = controlsContainer;
    this._canvasControlsContainer = canvasControlsContainer;
    this._helpers = new Helpers(this._kit, this._ui, this._ui.options);

    this.init();
  }

  /**
   * The entry point for this control
   */
  init () {

  }

  /**
   * Renders the controls
   * @private
   */
  _renderAllControls () {
    this._renderControls();
    this._renderCanvasControls();
  }

  /**
   * Renders the controls
   * @private
   */
  _renderControls () {
    if (typeof this._controlsTemplate === "undefined") {
      throw new Error("Control#_renderOverviewControls: Control needs to define this._controlsTemplate.");
    }

    // Render the template
    let renderFn = dot.template(this._controlsTemplate);
    let html = renderFn(this.context);

    // Create a wrapper
    this._controls = document.createElement("div");
    this._controls.innerHTML = html;

    // Append to DOM
    this._controlsContainer.appendChild(this._controls);
  }

  /**
   * Renders the canvas controls
   * @private
   */
  _renderCanvasControls () {
    if (typeof this._canvasControlsTemplate === "undefined") {
      return; // Canvas controls are optional
    }

    // Render the template
    let renderFn = dot.template(this._canvasControlsTemplate);
    let html = renderFn(this.context);

    // Create a wrapper
    this._canvasControls = document.createElement("div");
    this._canvasControls.innerHTML = html;

    // Append to DOM
    this._canvasControlsContainer.appendChild(this._canvasControls);
  }

  /**
   * Removes the controls from the DOM
   * @private
   */
  _removeControls () {
    this._controls.parentNode.removeChild(this._controls);
    this._canvasControls.parentNode.removeChild(this._canvasControls);
  }

  /**
   * Gets called when this control is activated
   * @internal Used by the SDK, don't override.
   */
  enter () {
    this._renderAllControls();
    this.onEnter();
  }

  /**
   * Gets called when this control is deactivated
   * @internal Used by the SDK, don't override.
   */
  leave () {
    this._removeControls();
    this.onLeave();
  }

  // Abstract methods

  /**
   * Gets called when this control is activated.
   * @abstract
   */
  onEnter () {
    throw new Error("Control#onEnter is not implemented.");
  }

  /**
   * Gets called when this control is deactivated
   * @abstract
   */
  onLeave () {
    throw new Error("Control#onLeave is not implemented.");
  }

  /**
   * The data that is available to the template
   * @type {Object}
   */
  get context () {
    return {
      helpers: this._helpers
    };
  }
}

export default Control;
