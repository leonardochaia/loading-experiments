module LCH.Loading {

    export interface ILoadingConfiguration {
        MinLoadingTime: number;
        DefaultTemplateUrl: string;
    }

    export class LoadingConfigurationProvider implements ng.IServiceProvider, ILoadingConfiguration {
        public MinLoadingTime = 250;

        public DefaultTemplateUrl: string;

        public $get(): ILoadingConfiguration {
            return this;
        }
    }
}