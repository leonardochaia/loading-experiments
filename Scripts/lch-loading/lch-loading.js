var LCH;
(function (LCH) {
    var Loading;
    (function (Loading) {
        var REJECTION_CANCEL_REASON = 'lch-loading-canceled';
        var LoadingManager = (function () {
            function LoadingManager(scope, $timeout, $q, minTime) {
                if (minTime === void 0) { minTime = 250; }
                this.scope = scope;
                this.$timeout = $timeout;
                this.$q = $q;
                this.minTime = minTime;
                this._isLoading = false;
                this._canStop = true;
                this._shouldStopOnTimeout = false;
            }
            Object.defineProperty(LoadingManager.prototype, "Loading", {
                get: function () {
                    return this._isLoading;
                },
                enumerable: true,
                configurable: true
            });
            LoadingManager.Create = function ($injector, scope, minTime) {
                var $q = $injector.get('$q');
                var $timeout = $injector.get('$timeout');
                var loadingConfig = $injector.get('loadingConfig');
                minTime = angular.isNumber(minTime) ? minTime : loadingConfig.MinLoadingTime;
                return new LoadingManager(scope, $timeout, $q, minTime);
            };
            /**
            * Turns the loading on
            */
            LoadingManager.prototype.StartLoading = function () {
                var _this = this;
                if (this._isLoading)
                    return;
                this._isLoading = true;
                this.scope.$broadcast(Loading.Events.LoadingStart);
                if (this.minTime > 0) {
                    this._canStop = false;
                    this._shouldStopOnTimeout = false;
                    this.$timeout(function () {
                        _this._canStop = true;
                        if (_this._shouldStopOnTimeout)
                            _this.StopLoading();
                    }, this.minTime);
                }
                else {
                    this._canStop = true;
                }
            };
            /**
             * Turns the loading off
             */
            LoadingManager.prototype.StopLoading = function () {
                if (!this._isLoading)
                    return;
                if (this._canStop) {
                    this._isLoading = false;
                    this.scope.$broadcast(Loading.Events.LoadingStop);
                }
                else {
                    this._shouldStopOnTimeout = true;
                }
            };
            /**
             * Starts loading and binds to the provided promise's finally
             * to stop loading.
             * @param promise The provied promise to allow chaining.
             */
            LoadingManager.prototype.Bind = function (promise) {
                var _this = this;
                this.StartLoading();
                var combined = promise;
                if (Queue.IsQueue(promise)) {
                    combined = promise.OriginalPromise;
                }
                if (this._queue) {
                    combined = this.$q.allSettled([promise, this._queue.OriginalPromise]);
                    this._queue.cancel();
                }
                this._queue = new Queue(combined, this.$q);
                var stop = function () {
                    _this._queue = null;
                    //To prevent views flickering!
                    _this.$timeout(function () {
                        _this.StopLoading();
                    }, 50);
                };
                this._queue
                    .then(stop)
                    .catch(function (reason) {
                    if (!reason || (reason != REJECTION_CANCEL_REASON))
                        stop();
                });
                return this._queue;
            };
            /**
             * Binds to the Manager's scope.
             * Could be the $rootScope or the directive's scope
             * @param fn
             */
            LoadingManager.prototype.OnLoadingStart = function (fn) {
                return this.scope.$on(Loading.Events.LoadingStart, function (e, user) { return fn(e); });
            };
            /**
             * Binds to the Manager's scope.
             * Could be the $rootScope or the directive's scope
             * @param fn
             */
            LoadingManager.prototype.OnLoadingStop = function (fn) {
                return this.scope.$on(Loading.Events.LoadingStop, function (e, user) { return fn(e); });
            };
            return LoadingManager;
        }());
        Loading.LoadingManager = LoadingManager;
        /**
        * A queue/promise that  can be canceled using the cancel(reason) method.
        */
        var Queue = (function () {
            function Queue(OriginalPromise, $q) {
                var _this = this;
                this.OriginalPromise = OriginalPromise;
                // The cancelDeferred is used to cancel the promise.
                this._cancelDeferred = $q.defer();
                // When the cancelDeferred is rejected.
                // The combined promise is rejected.
                // Which rejects the Underlying deferred
                var combined = $q.all([OriginalPromise, this._cancelDeferred.promise]);
                var underlyingDeferred = $q.defer();
                // The underlyingPromise must be a new promise, since we can't just return combined
                // Or the results for the then method will be an array of the original and cancelDeferred promises.
                this._underlyingPromise = underlyingDeferred.promise;
                // Resolve the cancelDeferred when the original is resolved, 
                // When both deferred resolves, the combined is resolved
                // And so is the underlyingDefered.
                OriginalPromise.then(function (result) {
                    _this._cancelDeferred.resolve();
                });
                // Hide the $q.all behavior for the consumer
                combined.then(function (results) {
                    // Resolve the underlyingDeferred using the original's promise result.
                    underlyingDeferred.resolve(results[0]);
                }).catch(function (reason) {
                    // Reject the underlyingDeferred with the given reason
                    underlyingDeferred.reject(reason);
                });
            }
            /**
            * Regardless of when the promise was or will be resolved or rejected, then calls one of the success or error callbacks asynchronously as soon as the result is available. The callbacks are called with a single argument: the result or rejection reason. Additionally, the notify callback may be called zero or more times to provide a progress indication, before the promise is resolved or rejected.
            * The successCallBack may return IPromise<void> for when a $q.reject() needs to be returned
            * This method returns a new promise which is resolved or rejected via the return value of the successCallback, errorCallback. It also notifies via the return value of the notifyCallback method. The promise can not be resolved or rejected from the notifyCallback method.
            */
            Queue.prototype.then = function (successCallback, errorCallback, notifyCallback) {
                return this._underlyingPromise.then(successCallback, errorCallback, notifyCallback);
            };
            /**
             * Shorthand for promise.then(null, errorCallback)
             */
            Queue.prototype.catch = function (onRejected) {
                return this._underlyingPromise.catch(onRejected);
            };
            /**
             * Allows you to observe either the fulfillment or rejection of a promise, but to do so without modifying the final value. This is useful to release resources or do some clean-up that needs to be done whether the promise was rejected or resolved. See the full specification for more information.
             *
             * Because finally is a reserved word in JavaScript and reserved keywords are not supported as property names by ES3, you'll need to invoke the method like promise['finally'](callback) to make your code IE8 and Android 2.x compatible.
             */
            Queue.prototype.finally = function (finallyCallback) {
                return this._underlyingPromise.finally(finallyCallback);
            };
            Queue.prototype.cancel = function () {
                return this._cancelDeferred.reject(REJECTION_CANCEL_REASON);
            };
            Queue.IsQueue = function (promise) {
                var queue = promise;
                return queue.OriginalPromise != null;
            };
            return Queue;
        }());
    })(Loading = LCH.Loading || (LCH.Loading = {}));
})(LCH || (LCH = {}));
var LCH;
(function (LCH) {
    var Loading;
    (function (Loading) {
        var LoadingDirectiveController = (function () {
            function LoadingDirectiveController($scope, $timeout, $q, loadingConfig, mainLoadingService, $attrs, $injector) {
                var _this = this;
                this.$scope = $scope;
                this.$timeout = $timeout;
                this.$q = $q;
                this.loadingConfig = loadingConfig;
                this.mainLoadingService = mainLoadingService;
                if (angular.isDefined($attrs['main'])) {
                    this.instance = mainLoadingService.LoadingManager;
                }
                else {
                    this.instance = Loading.LoadingManager.Create($injector, $scope, this.minTime);
                }
                $scope.$watch(function () { return _this.promise; }, function (newValue, oldValue) {
                    if (newValue) {
                        _this.Bind(newValue);
                    }
                });
            }
            Object.defineProperty(LoadingDirectiveController.prototype, "Loading", {
                get: function () {
                    return this.instance.Loading;
                },
                enumerable: true,
                configurable: true
            });
            LoadingDirectiveController.prototype.StartLoading = function () {
                return this.instance.StartLoading();
            };
            LoadingDirectiveController.prototype.StopLoading = function () {
                return this.instance.StopLoading();
            };
            LoadingDirectiveController.prototype.Bind = function (promise) {
                return this.instance.Bind(promise);
            };
            LoadingDirectiveController.prototype.OnLoadingStart = function (fn) {
                return this.instance.OnLoadingStart(fn);
            };
            LoadingDirectiveController.prototype.OnLoadingStop = function (fn) {
                return this.instance.OnLoadingStop(fn);
            };
            return LoadingDirectiveController;
        }());
        Loading.LoadingDirectiveController = LoadingDirectiveController;
    })(Loading = LCH.Loading || (LCH.Loading = {}));
})(LCH || (LCH = {}));
var LCH;
(function (LCH) {
    var Loading;
    (function (Loading) {
        var LoadingDirective = (function () {
            function LoadingDirective(loadingConfig) {
                var _this = this;
                this.loadingConfig = loadingConfig;
                this.controllerAs = 'ctrl';
                this.transclude = true;
                this.bindToController = true;
                this.scope = {
                    minTime: '=?',
                    instance: '=?',
                    templateUrl: '@?',
                    promise: '=?',
                };
                this.templateUrl = function (element, attributes) {
                    if (angular.isString(attributes['templateUrl']))
                        return attributes['templateUrl'];
                    else if (_this.loadingConfig.DefaultTemplateUrl)
                        return _this.loadingConfig.DefaultTemplateUrl;
                    else
                        return 'default-loading.html';
                };
                this.controller = Loading.LoadingDirectiveController;
            }
            LoadingDirective.Factory = function (loadingConfig) {
                return new LoadingDirective(loadingConfig);
            };
            return LoadingDirective;
        }());
        Loading.LoadingDirective = LoadingDirective;
    })(Loading = LCH.Loading || (LCH.Loading = {}));
})(LCH || (LCH = {}));
var LCH;
(function (LCH) {
    var Loading;
    (function (Loading) {
        var LoadingConfigurationProvider = (function () {
            function LoadingConfigurationProvider() {
                this.MinLoadingTime = 250;
            }
            LoadingConfigurationProvider.prototype.$get = function () {
                return this;
            };
            return LoadingConfigurationProvider;
        }());
        Loading.LoadingConfigurationProvider = LoadingConfigurationProvider;
    })(Loading = LCH.Loading || (LCH.Loading = {}));
})(LCH || (LCH = {}));
var LCH;
(function (LCH) {
    var Loading;
    (function (Loading) {
        var MainLoadingService = (function () {
            function MainLoadingService($rootScope, $timeout, $q, loadingConfig, $injector) {
                this.$rootScope = $rootScope;
                this.$timeout = $timeout;
                this.$q = $q;
                this.loadingConfig = loadingConfig;
                this._loadingManager = Loading.LoadingManager.Create($injector, $rootScope);
            }
            Object.defineProperty(MainLoadingService.prototype, "Loading", {
                get: function () {
                    return this.LoadingManager.Loading;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(MainLoadingService.prototype, "LoadingManager", {
                get: function () {
                    return this._loadingManager;
                },
                enumerable: true,
                configurable: true
            });
            MainLoadingService.prototype.StartLoading = function () {
                return this.LoadingManager.StartLoading();
            };
            MainLoadingService.prototype.StopLoading = function () {
                return this.LoadingManager.StopLoading();
            };
            MainLoadingService.prototype.Bind = function (promise) {
                return this.LoadingManager.Bind(promise);
            };
            MainLoadingService.prototype.OnLoadingStart = function (fn) {
                return this.LoadingManager.OnLoadingStart(fn);
            };
            MainLoadingService.prototype.OnLoadingStop = function (fn) {
                return this.LoadingManager.OnLoadingStop(fn);
            };
            return MainLoadingService;
        }());
        Loading.MainLoadingService = MainLoadingService;
    })(Loading = LCH.Loading || (LCH.Loading = {}));
})(LCH || (LCH = {}));
/**
   MIT License
   Copyright (c) 2016 LCH.Loading

   Permission is hereby granted, free of charge, to any person obtaining a copy
   of this software and associated documentation files (the "Software"), to deal
   in the Software without restriction, including without limitation the rights
   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   copies of the Software, and to permit persons to whom the Software is
   furnished to do so, subject to the following conditions:

   The above copyright notice and this permission notice shall be included in all
   copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   SOFTWARE.
*/
///<reference path="LoadingDirective/LoadingDirective.ts"/>
///<reference path="LoadingConfigurationProvider.ts"/>
///<reference path="MainLoadingService.ts"/>
var LCH;
(function (LCH) {
    var Loading;
    (function (Loading) {
        (function () {
            angular.module('lch-loading', ['angular-q-extras'])
                .provider('loadingConfig', Loading.LoadingConfigurationProvider)
                .directive('loading', Loading.LoadingDirective.Factory)
                .service('mainLoadingService', Loading.MainLoadingService)
                .run(function ($templateCache) {
                $templateCache.put('default-loading.html', '<div ng-if="ctrl.Loading">Loading...</div><ng-transclude ng-hide="ctrl.Loading"></ng-transclude>');
            });
        })();
    })(Loading = LCH.Loading || (LCH.Loading = {}));
})(LCH || (LCH = {}));
var LCH;
(function (LCH) {
    var Loading;
    (function (Loading) {
        var Events;
        (function (Events) {
            Events.LoadingStart = 'LoadingStart';
            Events.LoadingStop = 'LoadingStop';
        })(Events = Loading.Events || (Loading.Events = {}));
    })(Loading = LCH.Loading || (LCH.Loading = {}));
})(LCH || (LCH = {}));
