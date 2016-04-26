var LCH;
(function (LCH) {
    var Loading;
    (function (Loading) {
        var Demo;
        (function (Demo) {
            var Controllers;
            (function (Controllers) {
                var TestController = (function () {
                    function TestController($timeout, $interval, $q, $http) {
                        var _this = this;
                        this.$timeout = $timeout;
                        this.$interval = $interval;
                        this.$q = $q;
                        this.$http = $http;
                        this.auxTimeout = 1000;
                        this.resetBeforeTests = true;
                        this.HttpExample = function () {
                            _this.httpLoader.Bind(_this.$http.get('test.json')
                                .then(function (response) {
                                _this.httpResponse = response;
                            }));
                        };
                        this.AddTimeout = function (ms, chainer) {
                            if (ms === void 0) { ms = 1000; }
                            var promise = _this.$timeout(function () { return chainer; }, ms);
                            _this.promiseList.push(_this.loader.Bind(promise));
                            return promise;
                        };
                        this.Reset = function () {
                            if (_this.loader)
                                _this.loader.StopLoading();
                            _this.promiseList = new Array();
                        };
                        this.Test1 = function () {
                            _this.AddTimeout(2000);
                            _this.AddTimeout(500);
                            _this.AddTimeout(1000);
                        };
                        this.Test2 = function () {
                            _this.AddTimeout(2000);
                            _this.$interval(function () {
                                _this.AddTimeout(2000);
                            }, 1000, 5);
                        };
                        this.Test3 = function () {
                            _this.AddTimeout(2000);
                            _this.$interval(function () {
                                _this.AddTimeout(2000);
                            }, 1000, 5);
                            _this.$interval(function () {
                                _this.AddTimeout(500);
                            }, 2500, 2);
                        };
                        this.Test4 = function () {
                            _this.AddTimeout(2000, _this.$q.reject("Rejected on purpose"));
                            _this.AddTimeout(1000, _this.$q.reject("Rejected on purpose 2"));
                            _this.Test2();
                        };
                        this.Test5 = function () {
                            _this.Test1();
                            _this.AddTimeout(1000);
                            _this.Test2();
                            _this.AddTimeout(15000);
                            _this.AddTimeout(1000);
                            _this.AddTimeout(8000);
                            _this.AddTimeout(2000);
                            _this.$timeout(_this.Test3, 5000);
                        };
                        this.testList = Object.getOwnPropertyNames(this)
                            .filter(function (x) { return x.indexOf('Test') == 0; });
                        this.Reset();
                    }
                    return TestController;
                }());
                Controllers.TestController = TestController;
            })(Controllers = Demo.Controllers || (Demo.Controllers = {}));
        })(Demo = Loading.Demo || (Loading.Demo = {}));
    })(Loading = LCH.Loading || (LCH.Loading = {}));
})(LCH || (LCH = {}));
var LCH;
(function (LCH) {
    var Loading;
    (function (Loading) {
        var Demo;
        (function (Demo) {
            (function () {
                angular.module("LCH.Loading.Demo", [
                    'ngRoute',
                    'lch-loading'
                ])
                    .config(function (loadingConfigProvider, $routeProvider) {
                    //Configure the default template to use when not specifiying template-url on the directive.
                    loadingConfigProvider.DefaultTemplateUrl = 'loading-custom-template.html';
                    $routeProvider.otherwise('/');
                    $routeProvider.when('/', {
                        controller: Demo.Controllers.TestController,
                        controllerAs: 'testCtrl',
                        templateUrl: 'home.html',
                        resolve: {
                            test: function ($timeout) { return $timeout(angular.noop, 1000); }
                        }
                    });
                })
                    .run(function ($rootScope, mainLoadingService) {
                    $rootScope.$on('$routeChangeStart', function () {
                        mainLoadingService.StartLoading();
                    });
                    $rootScope.$on('$routeChangeSuccess', function () {
                        mainLoadingService.StopLoading();
                    });
                });
            })();
        })(Demo = Loading.Demo || (Loading.Demo = {}));
    })(Loading = LCH.Loading || (LCH.Loading = {}));
})(LCH || (LCH = {}));
//# sourceMappingURL=demo.js.map