using System;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using System.Diagnostics;
using System.Text.Json; // Nativo en .NET 6.0+

namespace UpdaterExample
{
    class Program
    {
        private static readonly string ApiUrl = "http://localhost:3000/api/check-update";
        private static readonly string PresenceUrl = "http://localhost:3000/api/presence";
        private static readonly string LocalVersion = "1.0.0";
        private static readonly string TargetExe = "baid.exe";
        private static readonly HttpClient client = new HttpClient();
        private static string CurrentUser = "Usuario_Local"; // Esto podría venir de un login

        private static Process _baidProcess = null;

        static async Task Main(string[] args)
        {
            Console.Title = "BAID Loader";
            Console.WriteLine("--- Iniciando BAID ---");

            // Handler para cerrar baid.exe si el loader se cierra
            AppDomain.CurrentDomain.ProcessExit += (s, e) => KillBaid();
            Console.CancelKeyPress += (s, e) => KillBaid();

            // Iniciar latido de presencia en segundo plano
            _ = Task.Run(() => StartHeartbeat());

            try
            {
                Console.WriteLine("Verificando actualizaciones...");
                var response = await client.GetAsync(ApiUrl);

                if (response.StatusCode == System.Net.HttpStatusCode.Forbidden)
                {
                    HandleBan(await response.Content.ReadAsStringAsync());
                    Console.ReadKey();
                    return;
                }

                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    var updateInfo = JsonDocument.Parse(json);
                    string remoteVersion = updateInfo.RootElement.GetProperty("version").GetString();
                    string downloadUrl = "http://localhost:3000" + updateInfo.RootElement.GetProperty("url").GetString();

                    if (remoteVersion != LocalVersion)
                    {
                        Console.ForegroundColor = ConsoleColor.Yellow;
                        Console.WriteLine($"\nNueva versión encontrada: {remoteVersion}");
                        await DownloadAndExecuteUpdate(downloadUrl);
                    }
                    else
                    {
                        Console.ForegroundColor = ConsoleColor.Green;
                        Console.WriteLine("\n[OK] Versión al día.");
                        Console.ResetColor();
                        LaunchBaid();
                    }
                }
            }
            catch (Exception ex) { Console.WriteLine("Error: " + ex.Message); }
            
            // Mantener el loader abierto mientras baid.exe esté corriendo
            while (_baidProcess != null && !_baidProcess.HasExited)
            {
                await Task.Delay(1000);
            }

            Console.WriteLine("\nBAID se ha cerrado. El loader se cerrará ahora.");
            await Task.Delay(2000);
        }

        static void KillBaid()
        {
            if (_baidProcess != null && !_baidProcess.HasExited)
            {
                try { _baidProcess.Kill(); } catch { }
            }
        }

        static async Task StartHeartbeat()
        {
            while (true)
            {
                try { await client.GetAsync($"{PresenceUrl}?username={CurrentUser}"); }
                catch { /* Silencioso si falla el servidor */ }
                await Task.Delay(10000); // 10 segundos
            }
        }

        static void LaunchBaid()
        {
            if (File.Exists(TargetExe))
            {
                Console.WriteLine($"Lanzando {TargetExe}...");
                _baidProcess = Process.Start(new ProcessStartInfo(TargetExe) { UseShellExecute = true });
            }
            else
            {
                Console.WriteLine($"\n[ERROR] {TargetExe} no encontrado.");
            }
        }

        static async Task DownloadAndExecuteUpdate(string url)
        {
            try
            {
                Console.WriteLine("Descargando baid.exe...");
                byte[] fileBytes = await client.GetByteArrayAsync(url);
                
                // Si baid.exe está abierto, hay que cerrarlo primero
                foreach (var process in Process.GetProcessesByName("baid"))
                {
                    process.Kill();
                    process.WaitForExit();
                }

                File.WriteAllBytes(TargetExe, fileBytes);
                Console.WriteLine("Actualización completada.");
                LaunchBaid();
            }
            catch (Exception ex) { Console.WriteLine($"Error al actualizar: {ex.Message}"); }
        }

        static void HandleBan(string errorJson)
        {
            var errorDoc = JsonDocument.Parse(errorJson);
            string serverMessage = errorDoc.RootElement.GetProperty("message").GetString();
            Console.Clear();
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("========================================");
            Console.WriteLine("           ACCESO DENEGADO");
            Console.WriteLine("========================================");
            Console.WriteLine($"\n{serverMessage}");
            Console.ResetColor();
        }
    }
}
