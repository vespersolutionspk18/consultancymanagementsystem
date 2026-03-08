import { useRunWorkflowRecordActions } from '@/action-menu/actions/record-actions/run-workflow-actions/hooks/useRunWorkflowRecordActions';
import { RecordAgnosticActionsKeys } from '@/action-menu/actions/record-agnostic-actions/types/RecordAgnosticActionsKeys';
import { useRunWorkflowRecordAgnosticActions } from '@/action-menu/actions/record-agnostic-actions/run-workflow-actions/hooks/useRunWorkflowRecordAgnosticActions';
import {
  ActionMenuContext,
  type ActionMenuContextType,
} from '@/action-menu/contexts/ActionMenuContext';
import { useRegisteredActions } from '@/action-menu/hooks/useRegisteredActions';
import { useShouldActionBeRegisteredParams } from '@/action-menu/hooks/useShouldActionBeRegisteredParams';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const ActionMenuContextProviderDefault = ({
  objectMetadataItem,
  isInRightDrawer,
  displayType,
  actionMenuType,
  children,
}: {
  objectMetadataItem: ObjectMetadataItem;
  isInRightDrawer: ActionMenuContextType['isInRightDrawer'];
  displayType: ActionMenuContextType['displayType'];
  actionMenuType: ActionMenuContextType['actionMenuType'];
  children: React.ReactNode;
}) => {
  const params = useShouldActionBeRegisteredParams({
    objectMetadataItem,
  });

  const shouldBeRegisteredParams = {
    ...params,
  };

  const actions = useRegisteredActions(shouldBeRegisteredParams);

  const contextStoreTargetedRecordsRule = useRecoilComponentValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const isRecordSelection =
    contextStoreTargetedRecordsRule.mode === 'selection' &&
    contextStoreTargetedRecordsRule.selectedRecordIds.length > 0;

  const runWorkflowRecordActions = useRunWorkflowRecordActions({
    objectMetadataItem,
    skip: !isRecordSelection,
  });

  const runWorkflowRecordAgnosticActions =
    useRunWorkflowRecordAgnosticActions();

  // Filter out AI actions for Project objects (they have their own custom chat)
  const isProjectObject =
    objectMetadataItem?.nameSingular === CoreObjectNameSingular.Project;

  const filteredActions = isProjectObject
    ? actions.filter(
        (action) =>
          action.key !== RecordAgnosticActionsKeys.ASK_AI &&
          action.key !== RecordAgnosticActionsKeys.VIEW_PREVIOUS_AI_CHATS,
      )
    : actions;

  return (
    <ActionMenuContext.Provider
      value={{
        isInRightDrawer,
        displayType,
        actionMenuType,
        actions: [
          ...filteredActions,
          ...runWorkflowRecordActions,
          ...runWorkflowRecordAgnosticActions,
        ],
      }}
    >
      {children}
    </ActionMenuContext.Provider>
  );
};
