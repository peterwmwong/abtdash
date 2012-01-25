define [
  'require'
  'Services'
  'cell!./LabeledCounts'
  'cell!shared/loadingindicator/LoadingIndicator'
  'cell!shared/InitialsList'
], (require,S,LabeledCounts,LoadingIndicator,InitialsList)->

  statusToColor = ['red','yellow','green']

  mockCountries = ["SG","RU","CN","VT"]
  stages = [
    "Initiation"
    "Installation"
    "Docs/Recs/Design"
    "Testing"
    "Launch"
    "Post Launch"
  ]


  render: (_)-> [
    _ '.header',

      _ '.collapseStory',
        _ '.triangle'
        _ '.rect'

      _ ".storyID.#{statusToColor[@model.status]}", @model.storynum

      _ '.nameContainer',
        _ 'a.name', href:"#",
          @model.name

      _ LabeledCounts,
        class: 'code'
        label: stages[Math.floor(Math.random()*stages.length)] + " : CMS Setup" 
        showIfZero: ['green']
        counts: do=>
          {completePct, notStarted, inProgress, completed} = @model.codeTasks
          completePct = [completePct, (_ 'span.codeCompletePct', '%')]
          if notStarted
            red: completePct
          else if inProgress
            yellow: completePct
          else
            green: completePct
        

      _ InitialsList, initials: [@model.owners]
        
      # _ LabeledCounts,
      #   class: 'tests'
      #   label: "TESTS"
      #   showIfZero: ['notests']
      #   counts: do=>
      #     {failing,needsAttn,unwritten,total} = @model.ats
      #     if failing + needsAttn + unwritten
      #       red: failing
      #       needsAttn: needsAttn
      #       yellow: unwritten
      #     else if total is 0
      #       notests: 0
      #     else
      #       green: total

      # _ LabeledCounts,
      #   class: 'tasks'
      #   label: "TASKS"
      #   showIfZero: ['green']
      #   counts: do=>
      #     {needsAttn,retest,completed} = @model.tasks
      #     if needsAttn + retest
      #       red: needsAttn
      #       yellow: retest
      #     else
      #       green: completed

      # _ '.chumps',
      #   _ InitialsList, initials: [@model.devs..., @model.testers...]
      
    _ '.details',
      _ LoadingIndicator
      _ '.contents'
  ]

  onSectionLoaded: onSectionLoaded = ->
      @$('.LoadingIndicator').trigger 'disable'
      @$('.details').height "#{@$('.detail.selected').outerHeight()}px"

  on: do->
    selectSection = (detailCellPath)->
      detailName = detailCellPath.split('/').slice -1
      (ev)->
        @$('.LabeledCounts.selected').toggleClass 'selected', false

        if not (@$el.hasClass 'selected')
          @$el.trigger 'selected'
          @$el.toggleClass 'selected', true

        # Collapse if already expanded
        if detailName == @options.expandedSection
          collapseStory.call this

        # Expand another section
        else
          @options.expandedSection = detailName
          @$('.countCol > .selected')
            .toggleClass 'selected', false

          # hide current details
          @$('.detail.selected')
            .toggleClass('selected', false)
          
          @$('.LoadingIndicator').trigger 'enable'
          
          require ["cell!#{detailCellPath}"], (detail)=>
            # Load new details for the first time
            if not ($detail = @$(".#{detail::name}"))[0]
              detailCell = new detail
                class:'detail selected'
                storynum: @model.storynum

              @$('.details > .contents')
                .prepend detailCell.el

              @onSectionLoaded() if detailCell.loaded

            # Show already loaded details
            else
              $detail.prependTo $detail.parent()
              setTimeout =>
                @$('.LoadingIndicator').trigger 'disable'
                $detail.toggleClass 'selected', true
                @$('.details').height "#{$detail.outerHeight()}px"
              , 0

    'click .nameContainer > a.name': selectSection './code/CodeSection' 
    'loaded .details > .contents > .detail.selected': onSectionLoaded
    'click .header > .tests': selectSection './tests/TestsSection'
    'click .header > .tasks': selectSection './tasks/TasksSection'
    'click .header > .code': selectSection './code/CodeSection'
    'click .collapseStory': collapseStory = ->
      @$('.LabeledCounts.selected, .detail.selected').toggleClass 'selected', false
      @$el.toggleClass 'selected', false
      @$('.details').height '0px'
      @options.expandedSection = undefined

    'deselected': collapseStory

