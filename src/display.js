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
        render: function () {
            this.$container.html(this.template());
            return this;
        },
        template: function () {
            return _.template($(this.templateSelector).html());
        }
    };

    var backboneViewMethods = [
        'delegateEvents',
        'undelegateEvents'
    ];

    JA.Display = function (options) {
        F.demandGoodObject(options, "options");
        F.demandGoodString(options.id, "options.id");
        F.demandGoodString(options.container, "options.container");

        _.extend(this, options);
        _.defaults(this, template);

        if (!this.selector) this.selector = this.container;

        this.$container = $(this.container);
        this.render();

        this.$el = this.$();
        this.delegateEvents(this.events);
    };

    _.extend(JA.Display.prototype, {
        $: function () {
            return $(this.selector);
        },

        activate: function () {
            var self = this;

            this.beforeActivate(function() {
                self.show();
                self.afterActivate();
            });
        },

        deactivate: function () {
            var self = this;

            this.beforeDeactivate(function() {
                self.hide();
                self.afterDeactivate();
            });
        },

        hide: function () { this.$().hide(); },
        show: function () { this.$().show(); }
    });

    _.extend(JA.Display.prototype,
        _.pick(Backbone.View.prototype, backboneViewMethods)
    );

} ());
