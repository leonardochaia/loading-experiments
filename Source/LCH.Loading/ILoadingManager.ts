module LCH.Loading {
    export interface ILoadingManager {
        /**
         * Whether the manager is loading right now.
         */
        Loading: boolean;
        /**
         * Turns the loading on
         */
        StartLoading(): void;
        /**
         * Turns the loading off
         */
        StopLoading(): void;
        /**
         * Starts loading and binds to the provided promise's finally
         * to stop loading.
         * @param promise The provied promise to allow chaining.
         */
        Bind<T>(promise: ng.IPromise<T>): IQueue<T>;
        /**
         * Binds to the Manager's scope.
         * Could be the $rootScope or the directive's scope
         * @param fn
         */
        OnLoadingStart(fn: (event?: ng.IAngularEvent) => void): () => void;
        /**
         * Binds to the Manager's scope.
         * Could be the $rootScope or the directive's scope
         * @param fn
         */
        OnLoadingStop(fn: (event?: ng.IAngularEvent) => void): () => void;
    }
}