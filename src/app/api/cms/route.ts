import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

function dataPath(file: string) {
  return path.join(process.cwd(), 'src', 'data', file);
}

async function requireAdmin() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.has('admin_session');
  return isAdmin;
}

// GET /api/cms?file=site-settings
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');
  if (!file || !/^[\w-]+$/.test(file)) {
    return NextResponse.json({ error: 'Invalid file name' }, { status: 400 });
  }
  try {
    const raw = await readFile(dataPath(`${file}.json`), 'utf-8');
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}

// POST /api/cms?file=site-settings  (body = new JSON content)
export async function POST(request: Request) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');
  if (!file || !/^[\w-]+$/.test(file)) {
    return NextResponse.json({ error: 'Invalid file name' }, { status: 400 });
  }

  try {
    const body = await request.json();
    await writeFile(dataPath(`${file}.json`), JSON.stringify(body, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to write file' }, { status: 500 });
  }
}
