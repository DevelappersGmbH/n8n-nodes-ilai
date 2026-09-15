import type { INodeProperties } from 'n8n-workflow';

import { idField, limitField, returnAllField } from '../../shared/descriptions';

const resource = ['redirect'];

const optionalRedirectFields: INodeProperties[] = [
	{
		displayName: 'Business Hours',
		name: 'businessHours',
		type: 'json',
		default: '{}',
		description: 'Business hours in which the redirect is used',
		routing: { send: { type: 'body', property: 'business_hours' } },
	},
	{
		displayName: 'Enabled',
		name: 'enabled',
		type: 'boolean',
		default: true,
		description: 'Whether the redirect is active',
		routing: { send: { type: 'body', property: 'enabled' } },
	},
	{
		displayName: 'Transfer Type',
		name: 'transferType',
		type: 'options',
		default: 'SIP',
		description: 'How the call is transferred',
		options: [
			{ name: 'Blind', value: 'BLIND' },
			{ name: 'SIP', value: 'SIP' },
		],
		routing: { send: { type: 'body', property: 'transfer_type' } },
	},
];

export const redirectDescription: INodeProperties[] = [
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
				action: 'Create a redirect',
				description: 'Create a new call redirect',
				routing: { request: { method: 'POST', url: '/api/v1/redirects/' } },
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a redirect',
				description: 'Delete a call redirect',
				routing: {
					request: { method: 'DELETE', url: '=/api/v1/redirects/{{ $parameter.redirectId }}' },
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a redirect',
				description: 'Get a single call redirect',
				routing: {
					request: { method: 'GET', url: '=/api/v1/redirects/{{ $parameter.redirectId }}' },
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many redirects',
				description: 'Get many call redirects',
				routing: { request: { method: 'GET', url: '/api/v1/redirects/' } },
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a redirect',
				description: 'Update an existing call redirect',
				routing: {
					request: { method: 'PUT', url: '=/api/v1/redirects/{{ $parameter.redirectId }}' },
				},
			},
		],
	},

	returnAllField({ resource, operation: ['getAll'] }),
	limitField({ resource, operation: ['getAll'] }),

	idField({
		displayName: 'Redirect ID',
		name: 'redirectId',
		default: 0,
		description: 'ID of the redirect',
		type: 'number',
		show: { resource, operation: ['delete', 'get', 'update'] },
	}),

	{
		displayName: 'Key',
		name: 'key',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. support',
		description: 'Key the agent uses to select this redirect',
		displayOptions: { show: { resource, operation: ['create', 'update'] } },
		routing: { send: { type: 'body', property: 'key' } },
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		description: 'Display name of the redirect',
		displayOptions: { show: { resource, operation: ['create', 'update'] } },
		routing: { send: { type: 'body', property: 'name' } },
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		default: '',
		required: true,
		description: 'Description of when the redirect is used',
		displayOptions: { show: { resource, operation: ['create', 'update'] } },
		routing: { send: { type: 'body', property: 'description' } },
	},
	{
		displayName: 'Number',
		name: 'number',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. +4930123456',
		description: 'Target the call is transferred to',
		displayOptions: { show: { resource, operation: ['create', 'update'] } },
		routing: { send: { type: 'body', property: 'number' } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource, operation: ['create', 'update'] } },
		options: optionalRedirectFields,
	},
];
