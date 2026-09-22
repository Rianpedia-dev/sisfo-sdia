# Panduan Lengkap & Praktis Deploy ke Windows Server (MSTSC / RDP) & CI/CD GitHub
test brench 2 dev
Dokumen ini berisi panduan langkah demi langkah (*step-by-step*) untuk melakukan deployment aplikasi **SISFO SDIA Cairo** (Next.js 16 + Prisma + MySQL) ke **Windows Server** menggunakan akses Remote Desktop (`mstsc`), serta konfigurasi **CI/CD otomatis menggunakan GitHub Actions**.

---

## Daftar Isi
1. [Arsitektur & Gambaran Umum](#1-arsitektur--gambaran-umum)
2. [Fase 1: Login Server & Persiapan Lingkungan](#fase-1-login-server--persiapan-lingkungan-windows)
3. [Fase 2: Instalasi & Konfigurasi Database MySQL](#fase-2-instalasi--konfigurasi-database-mysql)
4. [Fase 3: Setup & Build Aplikasi di Server](#fase-3-setup--build-aplikasi-di-server)
5. [Fase 4: Menjalankan Aplikasi Sebagai Background Service (PM2)](#fase-4-menjalankan-aplikasi-sebagai-background-service-pm2)
6. [Fase 5: Reverse Proxy & Domain SSL (Caddy / IIS)](#fase-5-reverse-proxy--domain-ssl-caddy--iis)
7. [Fase 6: Setup CI/CD Otomatis Menggunakan GitHub Actions](#fase-6-setup-cicd-otomatis-menggunakan-github-actions)
8. [Fase 7: Maintenance, Backup & Troubleshooting](#fase-7-maintenance-backup--troubleshooting)

---

## 1. Arsitektur & Gambaran Umum

```
[ Pengguna / Browser ]
         │ (Port 80 / 443 HTTPS)
         ▼
[ Reverse Proxy: Caddy / IIS ] ── (Otomatis SSL Let's Encrypt)
         │ (Proxy internal ke Port 3000)
         ▼
[ Node.js Next.js App ] ── (Dikelola oleh PM2 Windows Service)
         │
         ▼
[ Database MySQL 8.0 ] (Port 3306)
         ▲
         │ (Auto-deploy saat push ke main)
[ GitHub Actions (Self-Hosted Runner) ]
```

- **Akses Server**: Menggunakan RDP (`mstsc.exe`).
- **Runtime**: Node.js v20 atau v22 LTS (Windows x64).
- **Process Manager**: PM2 (berjalan di background 24/7, tidak mati saat keluar dari RDP).
- **Reverse Proxy**: Caddy (sangat disarankan di Windows: 1 file executable, SSL HTTPS otomatis) atau IIS.
- **CI/CD**: GitHub Actions Self-Hosted Runner (aman karena tidak perlu membuka port SSH publik ke server).

---

## Fase 1: Login Server & Persiapan Lingkungan Windows

### 1.1. Login ke Windows Server via MSTSC
1. Di komputer lokal Anda, tekan `Win + R`, ketik `mstsc` lalu tekan **Enter**.
2. Masukkan **IP Address / Hostname** server yang diberikan (contoh: `103.xx.xx.xx` atau `server.alazhar.sch.id`).
3. Klik **Connect**.
4. Masukkan **Username** (biasanya `Administrator` atau user khusus) dan **Password**.
5. Jika muncul peringatan sertifikat keamanan, centang *"Don't ask me again for connections to this computer"* lalu klik **Yes**.

---

### 1.2. Download & Install Software Wajib
Buka browser (Edge) di server, download dan install tools berikut:

1. **Node.js LTS (v20 atau v22 x64)**
   - Download installer `.msi`: [https://nodejs.org/](https://nodejs.org/)
   - Install dengan opsi default (pastikan opsi *"Add to PATH"* tercentang).
2. **Git for Windows**
   - Download: [https://git-scm.com/download/win](https://git-scm.com/download/win)
   - Install dengan opsi default.
3. **MySQL Server 8.0 (atau MariaDB)**
   - Download MySQL Community Server: [https://dev.mysql.com/downloads/installer/](https://dev.mysql.com/downloads/installer/)
   - *Catatan:* Jika server sudah memiliki MySQL atau menggunakan database external / cloud, lewati instalasi ini.
4. **Visual Studio Code / Notepad++ (Opsional)**
   - Sangat membantu untuk mengedit file `.env` di server.

### 1.3. Verifikasi Instalasi via PowerShell
Buka **PowerShell (Run as Administrator)** di server, lalu jalankan:
```powershell
node -v      # Pastikan muncul v20.x atau v22.x
npm -v       # Pastikan muncul versi npm
git --version # Pastikan muncul versi git
```

---

## Fase 2: Instalasi & Konfigurasi Database MySQL

Jika MySQL diinstall langsung di Windows Server:

1. **Buka MySQL Command Line Client** atau PowerShell:
   ```powershell
   mysql -u root -p
   ```
2. **Buat Database & User Khusus Aplikasi**:
   ```sql
   CREATE DATABASE sisfo_alazhar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

   -- Buat user khusus (ganti 'PasswordKuat123!' dengan password aman)
   CREATE USER 'sisfo_user'@'localhost' IDENTIFIED BY 'PasswordKuat123!';
   GRANT ALL PRIVILEGES ON sisfo_alazhar.* TO 'sisfo_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

---

## Fase 3: Setup & Build Aplikasi di Server

### 3.1. Buat Direktori Kerja & Clone Repository
Buka PowerShell Administrator:
```powershell
# Buat folder khusus aplikasi
New-Item -ItemType Directory -Path "C:\apps" -Force
cd C:\apps

# Clone repository Anda
git clone https://github.com/USERNAME/REPO_NAME.git sisfo-alazhar-sd
cd sisfo-alazhar-sd
```

### 3.2. Konfigurasi File `.env` Production
Salin file template:
```powershell
Copy-Item .env.example .env
notepad .env
```
Isi nilai-nilai penting di file `.env`:
```env
# Database
DATABASE_URL="mysql://sisfo_user:PasswordKuat123!@localhost:3306/sisfo_alazhar"
DB_CONNECTION_LIMIT="25"
DB_SSL_REJECT_UNAUTHORIZED="true"

# Auth Secret (Wajib diisi string acak minimal 32 karakter)
# Di PowerShell bisa digenerate dengan: 
# [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 } | ForEach-Object { [byte]$_ }))
AUTH_SECRET="masukkan_string_acak_panjang_dan_aman_disini"

# URLs (Sesuaikan dengan domain atau IP server)
NEXTAUTH_URL="https://sisfo.sekolahanda.sch.id"
NEXT_PUBLIC_APP_URL="https://sisfo.sekolahanda.sch.id"
NEXT_PUBLIC_APP_NAME="SISFO SDIA Cairo"

# Daily.co (Jika fitur kelas online aktif)
DAILY_API_KEY=""
NEXT_PUBLIC_DAILY_DOMAIN=""

# Mode Production
ENABLE_DEMO_MODE="false"
RATE_LIMIT_ENABLED="true"
```
Simpan file (`Ctrl + S`) dan tutup Notepad.

### 3.3. Install Dependencies & Build Aplikasi
Jalankan perintah berikut di folder aplikasi (`C:\apps\sisfo-alazhar-sd`):
```powershell
# Install semua dependensi
npm ci

# Push skema prisma ke database (atau migrate deploy)
npx prisma db push

# (Opsional) Jalankan seed jika data awal diperlukan
# npm run seed

# Build Next.js untuk production
npm run build
```

---

## Fase 4: Menjalankan Aplikasi Sebagai Background Service (PM2)

Agar aplikasi **tetap hidup** saat Anda menutup jendela MSTSC/RDP dan **otomatis menyala saat server restart**, gunakan **PM2**.

### 4.1. Install PM2 Secara Global
```powershell
npm install -g pm2
```

### 4.2. Buat File Konfigurasi PM2 (`ecosystem.config.cjs`)
Di dalam folder `C:\apps\sisfo-alazhar-sd`, buat file `ecosystem.config.cjs`:
```powershell
notepad ecosystem.config.cjs
```
Tempelkan konfigurasi berikut:
```javascript
module.exports = {
  apps: [
    {
      name: "sisfo-sdia",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: "C:/apps/sisfo-alazhar-sd",
      instances: "max",       // atau 2/4 sesuai jumlah core CPU server
      exec_mode: "cluster",   // load balancing otomatis
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};
```
Simpan dan tutup.

### 4.3. Jalankan Aplikasi dengan PM2
```powershell
# Jalankan aplikasi
pm2 start ecosystem.config.cjs

# Simpan state agar diingat PM2
pm2 save

# Cek status aplikasi
pm2 status
pm2 logs sisfo-sdia --lines 20
```
Sekarang aplikasi sudah berjalan di `http://localhost:3000`.

### 4.4. Pasang PM2 Sebagai Windows Service (Auto-Start saat Reboot)
Gunakan tool `pm2-windows-service`:
```powershell
npm install -g pm2-windows-service

# Pasang service ke Windows
pm2-service-install -n PM2
```
*Saat diminta konfigurasi:*
- `Perform other actions on the PM2 service?` -> Tekan `Enter` (No).
- `Set PM2_HOME?` -> Ketik `C:\etc\.pm2` atau tekan `Enter` untuk default (`%USERPROFILE%\.pm2`).
- `Set PM2_SERVICE_SCRIPTS?` -> Tekan `Enter`.

Sekarang jika server di-restart, aplikasi Next.js akan langsung berjalan otomatis tanpa harus login RDP!

---

## Fase 5: Reverse Proxy & Domain SSL (Caddy / IIS)

Aplikasi Next.js berjalan di port internal `3000`. Untuk membukanya ke internet dengan domain sekolah dan HTTPS gratis, gunakan salah satu dari dua opsi berikut:

### Opsi A: Caddy Server (Sangat Direkomendasikan ⭐⭐⭐⭐⭐)
*Caddy adalah web server modern, 1 file `.exe` tanpa ribet, dan otomatis mengurus sertifikat SSL Let's Encrypt gratis.*

1. **Download Caddy**:
   - Buka browser di server, download `caddy_windows_amd64.exe` dari [https://caddyserver.com/download](https://caddyserver.com/download).
   - Buat folder `C:\caddy`, letakkan file tersebut di sana dan ubah namanya menjadi `caddy.exe`.
2. **Buat File `C:\caddy\Caddyfile`**:
   ```powershell
   notepad C:\caddy\Caddyfile
   ```
   Isi dengan:
   ```caddy
   sisfo.sekolahanda.sch.id {
       reverse_proxy 127.0.0.1:3000
   }
   ```
3. **Jalankan Caddy sebagai Windows Service**:
   - Jalankan PowerShell Administrator:
     ```powershell
     cd C:\caddy
     # Pasang Caddy sebagai Windows Service (menggunakan sc.exe)
     sc.exe create Caddy binPath= "C:\caddy\caddy.exe run --config C:\caddy\Caddyfile" start= auto
     net start Caddy
     ```
4. Caddy akan otomatis menerbitkan sertifikat SSL Let's Encrypt. Website Anda langsung aktif di `https://sisfo.sekolahanda.sch.id`.

---

### Opsi B: Menggunakan IIS (Internet Information Services)
Jika instansi Anda mewajibkan penggunaan IIS:
1. Buka **Server Manager** > **Add Roles and Features** > Aktifkan **Web Server (IIS)**.
2. Download dan install dua ekstensi resmi Microsoft:
   - **URL Rewrite**: [https://www.iis.net/downloads/microsoft/url-rewrite](https://www.iis.net/downloads/microsoft/url-rewrite)
   - **Application Request Routing (ARR)**: [https://www.iis.net/downloads/microsoft/application-request-routing](https://www.iis.net/downloads/microsoft/application-request-routing)
3. Di IIS Manager:
   - Klik nama server > **Application Request Routing Cache** > **Server Proxy Settings** > Centang **Enable proxy** > Klik **Apply**.
4. Buat Website baru di IIS mengarah ke folder kosong (misal `C:\inetpub\sisfo-proxy`), dan buat file `web.config`:
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <configuration>
       <system.webServer>
           <rewrite>
               <rules>
                   <rule name="ReverseProxyToNextjs" stopProcessing="true">
                       <match url="(.*)" />
                       <action type="Rewrite" url="http://127.0.0.1:3000/{R:1}" />
                   </rule>
               </rules>
           </rewrite>
       </system.webServer>
   </configuration>
   ```

---

### 5.3. Konfigurasi Windows Firewall
Pastikan port 80 (HTTP) dan 443 (HTTPS) dibuka di Windows Defender Firewall:
```powershell
# Buka port 80 dan 443 untuk Web Traffic
New-NetFirewallRule -DisplayName "HTTP (Port 80)" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "HTTPS (Port 443)" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow
```

---

## Fase 6: Setup CI/CD Otomatis Menggunakan GitHub Actions

Untuk Windows Server, metode terbaik adalah **GitHub Actions Self-Hosted Runner**:
- **Kelebihan**: Server tidak perlu membuka port SSH ke publik (lebih aman dari serangan brute force). Runner di Windows Server yang akan menghubungi GitHub secara berkala via HTTPS (outbound port 443).

---

### Langkah 1: Pasang GitHub Self-Hosted Runner di Windows Server

1. Buka repository Anda di browser: **GitHub > Settings > Actions > Runners**.
2. Klik tombol **"New self-hosted runner"**.
3. Pilih **Windows** dan arsitektur **x64**.
4. Di Windows Server, buka **PowerShell (Run as Administrator)** dan jalankan perintah yang tertera di halaman GitHub tersebut:

```powershell
# 1. Buat folder runner
mkdir C:\actions-runner
cd C:\actions-runner

# 2. Download runner (versi terbaru sesuai yang tertera di GitHub)
Invoke-WebRequest -Uri https://github.com/actions/runner/releases/download/v2.322.0/actions-runner-win-x64-2.322.0.zip -OutFile actions-runner.zip
Expand-Archive -Path actions-runner.zip -DestinationPath .
Remove-Item actions-runner.zip

# 3. Konfigurasi runner (Gunakan TOKEN yang ada di halaman GitHub Anda)
.\config.cmd --url https://github.com/USERNAME/REPO_NAME --token MASUKKAN_TOKEN_DARI_GITHUB --name "WindowsServer-SISFO" --labels "windows-server,production" --unattended

# 4. Install Runner sebagai Windows Service (agar jalan otomatis di background)
.\svc.bat install
.\svc.bat start
```
*Status runner di GitHub Settings sekarang akan berubah menjadi warna hijau (**Idle**).*

---

### Langkah 2: Buat Workflow GitHub Actions di Repositori Anda

Di komputer lokal / repo proyek Anda, buat file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Windows Server

on:
  push:
    branches:
      - main # atau master (trigger setiap push ke branch utama)

jobs:
  deploy:
    name: Build & Deploy
    runs-on: [self-hosted, windows-server] # Menjalankan job di Windows Server Anda

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Copy Code to Application Directory
        shell: powershell
        run: |
          Write-Host "Syncing code to production directory..."
          $targetDir = "C:\apps\sisfo-alazhar-sd"
          
          # Gunakan robocopy untuk sync file kecuali .env dan node_modules
          robocopy . $targetDir /E /XD node_modules .git /XF .env /NFL /NDL /NJH /NJS /nc /ns /np
          
          # Robocopy exit code < 8 menandakan sukses
          if ($LASTEXITCODE -ge 8) {
            throw "Robocopy failed with exit code $LASTEXITCODE"
          }

      - name: Install Dependencies, Migrate & Build
        shell: powershell
        run: |
          cd C:\apps\sisfo-alazhar-sd
          
          Write-Host "Installing dependencies..."
          npm ci
          
          Write-Host "Generating Prisma Client..."
          npx prisma generate
          
          Write-Host "Pushing Database Schema..."
          npx prisma db push --skip-generate
          
          Write-Host "Building Next.js Application..."
          npm run build

      - name: Reload PM2 Process
        shell: powershell
        run: |
          cd C:\apps\sisfo-alazhar-sd
          Write-Host "Reloading application with zero-downtime..."
          pm2 reload sisfo-sdia || pm2 start ecosystem.config.cjs
          pm2 save
          Write-Host "Deployment completed successfully!"
```

### Langkah 3: Tes CI/CD
1. Lakukan perubahan kecil (misal update teks di file README atau komit file workflow).
2. Lakukan `git add .`, `git commit -m "ci: setup automatic deployment to windows server"`, dan `git push origin main`.
3. Buka tab **Actions** di GitHub. Anda akan melihat workflow berjalan dan secara otomatis men-deploy versi terbaru ke Windows Server Anda dalam 1-3 menit!

---

## Fase 7: Maintenance, Backup & Troubleshooting

### 7.1. Perintah Cek Status Harian (di Server)
```powershell
# Cek apakah aplikasi jalan
pm2 status

# Lihat log error aplikasi secara realtime
pm2 logs sisfo-sdia --err

# Restart manual aplikasi jika diperlukan
pm2 restart sisfo-sdia
```

### 7.2. Backup Otomatis Database MySQL
Buat script PowerShell di `C:\scripts\backup-db.ps1`:
```powershell
$date = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "C:\db-backups"
if (!(Test-Path -Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir }

# Eksekusi mysqldump
& "mysqldump" -u sisfo_user -pPasswordKuat123! sisfo_alazhar > "$backupDir\sisfo_alazhar_$date.sql"

# Hapus backup yang lebih lama dari 14 hari
Get-ChildItem -Path $backupDir -Filter *.sql | Where-Object { $_.CreationTime -lt (Get-Date).AddDays(-14) } | Remove-Item
```
Jadwalkan script ini berjalan setiap malam pukul 01:00 via **Windows Task Scheduler** (`taskschd.msc`).

---

## Ringkasan Checklist Sebelum Go-Live

| No | Komponen | Status | Catatan |
|---|---|---|---|
| 1 | File `.env` terisi lengkap | [ ] | Pastikan `ENABLE_DEMO_MODE="false"` dan `AUTH_SECRET` panjang & acak |
| 2 | Database MySQL berjalan | [ ] | User database memiliki hak akses penuh ke DB `sisfo_alazhar` |
| 3 | Prisma Schema teraplikasikan | [ ] | Tabel-tabel sudah terbuat melalui `npx prisma db push` |
| 4 | PM2 berjalan & tersimpan | [ ] | `pm2 save` sudah dijalankan & terdaftar di Windows Service |
| 5 | Reverse Proxy (Caddy/IIS) aktif | [ ] | Port 80 & 443 diteruskan ke port 3000, sertifikat SSL valid |
| 6 | Firewall Windows terbuka | [ ] | Rule Inbound Port 80 dan 443 sudah diizinkan |
| 7 | GitHub Actions Runner aktif | [ ] | Service `actions.runner...` berjalan dan status "Idle" di GitHub |
