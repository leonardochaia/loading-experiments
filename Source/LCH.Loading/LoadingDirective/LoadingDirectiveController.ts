module LCH.Loading {
    export class LoadingDirectiveController implements ILoadingManager {

        protected instance: ILoadingManager;

        public get Loading() {
            return this.instance.Loading;
        }

        //Properties from directive binding
        protected minTime: number;
        protected promise: ng.IPromise<any>;

        constructor(protected $scope: ng.IScope,
            protected $timeout: ng.ITimeoutService,
            protected $q: ng.IQService,
            protected loadingConfig: ILoadingConfiguration,
            protected mainLoadingService: MainLoadingService,
            $attrs: ng.IAttributes,
            $injector: ng.auto.IInjectorService) {

            if (angular.isDefined($attrs['main'])) {
                this.instance = mainLoadingService.LoadingManager;
            } else {
                this.instance = LoadingManager.Create($injector, $scope, this.minTime);
            }

            $scope.$watch<ng.IPromise<any>>(() => this.promise, (newValue, oldValue) => {
                if (newValue) {
                    this.Bind(newValue);
                }
            });
        }

        public StartLoading() {
            return this.instance.StartLoading();
        }

        public StopLoading() {
            return this.instance.StopLoading();
        }


        public Bind<T>(promise: ng.IPromise<T>): IQueue<T> {
            return this.instance.Bind(promise);
        }

        public OnLoadingStart(fn: (event?: ng.IAngularEvent) => void) {
            return this.instance.OnLoadingStart(fn);
        }

        public OnLoadingStop(fn: (event?: ng.IAngularEvent) => void) {
            return this.instance.OnLoadingStop(fn);
        }
    }

}