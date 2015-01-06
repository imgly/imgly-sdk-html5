/* jshint unused: false */
"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

/**
 * Base class for filters. Extendable via {@link ImglyKit.Filter#extend}
 * @class
 * @alias ImglyKit.Filter
 */
class Filter {
  /**
   * A unique string that identifies this operation. Can be used to select
   * the active filter.
   * @type {String}
   */
  static get identifier () { return null; }

  /**
   * Renders the filter
   * @param  {Renderer} renderer
   * @return {Promise}
   */
  render (renderer) {
    /* istanbul ignore next */
    throw new Error("Filter#render is abstract and not implemented in inherited class.");
  }
}

/**
 * To create an {@link ImglyKit.Filter} class of your own, call this
 * method and provide instance properties and functions.
 * @function
 */
Filter.extend = require("../../lib/extend");

// Exposed classes
Filter.PrimitivesStack = require("./primitives-stack").default;
Filter.Primitives = {};
Filter.Primitives.Saturation = require("./primitives/saturation").default;
Filter.Primitives.LookupTable = require("./primitives/lookup-table").default;
Filter.Primitives.ToneCurve = require("./primitives/tone-curve").default;
Filter.Primitives.SoftColorOverlay = require("./primitives/soft-color-overlay").default;
Filter.Primitives.Desaturation = require("./primitives/desaturation").default;
Filter.Primitives.X400 = require("./primitives/x400").default;
Filter.Primitives.Grayscale = require("./primitives/grayscale").default;
Filter.Primitives.Contrast = require("./primitives/contrast").default;
Filter.Primitives.Glow = require("./primitives/glow").default;
Filter.Primitives.Gobblin = require("./primitives/gobblin").default;
Filter.Primitives.Brightness = require("./primitives/brightness").default;

export default Filter;
