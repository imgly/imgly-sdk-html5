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

import { ReactBEM, BaseChildComponent, ReactRedux, ActionCreators } from '../../../globals'
import ScrollbarComponent from '../../scrollbar-component'

class FiltersControlsComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onBackClick',
      '_onItemClick'
    )
    this._operation = this.context.ui.getOrCreateOperation('filters')
    this._filters = this._operation.getFilters()
  }

  /**
   * Maps the given state to properties for this component
   * @param {*} state
   * @return {Object}
   */
  static mapStateToProps (state) {
    const { operationsOptions } = state
    return {
      operationOptions: operationsOptions.filters
    }
  }

  /**
   * Gets called when the user clicks an item
   * @param {Filter} filter
   * @param {Event} e
   * @private
   */
  _onItemClick (filter, e) {
    this._operation.setFilter(filter)
    this.props.dispatch(ActionCreators.operationUpdated(this._operation))
  }

  /**
   * Gets called when the user clicks the back button
   * @param {Event} e
   * @private
   */
  _onBackClick (e) {
    this.props.onSwitchControls('back')
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const ui = this.context.ui
    const { operationOptions } = this.props
    const currentFilter = operationOptions && operationOptions.filter

    let listItems = []
    for (let identifier in this._filters) {
      const filter = this._filters[identifier]

      listItems.push(<li
        bem='e:item'
        key={identifier}
        onClick={this._onItemClick.bind(this, filter)}>
        <bem specifier='$b:controls'>
          <div
            bem='$e:button m:withInlineLabel'
            className={filter === currentFilter ? 'is-active' : null}>
            <img bem='e:icon' src={ui.getHelpers().assetPath(`controls/filters/${identifier}.png`, true)} />
            <div bem='e:label'>{filter.prototype.name}</div>
          </div>
        </bem>
      </li>)
    }

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

export default ReactRedux.connect(FiltersControlsComponent.mapStateToProps)(FiltersControlsComponent)
