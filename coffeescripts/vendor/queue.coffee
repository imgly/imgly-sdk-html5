###
  Common interface for promises.

  Use jQuery's Deferreds when in browser environment,
  otherwise assume node environment and load kriskowal's q.
###

provider = if typeof window isnt "undefined"
  window.jQuery
else
  require "q"

###
  Creates a thenable value from the given value.

  @param value
  @returns {Promise}
###
Queue = -> provider.when arguments...

###
  Creates a new promise.

  Calls the resolver which takes as arguments three functions `resolve`,
  `reject` and `progress`.

  @param {function} resolver
  @returns {Promise}
###
Queue.promise = do ->
  if typeof window isnt "undefined"
    (resolver) ->
      d = provider.Deferred()
      resolver d.resolve, d.reject, d.progress
      d
  else
    -> provider.promise arguments ...

module.exports = Queue
