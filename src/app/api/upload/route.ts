import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const version = formData.get('version') as string;

    if (!file || !version) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const publicDir = path.join(process.cwd(), 'public');
    const downloadsDir = path.join(publicDir, 'downloads');

    // Asegurar que el directorio existe
    await mkdir(downloadsDir, { recursive: true });

    // Guardar el archivo .exe con versión única para el historial
    const fileName = `updater_${version.replace(/\./g, '_')}.exe`;
    const filePath = path.join(downloadsDir, fileName);
    await writeFile(filePath, buffer);

    // También sobrescribir el "updater.exe" principal para compatibilidad directa
    const mainFilePath = path.join(downloadsDir, 'updater.exe');
    await writeFile(mainFilePath, buffer);

    // Información de la nueva versión
    const newUpdate = {
      version,
      url: `/downloads/${fileName}`,
      timestamp: new Date().toISOString(),
    };

    // Leer y actualizar historial
    const historyPath = path.join(downloadsDir, 'history.json');
    let history = [];
    try {
      const historyContent = await readFile(historyPath, 'utf-8');
      history = JSON.parse(historyContent);
    } catch (e) {
      // Si no existe, empezamos con array vacío
    }

    // Añadir al inicio para que el más reciente esté primero
    history.unshift(newUpdate);
    
    // Limitar historial a los últimos 10 (opcional, pero recomendado)
    if (history.length > 10) history = history.slice(0, 10);

    await writeFile(historyPath, JSON.stringify(history, null, 2));

    // Guardar la información de la última versión
    await writeFile(path.join(downloadsDir, 'version.json'), JSON.stringify(newUpdate, null, 2));

    return NextResponse.json({ 
      success: true, 
      message: 'Actualización subida correctamente',
      data: newUpdate,
      history
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Error al subir el archivo' }, { status: 500 });
  }
}
