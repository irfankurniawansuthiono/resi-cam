<div align="center">

<img src="./public/img/logo/resi-cam-transparent-logo.png" alt="resi-cam logo" width="180"/>

<img src="https://img.shields.io/badge/version-1.3.0-blue?style=for-the-badge" alt="Version"/>
<img src="https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js" alt="Next.js"/>
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React"/>
<img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript"/>
<img src="https://img.shields.io/badge/Prisma-7.6-2D3748?style=for-the-badge&logo=prisma" alt="Prisma"/>
<img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License"/>

# 📷 resi-cam

**EN** | [ID](#bahasa-indonesia)

> A modern, open-source web-based camera/receipt management system built with Next.js, tRPC, Prisma, and real-time video chunk processing via FFmpeg.

</div>

---

### WHAT'S NEW IN V1.3.0

- fixed symlink error in config.ts for finalPath
- camera overlay style in preview + record using canvas tag in HTML5!
- enchance preview to fit the video

---

## en English

### Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Adding Timestamp Overlay (CCTV-style)](#adding-timestamp-overlay-cctv-style)
- [Configuration](#configuration)
- [Contributing (Pull Request Guide)](#contributing-pull-request-guide)
- [Contributors](#contributors)
- [Acknowledgements](#acknowledgements)

---

### Overview

**resi-cam** is a full-stack open-source application designed for camera-based receipt and video management. It leverages **FFmpeg** to merge video chunks seamlessly, offering a robust pipeline for video capture, processing, and storage. The project integrates modern tooling including tRPC for type-safe APIs, Prisma for database management, and UploadThing for media uploads.

---

### Features

- 🎥 **Video chunk merging** via FFmpeg
- 🔐 **Authentication** via Better Auth
- 📊 **Dashboard & Data Tables** with TanStack Query & Table
- 📁 **File uploads** via UploadThing
- 🎨 **Modern UI** with Radix UI, shadcn/ui, Tailwind CSS v4
- 📱 **Responsive design** with dark/light mode
- 🔄 **Real-time updates** with tRPC + React Query
- 🕐 **CCTV-style timestamp overlay** <--- new update in version 1.3.0

---

### Tech Stack

| Category         | Technology           |
| ---------------- | -------------------- |
| Framework        | Next.js 16, React 19 |
| Language         | TypeScript 5.9       |
| API Layer        | tRPC v11             |
| Database ORM     | Prisma 7             |
| Database         | PostgreSQL           |
| Auth             | Better Auth          |
| UI Components    | Radix UI, shadcn/ui  |
| Styling          | Tailwind CSS v4      |
| File Upload      | UploadThing          |
| Video Processing | FFmpeg               |
| State Management | TanStack Query v5    |
| Animation        | GSAP                 |
| Runtime          | Node.js, Bun         |

---

### Prerequisites

Make sure the following are installed on your system before proceeding:

| Dependency                               | Version | Installation                                 |
| ---------------------------------------- | ------- | -------------------------------------------- |
| [Node.js](https://nodejs.org)            | ≥ 18.x  | [nodejs.org](https://nodejs.org)             |
| [Bun](https://bun.sh)                    | Latest  | `curl -fsSL https://bun.sh/install \| bash`  |
| [FFmpeg](https://ffmpeg.org)             | Latest  | See guide below ⬇️                           |
| [PostgreSQL](https://www.postgresql.org) | ≥ 14    | [postgresql.org](https://www.postgresql.org) |

---

### Installing FFmpeg on Windows (via winget)

> 💡 **winget** is the Windows Package Manager, built into Windows 10 (1809+) and Windows 11.

#### Step 1 — Check if winget is available

Open **PowerShell** or **Command Prompt** and run:

```powershell
where winget
```

If it returns a path (e.g. `C:\Users\...\winget.exe`), you're good to go. If not, install it from the [Microsoft Store → App Installer](https://apps.microsoft.com/detail/9NBLGGH4NNS1).

#### Step 2 — Install FFmpeg via winget

```powershell
winget install --id Gyan.FFmpeg -e --source winget
```

#### Step 3 — Find where FFmpeg was installed

```powershell
where ffmpeg
```

This will print the current install path, something like:

```
C:\Users\YourName\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_...\ffmpeg-x.x.x-full_build\bin\ffmpeg.exe
```

#### Step 4 — Move FFmpeg to `C:\ffmpeg`

Open **PowerShell as Administrator** and run:

```powershell
# Create the target directory
New-Item -ItemType Directory -Force -Path "C:\ffmpeg"

# Copy the entire FFmpeg folder (adjust the source path from Step 3 above)
# Example — replace the path below with the actual path from 'where ffmpeg'
Copy-Item -Recurse -Force "C:\Users\$env:USERNAME\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-*\*" "C:\ffmpeg"
```

Or you can do it automatically with this one-liner:

```powershell
$src = (Get-Item "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Gyan.FFmpeg*\ffmpeg-*").FullName
Copy-Item -Recurse -Force "$src\*" "C:\ffmpeg"
```

#### Step 5 — Add FFmpeg to System PATH

Run the following in **PowerShell as Administrator**:

```powershell
[System.Environment]::SetEnvironmentVariable(
  "Path",
  [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";C:\ffmpeg\bin",
  "Machine"
)
```

#### Step 6 — Verify the installation

Close and reopen your terminal, then run:

```powershell
ffmpeg -version
```

You should see output like:

```
ffmpeg version 7.x.x Copyright (c) 2000-2024 the FFmpeg developers
...
```

> ⚠️ **If `ffmpeg` is not recognized after restart:** Double-check that `C:\ffmpeg\bin` exists and contains `ffmpeg.exe`. You can also verify PATH via **System Properties → Environment Variables → System Variables → Path**.

---

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/irfankurniawansuthiono/resi-cam.git
cd resi-cam
```

**2. Install dependencies**

```bash
bun install
```

**3. Set up environment variables**

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

> See [Environment Variables](#environment-variables) for details.

**4. Generate Prisma client**

```bash
bunx prisma generate
```

**5. Run database migrations**

```bash
bunx prisma migrate dev
```

**6. (Optional) Seed the database**

```bash
bun run seed
```

---

### Environment Variables

Create a `.env` file in the root of the project with the following variables:

```env
# Auth Secret (generate using: bunx @better-auth/cli@latest secret)
BETTER_AUTH_SECRET=your_generated_secret_here
BETTER_AUTH_URL=http://localhost:3000

# Public URL
NEXT_PUBLIC_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://{username}:{password}@localhost:{port}/{db}?schema=public"
```

> ⚠️ **Security Note:** Never commit your `.env` file to version control. Make sure `.env` is listed in your `.gitignore`.

To generate a new auth secret, run:

```bash
bunx @better-auth/cli@latest secret
```

---

### Running the App

```bash
bun dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

---

### Adding Timestamp Overlay (CCTV-style) (deprecated before v1.3.0)

You can overlay a real-time date and time on your webcam feed using **OBS Studio** with a Lua script — simulating a professional CCTV timestamp.

**Step-by-step setup:**

1. Go to the [OBS DateTime Lua Script page](https://obsproject.com/forum/threads/datetime-digital-clock.113883/) and click the grey **"Go to download"** button at the top right.
2. Save the `datetime.lua` file to a memorable location on your computer.
3. Open **OBS Studio**.
4. In the **Sources** panel, right-click and add a new **Text (FreeType 2)** source. Name it something unique (e.g., `clock1`). You don't need to fill it in — the script will handle it.
5. Go to **Tools → Scripts** in the menu bar.
6. Click the **"+"** button and navigate to your saved `datetime.lua` file, then click **Open**.
7. Select the script in the **Loaded Scripts** list. A description panel will appear on the right.
8. Set the **Datetime format** field to your preferred format, e.g.:
    ```
    %Y-%m-%dT%H:%M:%S%z
    ```
    _(produces output like: `2024-06-11T01:28:13+00:00`)_
9. Set the **Text Source** field to exactly match the name you gave your text source (e.g., `clock1`).
10. Click **Close** on the Scripts window.
11. The text source will now auto-update with the current time. Right-click it → **Properties** to customize font, size, and color.
12. Enable **OBS Virtual Camera** (Tools → Start Virtual Camera) and select it as your camera input in resi-cam.

---

### Configuration

App version and global settings are managed in:

```
app/config.ts
```

Edit this file to change app-level configurations such as version information, feature flags, or API endpoints.

---

### Contributing (Pull Request Guide)

We welcome contributions! Follow the step-by-step guide below to submit a Pull Request (PR) on GitHub.

#### Step 1 — Fork the Repository

1. Go to the project repository page on GitHub.
2. Click the **"Fork"** button (top-right corner of the page).
3. This creates a copy of the repository under your own GitHub account.

#### Step 2 — Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/resi-cam.git
cd resi-cam
```

#### Step 3 — Set the Upstream Remote

This connects your local repo to the original project so you can pull future updates:

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/resi-cam.git
```

Verify:

```bash
git remote -v
```

#### Step 4 — Create a New Branch

Always create a new branch for your changes. **Never work directly on `main`.**

```bash
git checkout -b feat/your-feature-name
```

**Branch naming conventions:**

| Prefix      | Use case             |
| ----------- | -------------------- |
| `feat/`     | New feature          |
| `fix/`      | Bug fix              |
| `docs/`     | Documentation update |
| `refactor/` | Code refactoring     |
| `chore/`    | Maintenance tasks    |

#### Step 5 — Make Your Changes

Make your code changes, then stage and commit them:

```bash
git add .
git commit -m "feat: add your descriptive commit message"
```

**Commit message format:**

```
type(scope): short description

Example:
feat(video): add FFmpeg chunk merge progress indicator
fix(auth): resolve session token expiry bug
docs(readme): update installation steps
```

#### Step 6 — Push to Your Fork

```bash
git push origin feat/your-feature-name
```

#### Step 7 — Open a Pull Request

1. Go to **your forked repository** on GitHub.
2. You will see a banner saying **"Compare & pull request"** — click it.
3. Set the base repository to the original `resi-cam` repo and base branch to `main`.
4. Fill in the PR template:
    - **Title:** A clear, concise title (e.g., `feat: add FFmpeg progress bar`)
    - **Description:** Explain _what_ you changed and _why_
    - **Screenshots/recordings:** If applicable, attach visuals
5. Click **"Create pull request"**.

#### Step 8 — Respond to Review

- A maintainer will review your PR and may request changes.
- Make the requested changes on the same branch and push again — the PR will update automatically.
- Once approved, your changes will be merged. 🎉

#### Keeping Your Fork Up to Date

Before starting new work, sync your fork with the upstream:

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

---

### Contributors

Thanks to all the amazing people who have contributed to this project! 🙌

<!-- ALL-CONTRIBUTORS-LIST:START -->
<a href="https://github.com/irfankurniawansuthiono/resi-cam/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=irfankurniawansuthiono/resi-cam" alt="Contributors"/>
</a>
<!-- ALL-CONTRIBUTORS-LIST:END -->

> Want to see your name here? [Submit a Pull Request](#contributing-pull-request-guide)!

---

### Acknowledgements

This project would not have been possible without the following incredible resources, tools, and people. A huge thank you to everyone listed here. 🙏

#### 🧱 Project Foundation

This project was **bootstrapped from** the open-source starter kit by **Candra Wali Sanjaya**:

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/chndrwali/nextjs-starter-kit">
        <img src="https://github.com/chndrwali.png" width="80" style="border-radius:50%"/><br/>
        <sub><b>chndrwali</b></sub><br/>
        <sub>nextjs-starter-kit</sub>
      </a>
    </td>
  </tr>
</table>

> 🔗 **[chndrwali/nextjs-starter-kit](https://github.com/chndrwali/nextjs-starter-kit)** — Modern Next.js 16 Boilerplate: React 19 + Better Auth + tRPC v11 + Prisma 7 + UploadThing + shadcn/ui + Tailwind v4.
>
> The starter kit provided the solid architectural foundation — authentication, tRPC setup, Prisma integration, and UI structure — that this project is built upon.

#### 🤖 AI Assistance

Development of this project was assisted by the following AI tools:

| AI                      | Role                                                      | Link                               |
| ----------------------- | --------------------------------------------------------- | ---------------------------------- |
| **Claude** by Anthropic | Code review, documentation writing, architecture guidance | [claude.ai](https://claude.ai)     |
| **ChatGPT** by OpenAI   | Debugging assistance, feature ideation, code generation   | [chatgpt.com](https://chatgpt.com) |

> These AI assistants helped accelerate development, but all final decisions, code review, and architecture choices were made by the human developer.

---

<div align="center">

Made with ❤️ by the resi-cam community

[⬆ Back to top](#-resi-cam)

</div>

---

### 📸 App Preview

Get a glimpse of what resi-cam looks like in action:

| Dashboard                              | Pack                         |
| -------------------------------------- | ---------------------------- |
| ![Dashboard](./preview/Dashboard.jpeg) | ![Pack](./preview/Pack.jpeg) |

| Pack History                                   | IP Cameras                                 |
| ---------------------------------------------- | ------------------------------------------ |
| ![Pack History](./preview/Pack%20History.jpeg) | ![IP Cameras](./preview/IP%20Cameras.jpeg) |

| Account                            | System Logs                                  |
| ---------------------------------- | -------------------------------------------- |
| ![Account](./preview/Account.jpeg) | ![System Logs](./preview/System%20Logs.jpeg) |

---

## 🇮🇩 Bahasa Indonesia

<div align="center" id="bahasa-indonesia">

### Daftar Isi

</div>

- [Gambaran Umum](#gambaran-umum)
- [Fitur](#fitur)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Persyaratan Sistem](#persyaratan-sistem)
- [Instalasi](#instalasi)
- [Variabel Lingkungan](#variabel-lingkungan)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Menambahkan Overlay Tanggal & Waktu (Gaya CCTV)](#menambahkan-overlay-tanggal--waktu-gaya-cctv)
- [Konfigurasi](#konfigurasi)
- [Cara Berkontribusi (Panduan Pull Request)](#cara-berkontribusi-panduan-pull-request)
- [Kontributor](#kontributor)
- [Penghargaan](#penghargaan)

---

### Gambaran Umum

**resi-cam** adalah aplikasi open-source full-stack yang dirancang untuk manajemen kamera berbasis tanda terima (resi) dan video. Aplikasi ini memanfaatkan **FFmpeg** untuk menggabungkan chunk-chunk video secara mulus, menyediakan pipeline yang kuat untuk perekaman, pemrosesan, dan penyimpanan video. Proyek ini mengintegrasikan teknologi modern seperti tRPC untuk API yang type-safe, Prisma untuk manajemen database, dan UploadThing untuk pengunggahan media.

---

### Fitur

- 🎥 **Penggabungan chunk video** via FFmpeg
- 🔐 **Autentikasi** via Better Auth
- 📊 **Dashboard & Tabel Data** dengan TanStack Query & Table
- 📁 **Upload file** via UploadThing
- 🎨 **UI Modern** dengan Radix UI, shadcn/ui, Tailwind CSS v4
- 📱 **Desain responsif** dengan mode gelap/terang
- 🔄 **Pembaruan real-time** dengan tRPC + React Query
- 🕐 **Overlay timestamp gaya CCTV** <--- update baru versi 1.3.0

---

### Teknologi yang Digunakan

| Kategori         | Teknologi            |
| ---------------- | -------------------- |
| Framework        | Next.js 16, React 19 |
| Bahasa           | TypeScript 5.9       |
| Lapisan API      | tRPC v11             |
| ORM Database     | Prisma 7             |
| Database         | PostgreSQL           |
| Autentikasi      | Better Auth          |
| Komponen UI      | Radix UI, shadcn/ui  |
| Styling          | Tailwind CSS v4      |
| Upload File      | UploadThing          |
| Pemrosesan Video | FFmpeg               |
| Manajemen State  | TanStack Query v5    |
| Animasi          | GSAP                 |
| Runtime          | Node.js, Bun         |

---

### Persyaratan Sistem

Pastikan semua dependensi berikut sudah terpasang di sistem Anda sebelum melanjutkan:

| Dependensi                               | Versi   | Instalasi                                    |
| ---------------------------------------- | ------- | -------------------------------------------- |
| [Node.js](https://nodejs.org)            | ≥ 18.x  | [nodejs.org](https://nodejs.org)             |
| [Bun](https://bun.sh)                    | Terbaru | `curl -fsSL https://bun.sh/install \| bash`  |
| [FFmpeg](https://ffmpeg.org)             | Terbaru | Lihat panduan di bawah ⬇️                    |
| [PostgreSQL](https://www.postgresql.org) | ≥ 14    | [postgresql.org](https://www.postgresql.org) |

---

### Menginstal FFmpeg di Windows (via winget)

> 💡 **winget** adalah Windows Package Manager bawaan Windows 10 (1809+) dan Windows 11.

#### Langkah 1 — Cek apakah winget tersedia

Buka **PowerShell** atau **Command Prompt** dan jalankan:

```powershell
where winget
```

Jika menampilkan path (contoh: `C:\Users\...\winget.exe`), berarti sudah siap digunakan. Jika tidak, instal melalui [Microsoft Store → App Installer](https://apps.microsoft.com/detail/9NBLGGH4NNS1).

#### Langkah 2 — Instal FFmpeg via winget

```powershell
winget install --id Gyan.FFmpeg -e --source winget
```

#### Langkah 3 — Cari lokasi instalasi FFmpeg

```powershell
where ffmpeg
```

Perintah ini akan menampilkan path instalasi saat ini, seperti:

```
C:\Users\NamaAnda\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_...\ffmpeg-x.x.x-full_build\bin\ffmpeg.exe
```

#### Langkah 4 — Pindahkan FFmpeg ke `C:\ffmpeg`

Buka **PowerShell sebagai Administrator** dan jalankan:

```powershell
# Buat direktori tujuan
New-Item -ItemType Directory -Force -Path "C:\ffmpeg"

# Salin seluruh folder FFmpeg (sesuaikan path sumber dari Langkah 3 di atas)
# Contoh — ganti path di bawah dengan path aktual dari 'where ffmpeg'
Copy-Item -Recurse -Force "C:\Users\$env:USERNAME\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-*\*" "C:\ffmpeg"
```

Atau bisa menggunakan perintah otomatis berikut:

```powershell
$src = (Get-Item "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Gyan.FFmpeg*\ffmpeg-*").FullName
Copy-Item -Recurse -Force "$src\*" "C:\ffmpeg"
```

#### Langkah 5 — Tambahkan FFmpeg ke System PATH

Jalankan perintah berikut di **PowerShell sebagai Administrator**:

```powershell
[System.Environment]::SetEnvironmentVariable(
  "Path",
  [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";C:\ffmpeg\bin",
  "Machine"
)
```

#### Langkah 6 — Verifikasi instalasi

Tutup dan buka kembali terminal Anda, lalu jalankan:

```powershell
ffmpeg -version
```

Anda akan melihat output seperti ini:

```
ffmpeg version 7.x.x Copyright (c) 2000-2024 the FFmpeg developers
...
```

> ⚠️ **Jika `ffmpeg` tidak dikenali setelah restart:** Pastikan `C:\ffmpeg\bin` ada dan berisi `ffmpeg.exe`. Anda juga bisa memverifikasi PATH melalui **System Properties → Environment Variables → System Variables → Path**.

---

### Instalasi

**1. Clone repositori**

```bash
git clone https://github.com/irfankurniawansuthiono/resi-cam.git
cd resi-cam
```

**2. Install dependensi**

```bash
bun install
```

**3. Siapkan variabel lingkungan**

Salin file env contoh dan isi dengan nilai Anda:

```bash
cp .env.example .env
```

> Lihat [Variabel Lingkungan](#variabel-lingkungan) untuk detail lebih lanjut.

**4. Generate Prisma client**

```bash
bunx prisma generate
```

**5. Jalankan migrasi database**

```bash
bunx prisma migrate dev
```

**6. (Opsional) Seed database**

```bash
bun run seed
```

---

### Variabel Lingkungan

Buat file `.env` di root proyek dengan variabel berikut:

```env
# Auth Secret (generate menggunakan: bunx @better-auth/cli@latest secret)
BETTER_AUTH_SECRET=rahasia_anda_di_sini
BETTER_AUTH_URL=http://localhost:3000

# URL Publik
NEXT_PUBLIC_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://{username}:{password}@localhost:{port}/{db}?schema=public"
```

> ⚠️ **Peringatan Keamanan:** Jangan pernah meng-commit file `.env` ke version control. Pastikan `.env` tercantum di `.gitignore` Anda.

Untuk generate auth secret baru, jalankan:

```bash
bunx @better-auth/cli@latest secret
```

---

### Menjalankan Aplikasi

```bash
bun dev
```

Aplikasi akan tersedia di [http://localhost:3000](http://localhost:3000).

---

### Menambahkan Overlay Tanggal & Waktu (Gaya CCTV) (deprecated sebelum versi 1.3.0)

Anda dapat menambahkan overlay tanggal dan waktu secara real-time pada tampilan webcam menggunakan **OBS Studio** dengan skrip Lua — menyimulasikan tampilan timestamp profesional seperti CCTV.

**Langkah-langkah setup:**

1. Kunjungi [halaman OBS DateTime Lua Script](https://obsproject.com/forum/threads/datetime-digital-clock.113883/) dan klik tombol abu-abu **"Go to download"** di sudut kanan atas.
2. Simpan file `datetime.lua` ke lokasi yang mudah diingat di komputer Anda.
3. Buka **OBS Studio**.
4. Di panel **Sources**, klik kanan dan tambahkan sumber baru berupa **Text (FreeType 2)**. Beri nama yang unik (contoh: `clock1`). Tidak perlu mengisi kontennya — skrip yang akan menanganinya.
5. Pergi ke menu **Tools → Scripts**.
6. Klik tombol **"+"** dan arahkan ke file `datetime.lua` yang sudah Anda simpan, lalu klik **Open**.
7. Pilih skrip di daftar **Loaded Scripts**. Panel deskripsi akan muncul di sebelah kanan.
8. Atur kolom **Datetime format** sesuai preferensi Anda, contoh:
    ```
    %Y-%m-%dT%H:%M:%S%z
    ```
    _(menghasilkan output seperti: `2024-06-11T01:28:13+00:00`)_
9. Atur kolom **Text Source** agar sama persis dengan nama sumber teks yang Anda buat (contoh: `clock1`).
10. Klik **Close** pada jendela Scripts.
11. Sumber teks kini akan otomatis diperbarui dengan waktu saat ini. Klik kanan sumber → **Properties** untuk mengatur font, ukuran, dan warna.
12. Aktifkan **OBS Virtual Camera** (Tools → Start Virtual Camera) dan pilih sebagai input kamera di resi-cam.

---

### Konfigurasi

Versi aplikasi dan pengaturan global dikelola di:

```
app/config.ts
```

Edit file ini untuk mengubah konfigurasi tingkat aplikasi seperti informasi versi, feature flag, atau endpoint API.

---

### Cara Berkontribusi (Panduan Pull Request)

Kami menyambut kontribusi dari siapa saja! Ikuti panduan langkah demi langkah berikut untuk mengirimkan Pull Request (PR) di GitHub.

#### Langkah 1 — Fork Repositori

1. Buka halaman repositori proyek di GitHub.
2. Klik tombol **"Fork"** (pojok kanan atas halaman).
3. Ini akan membuat salinan repositori di akun GitHub Anda sendiri.

#### Langkah 2 — Clone Fork Anda

```bash
git clone https://github.com/USERNAME_ANDA/resi-cam.git
cd resi-cam
```

#### Langkah 3 — Tambahkan Remote Upstream

Ini menghubungkan repo lokal Anda ke proyek asli agar bisa menarik pembaruan di masa mendatang:

```bash
git remote add upstream https://github.com/PEMILIK_ASLI/resi-cam.git
```

Verifikasi:

```bash
git remote -v
```

#### Langkah 4 — Buat Branch Baru

Selalu buat branch baru untuk setiap perubahan. **Jangan pernah bekerja langsung di `main`.**

```bash
git checkout -b feat/nama-fitur-anda
```

**Konvensi penamaan branch:**

| Prefix      | Kegunaan              |
| ----------- | --------------------- |
| `feat/`     | Fitur baru            |
| `fix/`      | Perbaikan bug         |
| `docs/`     | Pembaruan dokumentasi |
| `refactor/` | Refactoring kode      |
| `chore/`    | Tugas pemeliharaan    |

#### Langkah 5 — Buat Perubahan Anda

Lakukan perubahan kode Anda, lalu stage dan commit:

```bash
git add .
git commit -m "feat: tambahkan deskripsi commit yang jelas"
```

**Format pesan commit:**

```
type(scope): deskripsi singkat

Contoh:
feat(video): tambahkan indikator progres penggabungan chunk FFmpeg
fix(auth): perbaiki bug kedaluwarsa token sesi
docs(readme): perbarui langkah instalasi
```

#### Langkah 6 — Push ke Fork Anda

```bash
git push origin feat/nama-fitur-anda
```

#### Langkah 7 — Buka Pull Request

1. Buka **repositori fork Anda** di GitHub.
2. Anda akan melihat banner **"Compare & pull request"** — klik banner tersebut.
3. Atur base repository ke repo `resi-cam` asli dan base branch ke `main`.
4. Isi template PR:
    - **Judul:** Judul yang jelas dan ringkas (contoh: `feat: tambahkan progress bar FFmpeg`)
    - **Deskripsi:** Jelaskan _apa_ yang Anda ubah dan _mengapa_
    - **Screenshot/rekaman:** Lampirkan visual jika diperlukan
5. Klik **"Create pull request"**.

#### Langkah 8 — Tanggapi Review

- Seorang maintainer akan mereview PR Anda dan mungkin meminta perubahan.
- Lakukan perubahan yang diminta di branch yang sama dan push kembali — PR akan diperbarui secara otomatis.
- Setelah disetujui, perubahan Anda akan di-merge. 🎉

#### Menjaga Fork Tetap Terkini

Sebelum memulai pekerjaan baru, sinkronkan fork Anda dengan upstream:

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

---

### Kontributor

Terima kasih kepada semua orang luar biasa yang telah berkontribusi pada proyek ini! 🙌

<!-- ALL-CONTRIBUTORS-LIST:START -->
<a href="https://github.com/irfankurniawansuthiono/resi-cam/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=irfankurniawansuthiono/resi-cam" alt="Kontributor"/>
</a>
<!-- ALL-CONTRIBUTORS-LIST:END -->

> Ingin nama Anda muncul di sini? [Kirimkan Pull Request](#cara-berkontribusi-panduan-pull-request)!

---

### Penghargaan

Proyek ini tidak akan terwujud tanpa sumber daya, alat, dan orang-orang luar biasa berikut ini. Terima kasih sebesar-besarnya untuk semua yang tercantum di sini. 🙏

#### 🧱 Fondasi Proyek

Proyek ini **dibangun di atas** starter kit open-source karya **Candra Wali Sanjaya**:

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/chndrwali/nextjs-starter-kit">
        <img src="https://github.com/chndrwali.png" width="80" style="border-radius:50%"/><br/>
        <sub><b>chndrwali</b></sub><br/>
        <sub>nextjs-starter-kit</sub>
      </a>
    </td>
  </tr>
</table>

> 🔗 **[chndrwali/nextjs-starter-kit](https://github.com/chndrwali/nextjs-starter-kit)** — Modern Next.js 16 Boilerplate: React 19 + Better Auth + tRPC v11 + Prisma 7 + UploadThing + shadcn/ui + Tailwind v4.
>
> Starter kit ini menyediakan fondasi arsitektur yang kokoh — autentikasi, setup tRPC, integrasi Prisma, dan struktur UI — yang menjadi dasar dibangunnya proyek ini.

#### 🤖 Bantuan AI

Pengembangan proyek ini dibantu oleh AI tools berikut:

| AI                        | Peran                                                  | Tautan                             |
| ------------------------- | ------------------------------------------------------ | ---------------------------------- |
| **Claude** oleh Anthropic | Review kode, penulisan dokumentasi, panduan arsitektur | [claude.ai](https://claude.ai)     |
| **ChatGPT** oleh OpenAI   | Bantuan debugging, ideasi fitur, generasi kode         | [chatgpt.com](https://chatgpt.com) |

> AI-AI ini membantu mempercepat pengembangan, namun semua keputusan akhir, review kode, dan pilihan arsitektur tetap dibuat oleh developer manusia.

---

### 📸 Tampilan Aplikasi

Berikut tampilan resi-cam secara langsung:

| Dashboard                              | Pack                         |
| -------------------------------------- | ---------------------------- |
| ![Dashboard](./preview/Dashboard.jpeg) | ![Pack](./preview/Pack.jpeg) |

| Pack History                                   | IP Cameras                                 |
| ---------------------------------------------- | ------------------------------------------ |
| ![Pack History](./preview/Pack%20History.jpeg) | ![IP Cameras](./preview/IP%20Cameras.jpeg) |

| Account                            | System Logs                                  |
| ---------------------------------- | -------------------------------------------- |
| ![Account](./preview/Account.jpeg) | ![System Logs](./preview/System%20Logs.jpeg) |

---

---

<div align="center">

Dibuat dengan ❤️ oleh komunitas resi-cam

[⬆ Kembali ke atas](#-resi-cam)

## </div>
