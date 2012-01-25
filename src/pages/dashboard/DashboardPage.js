var __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

define(['Services', 'cell!shared/loadingindicator/LoadingIndicator', 'cell!./DashboardStory', 'cell!./statusshelf/IterationChooser', 'cell!./statusshelf/testresultsgraph/TestResultsGraph', 'cell!shared/InitialsList'], function(S, LoadingIndicator, DashboardStory, IterationChooser, TestResultsGraph, InitialsList) {
  return {
    render: function(_) {
      var rerender,
        _this = this;
      this.iterationNo = null;
      S.bus.bind({
        'auth.userLoggedIn': rerender = function() {
          return S.dashboard.getStorySummaries(_this.iterationNo, function(_arg) {
            var iterationNo, stories;
            iterationNo = _arg.iterationNo, stories = _arg.stories;
            return _this.renderStories(stories);
          });
        },
        'auth.userLoggedOut': rerender
      });
      setTimeout((function() {
        return S.auth.user(function(user) {
          return S.dashboard.getStorySummaries(null, function(_arg) {
            var iterationNo, stories;
            iterationNo = _arg.iterationNo, stories = _arg.stories;
            _this.$el.append([
              _('.myStoryDivider', _('span.leftTri'), 'STORIES'), _('.stats', _(IterationChooser, {
                iterationNo: iterationNo
              }), _(TestResultsGraph, {
                type: 'ats',
                label: 'AT',
                urlPrefix: S.getXPToolBaseUrl('xp.failingtestsbypackage.do?runID=')
              }), _(TestResultsGraph, {
                type: 'units',
                label: 'UNIT',
                urlPrefix: S.getXPToolBaseUrl('unittool.failingtestsbysuite.do?testRunID=')
              })), _('.noStories', 'No Stories')
            ]);
            return _this.renderStories(stories);
          });
        });
      }), 50);
      return [
        _(LoadingIndicator, {
          enable: true
        })
      ];
    },
    renderStories: function(stories) {
      var hasmystories, hasstories, mystories, s, user, _i, _len, _ref, _results;
      user = S.auth.getUser();
      this.$('.noStories').toggle(!(hasstories = stories && stories.length));
      this.$('.myStoryDivider').toggle(false);
      this.$('.DashboardStory').remove();
      this.$('> .LoadingIndicator').trigger('disable');
      if (hasstories) {
        mystories = (function() {
          var _i, _len, _results;
          if (user != null) {
            _results = [];
            for (_i = 0, _len = stories.length; _i < _len; _i++) {
              s = stories[_i];
              if (!((s.owners != null) && user.initials === s.owners)) continue;
              this.$el.append((new DashboardStory({
                model: s
              })).$el);
              _results.push(s.name);
            }
            return _results;
          } else {
            return [];
          }
        }).call(this);
        if (hasmystories = mystories.length > 0) {
          this.$('.myStoryDivider .InitialsList').remove();
          this.$('.myStoryDivider > .leftTri').after(new InitialsList({
            initials: user && [user.initials] || []
          }).el);
          this.$el.append(this.$('.myStoryDivider'));
          this.$('.myStoryDivider').toggle(true);
        }
        _results = [];
        for (_i = 0, _len = stories.length; _i < _len; _i++) {
          s = stories[_i];
          if (_ref = s.name, __indexOf.call(mystories, _ref) < 0) {
            _results.push(this.$el.append((new DashboardStory({
              model: s
            })).$el));
          }
        }
        return _results;
      }
    },
    on: {
      'selected .DashboardStory': function(_arg) {
        var target;
        target = _arg.target;
        return this.$('.DashboardStory.selected').trigger('deselected');
      },
      'iterationNoChanged .IterationChooser': function(_arg) {
        var newIterationNo,
          _this = this;
        newIterationNo = _arg.newIterationNo;
        this.iterationNo = newIterationNo;
        this.$('.DashboardStory').remove();
        this.$('.noStories').toggle(false);
        this.$('> .LoadingIndicator').trigger('enable');
        return S.dashboard.getStorySummaries(this.iterationNo, function(_arg2) {
          var stories;
          stories = _arg2.stories;
          _this.$('> .LoadingIndicator').trigger('disable');
          return _this.renderStories(stories);
        });
      }
    }
  };
});
