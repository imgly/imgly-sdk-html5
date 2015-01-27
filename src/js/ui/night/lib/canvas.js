"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import bluebird from "bluebird";
import WebGLRenderer from "../../../renderers/webgl-renderer";
import CanvasRenderer from "../../../renderers/canvas-renderer";
import Vector2 from "../../../lib/math/vector2";

class Canvas {
  constructor (kit, ui, options) {
    this._kit = kit;
    this._ui = ui;
    this._options = options;

    this._canvasContainer = this._ui.container.querySelector(".imglykit-canvas-container");
    this._canvas = this._canvasContainer.querySelector("canvas");
    this._image = this._options.image;
    this._roundZoomBy = 0.1;
  }

  /**
   * Initializes the renderer, sets the zoom level and initially
   * renders the operations stack
   */
  run () {
    this._initRenderer();

    // Calculate the initial zoom level
    this._zoomLevel = this._getInitialZoomLevel();
    this._initialZoomLevel = this._zoomLevel;
    this._isInitialZoom = true;

    this.render();
    this._centerCanvas();
    this._handleDrag();
  }

  /**
   * Renders the current operations stack
   */
  render () {
    this._initialZoomLevel = this._getInitialZoomLevel();
    if (this._isInitialZoom) {
      this._zoomLevel = this._initialZoomLevel;
    }

    let imageSize = new Vector2(this._image.width, this._image.height);
    let initialSize = imageSize.multiply(this._zoomLevel);
    let finalSize = this._finalDimensions;

    this._setCanvasSize(initialSize);

    this._renderer.reset();
    this._renderer.drawImage(this._image);

    let stack = this._actualStack;
    return bluebird
      .map(stack, (operation) => {
        return operation.validateSettings();
      })
      .then(() => {
        return bluebird.map(stack, (operation) => {
          return operation.render(this._renderer);
        }, { concurrency: 1 }).then(() => {
          return this._renderer.renderFinal();
        });
      });
  }

  /**
   * Increase zoom level
   */
  zoomIn () {
    this._isInitialZoom = false;

    let zoomLevel = Math.round(this._zoomLevel * 100);
    let roundZoomBy = Math.round(this._roundZoomBy * 100);

    // Round up if needed
    if (zoomLevel % roundZoomBy !== 0) {
      zoomLevel = Math.ceil(zoomLevel / roundZoomBy) * roundZoomBy;
    } else {
      zoomLevel += roundZoomBy;
    }

    zoomLevel = Math.min(100, zoomLevel);
    this._setZoomLevel(zoomLevel / 100);

    this.render();
  }

  /**
   * Decrease zoom level
   */
  zoomOut () {
    this._isInitialZoom = false;

    let zoomLevel = Math.round(this._zoomLevel * 100);
    let roundZoomBy = Math.round(this._roundZoomBy * 100);
    let initialZoomLevel = Math.round(this._initialZoomLevel * 100);

    // Round up if needed
    if (zoomLevel % roundZoomBy !== 0) {
      zoomLevel = Math.floor(zoomLevel / roundZoomBy) * roundZoomBy;
    } else {
      zoomLevel -= roundZoomBy;
    }

    zoomLevel = Math.max(initialZoomLevel, zoomLevel);
    this._setZoomLevel(zoomLevel / 100);
  }

  /**
   * Resizes and positions the canvas
   * @param {Vector2} size
   * @private
   */
  _setCanvasSize (size) {
    this._canvas.width = size.x;
    this._canvas.height = size.y;
  }

  /**
   * Centers the canvas inside the container
   * @private
   */
  _centerCanvas () {
    let position = this._maxSize
      .divide(2);

    this._canvas.style.left = `${position.x}px`;
    this._canvas.style.top = `${position.y}px`;

    this._updateCanvasMargins();
  }

  /**
   * Updates the canvas margins so that they are the negative half width
   * and height of the canvas
   * @private
   */
  _updateCanvasMargins () {
    let canvasSize = new Vector2(this._canvas.width, this._canvas.height);
    let margin = canvasSize
      .divide(2)
      .multiply(-1);
    this._canvas.style.marginLeft = `${margin.x}px`;
    this._canvas.style.marginTop = `${margin.y}px`;
  }

  /**
   * Sets the zoom level, re-renders the canvas and
   * repositions it
   * @param {Number} zoomLevel
   * @private
   */
  _setZoomLevel (zoomLevel) {
    this._zoomLevel = zoomLevel;
    this.render();
    this._updateCanvasMargins();
  }

  /**
   * Gets the initial zoom level so that the image fits the maximum
   * canvas size
   * @private
   */
  _getInitialZoomLevel () {
    let initialDimensions = new Vector2(this._image.width, this._image.height);
    let finalDimensions = this._finalDimensions;

    // Take rotation into account when needed
    let rotation = this._ui.operationsMap.rotation;
    if (rotation.getDegrees() % 180 !== 0) {
      finalDimensions.flip();
    }

    return finalDimensions.x / initialDimensions.x;
  }

  /**
   * Resizes the given two-dimensional vector so that it fits
   * the maximum size.
   * @private
   */
  _resizeVectorToFit (size) {
    let maxSize = this._maxSize;
    let scale = Math.min(maxSize.x / size.x, maxSize.y / size.y);

    let newSize = size.clone()
      .multiply(scale);

    return newSize;
  }

  /**
   * Initializes the renderer
   * @private
   */
  _initRenderer () {
    if (WebGLRenderer.isSupported() && this._options.renderer !== "canvas") {
      this._renderer = new WebGLRenderer(null, this._canvas);
      this._webglEnabled = true;
    } else if (CanvasRenderer.isSupported()) {
      this._renderer = new CanvasRenderer(null, this._canvas);
      this._webglEnabled = false;
    }

    if (this._renderer === null) {
      throw new Error("Neither Canvas nor WebGL renderer are supported.");
    }
  }

  /**
   * Handles the dragging
   * @private
   */
  _handleDrag () {

  }

  /**
   * The maximum canvas size
   * @private
   */
  get _maxSize () {
    let computedStyle = getComputedStyle(this._canvasContainer);
    let size = new Vector2(this._canvasContainer.offsetWidth, this._canvasContainer.offsetHeight);

    let paddingX = parseInt(computedStyle.getPropertyValue("padding-left"));
    paddingX += parseInt(computedStyle.getPropertyValue("padding-right"));

    let paddingY = parseInt(computedStyle.getPropertyValue("padding-top"));
    paddingY += parseInt(computedStyle.getPropertyValue("padding-bottom"));

    size.x -= paddingX;
    size.y -= paddingY;

    let controlsHeight = this._ui._controlsContainer.offsetHeight;
    size.y -= controlsHeight;

    return size;
  }

  /**
   * Filters the operation stack so that only the operations that are not
   * set to the default settings are used.
   * @private
   */
  get _actualStack () {
    return this._kit.operationsStack.filter((op) => {
      return !op.isIdentity;
    });
  }

  /**
   * Calculates the final image dimensions
   * @private
   */
  get _finalDimensions () {
    let dimensions = new Vector2(this._image.width, this._image.height);

    let rotationOperation = this._ui.operationsMap.rotation;
    dimensions = rotationOperation.getNewDimensions(this._renderer, dimensions);

    return this._resizeVectorToFit(dimensions);
  }

  /**
   * The current zoom level
   * @type {Number}
   */
  get zoomLevel () {
    return this._zoomLevel;
  }
}

export default Canvas;
