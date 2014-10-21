(function () {
    var template = {
        afterDeactivate: function () { },
        beforeDeactivate: function (next) {
            next();
        },
        afterActivate: function () { },
        beforeActivate: function (next) {
            next();
        },
        events: { },
        constructor: function () { }
    };

    var backboneViewMethods = [
        'setElement',
        'remove',
        'delegateEvents',
        'undelegateEvents'
    ];

    JA.Display = function (options) {
        ArgumentValidator.keysWithString(options, [ "id", "container" ], "options");

        _.extend(this, options);
        _.defaults(this, template);

        if (!this.selector) this.selector = this.container;

        this.isActive = false;

        for (var eventString in this.events) {
            var s = eventString.split(">");

            var events = s[0];
            var selector = s[1];

            var handler = _.bind(this.events[eventString], this);
            this.$().on(events.trim(), selector.trim(), handler);
        }

        var context = this;
        $(document).ready(function () {
            options.constructor.call(context);
        })

    };

    _.extend(JA.Display.prototype, {
        $: function () { return $(this.selector); },
        $hide: function () { this.$().hide(); },
        $show: function () { this.$().show(); },

        activate: function () {
            var self = this;

            this.beforeActivate(function() {
                self.isActive = true;

                self.$show();
                self.afterActivate();
            });
        },

        deactivate: function () {
            var self = this;

            this.beforeDeactivate(function() {
                self.isActive = false;

                self.$hide();
                self.afterDeactivate();
            });
        },

        toggle: function () {
            return this.isActive ? this.deactivate() : this.activate();
        }
    });

    _.extend(JA.Display.prototype,
        _.pick(Backbone.View.prototype, backboneViewMethods)
    );

} ());
