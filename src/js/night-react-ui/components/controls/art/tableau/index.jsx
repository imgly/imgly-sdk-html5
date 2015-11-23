/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import TableauControlsComponent from './tableau-controls-component'
import TableauCanvasControlsComponent from './tableau-canvas-controls-component'

export default {
  canvasControls: TableauCanvasControlsComponent,
  controls: TableauControlsComponent,
  largeCanvasControls: true,
  identifier: 'tableau',
  icon: 'controls/overview/filters@2x.png',
  label: 'controls.overview.filters',
  getInitialSharedState: (context) => {
    const operationExistedBefore = context.ui.operationExists('tableau')
    const operation = context.ui.getOrCreateOperation('tableau')
    const initialOptions = {
      filter: operation.getFilter(),
      intensity: operation.getIntensity()
    }
    return {
      operationExistedBefore,
      operation,
      initialOptions
    }
  },
  isSelectable: (ui) => {
    return true // return ui.isOperationSelected('filters')
  }
}
