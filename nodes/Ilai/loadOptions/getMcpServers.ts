import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { ilaiApiRequest } from '../shared/transport';

type McpServer = {
	id: number | null;
	name: string;
};

export async function getMcpServers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const servers = (await ilaiApiRequest.call(this, 'GET', '/api/v1/mcp/servers')) as McpServer[];

	return (servers ?? [])
		.filter((server) => server.id !== null && server.id !== undefined)
		.map((server) => ({ name: server.name, value: server.id as number }));
}
