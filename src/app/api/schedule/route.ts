import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'schedule.json');

interface ClassSession {
  id: number;
  subject: string;
  location: string;
  startTime: string;
  endTime: string;
  date: string;
}

export async function GET() {
  try {
    const fileData = await fs.readFile(DATA_PATH, 'utf8');
    const data = JSON.parse(fileData);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading schedule.json:', error);
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newClass: Partial<ClassSession> = await request.json();
    
    // Read the existing data
    const fileData = await fs.readFile(DATA_PATH, 'utf8');
    const data = JSON.parse(fileData);
    
    // Generate a new ID
    const nextId = data.classes.length > 0 ? Math.max(...data.classes.map((c: ClassSession) => c.id)) + 1 : 1;
    
    const classToSave: ClassSession = {
      id: nextId,
      subject: newClass.subject || 'Untitled Course',
      location: newClass.location || 'TBA',
      startTime: newClass.startTime || '00:00',
      endTime: newClass.endTime || '00:00',
      date: newClass.date || new Date().toISOString().split('T')[0],
    };
    
    data.classes.push(classToSave);
    
    // Write back to the file
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
    
    return NextResponse.json(classToSave, { status: 201 });
  } catch (error) {
    console.error('Error writing to schedule.json:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
