/** @jsx ReactBEM.createElement **/
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { ReactBEM, BaseComponent, Constants, Vector2 } from '../../../globals'
import ScrollbarComponent from '../../scrollbar-component'
import BackButtonComponent from '../../back-button-component'

// Specifies the default distance to the border
// when selecting a ratio
const PADDING = 0.1

export default class OrientationControlsComponent extends BaseComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onBackClick',
      '_onDoneClick',
      '_selectRatio'
    )

    this._operation = this.getSharedState('operation')

    this.state = { ratio: null }
    this._initRatios()
  }

  // -------------------------------------------------------------------------- INITIALIZATION

  /**
   * Initializes the available ratios
   * @private
   */
  _initRatios () {
    const additionalRatios = this.props.options.ratios || []
    const replaceRatios = !!this.props.options.replaceRatios
    this._ratios = [
      { identifier: 'custom', ratio: '*', selected: true },
      { identifier: 'square', ratio: 1 },
      { identifier: '4-3', ratio: 1.33 },
      { identifier: '16-9', ratio: 1.77 }
    ]

    if (replaceRatios) {
      this._ratios = additionalRatios
    } else {
      this._ratios = this._ratios.concat(additionalRatios)
    }
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called when this component has been mounted
   */
  componentDidMount () {
    super.componentDidMount()

    this.setSharedState({
      start: this._operation.getStart().clone(),
      end: this._operation.getEnd().clone()
    }, false)

    // Make sure we see the whole image
    this._operation.set({
      start: new Vector2(0, 0),
      end: new Vector2(1, 1)
    })

    // Reset zoom to fit the container
    this._emitEvent(Constants.EVENTS.CANVAS_ZOOM, 'auto', () => {
      // Disable zoom and drag while we're cropping
      this._emitEvent(Constants.EVENTS.EDITOR_DISABLE_FEATURES, ['zoom', 'drag'])

      if (!this.getSharedState('operationExistedBefore')) {
        // Select first ratio as default (for now)
        this._selectInitialRatio()
      } else {
        // Canvas has been rendered, dimensions might have changed. Make sure
        // that the canvas controls are rendered again (to match the new dimensions)
        this.props.sharedState.broadcastUpdate()
      }
    })
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user clicks the back button
   * @param {Event} e
   * @private
   */
  _onBackClick (e) {
    this.props.onSwitchControls('back')

    if (this.getSharedState('operationExistedBefore')) {
      this._operation.set(this._initialOptions)
    } else {
      const { ui } = this.context
      ui.removeOperation(this._operation)
    }

    this._emitEvent(Constants.EVENTS.CANVAS_UNDO_ZOOM)
    this._emitEvent(Constants.EVENTS.EDITOR_ENABLE_FEATURES, ['zoom', 'drag'])
  }

  /**
   * Gets called when the user clicks the done button
   * @param {Event} e
   * @private
   */
  _onDoneClick (e) {
    const newOptions = {
      start: this.getSharedState('start'),
      end: this.getSharedState('end')
    }
    const initialOptions = this.getSharedState('initialOptions')

    const optionsChanged = (!newOptions.start.equals(initialOptions.start) ||
      !newOptions.end.equals(initialOptions.end))

    // Update operation options
    this._operation.set(newOptions)

    if (optionsChanged) {
      const { editor } = this.props
      editor.addHistory(this._operation,
        this.getSharedState('initialOptions'),
        this.getSharedState('operationExistedBefore'))
    }

    // Enable zoom and drag again
    this._emitEvent(Constants.EVENTS.EDITOR_ENABLE_FEATURES, ['zoom', 'drag'])

    // Zoom to auto again
    this._emitEvent(Constants.EVENTS.CANVAS_ZOOM, 'auto')

    this.context.kit.reset()

    // Switch back to overview controls
    this.props.onSwitchControls('back')
  }

  // -------------------------------------------------------------------------- RATIO HANDLING

  /**
   * Selects the *last* ratio that has `selected` set to true
   * @private
   */
  _selectInitialRatio () {
    const selectedRatios = this._ratios.filter((ratio) => ratio.selected)
    let lastSelectedRatio = selectedRatios.pop()
    if (!lastSelectedRatio) {
      lastSelectedRatio = this._ratios[0]
    }
    return this._selectRatio(lastSelectedRatio)
  }

  /**
   * Selects the given ratio
   * @param {String} ratio
   * @private
   */
  _selectRatio (ratio) {
    this._setDefaultOptionsForRatio(ratio)
    this._operation.setRatio(ratio.ratio)
    this.setSharedState({ ratio })
  }

  /**
   * Sets the default options (start / end) for the given ratio
   * @param {Object} ratio
   * @private
   */
  _setDefaultOptionsForRatio ({ ratio, identifier }) {
    let start = new Vector2()
    let end = new Vector2()

    if (ratio === '*') {
      start = new Vector2(PADDING, PADDING)
      end = new Vector2(1, 1).subtract(PADDING)
    } else {
      const canvasDimensions = this.props.editor.getCanvasDimensions()
      const canvasRatio = canvasDimensions.x / canvasDimensions.y
      if (canvasRatio <= ratio) {
        const height = 1 / canvasDimensions.y * (canvasDimensions.x / ratio * (1.0 - PADDING * 2))
        start.set(PADDING, (1.0 - height) / 2)
        end.set(1.0 - PADDING, 1 - start.y)
      } else {
        const width = 1 / canvasDimensions.x * (ratio * canvasDimensions.y * (1.0 - PADDING * 2))
        start.set((1 - width) / 2, PADDING)
        end.set(1 - start.x, 1.0 - PADDING)
      }
    }

    this.setSharedState({ start, end })
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const ui = this.context.ui

    const listItems = this._ratios.map((ratio) => {
      return (<li
        bem='e:item'
        key={ratio.identifier}>
        <bem specifier='$b:controls'>
          <div bem='$e:button m:withLabel'
            className={this.state.ratio === ratio ? 'is-active' : null}
            onClick={this._selectRatio.bind(this, ratio)}>
              <img bem='e:icon' src={ui.getHelpers().assetPath(`controls/crop/${ratio.identifier}@2x.png`, true)} />
              <div bem='e:label'>{this._t(`controls.crop.${ratio.identifier}`)}</div>
          </div>
        </bem>
      </li>)
    })

    return (<div bem='$b:controls e:table'>
      <BackButtonComponent onClick={this._onBackClick} />
      <div bem='e:cell m:list'>
        <ScrollbarComponent>
          <ul bem='$e:list'>
            {listItems}
          </ul>
        </ScrollbarComponent>
      </div>
      <div bem='e:cell m:button m:withBorderLeft m:narrow'>
        <div bem='$e:button m:narrow' onClick={this._onDoneClick}>
          <img bem='e:icon' src={ui.getHelpers().assetPath(`controls/tick@2x.png`, true)} />
        </div>
      </div>
    </div>)
  }
}
