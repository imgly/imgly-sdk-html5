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
  }

  /**
   * Initializes the renderer, sets the zoom level and initially
   * renders the operations stack
   */
  run () {
    this._initRenderer();
    this._zoomLevel = this._getInitialZoomLevel();
    this._isInitialZoom = true;
    this.render();
  }

  /**
   * Renders the current operations stack
   */
  render () {
    if (this._isInitialZoom) {
      this._zoomLevel = this._getInitialZoomLevel();
    }

    let imageSize = new Vector2(this._image.width, this._image.height);
    let initialSize = imageSize.multiply(this._zoomLevel);

    this._canvas.width = initialSize.x;
    this._canvas.height = initialSize.y;

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
    let initialDimensions = new Vector2(this._image.width, this._image.height);

    let rotationOperation = this._ui.operationsMap.rotation;
    initialDimensions = rotationOperation.getNewDimensions(this._renderer, initialDimensions);

    return this._resizeVectorToFit(initialDimensions);
  }
}

export default Canvas;
