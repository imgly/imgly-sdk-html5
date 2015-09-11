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

const Utils = PhotoEditorSDK.Utils

const OPERATIONS_ORDER = [
  // First, all operations that affect the image dimensions
  'rotation',
  'crop',
  'flip',

  // Then color operations (first filters, then fine-tuning)
  'filters',
  'contrast',
  'brightness',
  'saturation',

  // Then post-processing
  'radial-blur',
  'tilt-shift',
  'frames',
  'stickers',
  'text'
]

export default (store = {}, action) => {
  switch (action.type) {
    case 'ADD_OPERATION':
      const { operation } = action
      store = Utils.clone(store)

      let operationsStack = store.operationsStack.slice(0)
      let index = OPERATIONS_ORDER.indexOf(operation.constructor.identifier)
      if (index === -1) {
        index = operationsStack.length
      }
      operationsStack[index] = operation
      store.operationsStack = operationsStack

      let operationsMap = Utils.clone(store.operationsMap)
      operationsMap[operation.constructor.identifier] = operation
      store.operationsMap = operationsMap
      break
  }
  return store
}
