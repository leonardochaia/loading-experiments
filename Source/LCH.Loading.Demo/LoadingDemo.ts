module LCH.Loading.Demo.Controllers {
    export class TestController {

        public promiseList: Array<IQueue<void>>;
        public loader: LCH.Loading.ILoadingManager;
        protected auxTimeout = 1000;

        public httpLoader: LCH.Loading.ILoadingManager;
        public httpResponse: any;

        public testList: Array<string>;
        protected resetBeforeTests = true;

        constructor(protected $timeout: ng.ITimeoutService,
            protected $interval: ng.IIntervalService,
            protected $q: ng.IQService,
            protected $http: ng.IHttpService) {

            this.testList = Object.getOwnPropertyNames(this)
                .filter(x => x.indexOf('Test') == 0);
            this.Reset();
        }

        public HttpExample = () => {
            this.httpLoader.Bind(this.$http.get('test.json')
                .then((response) => {
                    this.httpResponse = response;
                }));
        }

        public AddTimeout = (ms = 1000, chainer?: any) => {
            let promise = this.$timeout(() => chainer, ms);
            this.promiseList.push(this.loader.Bind(promise));
            return promise;
        }

        public Reset = () => {
            if (this.loader)
                this.loader.StopLoading();
            this.promiseList = new Array<IQueue<void>>();
        }

        public Test1 = () => {
            this.AddTimeout(2000);
            this.AddTimeout(500);
            this.AddTimeout(1000);
        }

        public Test2 = () => {
            this.AddTimeout(2000);
            this.$interval(() => {
                this.AddTimeout(2000);
            }, 1000, 5);
        }

        public Test3 = () => {
            this.AddTimeout(2000);
            this.$interval(() => {
                this.AddTimeout(2000);
            }, 1000, 5);
            this.$interval(() => {
                this.AddTimeout(500);
            }, 2500, 2);
        }

        public Test4 = () => {
            this.AddTimeout(2000, this.$q.reject("Rejected on purpose"));
            this.AddTimeout(1000, this.$q.reject("Rejected on purpose 2"));
            this.Test2();
        }

        public Test5 = () => {
            this.Test1();
            this.AddTimeout(1000);
            this.Test2();
            this.AddTimeout(15000);
            this.AddTimeout(1000);
            this.AddTimeout(8000);
            this.AddTimeout(2000);
            this.$timeout(this.Test3, 5000);
        }
    }
}

module LCH.Loading.Demo {
    (() => {
        angular.module("LCH.Loading.Demo", [
            'ngRoute',
            'lch-loading'
        ])
            .config((loadingConfigProvider: ILoadingConfiguration,
                $routeProvider: ng.route.IRouteProvider) => {
                //Configure the default template to use when not specifiying template-url on the directive.
                loadingConfigProvider.DefaultTemplateUrl = 'loading-custom-template.html';
                $routeProvider.otherwise('/');
                $routeProvider.when('/', {
                    controller: Controllers.TestController,
                    controllerAs: 'testCtrl',
                    templateUrl: 'home.html',
                    resolve: {
                        test: ($timeout: ng.ITimeoutService) => $timeout(angular.noop, 1000)
                    }
                });
            })
            .run(($rootScope: ng.IRootScopeService,
                mainLoadingService: ILoadingManager) => {

                $rootScope.$on('$routeChangeStart', () => {
                    mainLoadingService.StartLoading();
                });

                $rootScope.$on('$routeChangeSuccess', () => {
                    mainLoadingService.StopLoading();
                });
            });
    })();
}