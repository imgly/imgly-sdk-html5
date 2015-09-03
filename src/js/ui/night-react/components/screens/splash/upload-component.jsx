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

import { BaseChildComponent, ReactBEM } from '../../../globals'
import ButtonComponent from '../../button-component'

export default class UploadComponent extends BaseChildComponent {
  constructor () {
    super()
    this._bindAll('_onClick')
  }

  _onClick (e) {

  }

  renderWithBEM () {
    return (<bem specifier='b:splashScreen'>
      <div bem='e:row m:withContent m:upload'>
        <div bem='$e:cell m:upload'>
          <bem specifier='m:upload'>
            <div bem='e:or'>{this._t('splash.or')}</div>
          </bem>
          <img bem='e:image'
            src={this._getAssetPath('splash/add-photo@2x.png', true)} />
          <ButtonComponent bem='e:button'
            onClick={this._onClick}>
              {this._t('splash.upload.button')}
          </ButtonComponent>
          <div bem='e:description'>
            {this._t('splash.upload.description')}
          </div>
        </div>
      </div>
    </bem>)
  }
}
