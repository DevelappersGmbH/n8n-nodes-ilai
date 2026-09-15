import type { IDisplayOptions, INodeProperties } from 'n8n-workflow';

import { PAGE_SIZE } from './constants';

type Show = NonNullable<IDisplayOptions['show']>;

/**
 * "Return All" toggle for endpoints that return the full collection in one response.
 * The limit is applied by n8n on the returned items.
 */
export function returnAllField(show: Show): INodeProperties {
	return {
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show },
	};
}

/**
 * "Return All" toggle for endpoints that support offset based pagination.
 */
export function paginatedReturnAllField(
	show: Show,
	options: { limitParameter?: string; offsetParameter?: string; rootProperty?: string } = {},
): INodeProperties {
	const { limitParameter = 'limit', offsetParameter = 'offset', rootProperty } = options;

	return {
		...returnAllField(show),
		routing: {
			send: { paginate: '={{ $value }}' },
			operations: {
				pagination: {
					type: 'offset',
					properties: {
						limitParameter,
						offsetParameter,
						pageSize: PAGE_SIZE,
						rootProperty,
						type: 'query',
					},
				},
			},
		},
	};
}

/**
 * Limit field. When `queryParameter` is set the limit is pushed down to the API,
 * otherwise the response is truncated by n8n.
 */
export function limitField(
	show: Show,
	options: { queryParameter?: string; maxValue?: number } = {},
): INodeProperties {
	const { queryParameter, maxValue = 1000 } = options;

	return {
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: { minValue: 1, maxValue },
		description: 'Max number of results to return',
		displayOptions: { show: { ...show, returnAll: [false] } },
		routing: {
			...(queryParameter ? { send: { type: 'query', property: queryParameter } } : {}),
			output: { maxResults: '={{ $value }}' },
		},
	};
}

/**
 * Required resource identifier used in the URL of an operation.
 */
export function idField(config: {
	displayName: string;
	name: string;
	description: string;
	default: string | number;
	show: Show;
	type?: 'string' | 'number';
	placeholder?: string;
}): INodeProperties {
	const { displayName, name, description, show, type = 'string', placeholder } = config;

	return {
		displayName,
		name,
		type,
		default: config.default,
		required: true,
		...(placeholder ? { placeholder } : {}),
		description,
		displayOptions: { show },
	};
}

/**
 * Process picker backed by the processes configured in the ILAI cockpit.
 */
export function processSelect(
	config: {
		show: Show;
		name?: string;
		required?: boolean;
		sendAs?: 'body' | 'query';
		property?: string;
	} = {} as never,
): INodeProperties {
	const { show, name = 'process', required = false, sendAs, property = 'process' } = config;

	return {
		displayName: 'Process Name or ID',
		name,
		type: 'options',
		default: '',
		required,
		typeOptions: { loadOptionsMethod: 'getProcesses' },
		description:
			'Process the entry belongs to. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: { show },
		...(sendAs ? { routing: { send: { type: sendAs, property } } } : {}),
	};
}

/**
 * Free text process field, used where a new process name may be created on the fly.
 */
export function processTextField(config: {
	show: Show;
	required?: boolean;
	sendAs?: 'body' | 'query';
	property?: string;
}): INodeProperties {
	const { show, required = false, sendAs = 'body', property = 'process' } = config;

	return {
		displayName: 'Process',
		name: 'process',
		type: 'string',
		default: '',
		required,
		placeholder: 'e.g. Default',
		description: 'Name of the process this entry belongs to',
		displayOptions: { show },
		routing: { send: { type: sendAs, property } },
	};
}
