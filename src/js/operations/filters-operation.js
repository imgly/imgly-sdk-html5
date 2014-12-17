"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Operation from "./operation";

/**
 * An operation that can apply a selected filter
 *
 * @class
 * @alias ImglyKit.Operations.FiltersOperation
 * @extends ImglyKit.Operation
 */
class FiltersOperation extends Operation {
  constructor (...args) {
    this.availableOptions = {
      filter: { type: "string", required: true,
        setter: function (value) {
          var Filter = this._filters[value];
          if (typeof Filter === "undefined") {
            throw new Error("FiltersOperation: Unknown filter \"" + value + "\".");
          }
          this._selectedFilter = new Filter();
          return value;
        }
      }
    };

    /**
     * The registered filters
     * @type {Object.<string, class>}
     */
    this._filters = {};
    this._registerFilters();

    super(...args);
  }

  /**
   * A unique string that identifies this operation. Can be used to select
   * operations.
   * @type {String}
   */
  static get identifier () {
    return "filters";
  }

  /**
   * Renders the filter
   * @param  {Renderer} renderer
   * @return {Promise}
   */
  render (renderer) {
    this._selectedFilter.render(renderer);
  }

  /**
   * Registers all the known filters
   * @private
   */
  _registerFilters () {
    this._registerFilter(require("./filters/k1-filter")["default"]);
    this._registerFilter(require("./filters/k2-filter")["default"]);
    this._registerFilter(require("./filters/k6-filter")["default"]);
    this._registerFilter(require("./filters/kdynamic-filter")["default"]);
    this._registerFilter(require("./filters/fridge-filter")["default"]);
    this._registerFilter(require("./filters/breeze-filter")["default"]);
    this._registerFilter(require("./filters/orchid-filter")["default"]);
    this._registerFilter(require("./filters/chest-filter")["default"]);
    this._registerFilter(require("./filters/front-filter")["default"]);
    this._registerFilter(require("./filters/fixie-filter")["default"]);
    this._registerFilter(require("./filters/x400-filter")["default"]);
    this._registerFilter(require("./filters/bw-filter")["default"]);
    this._registerFilter(require("./filters/bwhard-filter")["default"]);
    this._registerFilter(require("./filters/lenin-filter")["default"]);
    this._registerFilter(require("./filters/quozi-filter")["default"]);
    this._registerFilter(require("./filters/pola669-filter")["default"]);
    this._registerFilter(require("./filters/pola-filter")["default"]);
    this._registerFilter(require("./filters/food-filter")["default"]);
    this._registerFilter(require("./filters/glam-filter")["default"]);
    this._registerFilter(require("./filters/celsius-filter")["default"]);
    this._registerFilter(require("./filters/texas-filter")["default"]);
    this._registerFilter(require("./filters/morning-filter")["default"]);
    this._registerFilter(require("./filters/lomo-filter")["default"]);
    this._registerFilter(require("./filters/gobblin-filter")["default"]);
    this._registerFilter(require("./filters/mellow-filter")["default"]);
    this._registerFilter(require("./filters/sunny-filter")["default"]);
    this._registerFilter(require("./filters/a15-filter")["default"]);
    this._registerFilter(require("./filters/semired-filter")["default"]);
  }

  /**
   * Registers the given filter
   * @param  {class} filter
   * @private
   */
  _registerFilter (filter) {
    this._filters[filter.identifier] = filter;
  }
}

export default FiltersOperation;
