import { success, error } from '../lib/response.js';

export async function onRequest(context) {
  const db = context.env.db;

  if (!db) {
    return error("D1 binding 'db' not found", 500);
  }

  try {
    const result = await db.prepare('SELECT 1 AS test').first();

    return success({
      message: 'D1 database connection successful',
      data: result
    });
  } catch (err) {
    return error(err.message, 500);
  }
}
