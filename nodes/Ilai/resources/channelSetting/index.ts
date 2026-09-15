import type { INodeProperties } from 'n8n-workflow';

import { idField, limitField, returnAllField } from '../../shared/descriptions';

const resource = ['channelSetting'];

export const channelSettingDescription: INodeProperties[] = [
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
				action: 'Create a channel setting',
				description: 'Create a new channel setting',
				routing: { request: { method: 'POST', url: '/api/v1/channel-setting/' } },
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a channel setting',
				description: 'Delete a channel setting',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/api/v1/channel-setting/{{ $parameter.channelSettingId }}',
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a channel setting',
				description: 'Get a single channel setting',
				routing: {
					request: {
						method: 'GET',
						url: '=/api/v1/channel-setting/{{ $parameter.channelSettingId }}',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many channel settings',
				description: 'Get many channel settings',
				routing: { request: { method: 'GET', url: '/api/v1/channel-setting/' } },
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a channel setting',
				description: 'Update an existing channel setting',
				routing: {
					request: {
						method: 'PUT',
						url: '=/api/v1/channel-setting/{{ $parameter.channelSettingId }}',
					},
				},
			},
		],
	},

	returnAllField({ resource, operation: ['getAll'] }),
	limitField({ resource, operation: ['getAll'] }),

	idField({
		displayName: 'Channel Setting ID',
		name: 'channelSettingId',
		default: 0,
		description: 'ID of the channel setting',
		type: 'number',
		show: { resource, operation: ['delete', 'get', 'update'] },
	}),

	{
		displayName: 'Channel',
		name: 'channel',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. phone',
		description: 'Channel the setting applies to',
		displayOptions: { show: { resource, operation: ['create', 'update'] } },
		routing: { send: { type: 'body', property: 'channel' } },
	},
	{
		displayName: 'Preamble',
		name: 'preamble',
		type: 'string',
		typeOptions: { rows: 5 },
		default: '',
		required: true,
		description: 'Preamble the agent uses on this channel',
		displayOptions: { show: { resource, operation: ['create', 'update'] } },
		routing: { send: { type: 'body', property: 'preamble' } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource, operation: ['create', 'update'] } },
		options: [
			{
				displayName: 'Default Process Name or ID',
				name: 'defaultProcess',
				type: 'options',
				default: '',
				typeOptions: { loadOptionsMethod: 'getProcesses' },
				description:
					'Process used when no other process matches. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				routing: { send: { type: 'body', property: 'default_process' } },
			},
		],
	},
];
