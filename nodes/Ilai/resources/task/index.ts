import type { INodeProperties } from 'n8n-workflow';

import { limitField, paginatedReturnAllField, returnAllField } from '../../shared/descriptions';

const resource = ['task'];

export const taskDescription: INodeProperties[] = [
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
				action: 'Get many scheduled tasks',
				description: 'Get many scheduled tasks',
				routing: { request: { method: 'GET', url: '/api/v1/tasks' } },
			},
			{
				name: 'Get Runs',
				value: 'getRuns',
				action: 'Get the runs of a scheduled task',
				description: 'Get the execution history of a scheduled task',
				routing: {
					request: {
						method: 'GET',
						url: '=/api/v1/tasks/{{ encodeURIComponent($parameter.taskId) }}/runs',
					},
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'runs' } }],
					},
				},
			},
			{
				name: 'Get Types',
				value: 'getTypes',
				action: 'Get the available task types',
				description: 'Get the task types that can be scheduled',
				routing: { request: { method: 'GET', url: '/api/v1/task-types' } },
			},
			{
				name: 'Run',
				value: 'run',
				action: 'Run a scheduled task',
				description: 'Trigger a scheduled task immediately',
				routing: {
					request: {
						method: 'POST',
						url: '=/api/v1/tasks/{{ encodeURIComponent($parameter.taskId) }}/run',
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a scheduled task',
				description: 'Update the schedule or parameters of a task',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/api/v1/tasks/{{ encodeURIComponent($parameter.taskId) }}',
					},
				},
			},
		],
	},

	returnAllField({ resource, operation: ['getAll', 'getTypes'] }),
	limitField({ resource, operation: ['getAll', 'getTypes'] }),

	{
		displayName: 'Task Name or ID',
		name: 'taskId',
		type: 'options',
		default: '',
		required: true,
		typeOptions: { loadOptionsMethod: 'getTasks' },
		description:
			'Scheduled task to act on. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: { show: { resource, operation: ['getRuns', 'run', 'update'] } },
	},

	// ----------------------------------
	//            task: getRuns
	// ----------------------------------
	paginatedReturnAllField({ resource, operation: ['getRuns'] }, { rootProperty: 'runs' }),
	limitField({ resource, operation: ['getRuns'] }, { queryParameter: 'limit' }),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource, operation: ['getRuns'] } },
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'string',
				default: '',
				placeholder: 'e.g. success',
				description: 'Only return runs with this status',
				routing: { send: { type: 'query', property: 'status' } },
			},
		],
	},

	// ----------------------------------
	//            task: update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource, operation: ['update'] } },
		options: [
			{
				displayName: 'Enabled',
				name: 'enabled',
				type: 'boolean',
				default: true,
				description: 'Whether the task is executed on its schedule',
				routing: { send: { type: 'body', property: 'enabled' } },
			},
			{
				displayName: 'Parameters',
				name: 'params',
				type: 'json',
				default: '{}',
				description: 'Parameters passed to the task',
				routing: { send: { type: 'body', property: 'params' } },
			},
			{
				displayName: 'Schedule Cron',
				name: 'scheduleCron',
				type: 'string',
				default: '',
				placeholder: 'e.g. 0 6 * * *',
				description: 'Cron expression the task runs on',
				routing: { send: { type: 'body', property: 'schedule_cron' } },
			},
			{
				displayName: 'Schedule Interval (Seconds)',
				name: 'scheduleIntervalSeconds',
				type: 'number',
				default: 0,
				description: 'Interval in seconds the task runs on',
				routing: { send: { type: 'body', property: 'schedule_interval_seconds' } },
			},
		],
	},
];
