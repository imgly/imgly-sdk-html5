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

import { ReactBEM, BaseChildComponent, Constants, Vector2 } from '../../../globals'
import ScrollbarComponent from '../../scrollbar-component'

// Specifies the default distance to the border
// when selecting a ratio
const PADDING = 0.1
const RATIOS = [
  {
    identifier: 'custom',
    ratio: '*'
  },
  {
    identifier: 'square',
    ratio: 1
  },
  {
    identifier: '4-3',
    ratio: 1.33
  },
  {
    identifier: '16-9',
    ratio: 1.77
  }
]

export default class OrientationControlsComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onBackClick',
      '_onDoneClick',
      '_selectRatio'
    )

    this._operation = this.getSharedState('operation')

    this.state = { ratio: null }
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
    })

    // Make sure we see the whole image
    this._operation.set({
      start: new Vector2(0, 0),
      end: new Vector2(1, 1)
    })

    this._emitEvent(Constants.EVENTS.CANVAS_ZOOM, 'auto', () => {
      this._emitEvent(Constants.EVENTS.EDITOR_DISABLE_FEATURES, ['zoom', 'drag'])
      this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
      if (!this.getSharedState('operationExistedBefore')) {
        this._selectRatio(RATIOS[0])
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

    this._emitEvent(Constants.EVENTS.CANVAS_UNDO_ZOOM)
    this._emitEvent(Constants.EVENTS.EDITOR_ENABLE_FEATURES, ['zoom', 'drag'])
  }

  /**
   * Gets called when the user clicks the done button
   * @param {Event} e
   * @private
   */
  _onDoneClick (e) {
    this.props.onSwitchControls('back')
    this._operation.set({
      start: this.getSharedState('start'),
      end: this.getSharedState('end')
    })
    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
  }

  // -------------------------------------------------------------------------- RATIO HANDLING

  /**
   * Selects the given ratio
   * @param {String} ratio
   * @private
   */
  _selectRatio (ratio) {
    this._setDefaultOptionsForRatio(ratio)
    this.setState({ ratio })
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

    const listItems = RATIOS.map((ratio) => {
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
      <div bem='e:cell m:button m:withBorderRight'>
        <div bem='$e:button' onClick={this._onBackClick}>
          <img bem='e:icon' src={ui.getHelpers().assetPath(`controls/back@2x.png`, true)} />
        </div>
      </div>
      <div bem='e:cell m:list'>
        <ScrollbarComponent>
          <ul bem='$e:list'>
            {listItems}
          </ul>
        </ScrollbarComponent>
      </div>
      <div bem='e:cell m:button m:withBorderLeft'>
        <div bem='$e:button' onClick={this._onDoneClick}>
          <img bem='e:icon' src={ui.getHelpers().assetPath(`controls/tick@2x.png`, true)} />
        </div>
      </div>
    </div>)
  }
}
