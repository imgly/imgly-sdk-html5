/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

export default class Helpers {
  constructor (renderer, options) {
    this._renderer = renderer
    this._options = options
  }

  assetPath (asset, uiAsset = false) {
    const { baseUrl, resolver } = this._options.assets

    let path = `${baseUrl}/${asset}`
    if (uiAsset) {
      path = `${baseUrl}/ui/night-react/${asset}`
    }

    if (typeof resolver !== 'undefined' && resolver !== null) {
      path = resolver(path)
    }

    return path
  }
}
