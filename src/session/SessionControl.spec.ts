import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import ow from 'ow';
import '../engines/MemoryEngine';
import { SessionControl } from './SessionControl';
import jsonwebtoken from 'jsonwebtoken';

chai.use(chaiAsPromised);

function createObjectSessionControl() {
  return new SessionControl({
    engineConnectionStore: 'Memory',
  });
}

describe('Session Control', () => {
  it('Create instance session control', () => {
    createObjectSessionControl();
  });

  it('Create session with scope string[]', async () => {
    const sessionControl = createObjectSessionControl();

    const session1 = await sessionControl.createSession('me', 'a b c', {
      role: 'Admin Cool',
      name: 'Jona',
      email: 'email@sample.com',
    });

    const session2 = await sessionControl.createSession('me', ['a', 'b', 'c'], {
      role: 'Admin Cool',
      name: 'Jona',
      email: 'email@sample.com',
    });

    const s1: any = jsonwebtoken.decode(session1.accessToken);
    const s2: any = jsonwebtoken.decode(session2.accessToken);

    expect(s1.scope).is.eql('a b c');
    expect(s2.scope).is.eql('a b c');
  });

  it('Create session', async () => {
    const sessionControl = createObjectSessionControl();

    const session = await sessionControl.createSession('me', '', {
      role: 'Admin Cool',
      name: 'Jona',
      email: 'email@sample.com',
    });

    const sessionId = session.sessionId;

    ow(sessionId, ow.string);

    const firstCredentials = session.toJSON();
    ow(firstCredentials, ow.object.exactShape({
      access_token: ow.string,
      refresh_token: ow.string,
      expires_in: ow.number,
    }));
  });

  it('Refresh session', async () => {
    const sessionControl = createObjectSessionControl();

    const session = await sessionControl.createSession('me', '', {
      role: 'Admin Cool',
      name: 'Jona',
      email: 'email@sample.com',
    });

    const firstCredentials = session.toJSON();

    const secondSession = await sessionControl.refreshSession(session.refreshToken);

    const secondCredential = secondSession.toJSON();

    expect(secondCredential.access_token).not.equals(firstCredentials.access_token);
    expect(secondCredential.refresh_token).not.equals(firstCredentials.refresh_token);
  });

  it('Revoke session', async () => {
    const sessionControl = createObjectSessionControl();

    const session = await sessionControl.createSession('me', '', {
      role: 'Admin Cool',
      name: 'Jona',
      email: 'email@sample.com',
    });

    await sessionControl.revokeSession(session);

    await expect(
      sessionControl.refreshSession(session.refreshToken),
      'Refresh session revoked',
    ).rejected;
  });

  it('Get all sessions', async () => {
    const sessionControl = createObjectSessionControl();

    const session = await sessionControl.createSession('user1');

    await Promise.all([
      sessionControl.createSession('user1'),
      sessionControl.createSession('user1'),
      sessionControl.createSession('user1'),
      sessionControl.createSession('user1'),
      sessionControl.createSession('user1'),
      sessionControl.createSession('user1'),
    ]);

    const sessions = await sessionControl.getAllSessions(session);

    expect(sessions).to.length(7);
  });

  it('Revoke all session', async () => {
    const sessionControl = createObjectSessionControl();

    const session = await sessionControl.createSession('user1');

    await Promise.all([
      sessionControl.createSession('user1'),
      sessionControl.createSession('user1'),
      sessionControl.createSession('user1'),
      sessionControl.createSession('user1'),
      sessionControl.createSession('user1'),
      sessionControl.createSession('user1'),
    ]);

    expect(await sessionControl.revokeAllSessions(session)).to.be.eql(true);

    const sessions = await sessionControl.getAllSessions(session);

    expect(sessions).to.length(0);
  });

  describe('Events', () => {
    it('event create-session', async () => {
      const sessionControl = createObjectSessionControl();

      let called = false;

      sessionControl.on('create-session', () => {
        called = true;
      });

      await sessionControl.createSession('me', '', {
        role: 'Admin Cool',
        name: 'Jona',
        email: 'email@sample.com',
      });

      expect(called, 'Event is called').is.true;
    });
  });
});
