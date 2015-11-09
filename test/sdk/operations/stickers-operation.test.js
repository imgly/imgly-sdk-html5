/* global SpecHelpers, describe, it, beforeEach */
/*
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import fs from 'fs'
import path from 'path'
import { Image } from 'canvas'

let kit, stickerImage
beforeEach(function () {
  kit = SpecHelpers.initRenderer()

  const stickerPath = path.resolve(__dirname, '../assets/sticker.png')
  const stickerImageBuffer = fs.readFileSync(stickerPath)
  stickerImage = new Image()
  stickerImage.src = stickerImageBuffer
})

describe.only('StickersOperation', function () {

  describe('#render', function () {

    it('should succeed', function () {
      const operation = kit.createOperation('stickers', {
        stickers: [
          { image: stickerImage }
        ]
      })
      kit.operationsStack.push(operation)

      return kit.render()
        .should.be.fulfilled

    })

  })

})
