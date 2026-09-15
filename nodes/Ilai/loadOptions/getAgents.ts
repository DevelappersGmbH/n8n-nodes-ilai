import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { ilaiApiRequest } from '../shared/transport';

type Agent = {
	id: number | null;
	sip_name: string | null;
	sip_display_name: string | null;
	process: string | null;
};

export async function getAgents(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const agents = (await ilaiApiRequest.call(this, 'GET', '/api/v1/agents/')) as Agent[];

	return (agents ?? [])
		.filter((agent) => agent.id !== null && agent.id !== undefined)
		.map((agent) => ({
			name:
				agent.sip_display_name ??
				agent.sip_name ??
				`${agent.process ?? 'Agent'} (${String(agent.id)})`,
			value: agent.id as number,
		}));
}
