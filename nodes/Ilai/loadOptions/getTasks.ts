import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { ilaiApiRequest } from '../shared/transport';

type ScheduledTask = {
	id: string;
	name: string;
	task_type: string;
};

export async function getTasks(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const tasks = (await ilaiApiRequest.call(this, 'GET', '/api/v1/tasks')) as ScheduledTask[];

	return (tasks ?? []).map((task) => ({
		name: task.name,
		value: task.id,
		description: task.task_type,
	}));
}
