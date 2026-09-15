import type { INodeProperties } from 'n8n-workflow';

import { limitField, returnAllField } from '../../shared/descriptions';

const resource = ['agent'];

/**
 * Agents carry the SIP registration of the telephony infrastructure. Creating, updating or
 * deleting them from a workflow can take the phone system offline, so only the read operations are
 * exposed. Use the HTTP Request node for administrative changes.
 */
export const agentDescription: INodeProperties[] = [
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
				action: 'Get an agent',
				description: 'Get a single agent',
				routing: { request: { method: 'GET', url: '=/api/v1/agents/{{ $parameter.agentId }}' } },
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many agents',
				description: 'Get many agents',
				routing: { request: { method: 'GET', url: '/api/v1/agents/' } },
			},
		],
	},

	returnAllField({ resource, operation: ['getAll'] }),
	limitField({ resource, operation: ['getAll'] }),

	{
		displayName: 'Agent Name or ID',
		name: 'agentId',
		type: 'options',
		default: '',
		required: true,
		typeOptions: { loadOptionsMethod: 'getAgents' },
		description:
			'Agent to look up. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: { show: { resource, operation: ['get'] } },
	},
];
