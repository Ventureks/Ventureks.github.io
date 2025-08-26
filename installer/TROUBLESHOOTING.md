# Przewodnik rozwiązywania problemów

## Najczęstsze problemy instalacyjne

### 1. Problem: "Permission denied" podczas uruchamiania skryptów

**Objaw:**
```bash
bash: ./install-docker.sh: Permission denied
```

**Rozwiązanie:**
```bash
chmod +x installer/*.sh
./install-docker.sh
```

### 2. Problem: Docker nie jest uruchomiony

**Objaw:**
```
Cannot connect to the Docker daemon at unix:///var/run/docker.sock
```

**Rozwiązanie:**
- **Linux:** `sudo systemctl start docker`
- **macOS:** Uruchom Docker Desktop
- **Windows:** Uruchom Docker Desktop

### 3. Problem: Port 3000 jest zajęty

**Objaw:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Rozwiązanie:**
```bash
# Sprawdź co używa portu
netstat -tuln | grep 3000
# lub
lsof -i :3000

# Zatrzymaj proces lub zmień port
echo "PORT=8080" >> crm-system/.env
./restart.sh
```

### 4. Problem: Node.js za stara wersja

**Objaw:**
```
Node version 16.x.x is not supported. Please use Node 18 or higher.
```

**Rozwiązanie:**
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS (Homebrew)
brew install node@18

# Windows
# Pobierz z https://nodejs.org/
```

### 5. Problem: PostgreSQL nie jest dostępny

**Objaw:**
```
psql: error: connection to server failed
```

**Rozwiązanie Docker:**
```bash
# Sprawdź status kontenerów
docker-compose ps
docker-compose logs postgres
```

**Rozwiązanie natywne:**
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# macOS
brew install postgresql
brew services start postgresql

# Utwórz bazę danych
sudo -u postgres createdb crm_database
```

### 6. Problem: Błąd migracji bazy danych

**Objaw:**
```
Error: relation "users" does not exist
```

**Rozwiązanie:**
```bash
cd crm-system
npm run db:push --force
```

### 7. Problem: Aplikacja nie odpowiada

**Objaw:**
Brak odpowiedzi na http://localhost:3000

**Diagnostyka:**
```bash
cd crm-system
./status.sh
./logs.sh -e
```

**Rozwiązanie:**
```bash
./stop.sh
./start.sh
```

## Problemy specyficzne dla systemu

### Windows

#### Problem: "Command not found" w PowerShell
**Rozwiązanie:** Użyj Command Prompt (cmd) jako administrator

#### Problem: Błędy kodowania znaków
**Rozwiązanie:** 
```cmd
chcp 65001
```

#### Problem: Docker Desktop nie startuje
**Rozwiązanie:**
1. Sprawdź czy Hyper-V jest włączone
2. Zrestartuj komputer
3. Uruchom Docker Desktop jako administrator

### Linux

#### Problem: Brak uprawnień do Docker
**Rozwiązanie:**
```bash
sudo usermod -aG docker $USER
newgrp docker
```

#### Problem: Brak pakietów systemowych
**Rozwiązanie:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install curl wget unzip build-essential

# CentOS/RHEL
sudo yum install curl wget unzip gcc gcc-c++
```

### macOS

#### Problem: Brak XCode Command Line Tools
**Rozwiązanie:**
```bash
xcode-select --install
```

#### Problem: Homebrew nie jest zainstalowany
**Rozwiązanie:**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

## Diagnostyka problemów

### Skrypt diagnostyczny
```bash
./tools/verify-environment.sh
```

### Sprawdzanie logów
```bash
cd crm-system

# Wszystkie logi
./logs.sh

# Tylko błędy
./logs.sh -e

# Logi na żywo
./logs.sh -f
```

### Sprawdzanie stanu systemu
```bash
./status.sh
```

### Sprawdzanie portów
```bash
netstat -tuln | grep -E "3000|5432"
```

### Sprawdzanie procesów
```bash
ps aux | grep -E "node|postgres|docker"
```

## Przywracanie systemu

### Reset konfiguracji
```bash
cd crm-system
cp .env .env.backup
# Edytuj .env zgodnie z dokumentacją
./restart.sh
```

### Przywracanie z kopii zapasowej
```bash
cd crm-system
./restore.sh backups/najnowsza-kopia.sql
```

### Pełna reinstalacja
```bash
cd crm-system
./uninstall.sh
cd ..
# Uruchom ponownie instalator
```

## Kontakt z wsparciem

### Informacje do zebrania przed kontaktem
1. System operacyjny i wersja
2. Metoda instalacji (Docker/natywna)
3. Komunikaty błędów
4. Logi z `./logs.sh -e`
5. Wynik `./tools/verify-environment.sh`

### Przydatne komendy diagnostyczne
```bash
# Informacje o systemie
uname -a
cat /etc/os-release  # Linux
sw_vers              # macOS
ver                  # Windows

# Wersje oprogramowania
node --version
npm --version
docker --version
psql --version

# Status usług
systemctl status postgresql  # Linux
brew services list           # macOS
```

## FAQ

**P: Czy mogę zmienić port aplikacji?**
O: Tak, edytuj plik `.env` i zmień `PORT=3000` na inny port.

**P: Jak zrobić backup?**
O: Uruchom `./backup.sh` w katalogu crm-system.

**P: Jak zaktualizować system?**
O: Uruchom `./update.sh` (zachowuje dane) lub przeinstaluj (traci dane).

**P: Czy mogę uruchomić na innym porcie niż 3000?**
O: Tak, zmień PORT w pliku .env i zrestartuj system.

**P: Jak sprawdzić czy system działa?**
O: Uruchom `./status.sh` lub otwórz http://localhost:3000.

**P: Jak zmienić hasło administratora?**
O: Zaloguj się do systemu i przejdź do ustawień.

**P: Czy mogę używać zewnętrznej bazy danych?**
O: Tak, zmień DATABASE_URL w pliku .env.

---

**Ostatnia aktualizacja:** Styczeń 2025  
**Wersja systemu:** 1.0.0