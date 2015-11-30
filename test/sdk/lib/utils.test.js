/* global PhotoEditorSDK, describe, it, beforeEach */
/*
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

const { Utils } = PhotoEditorSDK

describe('Utils', function () {
  describe('#isArray', function () {
    it('should return true for arrays', function () {
      Utils.isArray([]).should.equal(true)
    })

    it('should return false for everything else', function () {
      Utils.isArray({}).should.equal(false)
    })
  })

  describe('#select', function () {
    var items
    beforeEach(function () {
      items = ['a', 'b', 'c', 'd']
    })

    describe('when no selector is passed', function () {
      it('should return the same array', function () {
        var selectedItems = Utils.select(items)
        selectedItems.should.equal(items)
      })
    })

    describe('when an array is passed as a selector', function () {
      it('should only return the passed items', function () {
        var selectedItems = Utils.select(items, ['a', 'b'])
        selectedItems.should.have.length(2)
        selectedItems[0].should.equal('a')
        selectedItems[1].should.equal('b')
      })
    })

    describe('when a comma-separated string is passed as a selector', function () {
      it('should only return the passed items', function () {
        var selectedItems = Utils.select(items, 'a, b')
        selectedItems.should.have.length(2)
        selectedItems[0].should.equal('a')
        selectedItems[1].should.equal('b')
      })
    })

    describe('when an object with an `only` property (string) is passed as a selector', function () {
      it('should only return the passed items', function () {
        var selectedItems = Utils.select(items, { only: 'a, b' })
        selectedItems.should.have.length(2)
        selectedItems[0].should.equal('a')
        selectedItems[1].should.equal('b')
      })
    })

    describe('when an object with an `except` property (string) is passed as a selector', function () {
      it('should return all but the passed items', function () {
        var selectedItems = Utils.select(items, { except: 'a, b' })
        selectedItems.should.have.length(2)
        selectedItems[0].should.equal('c')
        selectedItems[1].should.equal('d')
      })
    })

    describe('when an object with an `only` property (array) is passed as a selector', function () {
      it('should only return the passed items', function () {
        var selectedItems = Utils.select(items, { only: ['a', 'b'] })
        selectedItems.should.have.length(2)
        selectedItems[0].should.equal('a')
        selectedItems[1].should.equal('b')
      })
    })

    describe('when an object with an `except` property (array) is passed as a selector', function () {
      it('should return all but the passed items', function () {
        var selectedItems = Utils.select(items, { except: ['a', 'b'] })
        selectedItems.should.have.length(2)
        selectedItems[0].should.equal('c')
        selectedItems[1].should.equal('d')
      })
    })

    describe('when an object without an `only` or `except` property is passed as a selector', function () {
      it('should throw', function () {
        var throwable = function () {
          Utils.select(items, {})
        }
        throwable.should.throw()
      })
    })
  })
})
