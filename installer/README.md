# Instalator Systemu CRM

## Opis
Kompletny system CRM do zarządzania kontrahentami, zadaniami, ofertami i wsparciem technicznym.

## Wymagania systemowe

### Minimalne wymagania:
- **RAM**: 2 GB
- **Procesor**: Dual-core 2.0 GHz
- **Miejsce na dysku**: 5 GB
- **System operacyjny**: 
  - Windows 10/11
  - Linux (Ubuntu 20.04+, CentOS 8+, Debian 11+)
  - macOS 10.15+

### Wymagania oprogramowania:
- Docker 20.10+ i Docker Compose 2.0+
- **LUB**
- Node.js 18+ i PostgreSQL 14+

## Metody instalacji

### 1. Instalacja za pomocą Docker (Zalecana)
```bash
# 1. Pobierz pliki instalatora
git clone <repository-url> crm-system
cd crm-system/installer

# 2. Uruchom instalator Docker
./install-docker.sh
```

### 2. Instalacja natywna
```bash
# 1. Pobierz pliki instalatora
git clone <repository-url> crm-system
cd crm-system/installer

# 2. Uruchom instalator natywny
./install-native.sh
```

### 3. Instalacja Windows
1. Pobierz `installer-windows.bat`
2. Uruchom jako administrator
3. Postępuj zgodnie z instrukcjami

## Szybki start

Po instalacji system będzie dostępny pod adresem:
- **Aplikacja główna**: http://localhost:3000
- **Panel administracyjny**: http://localhost:3000/admin

### Domyślne dane logowania:
- **Login**: admin
- **Hasło**: admin123

⚠️ **WAŻNE**: Zmień domyślne hasło po pierwszym logowaniu!

## Zarządzanie systemem

### Uruchamianie:
```bash
./start.sh
```

### Zatrzymywanie:
```bash
./stop.sh
```

### Restart:
```bash
./restart.sh
```

### Backup:
```bash
./backup.sh
```

### Przywracanie:
```bash
./restore.sh backup-file.sql
```

## Konfiguracja

### Plik konfiguracyjny: `config/app.env`
```env
# Baza danych
DATABASE_URL=postgresql://crm_user:password@localhost:5432/crm_db

# Port aplikacji
PORT=3000

# Bezpieczeństwo
SESSION_SECRET=your-secret-key-here

# Email (opcjonalne)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

## Rozwiązywanie problemów

### Najczęstsze problemy:

1. **Port 3000 jest zajęty**
   ```bash
   # Zmień port w config/app.env
   PORT=8080
   ```

2. **Błąd połączenia z bazą danych**
   ```bash
   # Sprawdź status PostgreSQL
   sudo systemctl status postgresql
   ```

3. **Problemy z uprawnieniami**
   ```bash
   # Napraw uprawnienia
   sudo chmod +x *.sh
   ```

## Wsparcie techniczne

W przypadku problemów:
1. Sprawdź logi: `./logs.sh`
2. Sprawdź status: `./status.sh`
3. Skontaktuj się z administratorem systemu

## Aktualizacje

```bash
# Sprawdź dostępne aktualizacje
./check-updates.sh

# Zaktualizuj system
./update.sh
```

## Dezinstalacja

```bash
./uninstall.sh
```

---

**Wersja**: 1.0.0  
**Data**: Styczeń 2025  
**Kompatybilność**: Wszystkie główne systemy operacyjne