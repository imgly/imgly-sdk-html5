/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import TiltShiftControlsComponent from './tilt-shift-controls-component'

export default {
  canvasControls: null,
  controls: TiltShiftControlsComponent,
  identifier: 'tilt-shift',
  isSelectable: (ui) => {
    return ui.isOperationSelected('tilt-shift')
  }
}
