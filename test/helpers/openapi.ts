import spec from '../fixtures/ilai-openapi.json';

type JsonSchema = {
	$ref?: string;
	type?: string;
	items?: JsonSchema;
	anyOf?: JsonSchema[];
	properties?: Record<string, JsonSchema>;
	required?: string[];
};

type Parameter = { name: string; in: string; required?: boolean };

type Operation = {
	parameters?: Parameter[];
	requestBody?: { content: Record<string, { schema: JsonSchema }> };
};

export type SpecOperation = {
	method: string;
	/** Path with every path parameter normalised to `{}` so it can be compared with a node URL. */
	normalisedPath: string;
	path: string;
	queryParameters: string[];
	bodyProperties: string[];
	requiredBodyProperties: string[];
};

const schemas = (spec as { components: { schemas: Record<string, JsonSchema> } }).components.schemas;

/** Replaces every `{param}` placeholder with `{}` so different naming schemes still match. */
export function normalisePath(path: string): string {
	return path.replace(/\{[^}]*\}/g, '{}');
}

function resolveSchema(schema: JsonSchema | undefined): JsonSchema | undefined {
	if (!schema) return undefined;
	if (schema.$ref) {
		const name = schema.$ref.split('/').pop() as string;
		return schemas[name];
	}
	return schema;
}

function bodyPropertiesOf(operation: Operation): {
	properties: string[];
	required: string[];
} {
	const content = operation.requestBody?.content ?? {};
	const jsonSchema = content['application/json']?.schema;
	const resolved = resolveSchema(jsonSchema);

	// Array bodies (e.g. bulk endpoints) carry the item schema.
	const target = resolved?.type === 'array' ? resolveSchema(resolved.items) : resolved;

	return {
		properties: Object.keys(target?.properties ?? {}),
		required: target?.required ?? [],
	};
}

export const specOperations: SpecOperation[] = Object.entries(
	(spec as { paths: Record<string, Record<string, Operation>> }).paths,
).flatMap(([path, methods]) =>
	Object.entries(methods).map(([method, operation]) => {
		const { properties, required } = bodyPropertiesOf(operation);

		return {
			method: method.toUpperCase(),
			path,
			normalisedPath: normalisePath(path),
			queryParameters: (operation.parameters ?? [])
				.filter((parameter) => parameter.in === 'query')
				.map((parameter) => parameter.name),
			bodyProperties: properties,
			requiredBodyProperties: required,
		};
	}),
);

export function findSpecOperation(
	method: string,
	normalisedPath: string,
): SpecOperation | undefined {
	return specOperations.find(
		(operation) =>
			operation.method === method.toUpperCase() && operation.normalisedPath === normalisedPath,
	);
}
