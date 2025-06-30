// src/setup.js
import 'dotenv/config'; // Mantenha essa linha aqui, bem no topo!
import { neon } from '@netlify/neon';

// 'dotenv/config' deve garantir que process.env.NETLIFY_DATABASE_URL já esteja disponível aqui.
const sql = neon(process.env.NETLIFY_DATABASE_URL); // Passe explicitamente a URL aqui

async function setup() {
  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title TEXT,
      content TEXT,
      user_id TEXT,
      timestamp TIMESTAMP
    );
  `;
  console.log('✅ Tabela criada com sucesso.');
}

setup().catch(err => {
  console.error('❌ Erro ao criar tabela:', err);
});