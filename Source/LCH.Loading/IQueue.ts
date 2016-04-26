module LCH.Loading {
    export interface IQueue<T> extends ng.IPromise<T> {
        cancel(): void;
        OriginalPromise: ng.IPromise<T>;
    }
}