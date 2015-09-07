/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

let root = typeof global !== 'undefined' ? global : (typeof window !== 'undefined' ? window : null)
let p = root.Promise

if (!p) {
  p = require('./native-promise-only')
}

export default p
