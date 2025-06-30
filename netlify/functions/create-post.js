import { neon } from '@netlify/neon';

const sql = neon(process.env.NETLIFY_DATABASE_URL); // Use a URL do env aqui

export async function handler(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { title, content, userId } = JSON.parse(event.body);

        if (!content || !userId) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Conteúdo e userId são obrigatórios.' }) };
        }

        const newPost = {
            id: 'post_' + Date.now(),
            title: title?.trim() || 'Sem Título',
            content: content.trim(),
            userId: userId.trim(),
            timestamp: new Date().toISOString(),
        };

        await sql`
            INSERT INTO posts (id, title, content, user_id, timestamp)
            VALUES (${newPost.id}, ${newPost.title}, ${newPost.content}, ${newPost.userId}, ${newPost.timestamp})
        `;

        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'Desabafo publicado com sucesso!', post: newPost }),
            headers: { 'Content-Type': 'application/json' },
        };
    } catch (error) {
        console.error('Erro na função create-post:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erro ao salvar no banco de dados.', error: error.message }),
            headers: { 'Content-Type': 'application/json' },
        };
    }
}