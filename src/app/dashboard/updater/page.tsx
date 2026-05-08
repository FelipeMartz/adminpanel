'use client';

import { useState, useEffect } from 'react';
import { Upload, FileCode, CheckCircle2, AlertCircle, Loader2, Download, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function UpdaterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [currentVersion, setCurrentVersion] = useState<{ version: string; timestamp: string } | null>(null);
  const [history, setHistory] = useState<{ version: string; timestamp: string; url: string }[]>([]);
  const [logs, setLogs] = useState<{ ip: string; version_checked: string; timestamp: string }[]>([]);

  useEffect(() => {
    fetch('/downloads/version.json')
      .then(res => res.json())
      .then(data => setCurrentVersion(data))
      .catch(() => setCurrentVersion(null));

    fetch('/downloads/history.json')
      .then(res => res.json())
      .then(data => setHistory(data))
      .catch(() => setHistory([]));

    fetch('/downloads/logs.json')
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(() => setLogs([]));
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !version) return;

    setIsUploading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('version', version);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Update published successfully!' });
        setCurrentVersion(data.data);
        setHistory(data.history || [data.data, ...history]);
        setFile(null);
        setVersion('');
      } else {
        setStatus({ type: 'error', message: data.error || 'Error uploading file' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Network error during upload' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Updater</h1>
        <p className="text-zinc-400 mt-1">Upload new versions of your application (.exe) and manage release history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8">
            <h3 className="text-lg font-bold mb-6">Publish New Version</h3>
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Software Version</label>
                <input
                  type="text"
                  placeholder="e.g. 1.0.5"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Executable File (.exe)</label>
                <div 
                  className={cn(
                    "border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer",
                    file ? "border-green-500/50 bg-green-500/5" : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50"
                  )}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <input
                    id="file-upload"
                    type="file"
                    accept=".exe"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  
                  {file ? (
                    <>
                      <div className="p-4 bg-green-500/10 rounded-full text-green-500">
                        <FileCode size={32} />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-white">{file.name}</p>
                        <p className="text-xs text-zinc-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="text-xs text-zinc-500 hover:text-white transition-colors"
                      >
                        Change file
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-zinc-900 rounded-full text-zinc-500">
                        <Upload size={32} />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-white">Click or drag file here</p>
                        <p className="text-xs text-zinc-400 mt-1">Only .exe files allowed</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {status && (
                <div className={cn(
                  "p-4 rounded-lg flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300",
                  status.type === 'success' ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                )}>
                  {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <p className="text-sm font-medium">{status.message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isUploading || !file || !version}
                className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Publishing Update...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Publish Update
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-zinc-900 bg-zinc-900/30">
              <h3 className="font-bold">Version History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-900">
                    <th className="px-6 py-4 font-medium">Version</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {history.length > 0 ? (
                    history.map((item, idx) => (
                      <tr key={idx} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">
                            {item.version}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-400">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <a 
                            href={item.url} 
                            download 
                            className="text-blue-400 hover:text-blue-300 font-medium"
                          >
                            Download
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-zinc-500 italic">
                        No history available yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Side Info / Current Status */}
        <div className="space-y-6">
          <div className="glass-card p-6 bg-gradient-to-br from-zinc-900 to-zinc-950 border-white/5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Download size={20} className="text-blue-500" />
              Current Version
            </h3>
            
            {currentVersion ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-zinc-400 text-sm">Version:</span>
                  <span className="font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-sm">{currentVersion.version}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-zinc-400 text-sm">Published:</span>
                  <span className="text-white text-sm">{new Date(currentVersion.timestamp).toLocaleDateString()}</span>
                </div>
                <div className="pt-2">
                  <a 
                    href="/downloads/baid.exe" 
                    download
                    className="flex items-center justify-center gap-2 w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
                  >
                    <Download size={14} />
                    Download latest
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-zinc-600 mb-2">No versions published</div>
                <p className="text-xs text-zinc-500">Upload a file to start</p>
              </div>
            )}
          </div>

          <div className="glass-card p-6 border-yellow-500/10 bg-yellow-500/[0.02]">
            <h4 className="text-sm font-bold text-yellow-500 mb-2 uppercase tracking-wider">App Instructions</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your application should check this endpoint for updates:
            </p>
            <div className="mt-3 p-3 bg-black/50 rounded font-mono text-[10px] text-zinc-300 break-all border border-white/5">
              GET /api/check-update
            </div>
            <p className="text-xs text-zinc-500 mt-3">
              The system automatically logs the user's IP address on every request.
            </p>
          </div>

          <div className="glass-card p-6 border-blue-500/10 bg-blue-500/[0.02]">
            <h4 className="text-sm font-bold text-blue-500 mb-4 uppercase tracking-wider">Recent Activity (IPs)</h4>
            <div className="space-y-4">
              {logs.length > 0 ? (
                logs.slice(0, 10).map((log, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0 group">
                    <div>
                      <p className="text-white font-mono flex items-center gap-2">
                        {log.ip}
                        <span className="text-[10px] text-zinc-500">v{log.version_checked}</span>
                      </p>
                      <p className="text-zinc-600">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <button 
                      onClick={async () => {
                        const reason = prompt(`Ban reason for ${log.ip}?`, "Violation of terms");
                        if (reason === null) return;
                        
                        const res = await fetch('/api/admin/ban-ip', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ ip: log.ip, action: 'ban', reason })
                        });
                        if (res.ok) alert('IP Banned');
                      }}
                      className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded transition-all"
                    >
                      Ban
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500 italic text-center">Waiting for connections...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
