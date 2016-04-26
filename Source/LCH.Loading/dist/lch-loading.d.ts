declare module LCH.Loading {
    interface IQueue<T> extends ng.IPromise<T> {
        cancel(): void;
        OriginalPromise: ng.IPromise<T>;
    }
}
declare module LCH.Loading {
    class LoadingManager implements ILoadingManager {
        protected scope: ng.IScope;
        protected $timeout: ng.ITimeoutService;
        protected $q: ng.IQService;
        protected minTime: number;
        Loading: boolean;
        protected _isLoading: boolean;
        protected _canStop: boolean;
        protected _shouldStopOnTimeout: boolean;
        protected _queue: IQueue<any>;
        constructor(scope: ng.IScope, $timeout: ng.ITimeoutService, $q: ng.IQService, minTime?: number);
        static Create($injector: ng.auto.IInjectorService, scope: ng.IScope, minTime?: number): ILoadingManager;
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
declare module LCH.Loading {
    class LoadingDirectiveController implements ILoadingManager {
        protected $scope: ng.IScope;
        protected $timeout: ng.ITimeoutService;
        protected $q: ng.IQService;
        protected loadingConfig: ILoadingConfiguration;
        protected mainLoadingService: MainLoadingService;
        protected instance: ILoadingManager;
        Loading: boolean;
        protected minTime: number;
        protected promise: ng.IPromise<any>;
        constructor($scope: ng.IScope, $timeout: ng.ITimeoutService, $q: ng.IQService, loadingConfig: ILoadingConfiguration, mainLoadingService: MainLoadingService, $attrs: ng.IAttributes, $injector: ng.auto.IInjectorService);
        StartLoading(): void;
        StopLoading(): void;
        Bind<T>(promise: ng.IPromise<T>): IQueue<T>;
        OnLoadingStart(fn: (event?: ng.IAngularEvent) => void): () => void;
        OnLoadingStop(fn: (event?: ng.IAngularEvent) => void): () => void;
    }
}
declare module LCH.Loading {
    interface ILoadingManager {
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
declare module LCH.Loading {
    class LoadingDirective implements ng.IDirective {
        protected loadingConfig: ILoadingConfiguration;
        controllerAs: string;
        transclude: boolean;
        bindToController: boolean;
        scope: {
            minTime: string;
            instance: string;
            templateUrl: string;
            promise: string;
        };
        constructor(loadingConfig: ILoadingConfiguration);
        static Factory(loadingConfig: ILoadingConfiguration): LoadingDirective;
        templateUrl: (element: ng.IAugmentedJQuery, attributes: ng.IAttributes) => any;
        controller: typeof LoadingDirectiveController;
    }
}
declare module LCH.Loading {
    interface ILoadingConfiguration {
        MinLoadingTime: number;
        DefaultTemplateUrl: string;
    }
    class LoadingConfigurationProvider implements ng.IServiceProvider, ILoadingConfiguration {
        MinLoadingTime: number;
        DefaultTemplateUrl: string;
        $get(): ILoadingConfiguration;
    }
}
declare module LCH.Loading {
    class MainLoadingService implements ILoadingManager {
        protected $rootScope: ng.IRootScopeService;
        protected $timeout: ng.ITimeoutService;
        protected $q: ng.IQService;
        protected loadingConfig: ILoadingConfiguration;
        Loading: boolean;
        LoadingManager: ILoadingManager;
        protected _loadingManager: ILoadingManager;
        constructor($rootScope: ng.IRootScopeService, $timeout: ng.ITimeoutService, $q: ng.IQService, loadingConfig: ILoadingConfiguration, $injector: ng.auto.IInjectorService);
        StartLoading(): void;
        StopLoading(): void;
        Bind<T>(promise: ng.IPromise<T>): IQueue<T>;
        OnLoadingStart(fn: (event?: ng.IAngularEvent) => void): () => void;
        OnLoadingStop(fn: (event?: ng.IAngularEvent) => void): () => void;
    }
}
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
declare module LCH.Loading {
}
declare module LCH.Loading.Events {
    const LoadingStart: string;
    const LoadingStop: string;
}
declare namespace angular {
    interface IQService {
        allSettled<TAll>(promises: IPromise<TAll>[]): IPromise<TAll[]>;
    }
}
