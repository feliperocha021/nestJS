import { Client } from 'pg';

export default async () => {
  const client = new Client({
    user: 'nestuser',
    password: process.env.DB_PASSWORD ?? 'nestpass',
    host: process.env.DB_HOST ?? 'postgres-test',
    database: 'postgres',
  });

  await client.connect();
  await client.query(`
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE usename = 'nestuser'
      AND pid <> pg_backend_pid();
  `);
  await client.end();
};
