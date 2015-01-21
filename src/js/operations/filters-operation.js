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
      filter: { type: "string", default: "identity",
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
  get identifier () {
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
    this._registerFilter(require("./filters/identity-filter"));
    this._registerFilter(require("./filters/k1-filter"));
    this._registerFilter(require("./filters/k2-filter"));
    this._registerFilter(require("./filters/k6-filter"));
    this._registerFilter(require("./filters/kdynamic-filter"));
    this._registerFilter(require("./filters/fridge-filter"));
    this._registerFilter(require("./filters/breeze-filter"));
    this._registerFilter(require("./filters/orchid-filter"));
    this._registerFilter(require("./filters/chest-filter"));
    this._registerFilter(require("./filters/front-filter"));
    this._registerFilter(require("./filters/fixie-filter"));
    this._registerFilter(require("./filters/x400-filter"));
    this._registerFilter(require("./filters/bw-filter"));
    this._registerFilter(require("./filters/bwhard-filter"));
    this._registerFilter(require("./filters/lenin-filter"));
    this._registerFilter(require("./filters/quozi-filter"));
    this._registerFilter(require("./filters/pola669-filter"));
    this._registerFilter(require("./filters/pola-filter"));
    this._registerFilter(require("./filters/food-filter"));
    this._registerFilter(require("./filters/glam-filter"));
    this._registerFilter(require("./filters/celsius-filter"));
    this._registerFilter(require("./filters/texas-filter"));
    this._registerFilter(require("./filters/morning-filter"));
    this._registerFilter(require("./filters/lomo-filter"));
    this._registerFilter(require("./filters/gobblin-filter"));
    this._registerFilter(require("./filters/mellow-filter"));
    this._registerFilter(require("./filters/sunny-filter"));
    this._registerFilter(require("./filters/a15-filter"));
    this._registerFilter(require("./filters/semired-filter"));
  }

  /**
   * Registers the given filter
   * @param  {class} filter
   * @private
   */
  _registerFilter (filter) {
    this._filters[filter.identifier] = filter;
  }

  /**
   * The registered filters
   * @type {Object.<String, Filter>}
   */
  get filters () {
    return this._filters;
  }
}

export default FiltersOperation;
