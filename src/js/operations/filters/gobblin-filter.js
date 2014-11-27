"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = require("./filter");

/**
 * Gobblin Filter
 * @class
 * @alias ImglyKit.Filters.GobblinFilter
 * @extends {ImglyKit.Filter}
 */
var GobblinFilter = Filter.extend({});

/**
 * A unique string that identifies this operation. Can be used to select
 * the active filter.
 * @type {String}
 */
GobblinFilter.identifier = "gobblin";

/**
 * Renders the filter
 * @param  {Renderer} renderer
 * @return {Promise}
 */
GobblinFilter.prototype.render = function(renderer) {
  var stack = new Filter.PrimitivesStack();

  stack.add(new Filter.Primitives.Gobblin());

  stack.render(renderer);
};

module.exports = GobblinFilter;
