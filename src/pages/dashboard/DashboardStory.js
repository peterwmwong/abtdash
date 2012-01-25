
define(['require', 'Services', 'cell!./LabeledCounts', 'cell!shared/loadingindicator/LoadingIndicator', 'cell!shared/InitialsList'], function(require, S, LabeledCounts, LoadingIndicator, InitialsList) {
  var mockCountries, onSectionLoaded, stages, statusToColor;
  statusToColor = ['red', 'yellow', 'green'];
  mockCountries = ["SG", "RU", "CN", "VT"];
  stages = ["Initiation", "Installation", "Docs/Recs/Design", "Testing", "Launch", "Post Launch"];
  return {
    render: function(_) {
      var _this = this;
      return [
        _('.header', _('.collapseStory', _('.triangle'), _('.rect')), _(".storyID." + statusToColor[this.model.status], this.model.storynum), _('.nameContainer', _('a.name', {
          href: "#"
        }, this.model.name)), _(LabeledCounts, {
          "class": 'code',
          label: stages[Math.floor(Math.random() * stages.length)] + " : CMS Setup",
          showIfZero: ['green'],
          counts: (function() {
            var completePct, completed, inProgress, notStarted, _ref;
            _ref = _this.model.codeTasks, completePct = _ref.completePct, notStarted = _ref.notStarted, inProgress = _ref.inProgress, completed = _ref.completed;
            completePct = [completePct, _('span.codeCompletePct', '%')];
            if (notStarted) {
              return {
                red: completePct
              };
            } else if (inProgress) {
              return {
                yellow: completePct
              };
            } else {
              return {
                green: completePct
              };
            }
          })()
        }), _(InitialsList, {
          initials: [this.model.owners]
        })), _('.details', _(LoadingIndicator), _('.contents'))
      ];
    },
    onSectionLoaded: onSectionLoaded = function() {
      this.$('.LoadingIndicator').trigger('disable');
      return this.$('.details').height("" + (this.$('.detail.selected').outerHeight()) + "px");
    },
    on: (function() {
      var collapseStory, selectSection;
      selectSection = function(detailCellPath) {
        var detailName;
        detailName = detailCellPath.split('/').slice(-1);
        return function(ev) {
          var _this = this;
          this.$('.LabeledCounts.selected').toggleClass('selected', false);
          if (!(this.$el.hasClass('selected'))) {
            this.$el.trigger('selected');
            this.$el.toggleClass('selected', true);
          }
          if (detailName === this.options.expandedSection) {
            return collapseStory.call(this);
          } else {
            this.options.expandedSection = detailName;
            this.$('.countCol > .selected').toggleClass('selected', false);
            this.$('.detail.selected').toggleClass('selected', false);
            this.$('.LoadingIndicator').trigger('enable');
            return require(["cell!" + detailCellPath], function(detail) {
              var $detail, detailCell;
              if (!($detail = _this.$("." + detail.prototype.name))[0]) {
                detailCell = new detail({
                  "class": 'detail selected',
                  storynum: _this.model.storynum
                });
                _this.$('.details > .contents').prepend(detailCell.el);
                if (detailCell.loaded) return _this.onSectionLoaded();
              } else {
                $detail.prependTo($detail.parent());
                return setTimeout(function() {
                  _this.$('.LoadingIndicator').trigger('disable');
                  $detail.toggleClass('selected', true);
                  return _this.$('.details').height("" + ($detail.outerHeight()) + "px");
                }, 0);
              }
            });
          }
        };
      };
      return {
        'click .nameContainer > a.name': selectSection('./code/CodeSection'),
        'loaded .details > .contents > .detail.selected': onSectionLoaded,
        'click .header > .tests': selectSection('./tests/TestsSection'),
        'click .header > .tasks': selectSection('./tasks/TasksSection'),
        'click .header > .code': selectSection('./code/CodeSection'),
        'click .collapseStory': collapseStory = function() {
          this.$('.LabeledCounts.selected, .detail.selected').toggleClass('selected', false);
          this.$el.toggleClass('selected', false);
          this.$('.details').height('0px');
          return this.options.expandedSection = void 0;
        },
        'deselected': collapseStory
      };
    })()
  };
});
