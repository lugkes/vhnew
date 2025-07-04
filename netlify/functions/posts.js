import { neon } from '@netlify/neon';

// Verificação da variável de ambiente
const connectionString = process.env.NETLIFY_DATABASE_URL;

if (!connectionString) {
  console.error("⚠️ Variável NETLIFY_DATABASE_URL não está definida!");
}

const sql = neon(connectionString);

export async function handler(event) {
  console.log("➡️ Requisição recebida:", event.httpMethod);

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Método não permitido. Use POST.' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  try {
    const body = JSON.parse(event.body);
    console.log("📥 Body recebido:", body);

    const { title = 'Sem Título', content, userId } = body;

    if (!content || !userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Campos obrigatórios: content e userId.' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    const newPost = {
      id: 'post_' + Date.now(),
      title: title.trim(),
      content: content.trim(),
      userId: userId.trim(),
      timestamp: new Date().toISOString(),
    };

    console.log("📤 Inserindo no banco:", newPost);

    await sql`
      INSERT INTO posts (id, title, content, user_id, timestamp)
      VALUES (${newPost.id}, ${newPost.title}, ${newPost.content}, ${newPost.userId}, ${newPost.timestamp})
    `;

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Desabafo publicado com sucesso!', post: newPost }),
      headers: { 'Content-Type': 'application/json' }
    };

  } catch (error) {
    console.error("🔥 Erro interno:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro interno ao salvar o post.', error: error.message }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}
