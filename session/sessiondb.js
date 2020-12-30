
const currentTimestamp = () => Math.ceil(Date.now() / 1000);
const escapePgIdentifier = (value) => value.replace(/"/g, '""');

function formTablePath(tableName, schemaName) {
    const escapedSchema = schemaName ? '"' + schemaName + '".' : '';
    return escapedSchema + '"' + tableName + '"' 
}

function makePGStore(store, options) {
    const defaultStore = {
        schemaName: options.schemaName ? escapePgIdentifier(options.schemaName) : undefined,
        tableName: options.tableName ? escapePgIdentifier(options.tableName) : 'session',
        ttl: 86400,
        disableTouch: true,
        serializer: JSON,
        errorLog: console.error.bind(console)
    }

    if (options.pruneSessionInterval === false) {
        /** @type {false|number} */
        this.pruneSessionInterval = false;
      } else {
        /** @type {false|number} */
        this.pruneSessionInterval = (options.pruneSessionInterval || DEFAULT_PRUNE_INTERVAL_IN_SECONDS) * 1000;
        if (options.pruneSessionRandomizedInterval !== false) {
          this.pruneSessionRandomizedInterval = (
            options.pruneSessionRandomizedInterval ||
            // Results in at least 50% of the specified interval and at most 150%. Makes it so that multiple instances doesn't all prune at the same time.
            (delay => Math.ceil(delay / 2 + delay * Math.random()))
          );
        }
        setImmediate(() => { this.pruneSessions(); });
      }
    }
}

/**
 * Does garbage collection for expired session in the database
 *
 * @param {SimpleErrorCallback} [fn] - standard Node.js callback called on completion
 * @access public
 */
pruneSessions (fn) {
    this.query('DELETE FROM ' + this.quotedTable() + ' WHERE expire < to_timestamp($1)', [currentTimestamp()], err => {
        if (fn && typeof fn === 'function') {
        return fn(err);
        }

        if (err) {
        this.errorLog('Failed to prune sessions:', err.message);
        }

        if (this.pruneSessionInterval && !this.closed) {
        if (this.pruneTimer) {
            clearTimeout(this.pruneTimer);
        }
        this.pruneTimer = setTimeout(
            () => { this.pruneSessions(); },
            this.getPruneDelay()
        );
        this.pruneTimer.unref();
        }
    });
}

async function all(pool) {
    const allSessions = await pool.query(
        'SELECT * FROM ' + table, []
    );
    return allSessions;
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

module.exports = {
    all,
    get,
    set,
    destroy,
    touch
}