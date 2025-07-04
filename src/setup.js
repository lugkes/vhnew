// src/setup.js
import 'dotenv/config';
import { neon } from '@netlify/neon';

const connectionString = process.env.NETLIFY_DATABASE_URL;

if (!connectionString) {
  console.error("❌ Variável de ambiente NETLIFY_DATABASE_URL não definida.");
  process.exit(1);
}

const sql = neon(connectionString);

async function setup() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        title TEXT,
        content TEXT NOT NULL,
        user_id TEXT NOT NULL,
        timestamp TIMESTAMPTZ NOT NULL
      );
    `;
    console.log('✅ Tabela `posts` criada/verificada com sucesso.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro ao criar/verificar tabela:', err);
    process.exit(1);
  }
}

setup();
