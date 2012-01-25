define
  init: ->
    @options.showIfZero ?= []

  render: (_)-> [
    _ '.triangle'
    _ '.label', href: '#',
      @options.label
    if @options.disableCount is undefined
      _ '.counts',
        for type, count of @options.counts when count > 0 or type in @options.showIfZero
          _ ".#{type}.count", count
  ]