"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Operation = require("./operation");

/**
 * An operation that can apply a selected filter
 *
 * @class
 * @alias ImglyKit.Operations.FiltersOperation
 * @extends ImglyKit.Operation
 */
var FiltersOperation = Operation.extend({
  constructor: function (renderer, options) {
    Operation.apply(this, arguments);

    if (typeof options === "undefined") {
      options = {};
    }

    /**
     * The selected filter
     * @type {class}
     * @private
     */
    this._selectedFilter = null;

    /**
     * The registered filters
     * @type {Object.<string, class>}
     */
    this._filters = {};
    this._registerFilters();

    if (typeof options.filter !== "undefined") {
      this.selectFilter(options.filter);
    }
  }
});

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
FiltersOperation.identifier = "filters";

/**
 * Checks whether this Operation can be applied the way it is configured
 * @return {boolean}
 */
FiltersOperation.prototype.validateSettings = function() {
  // Did the user select a filter?
  /* istanbul ignore else */
  if (this._selectedFilter === null) {
    throw new Error("FiltersOperation: Need to select a filter.");
  }
};

/**
 * Renders the filter
 * @param  {Renderer} renderer
 * @return {Promise}
 */
FiltersOperation.prototype.render = function(renderer) {
  this._selectedFilter.render(renderer);
};

/**
 * Sets the selected filter by the given identifier
 * @param  {String} identifier
 */
FiltersOperation.prototype.selectFilter = function(identifier) {
  var Filter = this._filters[identifier];
  if (typeof Filter === "undefined") {
    throw new Error("FiltersOperation: Unknown filter \"" + identifier + "\".");
  }

  this._selectedFilter = new Filter();
};

/**
 * Registers all the known filters
 * @private
 */
FiltersOperation.prototype._registerFilters = function() {
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
};

/**
 * Registers the given filter
 * @param  {class} filter
 * @private
 */
FiltersOperation.prototype._registerFilter = function(filter) {
  this._filters[filter.identifier] = filter;
};

module.exports = FiltersOperation;
