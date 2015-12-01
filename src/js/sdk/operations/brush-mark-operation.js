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
import BrushMarkFilter from './tableau/brush-mark-filter'

/**
 * An operation that can apply a selected filter
 *
 * @class
 * @alias PhotoEditorSDK.Operations.BrushMarkOperation
 * @extends PhotoEditorSDK.Operation
 */
class BrushMarkOperation extends Operation {
  constructor (...args) {
    super(...args)
    this._registerFilters()
  }

  /**
   * Registers the available filters
   * @private
   */
  _registerFilters () {
    this._filter = new BrushMarkFilter()
    this._filter.setImageURL(this._imageURL)
  }

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
    return this._filter.render(renderer)
  }

  /**
   * Sets this operation to dirty, so that it will re-render next time
   * @param {Boolean} dirty = true
   */
  setDirty (dirty) {
    super.setDirty(dirty)
    if (dirty) {
      this._filter.setDirty(dirty)
    }
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
BrushMarkOperation.identifier = 'brush-mark'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
BrushMarkOperation.prototype.availableOptions = {
  intensity: {
    type: 'number',
    default: 0.5,
    setter: function (intensity) {
      this._filter &&
        this._flter.setIntensity(intensity)
      return intensity
    }
  },
  imageURL: {
    type: 'string',
    default: '',
    setter: function (url) {
      this._filter && this._filter.setImageURL(url)
      return url
    }
  }
}

export default BrushMarkOperation
