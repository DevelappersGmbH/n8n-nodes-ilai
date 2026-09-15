import type { INodeProperties } from 'n8n-workflow';

import { idField, limitField, returnAllField } from '../../shared/descriptions';

const resource = ['configuration'];

/**
 * Configuration entries drive the running platform (TTS, telephony, model settings) and the API
 * key generation creates credentials. Both are read-only here on purpose: a workflow should not be
 * able to reconfigure or lock out the live system. Use the HTTP Request node for administrative
 * changes.
 */
export const configurationDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'getAll',
		displayOptions: { show: { resource } },
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a configuration entry',
				description: 'Get a single configuration entry',
				routing: {
					request: { method: 'GET', url: '=/api/v1/configuration/{{ $parameter.configId }}' },
				},
			},
			{
				name: 'Get By Key',
				value: 'getByKey',
				action: 'Get configuration entries by key',
				description: 'Get the configuration entries with a given key',
				routing: { request: { method: 'GET', url: '/api/v1/configuration/key/' } },
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many configuration entries',
				description: 'Get many configuration entries',
				routing: { request: { method: 'GET', url: '/api/v1/configuration/' } },
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
				displayName: 'Category',
				name: 'category',
				type: 'string',
				default: '',
				placeholder: 'e.g. tts',
				description: 'Only return entries of this category',
				routing: { send: { type: 'query', property: 'category' } },
			},
		],
	},

	idField({
		displayName: 'Configuration ID',
		name: 'configId',
		default: 0,
		description: 'ID of the configuration entry',
		type: 'number',
		show: { resource, operation: ['get'] },
	}),

	{
		displayName: 'Key',
		name: 'key',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. TTS_VOICE',
		description: 'Key of the configuration entry',
		displayOptions: { show: { resource, operation: ['getByKey'] } },
		routing: { send: { type: 'query', property: 'key' } },
	},
];
