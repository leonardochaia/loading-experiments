declare namespace angular {
    interface IQService {
        allSettled<TAll>(promises: IPromise<TAll>[]): IPromise<TAll[]>;
    }
}