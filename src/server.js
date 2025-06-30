// server.js
import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { neon } from '@netlify/neon';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const sql = neon(); // Usa NETLIFY_DATABASE_URL automaticamente

app.use(cors());
app.use(express.json());

app.use(express.static(join(__dirname, '../public')));
app.use('/assets', express.static(join(__dirname, '../assets')));

// POST: Criar novo desabafo
app.post('/api/posts', async (req, res) => {
  const { title, content, userId } = req.body;

  if (!content || !userId) {
    return res.status(400).json({ message: 'Conteúdo e userId são obrigatórios.' });
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
    res.status(201).json({ message: 'Desabafo publicado com sucesso!', post: newPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao salvar no banco de dados.' });
  }
});

// GET: Listar todos os desabafos
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await sql`
      SELECT * FROM posts ORDER BY timestamp DESC
    `;
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar posts.' });
  }
});

// PUT: Editar desabafo
app.put('/api/posts/:id', async (req, res) => {
  const postId = req.params.id;
  const { title, content, userId } = req.body;

  if (!content || !userId) {
    return res.status(400).json({ message: 'Conteúdo e userId são obrigatórios.' });
  }

  try {
    const [post] = await sql`SELECT * FROM posts WHERE id = ${postId}`;
    if (!post) return res.status(404).json({ message: 'Post não encontrado.' });
    if (post.user_id !== userId) return res.status(403).json({ message: 'Sem permissão para editar.' });

    await sql`
      UPDATE posts
      SET title = ${title || 'Sem Título'}, content = ${content}
      WHERE id = ${postId}
    `;

    res.json({ message: 'Desabafo atualizado com sucesso!' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar o post.' });
  }
});

// DELETE: Apagar desabafo
app.delete('/api/posts/:id', async (req, res) => {
  const postId = req.params.id;
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ message: 'userId obrigatório.' });

  try {
    const [post] = await sql`SELECT * FROM posts WHERE id = ${postId}`;
    if (!post) return res.status(404).json({ message: 'Post não encontrado.' });
    if (post.user_id !== userId) return res.status(403).json({ message: 'Sem permissão para deletar.' });

    await sql`DELETE FROM posts WHERE id = ${postId}`;
    res.json({ message: 'Desabafo apagado com sucesso!' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao apagar post.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
