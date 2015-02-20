"use strict";
/*!
 * Copyright (c) 2013-2015 9elements GmbH
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
    this._partialTemplates = [];
    this._active = false;

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

    let template = this._partialTemplates.concat([this._controlsTemplate]).join("\r\n");

    // Render the template
    let renderFn = dot.template(template);
    let html = renderFn(this.context);

    if (typeof this._controls !== "undefined" && this._controls.parentNode !== null) {
        this._controls.parentNode.removeChild(this._controls);
    }

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

    let template = this._partialTemplates.concat([this._canvasControlsTemplate]).join("\r\n");

    // Render the template
    let renderFn = dot.template(template);
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
    if (this._canvasControls) {
      this._canvasControls.parentNode.removeChild(this._canvasControls);
    }
  }

  _handleBackAndDoneButtons () {
    // Back button
    let backButton = this._controls.querySelector(".imglykit-controls-back");
    backButton.addEventListener("click", this._onBackButtonClick.bind(this));

    // Done button
    let doneButton = this._controls.querySelector(".imglykit-controls-done");
    doneButton.addEventListener("click", this._onDoneButtonClick.bind(this));
  }

  /**
   * Gets called when the back button has been clicked
   * @private
   */
  _onBackButtonClick () {
    this._onBack();
    this.emit("back");
  }

  /**
   * Gets called when the done button has been clicked
   * @private
   */
  _onDoneButtonClick () {
    this._onDone();
    this.emit("back");
  }

  /**
   * Gets called when this control is activated
   * @internal Used by the SDK, don't override.
   */
  enter () {
    this._active = true;

    this._renderAllControls();
    this._handleBackAndDoneButtons();
    this._enableCanvasControls();
    this._onEnter();
  }

  /**
   * Gets called when this control is deactivated
   * @internal Used by the SDK, don't override.
   */
  leave () {
    this._active = false;

    this._removeControls();
    this._disableCanvasControls();
    this._onLeave();
  }

  _enableCanvasControls ()  {
    this._canvasControlsContainer.classList.remove("imglykit-canvas-controls-disabled");
  }

  _disableCanvasControls () {
    this._canvasControlsContainer.classList.add("imglykit-canvas-controls-disabled");
  }

  // Protected methods

  /**
   * Gets called when this control is activated.
   * @protected
   */
  _onEnter () {}

  /**
   * Gets called when this control is deactivated
   * @protected
   */
  _onLeave () {}

  /**
   * Gets called when the back button has been clicked
   * @protected
   */
  _onBack () {}

  /**
   * Gets called when the done button has been clicked
   * @protected
   */
  _onDone () {}

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
