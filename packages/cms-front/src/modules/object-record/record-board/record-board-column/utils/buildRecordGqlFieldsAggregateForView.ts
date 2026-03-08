import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordGqlFieldsAggregate } from '@/object-record/graphql/types/RecordGqlFieldsAggregate';

import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION } from 'cms-shared/constants';
import { type Nullable } from 'cms-shared/types';
import { isDefined } from 'cms-shared/utils';

export const buildRecordGqlFieldsAggregateForView = ({
  objectMetadataItem,
  recordIndexGroupAggregateFieldMetadataItem,
  recordIndexGroupAggregateOperation,
}: {
  objectMetadataItem: ObjectMetadataItem;
  recordIndexGroupAggregateFieldMetadataItem: Nullable<FieldMetadataItem>;
  recordIndexGroupAggregateOperation: ExtendedAggregateOperations;
}): RecordGqlFieldsAggregate => {
  let recordGqlFieldsAggregate = {};

  if (!isDefined(recordIndexGroupAggregateFieldMetadataItem)) {
    if (recordIndexGroupAggregateOperation !== AggregateOperations.COUNT) {
      throw new Error(
        `No field found to compute aggregate operation ${recordIndexGroupAggregateOperation} on object ${objectMetadataItem.nameSingular}`,
      );
    } else {
      recordGqlFieldsAggregate = {
        [FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION]: [
          AggregateOperations.COUNT,
        ],
      };
    }
  } else {
    recordGqlFieldsAggregate = {
      [recordIndexGroupAggregateFieldMetadataItem.name]: [
        recordIndexGroupAggregateOperation ?? AggregateOperations.COUNT,
      ],
    };
  }

  return recordGqlFieldsAggregate;
};
