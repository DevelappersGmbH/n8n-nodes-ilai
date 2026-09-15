import type {
	INodeProperties,
	INodePropertyOptions,
	INodePropertyCollection,
	INodeTypeDescription,
} from 'n8n-workflow';

import { Ilai } from '../../nodes/Ilai/Ilai.node';

export const ilai = new Ilai();
export const description: INodeTypeDescription = ilai.description;

export type OperationOption = INodePropertyOptions & {
	action?: string;
	routing?: {
		request?: { method?: string; url?: string };
		output?: { postReceive?: unknown[] };
	};
};

export type SendTarget = { type: string; property: string; parameterName: string };

function isPropertyOptions(
	option: INodePropertyOptions | INodeProperties | INodePropertyCollection,
): option is INodePropertyOptions {
	return 'value' in option;
}

export const properties = description.properties;

export const resourceProperty = properties.find(
	(property) => property.name === 'resource',
) as INodeProperties;

export const resourceValues = (resourceProperty.options ?? [])
	.filter(isPropertyOptions)
	.map((option) => String(option.value));

/** All properties that are shown for the given resource (and optionally operation). */
function isVisibleFor(property: INodeProperties, resource: string, operation?: string): boolean {
	const show = property.displayOptions?.show;
	if (!show) return false;

	const resources = show.resource as string[] | undefined;
	if (!resources?.includes(resource)) return false;

	if (operation === undefined) return true;

	const operations = show.operation as string[] | undefined;
	return operations === undefined || operations.includes(operation);
}

export function operationPropertyFor(resource: string): INodeProperties {
	const property = properties.find(
		(candidate) => candidate.name === 'operation' && isVisibleFor(candidate, resource),
	);

	if (!property) throw new Error(`No operation property found for resource "${resource}"`);

	return property;
}

export function operationsFor(resource: string): OperationOption[] {
	return (operationPropertyFor(resource).options ?? []).filter(
		isPropertyOptions,
	) as OperationOption[];
}

/** Every `routing.send` target that can be filled in for a resource/operation combination. */
export function sendTargetsFor(resource: string, operation: string): SendTarget[] {
	const targets: SendTarget[] = [];

	const collect = (property: INodeProperties, parameterName: string) => {
		const send = property.routing?.send;
		if (send?.property !== undefined) {
			targets.push({
				type: send.type ?? 'body',
				property: send.property,
				parameterName,
			});
		}
	};

	for (const property of properties) {
		if (!isVisibleFor(property, resource, operation)) continue;

		collect(property, property.name);

		if (property.type === 'collection' || property.type === 'fixedCollection') {
			for (const option of property.options ?? []) {
				if (isPropertyOptions(option)) continue;
				if ('values' in option) {
					for (const value of option.values) collect(value, `${property.name}.${value.name}`);
					continue;
				}
				collect(option as INodeProperties, `${property.name}.${(option as INodeProperties).name}`);
			}
		}
	}

	return targets;
}

/** Turns a declarative URL template into the path shape used in the OpenAPI spec. */
export function normaliseRoutingUrl(url: string): string {
	return url.replace(/^=/, '').replace(/\{\{[^}]*\}\}/g, '{}');
}

export function allLoadOptionsMethods(): string[] {
	const methods = new Set<string>();

	const visit = (property: INodeProperties) => {
		const method = property.typeOptions?.loadOptionsMethod;
		if (method) methods.add(method);

		for (const option of property.options ?? []) {
			if (isPropertyOptions(option)) continue;
			if ('values' in option) {
				option.values.forEach(visit);
				continue;
			}
			visit(option as INodeProperties);
		}
	};

	properties.forEach(visit);

	return [...methods];
}
