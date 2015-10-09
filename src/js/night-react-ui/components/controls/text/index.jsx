/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import TextCanvasControlsComponent from './text-canvas-controls-component'
import TextControlsComponent from './text-controls-component'

export default {
  canvasControls: TextCanvasControlsComponent,
  controls: TextControlsComponent,
  identifier: 'text',

  /**
   * Checks if there is something at the given position that
   * would cause the UI to switch to this control on click
   * @param  {Vector2} position
   * @param  {Object} context
   * @return {*}
   */
  clickAtPosition: (position, context) => {
    if (!context.ui.operationExists('text')) return false
    const renderer = context.kit.getRenderer()
    const operation = context.ui.getOrCreateOperation('text')
    const text = operation.getTextAtPosition(renderer, position)
    if (!text) {
      return false
    } else {
      return { selectedText: text }
    }
  },

  /**
   * Returns the initial state for this control
   * @param  {Object} context
   * @return {Object}
   */
  getInitialSharedState: (context) => {
    const operationExistedBefore = context.ui.operationExists('text')
    const operation = context.ui.getOrCreateOperation('text')
    const texts = operation.getTexts()
    operation.setTexts([])

    context.kit.render()

    return {
      operationExistedBefore, operation, texts
    }
  },
  isSelectable: (ui) => {
    return ui.isOperationSelected('text')
  }
}
