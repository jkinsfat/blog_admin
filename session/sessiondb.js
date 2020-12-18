
const currentTimestamp = () => Math.ceil(Date.now() / 1000);
const escapePgIdentifier = (value) => value.replace(/"/g, '""');

function formTablePath(tableName, schemaName) {
    const escapedSchema = schemaName ? '"' + schemaName + '".' : '';
    return escapedSchema + '"' + tableName + '"' 
}

function makePGStore(store, options) {
    const defaultStore = {
        schemaName: undefined,
        tableName: 'session',
        ttl: 86400,
        disableTouch: true,
        serializer: JSON,
        errorLog: console.error.bind(console)
    }
}

async function get(pool, sessionId) {
    const savedSession = await pool.query(
        'SELECT session FROM ' + table + ' WHERE sid = $1 AND expire >= to_timestamp($2)',
        [sessionId, currentTimestamp()]
    );
    return savedSession;
}

async function set(pool, session) {
    const sessionId = session.id;
    const expiration = session.expire;

    await pool.query(
        'INSERT INTO ' + table + ' (session, expire, sid) SELECT $1, to_timestamp($2), $3 ON CONFLICT (sid) DO UPDATE SET session=$1, expire=to_timestamp($2) RETURNING sid',
        [session, expiration, sessionId]
    );
}

async function destroy(pool, sessionId) {
    await pool.query('DELETE FROM ' + table + ' WHERE sid = $1', [sessionId]);
}

async function touch(pool, expiration, sessionId) {
    await pool.query(
        'UPDATE ' + table +  ' SET expire = to_timestamp($1) WHERE sid = $2 RETURNING sid',
        [expiration, sessionId]
    );
}