import { findSpecOperation, normalisePath, specOperations } from './helpers/openapi';
import { normaliseRoutingUrl, operationsFor, resourceValues, sendTargetsFor } from './helpers/node';

type NodeOperation = {
	resource: string;
	operation: string;
	method: string;
	url: string;
	normalisedPath: string;
};

const nodeOperations: NodeOperation[] = resourceValues.flatMap((resource) =>
	operationsFor(resource).map((option) => {
		const request = option.routing?.request ?? {};
		const url = request.url as string;

		return {
			resource,
			operation: String(option.value),
			method: String(request.method),
			url,
			normalisedPath: normaliseRoutingUrl(url),
		};
	}),
);

const cases = nodeOperations.map(
	(operation) => [`${operation.resource}:${operation.operation}`, operation] as const,
);

describe('conformance with the ILAI OpenAPI specification', () => {
	it('loads the specification fixture', () => {
		expect(specOperations.length).toBeGreaterThan(100);
	});

	it.each(cases)('%s calls an endpoint that exists', (_name, operation) => {
		const specOperation = findSpecOperation(operation.method, operation.normalisedPath);

		// Surfaces the offending endpoint in the failure message instead of just "undefined".
		expect(
			specOperation ? 'found' : `${operation.method} ${operation.normalisedPath} is not in the spec`,
		).toBe('found');
	});

	it.each(cases)('%s only sends query parameters the API accepts', (_name, operation) => {
		const specOperation = findSpecOperation(operation.method, operation.normalisedPath);
		if (!specOperation) throw new Error(`Unknown endpoint ${operation.method} ${operation.url}`);

		const queryTargets = sendTargetsFor(operation.resource, operation.operation).filter(
			(target) => target.type === 'query',
		);

		for (const target of queryTargets) {
			expect(specOperation.queryParameters).toContain(target.property);
		}
	});

	it.each(cases)('%s only sends body properties the API accepts', (_name, operation) => {
		const specOperation = findSpecOperation(operation.method, operation.normalisedPath);
		if (!specOperation) throw new Error(`Unknown endpoint ${operation.method} ${operation.url}`);

		const bodyTargets = sendTargetsFor(operation.resource, operation.operation).filter(
			(target) => target.type === 'body',
		);

		if (bodyTargets.length > 0) {
			expect(specOperation.bodyProperties.length).toBeGreaterThan(0);
		}

		for (const target of bodyTargets) {
			expect(specOperation.bodyProperties).toContain(target.property);
		}
	});

	it.each(cases)('%s offers every required body property', (_name, operation) => {
		const specOperation = findSpecOperation(operation.method, operation.normalisedPath);
		if (!specOperation) throw new Error(`Unknown endpoint ${operation.method} ${operation.url}`);

		// Only checked for operations that send a body at all; GET/DELETE have none.
		const bodyTargets = sendTargetsFor(operation.resource, operation.operation).filter(
			(target) => target.type === 'body',
		);
		if (bodyTargets.length === 0) return;

		const sent = bodyTargets.map((target) => target.property);
		for (const required of specOperation.requiredBodyProperties) {
			expect(sent).toContain(required);
		}
	});

	it('normalises path parameters before comparing them', () => {
		expect(normalisePath('/api/v1/calls/{call_id}/history')).toBe('/api/v1/calls/{}/history');
		expect(normaliseRoutingUrl('=/api/v1/calls/{{ encodeURIComponent($parameter.callId) }}')).toBe(
			'/api/v1/calls/{}',
		);
	});

	it('covers the main areas of the API', () => {
		const paths = new Set(nodeOperations.map((operation) => operation.normalisedPath));

		expect(paths).toContain('/api/v1/calls/');
		expect(paths).toContain('/api/v1/call/outbound');
		expect(paths).toContain('/api/v1/agents/');
		expect(paths).toContain('/api/v1/faq/');
		expect(paths).toContain('/api/v1/mail/send');
		expect(paths).toContain('/api/v1/mcp/tools');
	});
});
