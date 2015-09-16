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

export default (state = {}, action) => {
  const { operation } = action
  switch (action.type) {
    case 'OPERATION_UPDATED':
      state = Utils.clone(state)

      state.operationsOptions = Utils.clone(state.operationsOptions)
      state.operationsOptions[operation.constructor.identifier] =
        Utils.clone(operation.getOptions())
      break
    case 'ADD_OPERATION':
      state = Utils.clone(state)

      let operationsStack = state.operationsStack.clone()
      let index = OPERATIONS_ORDER.indexOf(operation.constructor.identifier)
      if (index === -1) {
        index = operationsStack.length
      }
      operationsStack.set(index, operation)
      state.operationsStack = operationsStack

      let operationsMap = Utils.clone(state.operationsMap)
      operationsMap[operation.constructor.identifier] = operation
      state.operationsMap = operationsMap

      state.operationsOptions[operation.constructor.identifier] =
        Utils.clone(operation.getOptions())
      break
  }
  return state
}
