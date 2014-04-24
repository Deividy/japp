var allowedOptions = [ "errorHandler", "routes" ];

var defaultErrorHandler = function(jqXHR, textStatus, errorThrown) {
    alert(textStatus);
    window.location.reload(true);
};

JA = {
    build: function(options) {
        if (!options) options = {};
        var app = new JApp(options);
        _.extend(this, app);
    },
    inherit: function(child, superclass) {
        function c() {
            this.constructor = child.constructor;
        }
        c.prototype = superclass.prototype;
        for (var prop in superclass) {
            if (Object.hasOwnProperty.call(superclass, prop)) {
                child[prop] = superclass[prop];
            }
        }
        child.prototype = new c();
        return child;
    }
};

var JApp = function(options) {
    this._activePage = null;
    this._activeDisplay = null;
    this._pages = [];
    this._pageById = {};
    this.routes = {};
    _.extend(this, _.pick(options, allowedOptions));
    _.extend(this, Backbone.Events);
};

_.extend(JApp.prototype, {
    errorHandler: defaultErrorHandler,
    // routes
    createRoutesForPages: function() {
        var self = this;
        _.each(this._pages, function(page) {
            if (!page.isRoute || self.routes[page.id]) return;
            self.routes[page.id] = function() {
                self.navigate(page.id);
            };
        });
    },
    startRouter: function() {
        this.createRoutesForPages();
        var Router = Backbone.Router.extend({
            routes: this.routes
        });
        this.router = new Router();
        Backbone.history.start();
    },
    //
    // pages
    addPage: function(pageObj) {
        F.demandGoodObject(pageObj, "pageObj");
        var page = new JA.Page(pageObj);
        this._pages.push(page);
        this._pageById[page.id] = page;
        return page;
    },
    page: function(pageId) {
        F.demandGoodString(pageId, "pageId");
        var page = this._pageById[pageId];
        if (page) return page;
        throw new Error("Page " + pageId + " not found!");
    },
    currentPage: function() {
        return this._activePage;
    },
    currentDisplay: function() {
        return this._activeDisplay;
    },
    //
    currentDisplay: function() {
        return this._activeDisplay;
    },
    navigate: function(pageId) {
        F.demandGoodString(pageId, "pageId");
        this._activePage = null;
        _.each(this._pages, function(page) {
            if (page.id !== pageId) {
                return page.deactivate();
            }
            page.activate();
            this._activePage = page;
        }, this);
        if (this._activePage == null) {
            throw new Error("Page " + pageId + " not found");
        }
    },
    // ajax
    get: function(url, data, callback) {
        if (_.isFunction(data)) {
            callback = data;
            data = {};
        }
        F.demandGoodString(url, "url");
        F.demandObject(data, "data");
        F.demandFunction(callback, "callback");
        $.get(url, data).done(callback).fail(this.errorHandler);
    },
    post: function(url, data, callback) {
        if (_.isFunction(data)) {
            callback = data;
            data = {};
        }
        F.demandGoodString(url, "url");
        F.demandObject(data, "data");
        F.demandFunction(callback, "callback");
        $.post(url, data).done(callback).fail(this.errorHandler);
    }
});

var displayTemplate = {
    afterDeactivate: function() {},
    beforeDeactivate: function(next) {
        next();
    },
    afterActivate: function() {},
    beforeActivate: function(next) {
        next();
    },
    render: function() {
        this.$container.html(this.template());
        return this;
    },
    template: function() {
        return _.template($(this.templateSelector).html());
    }
};

var backboneViewEvents = [ "delegateEvents", "undelegateEvents" ];

JA.Display = function(options) {
    F.demandGoodObject(options, "options");
    F.demandGoodString(options.id, "options.id");
    F.demandGoodString(options.container, "options.container");
    _.extend(this, options);
    _.defaults(this, displayTemplate);
    if (!this.selector) this.selector = this.container;
    this.$container = $(this.container);
    this.render();
    this.$el = this.$();
    this.delegateEvents(this.events);
};

_.extend(JA.Display.prototype, {
    $: function() {
        return $(this.selector);
    },
    activate: function() {
        var self = this;
        this.beforeActivate(function() {
            self.show();
            self.afterActivate();
        });
    },
    deactivate: function() {
        var self = this;
        this.beforeDeactivate(function() {
            self.hide();
            self.afterDeactivate();
        });
    },
    hide: function() {
        this.$().hide();
    },
    show: function() {
        this.$().show();
    }
}, _.pick(Backbone.View.prototype, backboneViewEvents));

var pageTemplate = {
    _displays: [],
    _displayById: {},
    isRoute: true,
    afterDeactivate: function() {},
    beforeDeactivate: function(next) {
        next();
    },
    afterActivate: function() {},
    beforeActivate: function(next) {
        next();
    }
};

JA.Page = function(options) {
    F.demandGoodObject(options, "options");
    F.demandGoodString(options.id, "options.id");
    this._activeDisplay = null;
    _.extend(this, options);
    _.defaults(this, pageTemplate);
    _.extend(this, Backbone.Events);
    this._displays = [];
};

_.extend(JA.Page.prototype, {
    display: function(displayId) {
        F.demandGoodString(displayId, "displayId");
        var display = this._displayById[displayId];
        if (display) return display;
        throw new Error("Display " + displayId + " not found!");
    },
    addDisplay: function(displayObj) {
        F.demandGoodObject(displayObj, "displayObj");
        var display = new JA.Display(displayObj);
        this._displays.push(display);
        this._displayById[display.id] = display;
        display.hide();
        return display;
    },
    activeAllDisplays: function() {
        _.each(this._displays, function(display) {
            display.activate();
        });
    },
    deactiveAllDisplays: function() {
        _.each(this._displays, function(display) {
            display.deactivate();
        });
    },
    activate: function() {
        var self = this;
        this.beforeActivate(function() {
            self.activeAllDisplays();
            self.afterActivate();
        });
    },
    deactivate: function() {
        var self = this;
        this.beforeDeactivate(function() {
            self.deactiveAllDisplays();
            self.afterDeactivate();
        });
    }
});