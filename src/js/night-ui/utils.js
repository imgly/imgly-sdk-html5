/* global PhotoEditorSDK */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

const SDKUtils = PhotoEditorSDK.Utils

export default {
  /**
   * Translates the given key using the given options
   * @param  {Object} phrases
   * @param  {String} key
   * @param  {Object} interpolationOptions = {}
   * @return {String}
   */
  translate (phrases, key, interpolationOptions = {}) {
    let response = SDKUtils.fetch(phrases, key, key)
    for (let key in interpolationOptions) {
      response = response.replace(`\${${key}}`, interpolationOptions[key])
    }
    return response
  }
}
