import type { INodeProperties } from 'n8n-workflow';

const resource = ['mail'];

/** Splits a comma separated list of addresses into the array the API expects. */
const ADDRESS_LIST_EXPRESSION =
	'={{ $value.split(",").map((address) => address.trim()).filter((address) => address !== "") }}';

export const mailDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'send',
		displayOptions: { show: { resource } },
		options: [
			{
				name: 'Reply',
				value: 'reply',
				action: 'Reply to an email',
				description: 'Reply to an email that was received by ILAI',
				routing: { request: { method: 'POST', url: '/api/v1/mail/reply' } },
			},
			{
				name: 'Send',
				value: 'send',
				action: 'Send an email',
				description: 'Send an email through ILAI',
				routing: { request: { method: 'POST', url: '/api/v1/mail/send' } },
			},
		],
	},

	// ----------------------------------
	//             mail: send
	// ----------------------------------
	{
		displayName: 'To',
		name: 'toAddresses',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. info@example.com, support@example.com',
		description: 'Comma-separated list of recipients',
		displayOptions: { show: { resource, operation: ['send'] } },
		routing: {
			send: { type: 'body', property: 'to_addresses', value: ADDRESS_LIST_EXPRESSION },
		},
	},
	{
		displayName: 'Subject',
		name: 'subject',
		type: 'string',
		default: '',
		required: true,
		description: 'Subject of the email',
		displayOptions: { show: { resource, operation: ['send'] } },
		routing: { send: { type: 'body', property: 'subject' } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource, operation: ['send'] } },
		options: [
			{
				displayName: 'BCC',
				name: 'bccAddresses',
				type: 'string',
				default: '',
				placeholder: 'e.g. archive@example.com',
				description: 'Comma-separated list of blind copy recipients',
				routing: {
					send: { type: 'body', property: 'bcc_addresses', value: ADDRESS_LIST_EXPRESSION },
				},
			},
			{
				displayName: 'CC',
				name: 'ccAddresses',
				type: 'string',
				default: '',
				placeholder: 'e.g. team@example.com',
				description: 'Comma-separated list of copy recipients',
				routing: {
					send: { type: 'body', property: 'cc_addresses', value: ADDRESS_LIST_EXPRESSION },
				},
			},
			{
				displayName: 'HTML Body',
				name: 'bodyHtml',
				type: 'string',
				typeOptions: { rows: 5 },
				default: '',
				description: 'HTML body of the email',
				routing: { send: { type: 'body', property: 'body_html' } },
			},
			{
				displayName: 'Text Body',
				name: 'bodyText',
				type: 'string',
				typeOptions: { rows: 5 },
				default: '',
				description: 'Plain text body of the email',
				routing: { send: { type: 'body', property: 'body_text' } },
			},
			{
				displayName: 'Ticket Number',
				name: 'ticketNumber',
				type: 'string',
				default: '',
				description: 'Ticket number the email should be linked to',
				routing: { send: { type: 'body', property: 'ticket_number' } },
			},
		],
	},

	// ----------------------------------
	//             mail: reply
	// ----------------------------------
	{
		displayName: 'Internet Message ID',
		name: 'internetMessageId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. <AM0P123456@example.com>',
		description: 'Internet message ID of the email to reply to',
		displayOptions: { show: { resource, operation: ['reply'] } },
		routing: { send: { type: 'body', property: 'internet_message_id' } },
	},
	{
		displayName: 'Additional Fields',
		name: 'replyFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource, operation: ['reply'] } },
		options: [
			{
				displayName: 'Comment',
				name: 'comment',
				type: 'string',
				typeOptions: { rows: 3 },
				default: '',
				description: 'Comment added above the quoted original email',
				routing: { send: { type: 'body', property: 'comment' } },
			},
			{
				displayName: 'HTML Body',
				name: 'bodyHtml',
				type: 'string',
				typeOptions: { rows: 5 },
				default: '',
				description: 'HTML body of the reply',
				routing: { send: { type: 'body', property: 'body_html' } },
			},
			{
				displayName: 'Send',
				name: 'send',
				type: 'boolean',
				default: true,
				description: 'Whether to send the reply or only create it as a draft',
				routing: { send: { type: 'body', property: 'send' } },
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				description: 'Subject of the reply',
				routing: { send: { type: 'body', property: 'subject' } },
			},
			{
				displayName: 'Text Body',
				name: 'bodyText',
				type: 'string',
				typeOptions: { rows: 5 },
				default: '',
				description: 'Plain text body of the reply',
				routing: { send: { type: 'body', property: 'body_text' } },
			},
			{
				displayName: 'Ticket Number',
				name: 'ticketNumber',
				type: 'string',
				default: '',
				description: 'Ticket number the reply should be linked to',
				routing: { send: { type: 'body', property: 'ticket_number' } },
			},
		],
	},
];
