/** @jsx ReactBEM.createElement **/
/* global describe, it */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */
'use strict'

import React from 'react'
import ReactBEM from '../../src/js/ui/night-react/lib/react-bem'

class SpecComponent extends React.Component {
  constructor (content) {
    super()
    this._content = content
  }

  render () {
    return ReactBEM.transform(this._content)
  }
}
const componentFactory = React.createFactory(SpecComponent)
const render = (content) => {
  return React.renderToStaticMarkup(componentFactory(content))
}

describe('ReactBEM', () => {
  describe('<div bem="b:editor">', () => {
    it('should render a div with a proper class name', () => {
      const content = (<div bem='b:editor'></div>)
      const html = render(content)
      html.should.equal('<div class="pesdk-night-editor"></div>')
    })
  })

  describe('<div bem="b:editor e:row">', () => {
    it('should render a div with a proper class name', () => {
      const content = (<div bem='b:editor e:row'></div>)
      const html = render(content)
      html.should.equal('<div class="pesdk-night-editor pesdk-night-editor__row"></div>')
    })
  })

  describe('<div bem="b:editor e:row m:upload">', () => {
    it('should render a div with a proper class name', () => {
      const content = (<div bem='b:editor e:row m:upload'></div>)
      const html = render(content)
      html.should.equal('<div class="pesdk-night-editor pesdk-night-editor__row pesdk-night-editor__row--upload"></div>')
    })
  })

  describe('<div bem="b:editor"> with a className property', () => {
    it('should render the className as well', () => {
      const content = (<div bem='b:editor' className='is-active'></div>)
      const html = render(content)
      html.should.equal('<div class="is-active pesdk-night-editor"></div>')
    })
  })

  describe('errors', () => {
    describe('<div bem="b:editor">', () => {
      describe('with children that have an element specifier', () => {
        it('should fail with a proper message', () => {
          const content = (<div bem='b:editor'>
            <div bem='e:foo'></div>
          </div>)
          const throwable = () => {
            render(content)
          }
          throwable.should.throw('Tried to create an element, but no parent block has been found.')
        })
      })

      describe('with children that have a modifier specifier', () => {
        it('should fail with a proper message', () => {
          const content = (<div bem='b:editor'>
            <div bem='m:foo'></div>
          </div>)
          const throwable = () => {
            render(content)
          }
          throwable.should.throw('Tried to create a modifier, but no parent block has been found.')
        })
      })
    })

    describe('<bem> node without a specifier', () => {
      it('should fail with a proper message', () => {
        const content = (<bem></bem>)
        const throwable = () => {
          render(content)
        }
        throwable.should.throw('<bem> elements should always have a `specifier` property')
      })
    })
  })

  describe('passing specifiers', () => {
    describe('<div bem="$b:editor">', () => {
      describe('with a child that has an element specifier', () => {
        it('should pass the block specifier', () => {
          const content = (<div bem='$b:editor'>
            <div bem='e:foo'></div>
          </div>)
          const html = render(content)
          html.should.equal('<div class="pesdk-night-editor"><div class="pesdk-night-editor__foo"></div></div>')
        })
      })

      describe('with multiple children that have an element specifier', () => {
        it('should pass the block specifier', () => {
          const content = (<div bem='$b:editor'>
            <div bem='e:foo'></div>
            <div bem='e:bar'></div>
          </div>)
          const html = render(content)
          html.should.equal('<div class="pesdk-night-editor"><div class="pesdk-night-editor__foo"></div><div class="pesdk-night-editor__bar"></div></div>')
        })
      })

      describe('with a child that has a modifier specifier', () => {
        it('should pass the block specifier', () => {
          const content = (<div bem='$b:editor'>
            <div bem='m:foo'></div>
          </div>)
          const html = render(content)
          html.should.equal('<div class="pesdk-night-editor"><div class="pesdk-night-editor--foo"></div></div>')
        })
      })

      describe('with multiple children that have a modifier specifier', () => {
        it('should pass the block specifier', () => {
          const content = (<div bem='$b:editor'>
            <div bem='m:foo'></div>
            <div bem='m:bar'></div>
          </div>)
          const html = render(content)
          html.should.equal('<div class="pesdk-night-editor"><div class="pesdk-night-editor--foo"></div><div class="pesdk-night-editor--bar"></div></div>')
        })
      })
    })

    describe('<bem specifier="b:editor">', () => {
      describe('with a child that has an element modifier', () => {
        it('should not render the <bem> node, but pass the block specifier', () => {
          const content = (<bem specifier='$b:editor'>
            <div bem='e:foo'></div>
          </bem>)
          const html = render(content)
          html.should.equal('<div class="pesdk-night-editor__foo"></div>')
        })
      })

      describe('with multiple children that have an element modifier', () => {
        it('should not render the <bem> node, but pass the block specifier', () => {
          const content = (
            <div>
              <bem specifier='$b:editor'>
                <div bem='e:foo'></div>
                <div bem='e:bar'></div>
              </bem>
            </div>
          )
          const html = render(content)
          html.should.equal('<div><div class="pesdk-night-editor__foo"></div><div class="pesdk-night-editor__bar"></div></div>')
        })
      })
    })
  })
})
