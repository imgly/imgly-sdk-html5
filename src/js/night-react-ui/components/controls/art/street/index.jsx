/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import StreetControlsComponent from './street-controls-component'
import StreetCanvasControlsComponent from './street-canvas-controls-component'

export default {
  canvasControls: StreetCanvasControlsComponent,
  controls: StreetControlsComponent,
  largeCanvasControls: true,
  identifier: 'street',
  icon: 'controls/overview/filters@2x.png',
  label: 'controls.overview.filters',
  getInitialSharedState: (context) => {
    const operationExistedBefore = context.ui.operationExists('street')
    const operation = context.ui.getOrCreateOperation('street')
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
