import type { INodeProperties } from 'n8n-workflow';

import {
	idField,
	limitField,
	processSelect,
	processTextField,
	returnAllField,
} from '../../shared/descriptions';

const resource = ['faq'];

export const faqDescription: INodeProperties[] = [
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
				action: 'Create a FAQ entry',
				description: 'Create a new FAQ entry',
				routing: { request: { method: 'POST', url: '/api/v1/faq/' } },
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a FAQ entry',
				description: 'Delete a FAQ entry',
				routing: { request: { method: 'DELETE', url: '=/api/v1/faq/{{ $parameter.faqId }}' } },
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many FAQ entries',
				description: 'Get many FAQ entries',
				routing: { request: { method: 'GET', url: '/api/v1/faq/' } },
			},
			{
				name: 'Get Processes',
				value: 'getProcesses',
				action: 'Get processes used in FAQ entries',
				description: 'Get the distinct processes that FAQ entries are assigned to',
				routing: {
					request: { method: 'GET', url: '/api/v1/faq/processes' },
					output: {
						postReceive: [
							{ type: 'setKeyValue', properties: { process: '={{ $responseItem }}' } },
						],
					},
				},
			},
			{
				name: 'Query',
				value: 'query',
				action: 'Query the FAQ knowledge base',
				description: 'Ask the FAQ knowledge base a question',
				routing: { request: { method: 'POST', url: '/api/v1/faq/query' } },
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a FAQ entry',
				description: 'Update an existing FAQ entry',
				routing: { request: { method: 'PUT', url: '=/api/v1/faq/{{ $parameter.faqId }}' } },
			},
		],
	},

	// ----------------------------------
	//             faq: getAll
	// ----------------------------------
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
					'Only return FAQ entries of this process. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				routing: { send: { type: 'query', property: 'process' } },
			},
		],
	},

	// ----------------------------------
	//        faq: create / update
	// ----------------------------------
	idField({
		displayName: 'FAQ ID',
		name: 'faqId',
		default: 0,
		description: 'ID of the FAQ entry',
		type: 'number',
		show: { resource, operation: ['delete', 'update'] },
	}),
	{
		displayName: 'Topic',
		name: 'topic',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. Opening hours',
		description: 'Topic or question of the FAQ entry',
		displayOptions: { show: { resource, operation: ['create'] } },
		routing: { send: { type: 'body', property: 'topic' } },
	},
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		typeOptions: { rows: 5 },
		default: '',
		required: true,
		description: 'Answer text of the FAQ entry',
		displayOptions: { show: { resource, operation: ['create'] } },
		routing: { send: { type: 'body', property: 'text' } },
	},
	processTextField({ show: { resource, operation: ['create'] }, required: true }),
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource, operation: ['create'] } },
		options: [
			{
				displayName: 'Source',
				name: 'source',
				type: 'string',
				default: '',
				description: 'Source the FAQ entry was imported from',
				routing: { send: { type: 'body', property: 'source' } },
			},
		],
	},
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
				description: 'Name of the process this entry belongs to',
				routing: { send: { type: 'body', property: 'process' } },
			},
			{
				displayName: 'Source',
				name: 'source',
				type: 'string',
				default: '',
				description: 'Source the FAQ entry was imported from',
				routing: { send: { type: 'body', property: 'source' } },
			},
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				typeOptions: { rows: 5 },
				default: '',
				description: 'Answer text of the FAQ entry',
				routing: { send: { type: 'body', property: 'text' } },
			},
			{
				displayName: 'Topic',
				name: 'topic',
				type: 'string',
				default: '',
				description: 'Topic or question of the FAQ entry',
				routing: { send: { type: 'body', property: 'topic' } },
			},
		],
	},

	// ----------------------------------
	//             faq: query
	// ----------------------------------
	{
		displayName: 'Call ID',
		name: 'callId',
		type: 'string',
		default: '',
		required: true,
		description: 'ID of the call or chat session the question belongs to',
		displayOptions: { show: { resource, operation: ['query'] } },
		routing: { send: { type: 'body', property: 'call_id' } },
	},
	{
		displayName: 'Messages',
		name: 'messages',
		type: 'json',
		default: '[\n  {\n    "role": "User",\n    "text": ""\n  }\n]',
		required: true,
		typeOptions: { rows: 5 },
		description: 'Conversation messages to send to the knowledge base',
		displayOptions: { show: { resource, operation: ['query'] } },
		routing: { send: { type: 'body', property: 'messages' } },
	},
	processSelect({ show: { resource, operation: ['query'] }, sendAs: 'body' }),
];
