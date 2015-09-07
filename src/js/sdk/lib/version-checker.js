/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

const VERSION_CHECK_FN = 'imglySDKVersionCallback'
const VERSION_CHECK_URL = `https://www.photoeditorsdk.com/version.json?sdk=html5&jsoncallback=${VERSION_CHECK_FN}`

export default class VersionChecker {
  constructor (version) {
    this._version = version
    this._check()
  }

  /**
   * Checks if this version of the SDK is outdated
   * @private
   */
  _check () {
    let self = this
    window[VERSION_CHECK_FN] = (response) => {
      if (response.outdated) {
        console.warn(`imgly-sdk-html5: Your version ${self._version} is outdated.`)
        console.warn(`imgly-sdk-html5: Current version is ${response.version}.`)
      }
    }

    let script = document.createElement('script')
    script.src = VERSION_CHECK_URL + '&version=' + this._version
    script.async = true
    document.getElementsByTagName('head')[0].appendChild(script)
  }
}
