// netlify/functions/posts.js
import { neon } from '@netlify/neon';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.NETLIFY_DATABASE_URL);

export async function handler(event) {
  const method = event.httpMethod;

  if (method === 'POST') {
    const body = JSON.parse(event.body);
    const { title, content, userId } = body;

    if (!content || !userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Conteúdo e userId obrigatórios.' }),
      };
    }

    const newPost = {
      id: 'post_' + Date.now(),
      title: title?.trim() || 'Sem Título',
      content: content.trim(),
      userId: userId.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      await sql`
        INSERT INTO posts (id, title, content, user_id, timestamp)
        VALUES (${newPost.id}, ${newPost.title}, ${newPost.content}, ${newPost.userId}, ${newPost.timestamp})
      `;
      return {
        statusCode: 201,
        body: JSON.stringify({ message: 'Publicado com sucesso!', post: newPost }),
      };
    } catch (err) {
      console.error(err);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Erro ao salvar no banco de dados.' }),
      };
    }
  }

  if (method === 'GET') {
    try {
      const posts = await sql`SELECT * FROM posts ORDER BY timestamp DESC`;
      return {
        statusCode: 200,
        body: JSON.stringify(posts),
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Erro ao buscar posts.' }),
      };
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ message: 'Método não suportado' }),
  };
}
