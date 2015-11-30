/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Operation from './operation'
import IdentityFilter from './filters/identity-filter'

/**
 * An operation that can apply a selected filter
 *
 * @class
 * @alias PhotoEditorSDK.Operations.FilterOperation
 * @extends PhotoEditorSDK.Operation
 */
class FilterOperation extends Operation {
  /**
   * Renders the filter using WebGL
   * @param  {WebGLRenderer} renderer
   * @override
   */
  /* istanbul ignore next */
  _renderWebGL (renderer) {
    return this._render(renderer)
  }

  /**
   * Renders the filter using Canvas2D
   * @param {CanvasRenderer} renderer
   * @override
   */
  _renderCanvas (renderer) {
    return this._render(renderer)
  }

  /**
   * Renders the filter (all renderers supported)
   * @param {Renderer} renderer
   * @private
   */
  _render (renderer) {
    return this._selectedFilter.render(renderer)
  }

  /**
   * Sets this operation to dirty, so that it will re-render next time
   * @param {Boolean} dirty
   */
  setDirty (dirty) {
    super.setDirty(dirty)
    if (dirty) {
      this._selectedFilter.setDirty(dirty)
    }
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
FilterOperation.identifier = 'filter'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
FilterOperation.prototype.availableOptions = {
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

export default FilterOperation
