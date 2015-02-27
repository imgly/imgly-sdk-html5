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

class TopControls extends EventEmitter {
  constructor (kit, ui) {
    super();

    this._kit = kit;
    this._ui = ui;
    this._canvas = this._ui.canvas;
  }

  /**
   * Initializes the controls
   */
  run () {
    let { container } = this._ui;

    this._undoButton = container.querySelector(".imglykit-undo");
    this._zoomIn = container.querySelector(".imglykit-zoom-in");
    this._zoomOut = container.querySelector(".imglykit-zoom-out");
    this._zoomLevel = container.querySelector(".imglykit-zoom-level-num");
    this._handleZoom();
    this._handleUndo();
  }

  /**
   * Handles the zoom controls
   * @private
   */
  _handleZoom () {
    this._zoomIn.addEventListener("click", this._onZoomInClick.bind(this));
    this._zoomOut.addEventListener("click", this._onZoomOutClick.bind(this));
    this.updateZoomLevel();
  }

  /**
   * Handles the undo control
   * @private
   */
  _handleUndo () {
    this._undoButton.addEventListener("click", this._undo.bind(this));
    this._undo();
  }

  /**
   * Gets called when the user clicks the undo button
   * @private
   */
  _undo () {
    this.emit("undo");
  }

  /**
   * Updates the undo button active state
   */
  updateUndoButton () {
    let { history } = this._ui;
    if (history.length === 0) {
      this._undoButton.classList.add("imglykit-inactive");
    } else {
      this._undoButton.classList.remove("imglykit-inactive");
    }
  }

  /**
   * Gets called when the user clicked the zoom in button
   * @param {Event}
   * @private
   */
  _onZoomInClick (e) {
    e.preventDefault();

    this.emit("zoom-in");
    this.updateZoomLevel();
  }

  /**
   * Gets called when the user clicked the zoom out button
   * @param {Event}
   * @private
   */
  _onZoomOutClick (e) {
    e.preventDefault();

    this.emit("zoom-out");
    this.updateZoomLevel();
  }

  /**
   * Updates the zoom level display
   */
  updateZoomLevel () {
    let { zoomLevel } = this._canvas;
    this._zoomLevel.innerHTML = Math.round(zoomLevel * 100);
  }
}

export default TopControls;
