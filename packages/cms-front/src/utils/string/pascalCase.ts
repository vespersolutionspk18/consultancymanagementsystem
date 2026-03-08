import camelCase from 'lodash.camelcase';
import { capitalize } from 'cms-shared/utils';

export const pascalCase = (str: string) => capitalize(camelCase(str));
