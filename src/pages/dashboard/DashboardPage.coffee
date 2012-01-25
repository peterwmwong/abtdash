define [
  'Services'
  'cell!shared/loadingindicator/LoadingIndicator'
  'cell!./DashboardStory'
  'cell!./statusshelf/IterationChooser'
  'cell!./statusshelf/testresultsgraph/TestResultsGraph'
  'cell!shared/InitialsList'
], (S,LoadingIndicator,DashboardStory,IterationChooser,TestResultsGraph,InitialsList)->

  render: (_)->
    @iterationNo = null

    S.bus.bind
      'auth.userLoggedIn': rerender = =>
        S.dashboard.getStorySummaries @iterationNo,
          ({iterationNo,stories})=> @renderStories stories
      'auth.userLoggedOut': rerender

    setTimeout (=>
      S.auth.user (user)=>
        S.dashboard.getStorySummaries null, ({iterationNo,stories})=>
          @$el.append [
            _ '.myStoryDivider',
              _ 'span.leftTri'
              'STORIES'
            _ '.stats',
              _ IterationChooser, iterationNo:iterationNo
              _ TestResultsGraph,
                  type: 'ats'
                  label: 'AT'
                  urlPrefix: S.getXPToolBaseUrl 'xp.failingtestsbypackage.do?runID='
              _ TestResultsGraph,
                  type: 'units'
                  label: 'UNIT'
                  urlPrefix: S.getXPToolBaseUrl 'unittool.failingtestsbysuite.do?testRunID='
            _ '.noStories', 'No Stories'
          ]
          @renderStories stories
    ), 50

    [_ LoadingIndicator, enable: true]
    
  renderStories: (stories)->
    user = S.auth.getUser()

    @$('.noStories').toggle not (hasstories = stories and stories.length)
    @$('.myStoryDivider').toggle false
    @$('.DashboardStory').remove()
    @$('> .LoadingIndicator').trigger 'disable'

    # Any stories to render?
    if hasstories

      # Render the rest of the stories
      mystories =
        if user?
          for s in stories when (s.owners? and user.initials is s.owners)
            @$el.append (new DashboardStory model: s).$el
            s.name
        else []

      if hasmystories = (mystories.length > 0)
        @$('.myStoryDivider .InitialsList').remove()
        @$('.myStoryDivider > .leftTri')
          .after new InitialsList(initials:user and [user.initials] or []).el
        @$el.append @$('.myStoryDivider')
        @$('.myStoryDivider').toggle true

      # Render the rest of the stories
      for s in stories when s.name not in mystories
        @$el.append (new DashboardStory model: s).$el


  on:
    # When a Dashboard Story is selected
    'selected .DashboardStory': ({target})->
      @$('.DashboardStory.selected').trigger 'deselected'

    # When a new Interation is chosen
    'iterationNoChanged .IterationChooser': ({newIterationNo})->
      @iterationNo = newIterationNo
      @$('.DashboardStory').remove()
      @$('.noStories').toggle false
      @$('> .LoadingIndicator').trigger 'enable'

      # Fetch Stories for newly selected iteration
      S.dashboard.getStorySummaries @iterationNo, ({stories})=>
        @$('> .LoadingIndicator').trigger 'disable'
        @renderStories stories
