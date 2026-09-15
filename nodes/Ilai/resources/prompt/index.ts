import type { INodeProperties } from 'n8n-workflow';

import { idField, limitField, processTextField, returnAllField } from '../../shared/descriptions';

const resource = ['prompt'];

export const promptDescription: INodeProperties[] = [
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
				action: 'Create a prompt',
				description: 'Create a new prompt',
				routing: { request: { method: 'POST', url: '/api/v1/prompt/' } },
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a prompt',
				description: 'Delete a prompt',
				routing: {
					request: { method: 'DELETE', url: '=/api/v1/prompt/{{ $parameter.promptId }}' },
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many prompts',
				description: 'Get many prompts',
				routing: { request: { method: 'GET', url: '/api/v1/prompt/' } },
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a prompt',
				description: 'Update an existing prompt',
				routing: { request: { method: 'PUT', url: '=/api/v1/prompt/{{ $parameter.promptId }}' } },
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
					'Only return prompts of this process. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				routing: { send: { type: 'query', property: 'process' } },
			},
		],
	},

	idField({
		displayName: 'Prompt ID',
		name: 'promptId',
		default: 0,
		description: 'ID of the prompt',
		type: 'number',
		show: { resource, operation: ['delete', 'update'] },
	}),

	{
		displayName: 'Prompt',
		name: 'prompt',
		type: 'string',
		typeOptions: { rows: 8 },
		default: '',
		required: true,
		description: 'System prompt used by the agent',
		displayOptions: { show: { resource, operation: ['create'] } },
		routing: { send: { type: 'body', property: 'prompt' } },
	},
	processTextField({ show: { resource, operation: ['create'] }, required: true }),

	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource, operation: ['update'] } },
		options: [
			{
				displayName: 'Process',
				name: 'process',
				type: 'string',
				default: '',
				description: 'Name of the process this prompt belongs to',
				routing: { send: { type: 'body', property: 'process' } },
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				typeOptions: { rows: 8 },
				default: '',
				description: 'System prompt used by the agent',
				routing: { send: { type: 'body', property: 'prompt' } },
			},
		],
	},
];
