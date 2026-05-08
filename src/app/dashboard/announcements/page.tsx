'use client';

import { useState } from 'react';
import { Megaphone, Send, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export default function AnnouncementsPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await axios.post('/api/discord/webhook', { title, description, color });
      if (response.data.success) {
        setStatus({ type: 'success', message: '¡Anuncio enviado correctamente!' });
        setTitle('');
        setDescription('');
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: 'Error al enviar el anuncio' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Anuncios</h1>
        <p className="text-zinc-400 mt-1">Envía notificaciones a tu canal de Discord mediante webhooks.</p>
      </div>

      <div className="glass-card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Título del Anuncio</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
                placeholder="Ej: Nueva Actualización 2.0"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Color del Embed</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-10 p-1 bg-zinc-900 border-zinc-800"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 font-mono uppercase"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Contenido / Descripción</label>
            <textarea
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full"
              placeholder="Escribe aquí el contenido de tu anuncio..."
            />
          </div>

          {status && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${
              status.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-500' : 'bg-red-500/10 border border-red-500/20 text-red-500'
            }`}>
              {status.type === 'success' ? <CheckCircle2 size={18} /> : null}
              <span className="text-sm">{status.message}</span>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2 px-8"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> Enviar Anuncio</>}
            </button>
          </div>
        </form>
      </div>

      <div className="glass-card p-6 border-l-4 border-blue-500 bg-blue-500/5">
        <h4 className="font-bold flex items-center gap-2 mb-2">
          <Megaphone size={16} /> Tip de Seguridad
        </h4>
        <p className="text-sm text-zinc-400">
          El Webhook de Discord se maneja exclusivamente en el servidor. Nunca expongas la URL del webhook en el código del cliente para evitar que terceros envíen mensajes en tu nombre.
        </p>
      </div>
    </div>
  );
}
