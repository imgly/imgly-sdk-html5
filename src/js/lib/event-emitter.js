/**
 * EventEmitter (ES6) from:
 * https://gist.github.com/bloodyowl/41b1de3388c626796eca
 */

const DEFAULT_MAX_LISTENERS = 12

function error (message, ...args) {
  console.error.apply(console, [message].concat(args))
  console.trace()
}

class EventEmitter {
  constructor () {
    this._maxListeners = DEFAULT_MAX_LISTENERS
    this._events = {}
    this._pipeDestinations = []
  }

  pipeEvents (destination) {
    this._pipeDestinations.push(destination)
  }

  unpipeEvents (destination) {
    const i = this._pipeDestinations.indexOf(destination)
    if (i === -1) return
    this._pipeDestinations.splice(i, 1)
  }

  on (type, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError()
    }

    let listeners = this._events[type] || (this._events[type] = [])
    if (listeners.indexOf(listener) !== -1) {
      return this
    }
    listeners.push(listener)

    if (listeners.length > this._maxListeners) {
      error(
        `possible memory leak, added %i %s listeners,
        use EventEmitter#setMaxListeners(number) if you
        want to increase the limit (%i now)`,
        listeners.length,
        type,
        this._maxListeners
      )
    }
    return this
  }

  once (type, listener) {
    let eventsInstance = this
    function onceCallback () {
      eventsInstance.off(type, onceCallback)
      listener.apply(null, arguments)
    }
    return this.on(type, onceCallback)
  }

  off (type, ...args) {
    if (args.length === 0) {
      this._events[type] = null
      return this
    }

    let listener = args[0]
    if (typeof listener !== 'function') {
      throw new TypeError()
    }

    let listeners = this._events[type]
    if (!listeners || !listeners.length) {
      return this
    }

    let indexOfListener = listeners.indexOf(listener)
    if (indexOfListener === -1) {
      return this
    }

    listeners.splice(indexOfListener, 1)
    return this
  }

  emit (type, ...args) {
    this._pipeDestinations.forEach((dest) => {
      dest.emit(type, ...args)
    })

    let listeners = this._events[type]
    if (!listeners || !listeners.length) {
      return false
    }

    listeners.forEach(fn => fn.apply(null, args))

    return true
  }

  setMaxListeners (newMaxListeners) {
    if (parseInt(newMaxListeners, 10) !== newMaxListeners) {
      throw new TypeError()
    }

    this._maxListeners = newMaxListeners
  }
}

export default EventEmitter
