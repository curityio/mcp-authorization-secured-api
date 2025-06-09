# PME Authorization Goal

- Show organizations how to expose data securely from APIs to AI agents.
- Use a small and simple model, to keep the focus on security and show how to get connected.

## Initial Use Cases

1. Token-based authorization for AI agents invoked by users.
2. Token-based authorization for AI agents invoked by backend workloads.
3. Onboarding of AI agents / establishment of trust.

## Model Context Protocol Roles

- An MCP server feels like a utility API that forwards to existing APIs.
- [LibreChat](https://github.com/danny-avila/LibreChat) has a useful frontend that runs AI agents and implements an MCP client.
- PMEs will update it to use an [OAuth MCP Client](https://modelcontextprotocol.io/specification/2025-03-26/basic/authorization).

## Deploy the Backend

Add these entries to the `/etc/hosts` file, where LibreChat simulates an external MCP client.

```text
127.0.0.1 api.example.com mcp.example.com admin.example.com login.example.com agent.external.example
```

After deployment, components are available at these URLs.

| Component | URL |
| --------- | --- |
| Customer API | http://api.example.com/users |
| Utility MCP Server | http://mcp.example.com |
| Curity Identity Server Admin UI | http://admin.example.com/admin |
| Curity Identity Server OAuth Metadata | http://login.example.com/.well-known/oauth-authorization-server |
| LibreChat External Client | http://agent.external.example |

### Option 1: Deployed MCP Server

Deploy backend infrastructure, which includes the backend for LibreChat.

```bash
export LICENSE_FILE_PATH=~/Desktop/license.json
./build.sh
./deploy.sh
```

### Option 2: Local MCP Server

Run the MCP server for development at `http://localhost:3000`.

```bash
cd utility-mcp-server
npm install
npm start
```

Then use an environment variable to point the deployment to the local MCP server.

```bash
export LICENSE_FILE_PATH=~/Desktop/license.json
export RUN_LOCAL_MCP_SERVER='true'
./build.sh
./deploy.sh
```

## Run the Frontend with Librechat

Browse to `http://agent.external.example` to access the LibreChat frontend, then create an account and sign in.

Get an API key for ChatGPT:
- Go to `https://platform.openai.com/api-keys` and log in with Google using your Curity account.
- Create a new API key with this configuration:

![Create new API Key](docs/new-api-key.png)

Back in LibreChat, add the API Key by clicking the LLM model selector on top and selecting the settings icon next to OpenAI.  
Use the `never expire` option,

![Set API key](docs/set-api-key.png)

Create a new agent. From the right-hand side menu select `Agent Builder` then `Create New Agent`. Give it a name, choose one of the OpenAI models (I used gpt-4o-mini), then click `Add tools`. On the list of tools you should see `fetch-users`. Add it to the agent, then save.

Select the agent in the LLM dropdown at the top of the chat. Your chat is ready for testing. For example, prompt "Fetch me my users".

## MCP OAuth Development

The setup aims to provide a backend so that we can focus on the main tasks:

- The MCP server may need some extra code to deal with challenges and upgrading the connection.   
  But I think we will mostly deploy the MCP server rather than develop it.  
  The MCP server can forward JWT access tokens to the customer API.  

- The main work is likely to be focused on the MCP OAuth client.  
  Perhaps a simple console app will be easiest to develop, like [this code from the book](https://github.com/curityio/cloud-native-oauth-security-examples/tree/main/chapter-12-platform-specific-apps/console-app/src/oauth).  
  We will want to be able to inspect the MCP messages.  
  We will also want to deploy the MCP OAuth client integrated into LibreChat.  

Ultimately though, we'd like MCP components to be a thin layer that promote OAuth security for APIs.

## Test the Server wiht a Simple MCP Client

There aren't many clients yet which properly support MCP's draft specification for authorization — where the client receives a 401 from the MCP server and uses resource server metadata to redirect the user to the correct authorization server. We can test the current setup using the `simpleOAuthClient` from the Typescript MCP SDK that you can find here: [mcp-client/simpleOAuthClient.ts](mcp-client/simpleOAuthClient.ts)

Build and start the system as described above, then run:
```
cd mcp-client
npm i
npm run oauth-client
```

This will trigger an OAuth flow where you can log in with any username (username authenticator). Once you get the interactive shell, type:

```
call fetch-users
```

The client will call the MCP server and forward the access token to the API. You can use the following curl command to verify that the API requires an access token:

```
curl -i http://api.example.com/users
```

## Known Issues

Sometimes, when the mcp client starts the browser, you will see an error from nginx when calling the /authentication endpoint of Curity:

```
Error

An invalid response was received from the upstream server.
```

For now, I clear cookies and restart the client and it works. This needs further investigation why this fails

## Possible Futher Improvements

- should we protect only the tool call with tokens? In MCP server, the checkAuth method could try to figure out whether the request is trying to call the tool and require the token only then maybe?
- use templatized client so that we have more control over the attributes of the client - actually, there is a problem with this approach. In Curity, we don't allowed unauthenticated access to the DCR registration for templatized clients, and the MCP SDk does not, for now, support authenticated calls to DCR.
- use authenticated DCR flow?
- use other form of authentication for the DCR client?
- make the API return 403 at some point and try to have the MCP client react accordingly (new scope/step-up auth?)
- maybe create an mcp server for marketbuddy?
- add phantom tokens
- should there be token exchange somewhere?
- should we want to implement support in LibreChat, we should have a look at librechat's `packages/mcp`
