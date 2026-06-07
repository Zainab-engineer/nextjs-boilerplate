import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const tasks = await sql`SELECT * FROM tasks ORDER BY created_at DESC`;
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const { title, est } = await req.json();
  const [task] = await sql`
    INSERT INTO tasks (title, est) VALUES (${title}, ${est ?? 1})
    RETURNING *
  `;
  return NextResponse.json(task, { status: 201 });
}
