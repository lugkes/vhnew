import { neon } from '@netlify/neon';

const sql = neon();

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
