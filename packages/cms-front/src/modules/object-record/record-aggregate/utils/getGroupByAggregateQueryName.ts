import { capitalize } from 'cms-shared/utils';

export const getGroupByAggregateQueryName = ({
  objectMetadataNamePlural,
}: {
  objectMetadataNamePlural: string;
}) => {
  return `${capitalize(objectMetadataNamePlural)}GroupByAggregates`;
};
