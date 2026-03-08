import { Injectable } from '@nestjs/common';

import omit from 'lodash.omit';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'cms-shared/constants';
import { Any } from 'typeorm';

import { TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE } from 'src/engine/core-modules/calendar/constants/calendar.constants';
import { type TimelineCalendarEventsWithTotalDTO } from 'src/engine/core-modules/calendar/dtos/timeline-calendar-events-with-total.dto';
import { GlobalWorkspaceOrmManager } from 'src/engine/cms-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/cms-orm/utils/build-system-auth-context.util';
import { CalendarChannelVisibility } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { type ProjectWorkspaceEntity } from 'src/modules/project/standard-objects/project.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@Injectable()
export class TimelineCalendarEventService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async getCalendarEventsFromPersonIds({
    currentWorkspaceMemberId,
    personIds,
    workspaceId,
    page = 1,
    pageSize = TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE,
  }: {
    currentWorkspaceMemberId: string;
    personIds: string[];
    workspaceId: string;
    page: number;
    pageSize: number;
  }): Promise<TimelineCalendarEventsWithTotalDTO> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const offset = (page - 1) * pageSize;

        const calendarEventRepository =
          await this.globalWorkspaceOrmManager.getRepository<CalendarEventWorkspaceEntity>(
            workspaceId,
            'calendarEvent',
          );

        const calendarEventIds = await calendarEventRepository.find({
          where: {
            calendarEventParticipants: {
              personId: Any(personIds),
            },
          },
          select: {
            id: true,
            startsAt: true,
          },
          skip: offset,
          take: pageSize,
          order: {
            startsAt: 'DESC',
          },
        });

        const ids = calendarEventIds.map(({ id }) => id);

        if (ids.length <= 0) {
          return {
            totalNumberOfCalendarEvents: 0,
            timelineCalendarEvents: [],
          };
        }

        const [events, total] = await calendarEventRepository.findAndCount({
          where: {
            id: Any(ids),
          },
          relations: {
            calendarEventParticipants: {
              person: true,
              workspaceMember: true,
            },
            calendarChannelEventAssociations: {
              calendarChannel: {
                connectedAccount: {
                  accountOwner: true,
                },
              },
            },
          },
        });

        const orderedEvents = events.sort(
          (a, b) => ids.indexOf(a.id) - ids.indexOf(b.id),
        );

        const timelineCalendarEvents = orderedEvents.map((event) => {
          const participants = event.calendarEventParticipants.map(
            (participant) => ({
              calendarEventId: event.id,
              personId: participant.personId ?? null,
              workspaceMemberId: participant.workspaceMemberId ?? null,
              firstName:
                participant.person?.name?.firstName ||
                participant.workspaceMember?.name.firstName ||
                '',
              lastName:
                participant.person?.name?.lastName ||
                participant.workspaceMember?.name.lastName ||
                '',
              displayName:
                participant.person?.name?.firstName ||
                participant.person?.name?.lastName ||
                participant.workspaceMember?.name.firstName ||
                participant.workspaceMember?.name.lastName ||
                participant.displayName ||
                participant.handle ||
                '',
              avatarUrl:
                participant.person?.avatarUrl ||
                participant.workspaceMember?.avatarUrl ||
                '',
              handle: participant.handle ?? '',
            }),
          );

          const isCalendarEventImportedByCurrentWorkspaceMember =
            event.calendarChannelEventAssociations.some(
              (association) =>
                association.calendarChannel.connectedAccount.accountOwnerId ===
                currentWorkspaceMemberId,
            );

          const visibility =
            event.calendarChannelEventAssociations.some(
              (association) =>
                association.calendarChannel.visibility === 'SHARE_EVERYTHING',
            ) || isCalendarEventImportedByCurrentWorkspaceMember
              ? CalendarChannelVisibility.SHARE_EVERYTHING
              : CalendarChannelVisibility.METADATA;

          return {
            ...omit(event, [
              'calendarEventParticipants',
              'calendarChannelEventAssociations',
            ]),
            title:
              visibility === CalendarChannelVisibility.METADATA
                ? FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED
                : (event.title ?? ''),
            description:
              visibility === CalendarChannelVisibility.METADATA
                ? FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED
                : (event.description ?? ''),
            startsAt: event.startsAt as unknown as Date,
            endsAt: event.endsAt as unknown as Date,
            participants,
            visibility,
            location: event.location ?? '',
            conferenceSolution: event.conferenceSolution ?? '',
          };
        });

        return {
          totalNumberOfCalendarEvents: total,
          timelineCalendarEvents,
        };
      },
    );
  }

  async getCalendarEventsFromCompanyId({
    currentWorkspaceMemberId,
    companyId,
    workspaceId,
    page = 1,
    pageSize = TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE,
  }: {
    currentWorkspaceMemberId: string;
    companyId: string;
    workspaceId: string;
    page: number;
    pageSize: number;
  }): Promise<TimelineCalendarEventsWithTotalDTO> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const personRepository =
          await this.globalWorkspaceOrmManager.getRepository<PersonWorkspaceEntity>(
            workspaceId,
            'person',
            { shouldBypassPermissionChecks: true },
          );

        const personIds = await personRepository.find({
          where: {
            companyId,
          },
          select: {
            id: true,
          },
        });

        if (personIds.length <= 0) {
          return {
            totalNumberOfCalendarEvents: 0,
            timelineCalendarEvents: [],
          };
        }

        const formattedPersonIds = personIds.map(({ id }) => id);

        const calendarEvents = await this.getCalendarEventsFromPersonIds({
          currentWorkspaceMemberId,
          personIds: formattedPersonIds,
          workspaceId,
          page,
          pageSize,
        });

        return calendarEvents;
      },
    );
  }

  async getCalendarEventsFromProjectId({
    currentWorkspaceMemberId,
    projectId,
    workspaceId,
    page = 1,
    pageSize = TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE,
  }: {
    currentWorkspaceMemberId: string;
    projectId: string;
    workspaceId: string;
    page: number;
    pageSize: number;
  }): Promise<TimelineCalendarEventsWithTotalDTO> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const projectRepository =
          await this.globalWorkspaceOrmManager.getRepository<ProjectWorkspaceEntity>(
            workspaceId,
            'project',
            { shouldBypassPermissionChecks: true },
          );

        const project = await projectRepository.findOne({
          where: {
            id: projectId,
          },
          relations: {
            companies: true,
          },
        });

        const firstCompany = project?.companies?.[0];

        if (!firstCompany?.id) {
          return {
            totalNumberOfCalendarEvents: 0,
            timelineCalendarEvents: [],
          };
        }

        const calendarEvents = await this.getCalendarEventsFromCompanyId({
          currentWorkspaceMemberId,
          companyId: firstCompany.id,
          workspaceId,
          page,
          pageSize,
        });

        return calendarEvents;
      },
    );
  }
}
