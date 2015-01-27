"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
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

    this._zoomIn = container.querySelector(".imglykit-zoom-in");
    this._zoomOut = container.querySelector(".imglykit-zoom-out");
    this._zoomLevel = container.querySelector(".imglykit-zoom-level-num");
    this._handleZoom();
  }

  /**
   * Handles the zoom controls
   * @private
   */
  _handleZoom () {
    this._zoomIn.addEventListener("click", this._onZoomInClick.bind(this));
    this._zoomOut.addEventListener("click", this._onZoomOutClick.bind(this));
    this._updateZoomLevel();
  }

  /**
   * Gets called when the user clicked the zoom in button
   * @private
   */
  _onZoomInClick () {
    this.emit("zoom-in");
    this._updateZoomLevel();
  }

  /**
   * Gets called when the user clicked the zoom out button
   * @private
   */
  _onZoomOutClick () {
    this.emit("zoom-out");
    this._updateZoomLevel();
  }

  /**
   * Updates the zoom level display
   * @private
   */
  _updateZoomLevel () {
    let { zoomLevel } = this._canvas;
    this._zoomLevel.innerHTML = Math.round(zoomLevel * 100);
  }
}

export default TopControls;
