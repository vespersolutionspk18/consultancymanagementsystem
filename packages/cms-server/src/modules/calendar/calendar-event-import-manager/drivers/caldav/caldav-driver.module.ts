import { Module } from '@nestjs/common';

import { CMSConfigModule } from 'src/engine/core-modules/cms-config/cms-config.module';
import { CalDavClientProvider } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/providers/caldav.provider';
import { CalDavGetEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-get-events.service';

@Module({
  imports: [CMSConfigModule],
  providers: [CalDavClientProvider, CalDavGetEventsService],
  exports: [CalDavGetEventsService],
})
export class CalDavDriverModule {}
