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

import { ReactBEM, BaseChildComponent, Constants } from '../../../globals'
import ScrollbarComponent from '../../scrollbar-component'

const RATIOS = [
  {
    identifier: 'custom',
    ratio: '*'
  },
  {
    identifier: 'square',
    ratio: '1'
  },
  {
    identifier: '4-3',
    ratio: '1.33'
  },
  {
    identifier: '16-9',
    ratio: '1.77'
  }
]

export default class OrientationControlsComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._bindAll('_onBackClick')
    this._cropOperation = this.context.ui.getOrCreateOperation('crop')
  }

  /**
   * Gets called when this component has been mounted
   */
  componentDidMount () {
    super.componentDidMount()

    this._emitEvent(Constants.EVENTS.CANVAS_ZOOM, 'auto')
  }

  /**
   * Gets called when the user clicks the back button
   * @param {Event} e
   * @private
   */
  _onBackClick (e) {
    this.props.onSwitchControls('back')

    this._emitEvent(Constants.EVENTS.CANVAS_UNDO_ZOOM)
  }

  /**
   * Gets called when the user clicks a button
   * @param {String} ratio
   * @private
   */
  _onButtonClick (ratio) {

  }

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
          <div bem='$e:button m:withLabel'>
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
    </div>)
  }
}
