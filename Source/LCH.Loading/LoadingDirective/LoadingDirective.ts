module LCH.Loading {
    export class LoadingDirective implements ng.IDirective {

        controllerAs = 'ctrl';
        transclude = true;
        bindToController = true;
        scope = {
            minTime: '=?',
            instance: '=?',
            templateUrl: '@?',
            promise: '=?',
        };

        constructor(protected loadingConfig: ILoadingConfiguration) { }

        public static Factory(loadingConfig: ILoadingConfiguration): LoadingDirective {
            return new LoadingDirective(loadingConfig);
        }

        templateUrl = (element: ng.IAugmentedJQuery, attributes: ng.IAttributes) => {
            if (angular.isString(attributes['templateUrl']))
                return attributes['templateUrl'];
            else if (this.loadingConfig.DefaultTemplateUrl)
                return this.loadingConfig.DefaultTemplateUrl;
            else
                return 'default-loading.html';
        };

        controller = LoadingDirectiveController;
    }
}
