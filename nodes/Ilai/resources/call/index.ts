import type { INodeProperties } from 'n8n-workflow';

import {
	idField,
	limitField,
	paginatedReturnAllField,
	processSelect,
} from '../../shared/descriptions';

const resource = ['call'];

/**
 * Calls are the conversation record of the platform. The endpoints that write into an existing
 * call (`PUT /calls/{id}`, `POST /calls/{id}/history`, `POST /calls/{id}/metrics`) belong to the
 * voice pipeline and are deliberately not exposed here, so a workflow cannot rewrite a transcript,
 * its metadata or its latency metrics. Use the HTTP Request node if you really need them.
 */
export const callDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'getAll',
		displayOptions: { show: { resource } },
		options: [
			{
				name: 'Create Outbound',
				value: 'createOutbound',
				action: 'Create an outbound call',
				description: 'Start an outbound call to a phone number',
				routing: {
					request: {
						method: 'POST',
						url: '/api/v1/call/outbound',
					},
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a call',
				description: 'Permanently delete a call including its recordings',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/api/v1/calls/{{ encodeURIComponent($parameter.callId) }}',
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a call',
				description: 'Get a single call including its conversation history',
				routing: {
					request: {
						method: 'GET',
						url: '=/api/v1/calls/{{ encodeURIComponent($parameter.callId) }}',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many calls',
				description: 'Get many calls',
				routing: {
					request: {
						method: 'GET',
						url: '/api/v1/calls/',
					},
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'items' } }],
					},
				},
			},
			{
				name: 'Get Metrics',
				value: 'getMetrics',
				action: 'Get metrics of a call',
				description: 'Get the recorded metrics of a call',
				routing: {
					request: {
						method: 'GET',
						url: '=/api/v1/calls/{{ encodeURIComponent($parameter.callId) }}/metrics',
					},
				},
			},
			{
				name: 'Get Recordings',
				value: 'getRecordings',
				action: 'Get recordings of a call',
				description: 'List the audio recordings of a call',
				routing: {
					request: {
						method: 'GET',
						url: '=/api/v1/calls/{{ encodeURIComponent($parameter.callId) }}/recordings',
					},
				},
			},
		],
	},

	// ----------------------------------
	//            call: getAll
	// ----------------------------------
	paginatedReturnAllField({ resource, operation: ['getAll'] }, { rootProperty: 'items' }),
	limitField({ resource, operation: ['getAll'] }, { queryParameter: 'limit' }),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource, operation: ['getAll'] } },
		options: [
			{
				displayName: 'From',
				name: 'from',
				type: 'dateTime',
				default: '',
				description: 'Only return calls that started at or after this date',
				routing: { send: { type: 'query', property: 'from' } },
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Full text search across caller number, topic and transcript',
				routing: { send: { type: 'query', property: 'search' } },
			},
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'options',
				default: 'time',
				description: 'Field to sort the calls by',
				options: [
					{ name: 'Duration', value: 'duration' },
					{ name: 'Status', value: 'status' },
					{ name: 'Time', value: 'time' },
					{ name: 'Topic', value: 'topic' },
				],
				routing: { send: { type: 'query', property: 'sort_by' } },
			},
			{
				displayName: 'Sort Order',
				name: 'sortOrder',
				type: 'options',
				default: 'desc',
				description: 'Direction to sort the calls in',
				options: [
					{ name: 'Ascending', value: 'asc' },
					{ name: 'Descending', value: 'desc' },
				],
				routing: { send: { type: 'query', property: 'sort_order' } },
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'string',
				default: '',
				placeholder: 'e.g. completed',
				description: 'Only return calls with this status',
				routing: { send: { type: 'query', property: 'status' } },
			},
			{
				displayName: 'To',
				name: 'to',
				type: 'dateTime',
				default: '',
				description: 'Only return calls that started at or before this date',
				routing: { send: { type: 'query', property: 'to' } },
			},
		],
	},

	// ----------------------------------
	//      operations with a call ID
	// ----------------------------------
	idField({
		displayName: 'Call ID',
		name: 'callId',
		default: '',
		description: 'ID of the call',
		show: {
			resource,
			operation: ['delete', 'get', 'getMetrics', 'getRecordings'],
		},
	}),

	// ----------------------------------
	//        call: createOutbound
	// ----------------------------------
	{
		displayName: 'Phone Number',
		name: 'phoneNumber',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. +4930123456',
		description: 'Phone number to call',
		displayOptions: { show: { resource, operation: ['createOutbound'] } },
		routing: { send: { type: 'body', property: 'phone_number' } },
	},
	processSelect({
		show: { resource, operation: ['createOutbound'] },
		required: true,
		sendAs: 'body',
	}),
];
