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
    this.registerFilter(require("./filters/identity-filter"));
    this.registerFilter(require("./filters/k1-filter"));
    this.registerFilter(require("./filters/k2-filter"));
    this.registerFilter(require("./filters/k6-filter"));
    this.registerFilter(require("./filters/kdynamic-filter"));
    this.registerFilter(require("./filters/fridge-filter"));
    this.registerFilter(require("./filters/breeze-filter"));
    this.registerFilter(require("./filters/orchid-filter"));
    this.registerFilter(require("./filters/chest-filter"));
    this.registerFilter(require("./filters/front-filter"));
    this.registerFilter(require("./filters/fixie-filter"));
    this.registerFilter(require("./filters/x400-filter"));
    this.registerFilter(require("./filters/bw-filter"));
    this.registerFilter(require("./filters/bwhard-filter"));
    this.registerFilter(require("./filters/lenin-filter"));
    this.registerFilter(require("./filters/quozi-filter"));
    this.registerFilter(require("./filters/pola669-filter"));
    this.registerFilter(require("./filters/pola-filter"));
    this.registerFilter(require("./filters/food-filter"));
    this.registerFilter(require("./filters/glam-filter"));
    this.registerFilter(require("./filters/celsius-filter"));
    this.registerFilter(require("./filters/texas-filter"));
    this.registerFilter(require("./filters/morning-filter"));
    this.registerFilter(require("./filters/lomo-filter"));
    this.registerFilter(require("./filters/gobblin-filter"));
    this.registerFilter(require("./filters/mellow-filter"));
    this.registerFilter(require("./filters/sunny-filter"));
    this.registerFilter(require("./filters/a15-filter"));
    this.registerFilter(require("./filters/semired-filter"));
  }

  /**
   * Registers the given filter
   * @param  {class} filter
   * @private
   */
  registerFilter (filter) {
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
