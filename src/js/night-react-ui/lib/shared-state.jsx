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

const EventEmitter = PhotoEditorSDK.EventEmitter
const SDKUtils = PhotoEditorSDK.Utils

export default class SharedState extends EventEmitter {
  constructor (state = {}) {
    super()
    this._state = state
  }

  set (newState, update = true) {
    this._state = SDKUtils.extend(this._state, newState)
    if (update) {
      this.broadcastUpdate()
    }
  }

  get (key) {
    return this._state[key]
  }

  broadcastUpdate () {
    this.emit('update')
  }
}
