import { isDefined } from 'cms-shared/utils';
import {
  type BarChartConfiguration,
  type LineChartConfiguration,
} from '~/generated/graphql';

export const isChartConfigurationTwoDimensional = (
  configuration: BarChartConfiguration | LineChartConfiguration,
): boolean => {
  return isDefined(configuration.secondaryAxisGroupByFieldMetadataId);
};
