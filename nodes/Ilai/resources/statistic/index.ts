import type { INodeProperties } from 'n8n-workflow';

import { limitField, paginatedReturnAllField } from '../../shared/descriptions';

const resource = ['statistic'];

const dateRangeOptions: INodeProperties[] = [
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'dateTime',
		default: '',
		description: 'Only include statistics up to this date',
		routing: { send: { type: 'query', property: 'end_date' } },
	},
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'dateTime',
		default: '',
		description: 'Only include statistics from this date on',
		routing: { send: { type: 'query', property: 'start_date' } },
	},
];

/**
 * Statistics feed the cockpit dashboards. Writing entries from a workflow would distort the
 * reported numbers, so only the read operations are exposed; the regeneration and synthetic data
 * endpoints are left out entirely.
 */
export const statisticDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'getAll',
		displayOptions: { show: { resource } },
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many statistic entries',
				description: 'Get many statistic entries',
				routing: { request: { method: 'GET', url: '/api/v1/statistics/' } },
			},
			{
				name: 'Get Summary',
				value: 'getSummary',
				action: 'Get the dashboard summary',
				description: 'Get the aggregated dashboard summary',
				routing: { request: { method: 'GET', url: '/api/v1/statistics/summary' } },
			},
		],
	},

	paginatedReturnAllField({ resource, operation: ['getAll'] }, { offsetParameter: 'skip' }),
	limitField({ resource, operation: ['getAll'] }, { queryParameter: 'limit' }),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource, operation: ['getAll', 'getSummary'] } },
		options: dateRangeOptions,
	},
];
