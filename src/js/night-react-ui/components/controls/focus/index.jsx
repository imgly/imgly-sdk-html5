/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import FocusControlsComponent from './focus-controls-component'

export default {
  canvasControls: null,
  controls: FocusControlsComponent,
  identifier: 'focus',
  icon: 'controls/overview/focus@2x.png',
  label: 'controls.overview.focus',
  isSelectable: (ui) => {
    return ui.isOperationSelected('radial-blur') ||
      ui.isOperationSelected('tilt-shift')
  }
}
