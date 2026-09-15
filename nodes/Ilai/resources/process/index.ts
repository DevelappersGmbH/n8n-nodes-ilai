import type { INodeProperties } from 'n8n-workflow';

import { idField, limitField, returnAllField } from '../../shared/descriptions';

const resource = ['process'];

const processFields: INodeProperties[] = [
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		typeOptions: { rows: 3 },
		default: '',
		description: 'Description of the process',
		routing: { send: { type: 'body', property: 'description' } },
	},
	{
		displayName: 'Persona',
		name: 'persona',
		type: 'json',
		default: '{}',
		description: 'Persona configuration of the process',
		routing: { send: { type: 'body', property: 'persona' } },
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'boolean',
		default: true,
		description: 'Whether the process is active',
		routing: { send: { type: 'body', property: 'status' } },
	},
	{
		displayName: 'Steps',
		name: 'steps',
		type: 'string',
		typeOptions: { multipleValues: true, multipleValueButtonText: 'Add Step' },
		default: [],
		description: 'Ordered steps the agent works through',
		routing: { send: { type: 'body', property: 'steps' } },
	},
];

export const processDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'getAll',
		displayOptions: { show: { resource } },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a process',
				description: 'Create a new process',
				routing: { request: { method: 'POST', url: '/api/v1/process/' } },
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a process',
				description: 'Delete a process',
				routing: {
					request: { method: 'DELETE', url: '=/api/v1/process/{{ $parameter.processId }}' },
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a process',
				description: 'Get a single process',
				routing: {
					request: { method: 'GET', url: '=/api/v1/process/{{ $parameter.processId }}' },
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many processes',
				description: 'Get many processes',
				routing: { request: { method: 'GET', url: '/api/v1/process/' } },
			},
			{
				name: 'Get Names',
				value: 'getUnique',
				action: 'Get the distinct process names',
				description: 'Get the distinct names of all configured processes',
				routing: {
					request: { method: 'GET', url: '/api/v1/process/unique' },
					output: {
						postReceive: [{ type: 'setKeyValue', properties: { name: '={{ $responseItem }}' } }],
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a process',
				description: 'Update an existing process',
				routing: {
					request: { method: 'PUT', url: '=/api/v1/process/{{ $parameter.processId }}' },
				},
			},
		],
	},

	returnAllField({ resource, operation: ['getAll'] }),
	limitField({ resource, operation: ['getAll'] }),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource, operation: ['getAll'] } },
		options: [
			{
				displayName: 'Process Name or ID',
				name: 'process',
				type: 'options',
				default: '',
				typeOptions: { loadOptionsMethod: 'getProcesses' },
				description:
					'Only return process definitions with this name. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				routing: { send: { type: 'query', property: 'process' } },
			},
		],
	},

	idField({
		displayName: 'Process ID',
		name: 'processId',
		default: 0,
		description: 'ID of the process',
		type: 'number',
		show: { resource, operation: ['delete', 'get', 'update'] },
	}),

	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. Default',
		description: 'Name of the process',
		displayOptions: { show: { resource, operation: ['create'] } },
		routing: { send: { type: 'body', property: 'name' } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource, operation: ['create'] } },
		options: processFields,
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource, operation: ['update'] } },
		options: [
			processFields[0],
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name of the process',
				routing: { send: { type: 'body', property: 'name' } },
			},
			...processFields.slice(1),
		],
	},
];
