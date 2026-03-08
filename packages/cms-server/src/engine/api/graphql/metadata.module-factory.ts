import { type YogaDriverConfig } from '@graphql-yoga/nestjs';
import GraphQLJSON from 'graphql-type-json';

import { NodeEnvironment } from 'src/engine/core-modules/cms-config/interfaces/node-environment.interface';

import { useCachedMetadata } from 'src/engine/api/graphql/graphql-config/hooks/use-cached-metadata';
import { MetadataGraphQLApiModule } from 'src/engine/api/graphql/metadata-graphql-api.module';
import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { type ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { useDisableIntrospectionAndSuggestionsForUnauthenticatedUsers } from 'src/engine/core-modules/graphql/hooks/use-disable-introspection-and-suggestions-for-unauthenticated-users.hook';
import { useGraphQLErrorHandlerHook } from 'src/engine/core-modules/graphql/hooks/use-graphql-error-handler.hook';
import { useValidateGraphqlQueryComplexity } from 'src/engine/core-modules/graphql/hooks/use-validate-graphql-query-complexity.hook';
import { type I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { type CMSConfigService } from 'src/engine/core-modules/cms-config/cms-config.service';
import { type DataloaderService } from 'src/engine/dataloaders/dataloader.service';
import { renderApolloPlayground } from 'src/engine/utils/render-apollo-playground.util';

export const metadataModuleFactory = async (
  cmsConfigService: CMSConfigService,
  exceptionHandlerService: ExceptionHandlerService,
  dataloaderService: DataloaderService,
  cacheStorageService: CacheStorageService,
  metricsService: MetricsService,
  i18nService: I18nService,
): Promise<YogaDriverConfig> => {
  const config: YogaDriverConfig = {
    autoSchemaFile: true,
    include: [MetadataGraphQLApiModule],
    renderGraphiQL() {
      return renderApolloPlayground({ path: 'metadata' });
    },
    resolvers: { JSON: GraphQLJSON },
    plugins: [
      useGraphQLErrorHandlerHook({
        metricsService: metricsService,
        exceptionHandlerService,
        i18nService,
        cmsConfigService,
      }),
      useCachedMetadata({
        cacheGetter: cacheStorageService.get.bind(cacheStorageService),
        cacheSetter: cacheStorageService.set.bind(cacheStorageService),
        operationsToCache: ['ObjectMetadataItems', 'FindAllCoreViews'],
      }),
      useDisableIntrospectionAndSuggestionsForUnauthenticatedUsers(
        cmsConfigService.get('NODE_ENV') === NodeEnvironment.PRODUCTION,
      ),
      useValidateGraphqlQueryComplexity({
        maximumAllowedFields: cmsConfigService.get('GRAPHQL_MAX_FIELDS'),
        maximumAllowedRootResolvers: 10,
        maximumAllowedNestedFields: 10,
        checkDuplicateRootResolvers: true,
      }),
    ],
    path: '/metadata',
    context: () => ({
      loaders: dataloaderService.createLoaders(),
    }),
  };

  if (cmsConfigService.get('NODE_ENV') === NodeEnvironment.DEVELOPMENT) {
    config.renderGraphiQL = () => {
      return renderApolloPlayground({ path: 'metadata' });
    };
  }

  return config;
};
