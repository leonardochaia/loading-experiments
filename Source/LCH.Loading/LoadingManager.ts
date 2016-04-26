module LCH.Loading {
    const REJECTION_CANCEL_REASON = 'lch-loading-canceled';
    export class LoadingManager implements ILoadingManager {

        public get Loading() {
            return this._isLoading;
        }

        protected _isLoading = false;
        protected _canStop = true;
        protected _shouldStopOnTimeout = false;
        protected _queue: IQueue<any>;

        constructor(protected scope: ng.IScope,
            protected $timeout: ng.ITimeoutService,
            protected $q: ng.IQService,
            protected minTime: number = 250) { }

        public static Create($injector: ng.auto.IInjectorService, scope: ng.IScope, minTime?: number): ILoadingManager {
            let $q = $injector.get<ng.IQService>('$q');
            let $timeout = $injector.get<ng.ITimeoutService>('$timeout');
            let loadingConfig = $injector.get<ILoadingConfiguration>('loadingConfig');
            minTime = angular.isNumber(minTime) ? minTime : loadingConfig.MinLoadingTime;
            return new LoadingManager(scope, $timeout, $q, minTime);
        }

        /**
        * Turns the loading on
        */
        public StartLoading() {
            if (this._isLoading)
                return;
            this._isLoading = true;
            this.scope.$broadcast(Events.LoadingStart);

            if (this.minTime > 0) {
                this._canStop = false;
                this._shouldStopOnTimeout = false;
                this.$timeout(() => {
                    this._canStop = true;
                    if (this._shouldStopOnTimeout)
                        this.StopLoading();
                }, this.minTime);
            } else {
                this._canStop = true;
            }
        }

        /**
         * Turns the loading off
         */
        public StopLoading() {
            if (!this._isLoading)
                return;
            if (this._canStop) {
                this._isLoading = false;
                this.scope.$broadcast(Events.LoadingStop);
            } else {
                this._shouldStopOnTimeout = true;
            }
        }


        /**
         * Starts loading and binds to the provided promise's finally
         * to stop loading.
         * @param promise The provied promise to allow chaining.
         */
        public Bind<T>(promise: ng.IPromise<T>): IQueue<T> {
            this.StartLoading();

            let combined: ng.IPromise<any> = promise;
            if (Queue.IsQueue(promise)) {
                combined = promise.OriginalPromise;
            }

            if (this._queue) {
                combined = this.$q.allSettled([promise, this._queue.OriginalPromise]);
                this._queue.cancel();
            }
            this._queue = new Queue(combined, this.$q);

            var stop = () => {
                this._queue = null;
                //To prevent views flickering!
                this.$timeout(() => {
                    this.StopLoading();
                }, 50);
            }
            this._queue
                .then(stop)
                .catch((reason) => {
                    if (!reason || (reason != REJECTION_CANCEL_REASON))
                        stop();
                });

            return this._queue;
        }

        /**
         * Binds to the Manager's scope.
         * Could be the $rootScope or the directive's scope
         * @param fn
         */
        public OnLoadingStart(fn: (event?: ng.IAngularEvent) => void) {
            return this.scope.$on(Events.LoadingStart, (e, user) => fn(e));
        }

        /**
         * Binds to the Manager's scope.
         * Could be the $rootScope or the directive's scope
         * @param fn
         */
        public OnLoadingStop(fn: (event?: ng.IAngularEvent) => void) {
            return this.scope.$on(Events.LoadingStop, (e, user) => fn(e));
        }
    }

    /**
    * A queue/promise that  can be canceled using the cancel(reason) method.
    */
    class Queue<T> implements IQueue<T> {

        protected _underlyingPromise: ng.IPromise<T>;
        protected _cancelDeferred: ng.IDeferred<void>;

        constructor(public OriginalPromise: ng.IPromise<T>,
            $q: ng.IQService) {

            // The cancelDeferred is used to cancel the promise.
            this._cancelDeferred = $q.defer<void>();
            // When the cancelDeferred is rejected.
            // The combined promise is rejected.
            // Which rejects the Underlying deferred
            let combined = $q.all([OriginalPromise, this._cancelDeferred.promise]);
            let underlyingDeferred = $q.defer<T>();
            // The underlyingPromise must be a new promise, since we can't just return combined
            // Or the results for the then method will be an array of the original and cancelDeferred promises.
            this._underlyingPromise = underlyingDeferred.promise;

            // Resolve the cancelDeferred when the original is resolved, 
            // When both deferred resolves, the combined is resolved
            // And so is the underlyingDefered.
            OriginalPromise.then((result) => {
                this._cancelDeferred.resolve();
            });

            // Hide the $q.all behavior for the consumer
            combined.then((results) => {
                // Resolve the underlyingDeferred using the original's promise result.
                underlyingDeferred.resolve(results[0]);
            }).catch((reason) => {
                // Reject the underlyingDeferred with the given reason
                underlyingDeferred.reject(reason);
            });
        }

        /**
        * Regardless of when the promise was or will be resolved or rejected, then calls one of the success or error callbacks asynchronously as soon as the result is available. The callbacks are called with a single argument: the result or rejection reason. Additionally, the notify callback may be called zero or more times to provide a progress indication, before the promise is resolved or rejected.
        * The successCallBack may return IPromise<void> for when a $q.reject() needs to be returned
        * This method returns a new promise which is resolved or rejected via the return value of the successCallback, errorCallback. It also notifies via the return value of the notifyCallback method. The promise can not be resolved or rejected from the notifyCallback method.
        */
        then<TResult>(successCallback: (promiseValue: T) => ng.IPromise<TResult> | TResult, errorCallback?: (reason: any) => any, notifyCallback?: (state: any) => any): ng.IPromise<TResult> {
            return this._underlyingPromise.then(successCallback, errorCallback, notifyCallback);
        }

        /**
         * Shorthand for promise.then(null, errorCallback)
         */
        catch<TResult>(onRejected: (reason: any) => ng.IPromise<TResult> | TResult): ng.IPromise<TResult> {
            return this._underlyingPromise.catch(onRejected);
        }

        /**
         * Allows you to observe either the fulfillment or rejection of a promise, but to do so without modifying the final value. This is useful to release resources or do some clean-up that needs to be done whether the promise was rejected or resolved. See the full specification for more information.
         *
         * Because finally is a reserved word in JavaScript and reserved keywords are not supported as property names by ES3, you'll need to invoke the method like promise['finally'](callback) to make your code IE8 and Android 2.x compatible.
         */
        finally(finallyCallback: () => any): ng.IPromise<T> {
            return this._underlyingPromise.finally(finallyCallback);
        }

        cancel() {
            return this._cancelDeferred.reject(REJECTION_CANCEL_REASON);
        }

        public static IsQueue<T>(promise: ng.IPromise<T>): promise is Queue<T> {
            let queue = promise as IQueue<any>;
            return queue.OriginalPromise != null;
        }
    }
}