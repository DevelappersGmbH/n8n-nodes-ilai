import type { INodeProperties } from 'n8n-workflow';

import { limitField, returnAllField } from '../../shared/descriptions';

const resource = ['mcp'];

const serverSelect: INodeProperties = {
	displayName: 'Server Name or ID',
	name: 'serverId',
	type: 'options',
	default: '',
	required: true,
	typeOptions: { loadOptionsMethod: 'getMcpServers' },
	description:
		'MCP server to use. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	displayOptions: { show: { resource, operation: ['executeTool', 'refreshTools'] } },
};

export const mcpDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'getTools',
		displayOptions: { show: { resource } },
		options: [
			{
				name: 'Execute Tool',
				value: 'executeTool',
				action: 'Execute an MCP tool',
				description: 'Execute a tool on an MCP server',
				routing: {
					request: {
						method: 'POST',
						url: '=/api/v1/mcp/servers/{{ $parameter.serverId }}/execute',
					},
				},
			},
			{
				name: 'Get Servers',
				value: 'getServers',
				action: 'Get many MCP servers',
				description: 'Get many configured MCP servers',
				routing: { request: { method: 'GET', url: '/api/v1/mcp/servers' } },
			},
			{
				name: 'Get Tools',
				value: 'getTools',
				action: 'Get many MCP tools',
				description: 'Get the tools exposed by the configured MCP servers',
				routing: { request: { method: 'GET', url: '/api/v1/mcp/tools' } },
			},
			{
				name: 'Refresh Tools',
				value: 'refreshTools',
				action: 'Refresh the tools of an MCP server',
				description: 'Reload the tool list from an MCP server',
				routing: {
					request: {
						method: 'POST',
						url: '=/api/v1/mcp/servers/{{ $parameter.serverId }}/refresh',
					},
				},
			},
		],
	},

	returnAllField({ resource, operation: ['getServers', 'getTools'] }),
	limitField({ resource, operation: ['getServers', 'getTools'] }),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource, operation: ['getTools'] } },
		options: [
			{
				displayName: 'Server Name or ID',
				name: 'serverId',
				type: 'options',
				default: '',
				typeOptions: { loadOptionsMethod: 'getMcpServers' },
				description:
					'Only return tools of this server. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				routing: { send: { type: 'query', property: 'server_id' } },
			},
		],
	},

	serverSelect,
	{
		displayName: 'Tool Name or ID',
		name: 'toolName',
		type: 'options',
		default: '',
		required: true,
		typeOptions: { loadOptionsMethod: 'getMcpTools', loadOptionsDependsOn: ['serverId'] },
		description:
			'Tool to execute. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: { show: { resource, operation: ['executeTool'] } },
		routing: { send: { type: 'body', property: 'tool_name' } },
	},
	{
		displayName: 'Arguments',
		name: 'arguments',
		type: 'json',
		default: '{}',
		description: 'Arguments passed to the tool',
		displayOptions: { show: { resource, operation: ['executeTool'] } },
		routing: { send: { type: 'body', property: 'arguments' } },
	},
];
