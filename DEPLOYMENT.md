# 📦 Návod pro nasazení na nkopava.cz

## ✅ Předpoklady

- Node.js verze 18 nebo vyšší
- npm (součást Node.js)
- Přístup k FTP/SSH serveru nkopava.cz

## 🚀 Krok 1: Vytvoření produkční verze

1. Otevřete terminál v kořenovém adresáři projektu
2. Spusťte produkční build:

```bash
npm run build
```

3. Po dokončení buildu se vytvoří složka `dist/` s optimalizovanými soubory

## 📁 Krok 2: Struktura výsledných souborů

Po buildu bude složka `dist/` obsahovat:

```
dist/
├── index.html          # Hlavní HTML soubor
├── assets/             # Optimalizované CSS a JS soubory
│   ├── js/             # JavaScript chunks
│   ├── images/         # Obrázky
│   └── media/          # Videa
└── public/             # Veřejné soubory (videa, obrázky)
    ├── images/
    ├── players/
    └── videos/
```

## 🌐 Krok 3: Nahrání na server

### Pomocí FTP/SFTP:

1. Připojte se k serveru nkopava.cz pomocí FTP klienta (FileZilla, WinSCP, apod.)
2. Nahrajte **celý obsah** složky `dist/` do kořenového adresáře webu
3. Ujistěte se, že struktura složek zůstane zachována

### Pomocí SSH:

```bash
# Přihlášení na server
ssh uzivatel@nkopava.cz

# Nahrání souborů (z lokálního počítače)
scp -r dist/* uzivatel@nkopava.cz:/cesta/k/webovemu/adresari/
```

## ⚙️ Krok 4: Konfigurace serveru

### Apache (.htaccess)

Vytvořte soubor `.htaccess` v kořenovém adresáři s následujícím obsahem:

```apache
# Aktivovat mod_rewrite
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Přesměrovat všechny požadavky na index.html (pro SPA routing)
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^.*$ / [L,QSA]
</IfModule>

# Komprese souborů
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache hlavičky
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/avif "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType video/mp4 "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### Nginx

Pokud server používá Nginx, přidejte do konfigurace:

```nginx
server {
  listen 80;
  server_name nkopava.cz www.nkopava.cz;
  root /cesta/k/webovemu/adresari;
  index index.html;

  # Komprese
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml;

  # SPA routing - všechny požadavky na index.html
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Cache pro statické soubory
  location ~* \.(jpg|jpeg|png|gif|ico|css|js|avif|webp)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # Cache pro videa
  location ~* \.(mp4|webm|mov)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

## 🧪 Krok 5: Testování

Po nahrání otestujte web na:

- Desktop prohlížečích (Chrome, Firefox, Edge, Safari)
- Mobilních zařízeních (iOS Safari, Chrome Mobile)
- Různých rozlišeních (320px, 768px, 1024px, 1920px)

### Kontrolní seznam:

- [ ] Načítá se homepage správně
- [ ] Funguje navigace mezi stránkami
- [ ] Zobrazují se obrázky hráčů
- [ ] Přehrávají se videa
- [ ] Funguje simulátor zápasů
- [ ] Funguje škola nohejbalu
- [ ] Responzivní design na mobilu
- [ ] Rychlost načítání je přijatelná

## 🐛 Řešení problémů

### Problém: Videa se nenačítají

**Řešení:**
- Zkontrolujte, že složka `public/videos/` byla nahrána
- Zkontrolujte cesty k videím v konzoli prohlížeče (F12)
- Ujistěte se, že server podporuje MIME typ `video/mp4`

### Problém: Navigace nefunguje (404 chyby)

**Řešení:**
- Ujistěte se, že `.htaccess` nebo Nginx konfigurace je správně nastavena
- Zkontrolujte mod_rewrite na Apache serveru: `a2enmod rewrite`

### Problém: Stránka se nenačítá vůbec

**Řešení:**
- Zkontrolujte konzoli prohlížeče (F12) pro JavaScriptové chyby
- Ujistěte se, že `base` v `vite.config.js` je nastaven na `/`
- Zkontrolujte, že všechny soubory z `dist/` byly nahrány

## 📊 Optimalizace výkonu

### Po nasazení doporučujeme:

1. **Zapnout HTTPS** pro bezpečnost
2. **Nastavit CDN** pro rychlejší načítání (Cloudflare zdarma)
3. **Monitorovat výkon** pomocí Google PageSpeed Insights
4. **Optimalizovat obrázky** (convert to WebP/AVIF)
5. **Lazy loading** pro videa (již implementováno)

## 📝 Aktualizace webu

Pro budoucí aktualizace:

1. Proveďte změny v kódu
2. Spusťte `npm run build`
3. Nahrajte nový obsah `dist/` na server
4. Vyčistěte cache prohlížeče (Ctrl+F5)

## 🆘 Podpora

V případě problémů:
- Zkontrolujte konzoli prohlížeče (F12 → Console)
- Zkontrolujte server logy
- Zkontrolujte Network tab (F12 → Network) pro failed requests

---

**Aktualizováno:** $(date)
**Verze:** 1.0.0
