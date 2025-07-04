import { neon } from '@netlify/neon';

const sql = neon(process.env.NETLIFY_DATABASE_URL);

export async function handler(event, context) {
  try {
    const { method } = event;

    if (method === 'GET') {
      const result = await sql`SELECT * FROM posts ORDER BY id DESC`;
      return {
        statusCode: 200,
        body: JSON.stringify(result),
      };
    }

    if (method === 'POST') {
      const body = JSON.parse(event.body);
      await sql`INSERT INTO posts (title, content) VALUES (${body.title}, ${body.content})`;
      return {
        statusCode: 201,
        body: JSON.stringify({ success: true }),
      };
    }

    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
