import { randomUUID } from 'crypto';

import { COMPANY_GQL_FIELDS } from 'test/integration/constants/company-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { groupByOperationFactory } from 'test/integration/graphql/utils/group-by-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

describe('group-by resolvers - order by', () => {
  const testCompanyId1 = randomUUID();
  const testCompanyId2 = randomUUID();
  const testCompanyId3 = randomUUID();
  const testCompanyId4 = randomUUID();
  const testCompanyId5 = randomUUID();
  const testCompanyId6 = randomUUID();
  const testCompanyId7 = randomUUID();

  beforeAll(async () => {
    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS,
        data: {
          id: testCompanyId1,
          createdAt: '2025-03-03T09:30:00.000Z', // Monday
          address: { addressCity: 'Cuzco' },
          employees: 20,
        },
      }),
    );
    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS,
        data: {
          id: testCompanyId7,
          createdAt: '2025-03-03T09:30:00.000Z', // Monday
          address: { addressCity: 'Anvers' },
          employees: 19,
        },
      }),
    );

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS,
        data: {
          id: testCompanyId2,
          createdAt: '2025-03-03T09:30:00.000Z', // Monday
          address: { addressCity: 'Cuzco' },
          employees: 19,
        },
      }),
    );
    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS,
        data: {
          id: testCompanyId3,
          createdAt: '2025-03-03T09:30:00.000Z', // Monday
          address: { addressCity: 'Dallas' },
          employees: 2,
        },
      }),
    );
    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS,
        data: {
          id: testCompanyId4,
          createdAt: '2025-01-02T12:00:00.000Z', // Thursday
          address: { addressCity: 'Paris' },
          employees: 10,
        },
      }),
    );
    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS,
        data: {
          id: testCompanyId5,
          createdAt: '2025-01-08T08:00:00.000Z', // Wednesday
          address: { addressCity: 'Barcelona' },
          employees: 5,
        },
      }),
    );
    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS,
        data: {
          id: testCompanyId6,
          createdAt: '2025-01-08T08:00:00.000Z', // Wednesday
          address: { addressCity: 'Barcelona' },
          employees: 1,
        },
      }),
    );
  });

  afterAll(async () => {
    // cleanup created companies
    for (const id of [
      testCompanyId1,
      testCompanyId2,
      testCompanyId3,
      testCompanyId4,
      testCompanyId5,
      testCompanyId6,
      testCompanyId7,
    ]) {
      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: 'id',
          recordId: id,
        }),
      );
    }
  });

  const filter2025 = {
    and: [
      {
        createdAt: {
          gte: '2025-01-01T00:00:00.000Z',
        },
      },
      {
        createdAt: {
          lte: '2025-03-03T23:59:59.999Z',
        },
      },
    ],
  };

  const groupByAddressCreatedAtAndEmployees = (orderBy: object[]) => {
    return groupByOperationFactory({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      groupBy: [
        { address: { addressCity: true } },
        { createdAt: { granularity: 'DAY_OF_THE_WEEK' } },
        { employees: true },
      ],
      orderBy,
      filter: filter2025,
      gqlFields: `
        countId
      `,
    });
  };

  describe('valid cases', () => {
    it('should order results in the right order - createdAt, countId, addressCity', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByAddressCreatedAtAndEmployees([
          {
            createdAt: {
              granularity: 'DAY_OF_THE_WEEK',
              orderBy: 'AscNullsFirst',
            },
          },
          {
            aggregate: {
              countId: 'AscNullsFirst',
            },
          },
          {
            address: {
              addressCity: 'AscNullsFirst',
            },
          },
        ]),
      );

      const groups = response.body.data.companiesGroupBy;

      expect(groups).toBeDefined();
      expect(Array.isArray(groups)).toBe(true);

      // Extract group info for easier assertions
      const groupInfos = groups.map((g: any) => ({
        city: g.groupByDimensionValues?.[0],
        dayOfWeek: g.groupByDimensionValues?.[1],
        employees: g.groupByDimensionValues?.[2],
        countId: g.countId,
        totalCount: g.totalCount,
      }));

      // Order by dayOfWeek then countId then city
      expect(groupInfos).toEqual([
        {
          city: 'Anvers',
          dayOfWeek: 'Monday',
          employees: '19',
          countId: 1,
          totalCount: 1,
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          employees: '19',
          countId: 1,
          totalCount: 1,
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          employees: '20',
          countId: 1,
          totalCount: 1,
        },
        {
          city: 'Dallas',
          dayOfWeek: 'Monday',
          employees: '2',
          countId: 1,
          totalCount: 1,
        },
        {
          city: 'Paris',
          dayOfWeek: 'Thursday',
          employees: '10',
          countId: 1,
          totalCount: 1,
        },
        {
          city: 'Barcelona',
          dayOfWeek: 'Wednesday',
          employees: '1',
          countId: 1,
          totalCount: 1,
        },
        {
          city: 'Barcelona',
          dayOfWeek: 'Wednesday',
          employees: '5',
          countId: 1,
          totalCount: 1,
        },
      ]);
    });
    it('should order results in the right order - createdAt, addressCity, countId', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByAddressCreatedAtAndEmployees([
          {
            createdAt: {
              granularity: 'DAY_OF_THE_WEEK',
              orderBy: 'AscNullsFirst',
            },
          },
          {
            address: {
              addressCity: 'AscNullsFirst',
            },
          },
          {
            aggregate: {
              countId: 'AscNullsFirst',
            },
          },
        ]),
      );
      const groups = response.body.data.companiesGroupBy;

      expect(groups).toBeDefined();
      expect(Array.isArray(groups)).toBe(true);

      const groupInfos = groups.map((g: any) => ({
        city: g.groupByDimensionValues?.[0],
        dayOfWeek: g.groupByDimensionValues?.[1],
        employees: g.groupByDimensionValues?.[2],
        countId: g.countId,
        totalCount: g.totalCount,
      }));

      expect(groupInfos).toEqual([
        {
          city: 'Anvers',
          dayOfWeek: 'Monday',
          employees: '19',
          countId: 1,
          totalCount: 1,
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          employees: '19',
          countId: 1,
          totalCount: 1,
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          employees: '20',
          countId: 1,
          totalCount: 1,
        },
        {
          city: 'Dallas',
          dayOfWeek: 'Monday',
          employees: '2',
          countId: 1,
          totalCount: 1,
        },
        {
          city: 'Paris',
          dayOfWeek: 'Thursday',
          employees: '10',
          countId: 1,
          totalCount: 1,
        },
        {
          city: 'Barcelona',
          dayOfWeek: 'Wednesday',
          employees: '1',
          countId: 1,
          totalCount: 1,
        },
        {
          city: 'Barcelona',
          dayOfWeek: 'Wednesday',
          employees: '5',
          countId: 1,
          totalCount: 1,
        },
      ]);
    });
    it('should order results in the right order - addressCity, createdAt, countId', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByAddressCreatedAtAndEmployees([
          {
            address: {
              addressCity: 'AscNullsFirst',
            },
          },
          {
            createdAt: {
              granularity: 'DAY_OF_THE_WEEK',
              orderBy: 'AscNullsFirst',
            },
          },
          {
            aggregate: {
              countId: 'AscNullsFirst',
            },
          },
        ]),
      );
      const groups = response.body.data.companiesGroupBy;

      expect(groups).toBeDefined();
      expect(Array.isArray(groups)).toBe(true);

      const groupInfos = groups.map((g: any) => ({
        city: g.groupByDimensionValues?.[0],
        dayOfWeek: g.groupByDimensionValues?.[1],
        employees: g.groupByDimensionValues?.[2],
        countId: g.countId,
        totalCount: g.totalCount,
      }));

      expect(groupInfos).toEqual([
        {
          city: 'Anvers',
          dayOfWeek: 'Monday',
          employees: '19',
          countId: 1,
          totalCount: 1,
        },
        {
          city: 'Barcelona',
          dayOfWeek: 'Wednesday',
          employees: '1',
          countId: 1,
          totalCount: 1,
        },
        {
          city: 'Barcelona',
          dayOfWeek: 'Wednesday',
          employees: '5',
          countId: 1,
          totalCount: 1,
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          employees: '19',
          countId: 1,
          totalCount: 1,
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          employees: '20',
          countId: 1,
          totalCount: 1,
        },
        {
          city: 'Dallas',
          dayOfWeek: 'Monday',
          employees: '2',
          countId: 1,
          totalCount: 1,
        },
        {
          city: 'Paris',
          dayOfWeek: 'Thursday',
          employees: '10',
          countId: 1,
          totalCount: 1,
        },
      ]);
    });
    it('should order results in the right order - countId, createdAt, addressCity', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByAddressCreatedAtAndEmployees([
          {
            aggregate: {
              countId: 'AscNullsFirst',
            },
          },
          {
            createdAt: {
              granularity: 'DAY_OF_THE_WEEK',
              orderBy: 'AscNullsFirst',
            },
          },
          {
            address: {
              addressCity: 'AscNullsFirst',
            },
          },
        ]),
      );
      const groups = response.body.data.companiesGroupBy;

      expect(groups).toBeDefined();
      expect(Array.isArray(groups)).toBe(true);

      const groupInfos = groups.map((g: any) => ({
        city: g.groupByDimensionValues?.[0],
        dayOfWeek: g.groupByDimensionValues?.[1],
        employees: g.groupByDimensionValues?.[2],
        countId: g.countId,
        totalCount: g.totalCount,
      }));

      expect(groupInfos).toEqual([
        {
          city: 'Anvers',
          dayOfWeek: 'Monday',
          employees: '19',
          countId: 1,
          totalCount: 1,
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          employees: '19',
          countId: 1,
          totalCount: 1,
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          employees: '20',
          countId: 1,
          totalCount: 1,
        },
        {
          city: 'Dallas',
          dayOfWeek: 'Monday',
          employees: '2',
          countId: 1,
          totalCount: 1,
        },
        {
          city: 'Paris',
          dayOfWeek: 'Thursday',
          employees: '10',
          countId: 1,
          totalCount: 1,
        },
        {
          city: 'Barcelona',
          dayOfWeek: 'Wednesday',
          employees: '1',
          countId: 1,
          totalCount: 1,
        },
        {
          city: 'Barcelona',
          dayOfWeek: 'Wednesday',
          employees: '5',
          countId: 1,
          totalCount: 1,
        },
      ]);
    });
  });

  describe('invalid cases', () => {
    it('should fail if attempt to order by a field that is not part of the groupBy', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByAddressCreatedAtAndEmployees([{ name: 'AscNullsFirst' }]),
      );

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBe(1);
      expect(response.body.errors[0].message).toBe(
        'Cannot order by a field that is not an aggregate nor in groupBy criteria: name.',
      );
    });

    it('should fail if attempt to order by a date granularity that is not the same as in the groupBy', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByAddressCreatedAtAndEmployees([
          { createdAt: { granularity: 'MONTH', orderBy: 'AscNullsFirst' } },
        ]),
      );

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBe(1);
      expect(response.body.errors[0].message).toBe(
        'Cannot order by a date granularity that is not in groupBy criteria: MONTH',
      );
    });

    it('should fail if attempt to order by a date without indicating the granularity', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByAddressCreatedAtAndEmployees([
          { createdAt: { orderBy: 'AscNullsFirst' } },
        ]),
      );

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBe(1);
      expect(response.body.errors[0].message).toContain(
        'Cannot order by a field that is not in groupBy or that is not an aggregate field',
      );
    });

    it('should fail if attempt to indicate more than one orderBy field at the time (aggregate)', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByAddressCreatedAtAndEmployees([
          {
            aggregate: {
              countId: 'AscNullsFirst',
              sumEmployees: 'AscNullsFirst',
            },
          },
        ]),
      );

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBe(1);
      expect(response.body.errors[0].message).toBe(
        'Please provide aggregate criteria one by one in orderBy array',
      );
    });

    it('should fail if attempt to indicate more than one orderBy field at the time', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByAddressCreatedAtAndEmployees([
          {
            employees: 'AscNullsFirst',
            name: 'AscNullsFirst',
          },
        ]),
      );

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBe(1);
      expect(response.body.errors[0].message).toBe(
        'Please provide orderBy field criteria one by one in orderBy array',
      );
    });
  });
});
