import type { INodeProperties } from 'n8n-workflow';

import { idField, limitField, returnAllField } from '../../shared/descriptions';

const resource = ['glossary'];

export const glossaryDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'getAll',
		displayOptions: { show: { resource } },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a glossary entry',
				description: 'Create a new pronunciation glossary entry',
				routing: { request: { method: 'POST', url: '/api/v1/glossary/' } },
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a glossary entry',
				description: 'Delete a glossary entry',
				routing: {
					request: { method: 'DELETE', url: '=/api/v1/glossary/{{ $parameter.entryId }}' },
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many glossary entries',
				description: 'Get many glossary entries',
				routing: { request: { method: 'GET', url: '/api/v1/glossary/' } },
			},
			{
				name: 'Preview',
				value: 'preview',
				action: 'Preview a glossary entry',
				description: 'Render an audio preview of the replacement term',
				routing: {
					request: { method: 'POST', url: '=/api/v1/glossary/{{ $parameter.entryId }}/preview' },
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a glossary entry',
				description: 'Update an existing glossary entry',
				routing: {
					request: { method: 'PUT', url: '=/api/v1/glossary/{{ $parameter.entryId }}' },
				},
			},
		],
	},

	returnAllField({ resource, operation: ['getAll'] }),
	limitField({ resource, operation: ['getAll'] }),

	idField({
		displayName: 'Entry ID',
		name: 'entryId',
		default: 0,
		description: 'ID of the glossary entry',
		type: 'number',
		show: { resource, operation: ['delete', 'preview', 'update'] },
	}),

	{
		displayName: 'Search Term',
		name: 'searchTerm',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. ILAI',
		description: 'Term that should be replaced before it is spoken',
		displayOptions: { show: { resource, operation: ['create', 'update'] } },
		routing: { send: { type: 'body', property: 'search_term' } },
	},
	{
		displayName: 'Replacement Term',
		name: 'replacementTerm',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. Ei-Ell-Ei-Ei',
		description: 'Phonetic replacement that is spoken instead',
		displayOptions: { show: { resource, operation: ['create', 'update'] } },
		routing: { send: { type: 'body', property: 'replacement_term' } },
	},
];
