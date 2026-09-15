import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { ilaiApiRequest } from '../shared/transport';

type McpTool = {
	id: number | null;
	server_id: number;
	name: string;
	description: string | null;
};

export async function getMcpTools(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const serverId = this.getNodeParameter('serverId', 0) as number | string;

	const tools = (await ilaiApiRequest.call(this, 'GET', '/api/v1/mcp/tools', {
		server_id: serverId,
	})) as McpTool[];

	return (tools ?? []).map((tool) => ({
		name: tool.name,
		value: tool.name,
		description: tool.description ?? undefined,
	}));
}
