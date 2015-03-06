"use strict";
/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import _ from "lodash";
import bluebird from "bluebird";
import RenderImage from "./lib/render-image";
import ImageExporter from "./lib/image-exporter";
import { RenderType, ImageFormat } from "./constants";
import Utils from "./lib/utils";

// Default UIs
import NightUI from "./ui/night/ui";

// Don't catch errors
bluebird.onPossiblyUnhandledRejection((error) => { throw error; });

/**
 * @class
 * @param {Object} options
 * @param {HTMLElement} [options.container] - Specifies where the UI should be
 *                                          added to. If none is given, the UI
 *                                          will automatically be disabled.
 * @param {Image} options.image - The source image
 */
class ImglyKit {
  constructor (options) {
    // `options` is required
    if (typeof options === "undefined") throw new Error("No options given.");

    // Set default options
    options = _.defaults(options, {
      assetsUrl: "assets",
      container: null,
      ui: true,
      renderOnWindowResize: false
    });

    /**
     * @type {Object}
     * @private
     */
    this._options = options;

    // `options.image` is required
    if (typeof this._options.image === "undefined") throw new Error("`options.image` is undefined.");

    /**
     * The stack of {@link Operation} instances that will be used
     * to render the final Image
     * @type {Array.<ImglyKit.Operation>}
     */
    this.operationsStack = [];

    /**
     * The registered UI types that can be selected via the `ui` option
     * @type {Object.<String, UI>}
     * @private
     */
    this._registeredUIs = {};

    // Register the default UIs
    this._registerUIs();

    /**
     * The registered operations
     * @type {Object.<String, ImglyKit.Operation>}
     */
    this._registeredOperations = {};

    // Register the default operations
    this._registerOperations();

    if (this._options.ui) {
      this._initUI();
      if (this._options.renderOnWindowResize) {
        this._handleWindowResize();
      }
    }
  }

  /**
   * Renders the image
   * @param  {ImglyKit.RenderType} [renderType=ImglyKit.RenderType.DATA_URL] - The output type
   * @param  {ImglyKit.ImageFormat} [imageFormat=ImglyKit.ImageFormat.PNG] - The output image format
   * @param  {string} [dimensions] - The final dimensions of the image
   * @return {Promise}
   */
  render (renderType, imageFormat, dimensions) {
    var settings = ImageExporter.validateSettings(renderType, imageFormat);

    renderType = settings.renderType;
    imageFormat = settings.imageFormat;

    // Create a RenderImage
    var renderImage = new RenderImage(this._options.image, this.operationsStack, dimensions, this._options.renderer);

    // Set all operations to dirty, since we have another webgl renderer
    for (let operation of this.operationsStack) {
      if (!operation) continue;
      operation.dirty = true;
    }

    // Initiate image rendering
    return renderImage.render()
      .then(function () {
        var canvas = renderImage.getRenderer().getCanvas();
        return ImageExporter.export(canvas, renderType, imageFormat);
      });
  }

  /**
   * Resets all custom and selected operations
   */
  reset () {

  }

  /**
   * Returns the asset path for the given filename
   * @param  {String} asset
   * @return {String}
   */
  getAssetPath (asset) {
    var isBrowser = typeof window !== "undefined";
    if (isBrowser) {
      /* istanbul ignore next */
      return this._options.assetsUrl + "/" + asset;
    } else {
      var path = require("path");
      return path.resolve(this._options.assetsUrl, asset);
    }
  }

  /**
   * If `options.renderOnWindowResize` is set to true, this function
   * will re-render the canvas with a slight delay so that it won't
   * cause lagging of the resize
   * @private
   */
  _handleWindowResize () {
    let timer = null;
    window.addEventListener("resize", () => {
      if (timer !== null) {
        clearTimeout(timer);
      }

      timer = setTimeout(() => {
        timer = null;
        this.ui.render();
      }, 300);
    });
  }

  /**
   * Registers all default UIs
   * @private
   */
  _registerUIs () {
    this.registerUI(NightUI);
  }

  /**
   * Registers all default operations
   * @private
   */
  _registerOperations () {
    for (let operationName in ImglyKit.Operations) {
      this.registerOperation(ImglyKit.Operations[operationName]);
    }
  }

  /**
   * Registers the given operation
   * @param {ImglyKit.Operation} operation - The operation class
   */
  registerOperation (operation) {
    this._registeredOperations[operation.prototype.identifier] = operation;
  }

  /**
   * Registers the given UI
   * @param {UI} ui
   */
  registerUI (ui) {
    this._registeredUIs[ui.prototype.identifier] = ui;
  }

