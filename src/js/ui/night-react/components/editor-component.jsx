/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { React, BEM } from '../globals'

const c = BEM.elementClass('editor')

export default class EditorComponent extends React.Component {
  render () {
    const className = c()
    return (<div className={className}></div>)
  }
}
