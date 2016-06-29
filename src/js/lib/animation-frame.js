/*!
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 * http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 * requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
 * MIT license
 */
const root = typeof window === 'undefined' ? global : window
let rAF = root.requestAnimationFrame
let cAF = root.cancelAnimationFrame

let lastTime = 0
const vendors = ['ms', 'moz', 'webkit', 'o']
for (let x = 0; x < vendors.length && !rAF; ++x) {
  rAF = root[vendors[x] + 'RequestAnimationFrame']
  cAF = root[vendors[x] + 'CancelAnimationFrame'] || root[vendors[x] + 'CancelRequestAnimationFrame']
}

if (!rAF) {
  rAF = function (callback, element) {
    const currTime = new Date().getTime()
    const timeToCall = Math.max(0, 16 - (currTime - lastTime))
    const id = setTimeout(function () { callback(currTime + timeToCall) }, timeToCall)
    lastTime = currTime + timeToCall
    return id
  }
}

if (!cAF) {
  cAF = function (id) {
    clearTimeout(id)
  }
}

export {
  rAF as requestAnimationFrame,
  cAF as cancelAnimationFrame
}