  /**
   * Initializes the UI
   * @private
   */
  /* istanbul ignore next */
  _initUI () {
    var UI;

    if (this._options.ui === true) {
      // Select the first UI by default
      UI = Utils.values(this._registeredUIs)[0];
    } else {
      // Select the UI with the given identifier
      UI = this._registeredUIs[this._options.ui];
    }

    // Check if UI exists
    if (typeof UI === "undefined") {
      throw new Error("ImglyKit: Unknown UI: " + this._options.ui);
    }

    /**
     * @type {ImglyKit.UI}
     */
    this.ui = new UI(this, this._options);
  }

  get registeredOperations () {
    return this._registeredOperations;
  }

  run () {
    if (typeof this.ui !== "undefined") {
      this.ui.run();
    }

  }
}

/**
 * The current version of the SDK
 * @name ImglyKit.version
 * @internal Keep in sync with package.json
 */
ImglyKit.version = "2.0.0-beta";

// Exposed classes
ImglyKit.RenderImage = RenderImage;
ImglyKit.Color = require("./lib/color");
ImglyKit.Operation = require("./operations/operation");
ImglyKit.Operations = {};
ImglyKit.Operations.Filters = require("./operations/filters-operation");
ImglyKit.Operations.Crop = require("./operations/crop-operation");
ImglyKit.Operations.Rotation = require("./operations/rotation-operation");
ImglyKit.Operations.Saturation = require("./operations/saturation-operation");
ImglyKit.Operations.Contrast = require("./operations/contrast-operation");
ImglyKit.Operations.Brightness = require("./operations/brightness-operation");
ImglyKit.Operations.Flip = require("./operations/flip-operation");
ImglyKit.Operations.TiltShift = require("./operations/tilt-shift-operation");
ImglyKit.Operations.RadialBlur = require("./operations/radial-blur-operation");
ImglyKit.Operations.Text = require("./operations/text-operation");
ImglyKit.Operations.Stickers = require("./operations/stickers-operation");
ImglyKit.Operations.Frames = require("./operations/frames-operation");

ImglyKit.Filters = {};
ImglyKit.Filters.A15 = require("./operations/filters/a15-filter");
ImglyKit.Filters.Breeze = require("./operations/filters/breeze-filter");
ImglyKit.Filters.BW = require("./operations/filters/bw-filter");
ImglyKit.Filters.BWHard = require("./operations/filters/bwhard-filter");
ImglyKit.Filters.Celsius = require("./operations/filters/celsius-filter");
ImglyKit.Filters.Chest = require("./operations/filters/chest-filter");
ImglyKit.Filters.Fixie = require("./operations/filters/fixie-filter");
ImglyKit.Filters.Food = require("./operations/filters/food-filter");
ImglyKit.Filters.Fridge = require("./operations/filters/fridge-filter");
ImglyKit.Filters.Front = require("./operations/filters/front-filter");
ImglyKit.Filters.Glam = require("./operations/filters/glam-filter");
ImglyKit.Filters.Gobblin = require("./operations/filters/gobblin-filter");
ImglyKit.Filters.K1 = require("./operations/filters/k1-filter");
ImglyKit.Filters.K2 = require("./operations/filters/k2-filter");
ImglyKit.Filters.K6 = require("./operations/filters/k6-filter");
ImglyKit.Filters.KDynamic = require("./operations/filters/kdynamic-filter");
ImglyKit.Filters.Lenin = require("./operations/filters/lenin-filter");
ImglyKit.Filters.Lomo = require("./operations/filters/lomo-filter");
ImglyKit.Filters.Mellow = require("./operations/filters/mellow-filter");
ImglyKit.Filters.Morning = require("./operations/filters/morning-filter");
ImglyKit.Filters.Orchid = require("./operations/filters/orchid-filter");
ImglyKit.Filters.Pola = require("./operations/filters/pola-filter");
ImglyKit.Filters.Pola669 = require("./operations/filters/pola669-filter");
ImglyKit.Filters.Quozi = require("./operations/filters/quozi-filter");
ImglyKit.Filters.Semired = require("./operations/filters/semired-filter");
ImglyKit.Filters.Sunny = require("./operations/filters/sunny-filter");
ImglyKit.Filters.Texas = require("./operations/filters/texas-filter");
ImglyKit.Filters.X400 = require("./operations/filters/x400-filter");

// Exposed constants
ImglyKit.RenderType = RenderType;
ImglyKit.ImageFormat = ImageFormat;
ImglyKit.Vector2 = require("./lib/math/vector2");

export default ImglyKit;
