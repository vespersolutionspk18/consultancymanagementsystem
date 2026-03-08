import { z } from 'zod';

import { CurrencyCode } from 'cms-shared/constants';

export const currencyCodeSchema = z.enum(CurrencyCode);
