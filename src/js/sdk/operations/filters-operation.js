/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Utils from '../lib/utils'
import Operation from './operation'
import Filters from './filters/'
import IdentityFilter from './filters/identity-filter'

/**
 * An operation that can apply a selected filter
 *
 * @class
 * @alias ImglyKit.Operations.FiltersOperation
 * @extends ImglyKit.Operation
 */
class FiltersOperation extends Operation {
  constructor (...args) {
    super(...args)

    this._registerFilters()
  }

  /**
   * Registers the available filters
   * @private
   */
  _registerFilters () {
    this._filters = {}
    this._filters.identity = Filters.IdentityFilter
    for (let name in Filters) {
      const filter = Filters[name]
      this._filters[filter.identifier] = filter
    }

    this._filters = Utils.extend(this._filters, this._options.additionalFilters)
  }

  /**
   * Renders the filter using WebGL
   * @param  {WebGLRenderer} renderer
   * @override
   */
  /* istanbul ignore next */
  _renderWebGL (renderer) {
    this._render(renderer)
  }

  /**
   * Renders the filter using Canvas2D
   * @param {CanvasRenderer} renderer
   * @override
   */
  _renderCanvas (renderer) {
    this._render(renderer)
  }

  /**
   * Renders the filter (all renderers supported)
   * @param {Renderer} renderer
   * @private
   */
  _render (renderer) {
    this._selectedFilter.render(renderer)
  }

  getFilters () { return this._filters }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
FiltersOperation.identifier = 'filters'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
FiltersOperation.prototype.availableOptions = {
  intensity: {
    type: 'number',
    default: 1,
    setter: function (intensity) {
      this._selectedFilter &&
        this._selectedFilter.setIntensity(intensity)
      return intensity
    }
  },
  filter: { type: 'object', default: IdentityFilter,
    setter: function (Filter) {
      this._selectedFilter = new Filter(this._options.intensity)
      return Filter
    }
  }
}

export default FiltersOperation
