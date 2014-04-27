(function () {
    var template = {
        errorHander: function (jqXHR, textStatus, erorThrown) {
            alert(textStatus);
            window.location.reload(true);
        }
    };

    JA = {
        build: function (options) {
            if (!options) options = { };

            var app = new JApp(options);
            _.extend(this, app);
        },

        inherit: function (child, superclass) {
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

    var JApp = function (options) {
        _.extend(this, Backbone.Events);

        _.extend(this, options);
        _.defaults(this, template);

        this._activePage = null;
        this._activeDisplay = null;

        this._pages = [ ];
        this._pageById = { };
        this.routes = { };
    };

    _.extend(JApp.prototype, {
        // routes
        createRoutesForPages: function () {
            var self = this;

            _.each(this._pages, function (page) {
                if (!page.isRoute || self.routes[page.id]) return;

                self.routes[page.id] = function () {
                    self.navigate(page.id);
                };

            });
        },

        startRouter: function () {
            this.createRoutesForPages();

            var Router = Backbone.Router.extend({
                routes: this.routes
            });

            this.router = new Router();

            Backbone.history.start();
        },
        //

        // pages
        addPage: function (pageObj) {
            F.demandGoodObject(pageObj, 'pageObj');

            var page = new JA.Page(pageObj);
            this._pages.push(page);
            this._pageById[page.id] = page;  

            return page;
        },

        page: function (pageId) {
            F.demandGoodString(pageId, 'pageId');

            var page = this._pageById[pageId];
            if (page) return page;

            throw new Error("Page " + pageId + " not found!");
        },

        currentPage: function () {
            return this._activePage;
        },
        currentDisplay: function () {
            return this._activeDisplay;
        },
        //

        currentDisplay: function () {
            return this._activeDisplay;
        },

        navigate: function (pageId) {
            F.demandGoodString(pageId, 'pageId');

            this._activePage = null;

            _.each(this._pages, function (page) {
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
        get: function (url, data, callback) {
            if (_.isFunction(data)) {
                callback = data;
                data = { };
            }

            F.demandGoodString(url, 'url');
            F.demandObject(data, 'data');
            F.demandFunction(callback, 'callback');

            $.ajax({
                type: "GET",
                url: url,
                data: data,
                success: callback,
                error: this.errorHandler,
                cache: false
            });
        },

        post: function (url, data, callback) {
            if (_.isFunction(data)) {
                callback = data;
                data = { };
            }

            F.demandGoodString(url, 'url');
            F.demandObject(data, 'data');
            F.demandFunction(callback, 'callback');

            $.ajax({
                type: "POST",
                url: url,
                data: data,
                success: callback,
                error: this.errorHandler
            });
        },
        //
    });
} ());
