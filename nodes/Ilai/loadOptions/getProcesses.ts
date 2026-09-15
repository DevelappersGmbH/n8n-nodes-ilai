import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { ilaiApiRequest } from '../shared/transport';

export async function getProcesses(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const processes = (await ilaiApiRequest.call(
		this,
		'GET',
		'/api/v1/process/unique',
	)) as string[];

	return (processes ?? [])
		.filter((process) => Boolean(process))
		.map((process) => ({ name: process, value: process }));
}
