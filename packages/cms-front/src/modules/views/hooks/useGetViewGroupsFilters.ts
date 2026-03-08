import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { FieldMetadataType, ViewFilterOperand } from 'cms-shared/types';
import { getFilterTypeFromFieldType, isDefined } from 'cms-shared/utils';

export const useGetViewGroupsFilters = (): RecordFilter[] => {
  const { currentView } = useGetCurrentViewOnly();

  return (
    currentView?.viewGroups
      .filter((recordGroup) => !recordGroup.isVisible)
      .map((recordGroup) => {
        if (!isDefined(currentView.mainGroupByFieldMetadataId)) {
          throw new Error('mainGroupByFieldMetadataId is required');
        }

        return {
          id: recordGroup.id,
          fieldMetadataId: currentView.mainGroupByFieldMetadataId,
          value: JSON.stringify([recordGroup.fieldValue]),
          operand: ViewFilterOperand.IS_NOT,
          displayValue: '',
          type: getFilterTypeFromFieldType(FieldMetadataType.SELECT),
          label: '',
        };
      })
      .filter(isDefined) || []
  );
};
