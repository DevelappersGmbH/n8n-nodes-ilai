# @develappers/n8n-nodes-ilai

This is an n8n community node. It lets you use [ILAI](https://impact-labs.ai/) (Impact Labs AI) in
your n8n workflows.

ILAI is a voice and text AI platform for customer communication. The cockpit exposes a REST API for
calls, agents, knowledge base entries, processes, prompts, scheduled tasks and email — this node
makes those operations available in n8n.

[Installation](#installation) · [Credentials](#credentials) · [Operations](#operations) ·
[Usage](#usage) · [Development](#development) · [Resources](#resources)

## Installation

Follow the
[installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n
community nodes documentation.

In n8n, go to **Settings > Community Nodes**, select **Install** and enter
`@develappers/n8n-nodes-ilai`.

## Credentials

The node authenticates with a bearer token against your own ILAI cockpit instance, so the
credential needs two values:

| Field      | Description                                                                                               |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| `Base URL` | URL of your cockpit instance, e.g. `https://your-tenant.cockpit.impact-labs.ai` (without the `/api/v1` path) |
| `API Key`  | Bearer token, created in the cockpit under **Configuration**                                               |

Trailing slashes in the base URL are removed automatically. The credential test calls
`GET /api/v1/agents/`, so the token needs at least read access.

## Operations

| Resource            | Operations                                                                        |
| ------------------- | --------------------------------------------------------------------------------- |
| **Agent**           | Get, Get Many                                                                       |
| **Call**            | Create Outbound, Delete, Get, Get Many, Get Metrics, Get Recordings                  |
| **Channel Setting** | Create, Delete, Get, Get Many, Update                                               |
| **Configuration**   | Get, Get By Key, Get Many                                                           |
| **FAQ**             | Create, Delete, Get Many, Get Processes, Query, Update                              |
| **Glossary**        | Create, Delete, Get Many, Preview, Update                                           |
| **Mail**            | Reply, Send                                                                         |
| **MCP**             | Execute Tool, Get Servers, Get Tools, Refresh Tools                                 |
| **Process**         | Create, Delete, Get, Get Many, Get Names, Update                                    |
| **Prompt**          | Create, Delete, Get Many, Update                                                     |
| **Redirect**        | Create, Delete, Get, Get Many, Update                                               |
| **Statistic**       | Get Many, Get Summary                                                               |
| **Task**            | Get Many, Get Runs, Get Types, Run, Update                                          |
| **Utterance**       | Create, Delete, Get, Get Many, Preview, Update                                      |

Process, agent, MCP server, MCP tool and task fields are loaded from your instance, so you can pick
them from a dropdown instead of typing IDs.

**Calls**, **statistics** and **task runs** are paginated by the API. Enable **Return All** to
fetch every page, or set a **Limit** to stop earlier.

### Deliberately read-only

Some parts of the API are exposed read-only, because a workflow writing to them would falsify
records or take the live system down. Use the **HTTP Request** node with the ILAI credential if you
really need them:

- **Calls** — `PUT /calls/{id}` (metadata), `POST /calls/{id}/history` (transcript) and
  `POST /calls/{id}/metrics` (latency telemetry) are written by the voice pipeline. Rewriting them
  from a workflow changes the conversation record that reporting and audits rely on. Starting a
  call (**Create Outbound**) and deleting one (**Delete**, for erasure requests) are available.
- **Agents** — carry the SIP registration of the telephony infrastructure.
- **Configuration** — drives the running platform, and `generate-key` creates API credentials.
- **Statistics** — writing entries would distort the cockpit dashboards.

### Not covered

These endpoints are left out entirely:

- FAQ imports (`/api/v1/faq/import`) and the chatbot icon upload — both are `multipart/form-data`
  uploads.
- The SSE variant of the FAQ query (`/api/v1/faq/query-sse`), which streams its response.
- Bulk and retention deletes (`/api/v1/calls/bulk*`) and the statistics regeneration and synthetic
  data endpoints, which delete or rewrite large amounts of data.
- Pronunciation/TTS configuration and login endpoints.

There is no trigger node: the ILAI API does not offer webhooks or a change feed. Use a **Schedule
Trigger** with **Call > Get Many** and a `From` filter to poll for new calls.

## Usage

Some patterns that map well onto the API:

- **React to finished calls** — Schedule Trigger → **Call > Get Many** (filter `From`, `Status`) →
  process the transcripts in your workflow.
- **Start an outbound call** — **Call > Create Outbound** with a phone number and the process the
  agent should follow.
- **Keep the knowledge base in sync** — **FAQ > Create** or **Update** from your CMS, ticket system
  or spreadsheet.
- **Answer with the knowledge base** — **FAQ > Query** with the conversation history, for example
  inside a chatbot workflow.
- **Send the follow-up email** — **Mail > Send** or **Mail > Reply** after a call has been handled.

The node is also available as a tool for AI agents (`usableAsTool`), so an agent can look up FAQ
entries or trigger a call on its own.

## Development

```bash
npm install
npm run dev     # run n8n with this node loaded
npm run lint    # n8n community node lint rules
npm test        # jest test suite
npm run build   # compile to dist/
```

### Tests

The suite (`npm test`) covers three areas:

1. **Node description** — every resource has operations, every operation has a routing request,
   alphabetically sorted options, defaults, and load options methods that are actually implemented.
2. **API conformance** — every request the node can send is checked against
   `test/fixtures/ilai-openapi.json`, a copy of the ILAI OpenAPI specification: the endpoint must
   exist, query and body properties must be part of the schema, and every property the API marks as
   required must be reachable in the UI.
3. **Unit tests** — the transport helper, the load options methods (with mocked HTTP calls) and the
   expressions used for base URL normalisation and address list splitting.

When the ILAI API changes, replace the fixture and run the suite again:

```bash
curl -o test/fixtures/ilai-openapi.json https://<your-tenant>.cockpit.impact-labs.ai/openapi.json
npm test
```

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [ILAI / Impact Labs AI](https://impact-labs.ai/)

## License

[MIT](LICENSE)
