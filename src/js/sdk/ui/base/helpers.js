/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

class Helpers {
  constructor (renderer, ui, options) {
    this._renderer = renderer
    this._ui = ui
    this._options = options
  }

  assetPath (asset, uiAsset = false) {
    const { baseUrl, resolver } = this._ui.options.assets

    let path = `${baseUrl}/${asset}`
    if (uiAsset) {
      path = `${baseUrl}/ui/${this._ui.identifier}/${asset}`
    }

    if (typeof resolver !== 'undefined' && resolver !== null) {
      path = resolver(path)
    }

    return path
  }

  translate (key) {
    return this._ui.translate(key)
  }
}

export default Helpers
