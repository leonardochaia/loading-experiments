module LCH.Loading {
    export class MainLoadingService implements ILoadingManager {

        public get Loading() {
            return this.LoadingManager.Loading;
        }

        public get LoadingManager() {
            return this._loadingManager;
        }

        protected _loadingManager: ILoadingManager;

        constructor(protected $rootScope: ng.IRootScopeService,
            protected $timeout: ng.ITimeoutService,
            protected $q: ng.IQService,
            protected loadingConfig: ILoadingConfiguration,
            $injector: ng.auto.IInjectorService) {

            this._loadingManager = LoadingManager.Create($injector, $rootScope);
        }

        StartLoading() {
            return this.LoadingManager.StartLoading();
        }

        StopLoading() {
            return this.LoadingManager.StopLoading();
        }

        Bind<T>(promise: ng.IPromise<T>) {
            return this.LoadingManager.Bind(promise);
        }

        OnLoadingStart(fn: (event?: ng.IAngularEvent) => void) {
            return this.LoadingManager.OnLoadingStart(fn);
        }
        OnLoadingStop(fn: (event?: ng.IAngularEvent) => void) {
            return this.LoadingManager.OnLoadingStop(fn);
        }
    }
}