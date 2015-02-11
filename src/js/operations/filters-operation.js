"use strict";
/*!
 * Copyright (c) 2013-2015 9elements GmbH
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
    this._addDefaultFilters();

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
  _addDefaultFilters () {
    this.addFilter(require("./filters/identity-filter"));
    this.addFilter(require("./filters/k1-filter"));
    this.addFilter(require("./filters/k2-filter"));
    this.addFilter(require("./filters/k6-filter"));
    this.addFilter(require("./filters/kdynamic-filter"));
    this.addFilter(require("./filters/fridge-filter"));
    this.addFilter(require("./filters/breeze-filter"));
    this.addFilter(require("./filters/orchid-filter"));
    this.addFilter(require("./filters/chest-filter"));
    this.addFilter(require("./filters/front-filter"));
    this.addFilter(require("./filters/fixie-filter"));
    this.addFilter(require("./filters/x400-filter"));
    this.addFilter(require("./filters/bw-filter"));
    this.addFilter(require("./filters/bwhard-filter"));
    this.addFilter(require("./filters/lenin-filter"));
    this.addFilter(require("./filters/quozi-filter"));
    this.addFilter(require("./filters/pola669-filter"));
    this.addFilter(require("./filters/pola-filter"));
    this.addFilter(require("./filters/food-filter"));
    this.addFilter(require("./filters/glam-filter"));
    this.addFilter(require("./filters/celsius-filter"));
    this.addFilter(require("./filters/texas-filter"));
    this.addFilter(require("./filters/morning-filter"));
    this.addFilter(require("./filters/lomo-filter"));
    this.addFilter(require("./filters/gobblin-filter"));
    this.addFilter(require("./filters/mellow-filter"));
    this.addFilter(require("./filters/sunny-filter"));
    this.addFilter(require("./filters/a15-filter"));
    this.addFilter(require("./filters/semired-filter"));
  }

  /**
   * Registers the given filter
   * @param  {class} filter
   * @private
   */
  addFilter (filter) {
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
