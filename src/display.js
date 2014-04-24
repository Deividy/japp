var displayTemplate = {
    afterDeactivate: function () { },
    beforeDeactivate: function (next) { next(); },
    afterActivate: function () { },
    beforeActivate: function (next) { next(); },
    
    render: function () {
        this.$container.html(this.template.apply(this, arguments));
        return this;
    },

    template: function () {
        return _.template($(this.templateSelector).html());
    }
};

JA.Display = function (options) {
    F.demandGoodObject(options, "options");
    F.demandGoodString(options.id, "options.id");
    F.demandGoodString(options.container, "options.container");

    JA.extendAndApplyDefaults(this, options, displayTemplate);

    if (!this.selector) this.selector = this.container;

    this.$container = $(this.container);
    this.render();

    this.$el = this.$();
    this.delegateEvents(this.events);
};

JA.inherit(JA.Display, Backbone.View);

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
