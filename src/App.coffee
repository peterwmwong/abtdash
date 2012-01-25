define [
  'require'
  'cell!shared/page/Page'
  'cell!pages/dashboard/DashboardPage'
  'cell!Bar'
], (require,Page,DashboardPage,Bar)->

  pages =
    Dashboard:
      cell: DashboardPage

  init: ->
    @options.selectedPage ?= 'Dashboard'

  render: (_)->
    if $.browser.msie
      require ['cell!./IEGTFO'], (IEGTFO)=>
        @$el
          .html('')
          .append(_ IEGTFO)
    else [
      _ Bar, selectedItem:@options.selectedPage, items:(p for p of pages)
      _ '#content',
        @getPage @options.selectedPage
    ]

  on:
    'selectedItemChanged :parent > .Bar': (e,{item})->
      @$('> #content')
        .html('')
        .append @getPage item

  getPage: (page)->
    if p = pages[page]
      (new p.cell p.options).el

