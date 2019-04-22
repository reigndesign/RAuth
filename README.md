# RAuth 🔏

Make your service of the authentication with RAuth library.

# How to use

```shell
$ npm install rauth
```

## Create a session control

```ts
import 'rauth/engines/SQLiteEngine';
import { SessionControl } from 'rauth/session/SessionControl';

const sessionControl = new SessionControl({ engineConnectionStore: 'SQLite' });
```

## Create an authorization handler

This handler allows you to create the session

```ts
// Handler to GET /authorize?grant_type=basic

// Here is your method to validate the credentials

const session = await sessionControl.createSession(username);

res.setHeader('Content-Type', 'application/json');
return res.end(JSON.stringify(session), 'utf8');
```

## Validate token

```ts
const token = query.token;
const session = await sessionControl.verify(token);
```

## Create a refresh token handler

This handler allows you to refresh the session.

```ts
// Handler to GET /authorize?grant_type=refresh_token&refresh_token=...
const refreshToken = query.refresh_token;

const session = await sessionControl.refreshSession(refreshToken);

res.setHeader('Content-Type', 'application/json');
return res.end(JSON.stringify(session), 'utf8');
```

## Create a revoke token handler

This handler allow revoke a refresh token, to invalidate the next use of refresh token.

```ts
// Handler to GET /logout
await sessionControl.revokeSession(session);

res.setHeader('Content-Type', 'application/json');
return res.end(JSON.stringify(session), 'utf8');
```
