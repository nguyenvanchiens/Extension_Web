const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

function parseConnectionString(connStr) {
  if (connStr.startsWith('mysql://')) {
    const url = new URL(connStr);
    return {
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.replace('/', '') || undefined,
    };
  }
  const config = {};
  connStr.split(';').forEach((part) => {
    const [key, ...rest] = part.split('=');
    const value = rest.join('=').trim();
    const k = key.trim().toLowerCase();
    if (k === 'server' || k === 'host' || k === 'data source') config.host = value;
    if (k === 'port') config.port = parseInt(value);
    if (k === 'database' || k === 'initial catalog') config.database = value;
    if (k === 'uid' || k === 'user' || k === 'user id') config.user = value;
    if (k === 'pwd' || k === 'password') config.password = value;
  });
  return { host: config.host, port: config.port || 3306, user: config.user, password: config.password, database: config.database };
}

app.post('/api/db/test', async (req, res) => {
  try {
    const config = parseConnectionString(req.body.connectionString);
    const conn = await mysql.createConnection(config);
    await conn.ping();
    await conn.end();
    res.json({ success: true, message: 'Kết nối thành công!' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

app.post('/api/db/databases', async (req, res) => {
  try {
    const config = parseConnectionString(req.body.connectionString);
    const conn = await mysql.createConnection(config);
    const [rows] = await conn.query('SHOW DATABASES');
    await conn.end();
    res.json({ success: true, data: rows.map((r) => r.Database) });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

app.post('/api/db/tables', async (req, res) => {
  try {
    const config = parseConnectionString(req.body.connectionString);
    config.database = req.body.database;
    const conn = await mysql.createConnection(config);
    const [rows] = await conn.query('SHOW TABLES');
    await conn.end();
    const key = Object.keys(rows[0] || {})[0];
    res.json({ success: true, data: rows.map((r) => r[key]) });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

app.post('/api/db/columns', async (req, res) => {
  try {
    const config = parseConnectionString(req.body.connectionString);
    config.database = req.body.database;
    const conn = await mysql.createConnection(config);
    const [rows] = await conn.query(
      `SELECT
        COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION, NUMERIC_SCALE,
        IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT, EXTRA, COLUMN_COMMENT, ORDINAL_POSITION
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION`,
      [req.body.database, req.body.table]
    );
    await conn.end();
    res.json({
      success: true,
      data: rows.map((r) => {
        let length = 0;
        let decimals = 0;
        if (r.CHARACTER_MAXIMUM_LENGTH != null) {
          length = r.CHARACTER_MAXIMUM_LENGTH;
        } else if (r.NUMERIC_PRECISION != null) {
          length = r.NUMERIC_PRECISION;
          decimals = r.NUMERIC_SCALE || 0;
        } else {
          const match = (r.COLUMN_TYPE || '').match(/\((\d+)(?:,(\d+))?\)/);
          if (match) {
            length = parseInt(match[1]) || 0;
            decimals = parseInt(match[2]) || 0;
          }
        }
        return {
          name: r.COLUMN_NAME,
          type: r.DATA_TYPE,
          length,
          decimals,
          nullable: r.IS_NULLABLE === 'YES',
          key: r.COLUMN_KEY,
          default: r.COLUMN_DEFAULT,
          extra: r.EXTRA,
          comment: r.COLUMN_COMMENT || '',
        };
      }),
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`DB Explorer API running on http://localhost:${PORT}`);
});
