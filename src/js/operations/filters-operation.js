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
import IdentityFilter from "./filters/identity-filter";

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
      filter: { type: "object", default: IdentityFilter,
        setter: function (Filter) {
          this._selectedFilter = new Filter();
          return Filter;
        }
      }
    };

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
   * Renders the filter using WebGL
   * @param  {WebGLRenderer} renderer
   * @override
   */
  /* istanbul ignore next */
  _renderWebGL (renderer) {
    this._render(renderer);
  }

  /**
   * Renders the filter using Canvas2D
   * @param {CanvasRenderer} renderer
   * @override
   */
  _renderCanvas (renderer) {
    this._render(renderer);
  }

  /**
   * Renders the filter (all renderers supported)
   * @param {Renderer} renderer
   * @private
   */
  _render (renderer) {
    this._selectedFilter.render(renderer);
  }
}

export default FiltersOperation;
