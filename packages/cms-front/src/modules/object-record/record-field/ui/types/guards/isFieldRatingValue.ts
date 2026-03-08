import { RATING_VALUES } from 'cms-shared/constants';
import { type FieldRatingValue } from 'cms-shared/types';

export const isFieldRatingValue = (
  fieldValue: unknown,
): fieldValue is FieldRatingValue =>
  RATING_VALUES.includes(fieldValue as NonNullable<FieldRatingValue>);
