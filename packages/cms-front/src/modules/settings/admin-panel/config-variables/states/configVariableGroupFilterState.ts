import { type ConfigVariableGroupFilter } from '@/settings/admin-panel/config-variables/types/ConfigVariableGroupFilter';
import { createState } from 'cms-ui/utilities';

export const configVariableGroupFilterState =
  createState<ConfigVariableGroupFilter>({
    key: 'configVariableGroupFilterState',
    defaultValue: 'all',
  });
