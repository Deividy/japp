var allowedOptions = [ "errorHandler", "routes" ];

var defaultErrorHandler = function(jqXHR, textStatus, errorThrown) {
    alert(textStatus);
    window.location.reload(true);
};

var JApp = function(options) {
    this._activePage = null;
    this._activeDisplay = null;
    this._pages = [];
    this._pageById = {};
    this.routes = {};
    _.extend(this, _.pick(options, allowedOptions));
    _.extend(this, Backbone.Events);
    this.constructor.apply(this, arguments);
};

_.extend(JApp.prototype, {
    errorHandler: defaultErrorHandler,
    constructor: function() {},
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
    },
    extendAndApplyDefaults: function(context, obj, defaults) {
        _.extend(context, _.defaults(obj, defaults));
    }
};

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
        this.$container.html(this._template());
        return this;
    }
};

JA.Display = function(options) {
    F.demandGoodObject(options, "options");
    F.demandGoodString(options.id, "options.id");
    F.demandGoodString(options.container, "options.container");
    JA.extendAndApplyDefaults(this, options, displayTemplate);
    if (!this.selector) this.selector = this.container;
    this.$container = $(this.container);
    this.render();
    this.delegateEvents(this.events);
};

JA.inherit(JA.Display, Backbone.View);

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
    },
    _template: function() {
        if (_.isFunction(this.template)) {
            return this.template.apply(this, arguments);
        }
        return _.template($(this.template).html());
    }
});

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
        throw new Error("Must implement and pass a display id to next()");
    }
};

JA.Page = function(options) {
    F.demandGoodObject(options, "options");
    F.demandGoodString(options.id, "options.id");
    this._activeDisplay = null;
    JA.extendAndApplyDefaults(this, options, pageTemplate);
    _.extend(this, Backbone.Events);
};

_.extend(JA.Page.prototype, {
    display: function(displayId) {
        F.demandGoodString(displayId, "displayId");
        var display = this._displayById[displayId];
        if (display) return display;
        throw new Error("Display " + displayId + " not found!");
    },
    addDisplay: function(obj) {
        F.demandGoodObject(obj, "obj");
        var display = new JA.Display(obj);
        this._displays.push(display);
        this._displayById[display.id] = display;
        display.hide();
        return display;
    },
    navigate: function(displayId) {
        F.demandGoodString(displayId, "displayId");
        this._activeDisplay = null;
        JA._activeDisplay = null;
        _.each(this._displays, function(display) {
            if (display.id !== displayId) return display.deactivate();
            display.activate();
            this._activeDisplay = display;
            JA._activeDisplay = display;
        }, this);
    },
    activate: function() {
        var self = this;
        this.beforeActivate(function(displayId) {
            F.demandGoodString(displayId, "displayId");
            self.navigate(displayId);
            self.afterActivate();
        });
    },
    deactivate: function() {
        this.beforeDeactivate(_.bind(function() {
            if (this._activeDisplay) {
                this._activeDisplay.deactivate();
            }
            this.afterDeactivate();
        }, this));
    }
});