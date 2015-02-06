"use strict";
/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

let fs = require("fs");
import Symbol from "es6-symbol";
import UI from "../base/ui";
import Canvas from "./lib/canvas";
import TopControls from "./lib/top-controls";

class NightUI extends UI {
  constructor (...args) {
    super(...args);

    this._template = fs.readFileSync(__dirname + "/../../templates/night/template.jst", "utf-8");
    this._registeredControls = {};

    // The `Night` UI has a fixed operation order
    this._preferredOperationOrder = [
      // First, all operations that affect the image dimensions
      "crop",
      "rotation",
      "flip",

      // Then color operations (first filters, then fine-tuning)
      "filters",
      "contrast",
      "brightness",
      "saturation",

      // Then post-processing
      "radial-blur",
      "tilt-shift",
      "frames"
    ];
  }

  run () {
    super();

    let { container } = this._options;

    this._controlsContainer = container.querySelector(".imglykit-controls");
    this._canvasControlsContainer = container.querySelector(".imglykit-canvas-controls");
    this._overviewControlsContainer = container.querySelector(".imglykit-controls-overview");

    this._operationsMap = {};

    this._initOperations();
    this._registerControls();
    this._handleOverview();

    this._initCanvas();
    this._initTopControls();
  }

  /**
   * Initializes the top controls
   * @private
   */
  _initTopControls () {
    this._topControls = new TopControls(this._kit, this);
    this._topControls.run();

    // Pass zoom in event
    this._topControls.on("zoom-in", () => {
      this._canvas.zoomIn();
    });

    // Pass zoom out event
    this._topControls.on("zoom-out", () => {
      this._canvas.zoomOut();
    });
  }

  /**
   * Inititializes the canvas
   * @private
   */
  _initCanvas () {
    this._canvas = new Canvas(this._kit, this, this._options);
    this._canvas.run();
    this._canvas.on("zoom", () => {
      this._topControls.updateZoomLevel();
    });
  }

  /**
   * Initializes all operations
   * @private
   */
  _initOperations () {
    let { operationsStack, registeredOperations } = this._kit;
    for (let operationIdentifier of this._preferredOperationOrder) {
      if (this.isOperationSelected(operationIdentifier)) {
        let Operation = registeredOperations[operationIdentifier];
        let operationInstance = new Operation(this._kit);

        // Skip per default
        // This additional attribute is not part of the img.ly SDK,
        // we only use it for the Night UI to check whether an operation
        // needs to be rendered
        operationInstance.isIdentity = true;

        operationInstance.on("update", () => {
          if (this._paused) return;

          operationInstance.isIdentity = false;
          this.render();
        });

        this._operationsMap[operationIdentifier] = operationInstance;
        operationsStack.push(operationInstance);
      }
    }
  }

  /**
   * Registers all default operation controls
   * @private
   */
  _registerControls () {
    this.registerControl(this._operationsMap.filters, require("./controls/filters"));
    this.registerControl(this._operationsMap.rotation, require("./controls/rotation"));
    this.registerControl(this._operationsMap.flip, require("./controls/flip"));
    this.registerControl(this._operationsMap.brightness, require("./controls/brightness"));
    this.registerControl(this._operationsMap.contrast, require("./controls/contrast"));
    this.registerControl(this._operationsMap.saturation, require("./controls/saturation"));
    this.registerControl(this._operationsMap.crop, require("./controls/crop"));
    this.registerControl(this._operationsMap["radial-blur"], require("./controls/radial-blur"));
    this.registerControl(this._operationsMap["tilt-shift"], require("./controls/tilt-shift"));
    this.registerControl(this._operationsMap.frames, require("./controls/frames"));
  }

  /**
   * Handles the overview button click events
   * @private
   */
  _handleOverview () {
    let listItems = this._overviewControlsContainer.querySelectorAll(":scope > ul > li");

    // Turn NodeList into an Array
    listItems = Array.prototype.slice.call(listItems);

    // Add click events to all items
    for (let listItem of listItems) {
      let { identifier } = listItem.dataset;
      listItem.addEventListener("click", () => {
        this._onOverviewButtonClick(identifier);
      });
    }
  }

  /**
   * Gets called when an overview button has been clicked
   * @private
   */
  _onOverviewButtonClick (identifier) {
    this._overviewControlsContainer.style.display = "none";

    if (this._currentControl) {
      this._currentControl.leave();
    }

    this._currentControl = this._registeredControls[identifier];
    this._currentControl.enter();
    this._currentControl.once("back", this._switchToOverview.bind(this));
  }

  /**
   * Switches back to the overview controls
   * @private
   */
  _switchToOverview () {
    if (this._currentControl) {
      this._currentControl.leave();
    }

    this._currentControl = null;
    this._overviewControlsContainer.style.display = "";
  }

  /**
   * Registers the controls for an operation
   */
  registerControl (operation, Controls) {
    let instance = new Controls(this._kit, this, operation, this._controlsContainer, this._canvasControlsContainer);
    this._registeredControls[operation.identifier] = instance;
  }

  /**
   * Re-renders the canvas
   */
  render () {
    this._canvas.render();
  }

  /**
   * An object containing all active operations
   * @type {Object.<String,Operation>}
   */
  get operationsMap () {
    return this._operationsMap;
  }
}

export default NightUI;
