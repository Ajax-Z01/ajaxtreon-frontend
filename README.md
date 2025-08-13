# Ajaxtreon Frontend (ERP)

Ajaxtreon Frontend adalah aplikasi web ERP berbasis **Nuxt 3** yang digunakan untuk mengelola data internal seperti inventori, pesanan, pembelian, pelanggan, pemasok, laporan, dan modul CRM. Frontend ini terintegrasi langsung dengan backend Ajaxtreon.

---

## 📦 Fitur Utama

* Login & role-based access control (Admin/User)
* Dashboard ringkasan data
* Manajemen inventori (produk, kategori, stok)
* Manajemen pesanan & pembayaran
* Manajemen pembelian dan supplier
* Manajemen pelanggan dan pemasok
* Modul CRM (Lead, Contact, Opportunity, Activity)
* Dashboard laporan
* Upload gambar dengan Cloudinary
* UI responsif untuk desktop dan mobile

---

## 🚀 Teknologi yang Digunakan

* **Nuxt 3** – Framework Vue terbaru
* **TypeScript** – Pengetikan statis
* **Tailwind CSS** – Styling utility-first
* **Lucide Icons** – Ikon SVG
* **Firebase Authentication** – Autentikasi pengguna
* **Cloudinary** – Penyimpanan gambar
* **Pinia** – Manajemen state
* **Axios** atau `useFetch` – HTTP client

---

## 📂 Struktur Direktori

```
src/
├── components/      # Komponen UI reusable  
├── composables/     # Reusable logic seperti API composables  
├── layouts/         # Layout halaman  
├── pages/           # Halaman aplikasi  
├── plugins/         # Plugin Nuxt  
├── stores/          # Pinia stores  
├── assets/          # Gambar dan style global  
├── types/           # TypeScript types  
└── utils/           # Helper functions  
```

---

## 🔧 Instalasi

### Prasyarat

* Node.js 18.x atau lebih baru
* NPM / Yarn / pnpm

### Langkah-langkah

1. **Clone repository**

```bash
git clone https://github.com/Ajax-Z01/ajaxtreon-frontend.git
cd ajaxtreon-frontend
```

2. **Install dependencies**

```bash
npm install
# atau yarn install
```

3. **Salin dan konfigurasi file `.env`**

```bash
cp .env.example .env
```

Isi dengan variabel:

```
NUXT_PUBLIC_API_BASE=https://api.ajaxtreon.com
NUXT_PUBLIC_FIREBASE_API_KEY=...
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NUXT_PUBLIC_FIREBASE_PROJECT_ID=...
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NUXT_PUBLIC_FIREBASE_APP_ID=...

NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...

MIDTRANS_CLIENT_KEY=...
```

---

## ▶️ Menjalankan Proyek

### Jalankan mode development

```bash
npm run dev
```

### Build & Preview production

```bash
npm run build
npm run preview
```

### Linting & Format

```bash
npm run lint
```

---

## 📄 Lisensi

MIT License