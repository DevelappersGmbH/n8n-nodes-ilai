import type { INodeProperties } from 'n8n-workflow';

import { idField, limitField, processTextField, returnAllField } from '../../shared/descriptions';

const resource = ['utterance'];

export const utteranceDescription: INodeProperties[] = [
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
				action: 'Create an utterance',
				description: 'Create a new utterance or update an existing one with the same keyword',
				routing: { request: { method: 'POST', url: '/api/v1/utterances/' } },
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete an utterance',
				description: 'Delete an utterance',
				routing: {
					request: { method: 'DELETE', url: '=/api/v1/utterances/{{ $parameter.utteranceId }}' },
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get an utterance',
				description: 'Get a single utterance',
				routing: {
					request: { method: 'GET', url: '=/api/v1/utterances/{{ $parameter.utteranceId }}' },
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many utterances',
				description: 'Get many utterances',
				routing: { request: { method: 'GET', url: '/api/v1/utterances/' } },
			},
			{
				name: 'Preview',
				value: 'preview',
				action: 'Preview an utterance',
				description: 'Render an audio preview of the utterance',
				routing: {
					request: {
						method: 'POST',
						url: '=/api/v1/utterances/{{ $parameter.utteranceId }}/preview',
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update an utterance',
				description: 'Update an existing utterance',
				routing: {
					request: { method: 'PUT', url: '=/api/v1/utterances/{{ $parameter.utteranceId }}' },
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
					'Only return utterances of this process. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				routing: { send: { type: 'query', property: 'process' } },
			},
		],
	},

	idField({
		displayName: 'Utterance ID',
		name: 'utteranceId',
		default: 0,
		description: 'ID of the utterance',
		type: 'number',
		show: { resource, operation: ['delete', 'get', 'preview', 'update'] },
	}),

	{
		displayName: 'Keyword',
		name: 'keyword',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. greeting',
		description: 'Keyword the utterance is referenced by',
		displayOptions: { show: { resource, operation: ['create'] } },
		routing: { send: { type: 'body', property: 'keyword' } },
	},
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		typeOptions: { rows: 3 },
		default: '',
		required: true,
		description: 'Text the agent says for this utterance',
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
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of when the utterance is used',
				routing: { send: { type: 'body', property: 'description' } },
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
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of when the utterance is used',
				routing: { send: { type: 'body', property: 'description' } },
			},
			{
				displayName: 'Keyword',
				name: 'keyword',
				type: 'string',
				default: '',
				description: 'Keyword the utterance is referenced by',
				routing: { send: { type: 'body', property: 'keyword' } },
			},
			{
				displayName: 'Process',
				name: 'process',
				type: 'string',
				default: '',
				description: 'Name of the process this utterance belongs to',
				routing: { send: { type: 'body', property: 'process' } },
			},
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				typeOptions: { rows: 3 },
				default: '',
				description: 'Text the agent says for this utterance',
				routing: { send: { type: 'body', property: 'text' } },
			},
		],
	},
];
