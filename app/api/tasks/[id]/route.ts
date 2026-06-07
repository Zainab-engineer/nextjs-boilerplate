import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (body.title !== undefined) {
    fields.push(`title = $${idx++}`);
    values.push(body.title);
  }
  if (body.completed !== undefined) {
    fields.push(`completed = $${idx++}`);
    values.push(body.completed);
  }
  if (body.pomodoro_count !== undefined) {
    fields.push(`pomodoro_count = $${idx++}`);
    values.push(body.pomodoro_count);
  }

  if (fields.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  values.push(id);
  const query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
  const [task] = await sql.query(query, values);
  return NextResponse.json(task);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM tasks WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
