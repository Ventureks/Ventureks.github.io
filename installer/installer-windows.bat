@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

title Instalator Systemu CRM - Windows

echo ==================================================
echo     INSTALATOR SYSTEMU CRM - WERSJA WINDOWS
echo ==================================================
echo.

:: Sprawdzenie uprawnień administratora
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [INFO] Uruchomiono z uprawnieniami administratora
) else (
    echo [ERROR] Ten instalator wymaga uprawnień administratora!
    echo Kliknij prawym przyciskiem myszy i wybierz "Uruchom jako administrator"
    pause
    exit /b 1
)

:: Sprawdzenie architektury systemu
echo [INFO] Sprawdzanie architektury systemu...
if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
    set ARCH=x64
    echo [SUCCESS] Wykryto architekturę 64-bit
) else if "%PROCESSOR_ARCHITEW6432%"=="AMD64" (
    set ARCH=x64
    echo [SUCCESS] Wykryto architekturę 64-bit
) else (
    set ARCH=x86
    echo [WARNING] Wykryto architekturę 32-bit - może być niekompatybilna
)

:: Menu wyboru metody instalacji
echo.
echo Wybierz metodę instalacji:
echo 1. Docker (zalecana - automatyczna)
echo 2. Natywna (wymagane Node.js i PostgreSQL)
echo 3. Anuluj
echo.
set /p choice="Twój wybór (1-3): "

if "%choice%"=="1" goto docker_install
if "%choice%"=="2" goto native_install
if "%choice%"=="3" goto exit
echo [ERROR] Nieprawidłowy wybór!
pause
exit /b 1

:docker_install
echo.
echo [INFO] Wybrano instalację Docker
echo.

:: Sprawdzenie Docker Desktop
echo [INFO] Sprawdzanie Docker Desktop...
docker --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Docker Desktop nie jest zainstalowany!
    echo.
    echo Pobierz i zainstaluj Docker Desktop z:
    echo https://www.docker.com/products/docker-desktop
    echo.
    echo Po instalacji uruchom ponownie ten instalator.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Docker Compose nie jest dostępny!
    echo Upewnij się, że Docker Desktop jest uruchomiony.
    pause
    exit /b 1
)

echo [SUCCESS] Docker Desktop jest dostępny

:: Sprawdzenie czy Docker działa
echo [INFO] Sprawdzanie statusu Docker...
docker info >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Docker nie jest uruchomiony!
    echo Uruchom Docker Desktop i spróbuj ponownie.
    pause
    exit /b 1
)

echo [SUCCESS] Docker działa poprawnie

:: Tworzenie katalogów
echo [INFO] Tworzenie struktury katalogów...
if not exist "crm-system" mkdir crm-system
cd crm-system
if not exist "config" mkdir config
if not exist "data" mkdir data
if not exist "logs" mkdir logs
if not exist "backups" mkdir backups

:: Kopiowanie plików aplikacji
echo [INFO] Kopiowanie plików aplikacji...
xcopy /E /I ..\client client >nul
xcopy /E /I ..\server server >nul
xcopy /E /I ..\shared shared >nul
copy ..\package.json . >nul
copy ..\package-lock.json . >nul
copy ..\tsconfig.json . >nul
copy ..\vite.config.ts . >nul
copy ..\tailwind.config.ts . >nul
copy ..\postcss.config.js . >nul
copy ..\components.json . >nul
copy ..\drizzle.config.ts . >nul

:: Tworzenie docker-compose.yml
echo [INFO] Tworzenie konfiguracji Docker...
(
echo version: '3.8'
echo.
echo services:
echo   postgres:
echo     image: postgres:15-alpine
echo     container_name: crm-postgres
echo     environment:
echo       POSTGRES_DB: crm_database
echo       POSTGRES_USER: crm_user
echo       POSTGRES_PASSWORD: crm_password_2025
echo     volumes:
echo       - postgres_data:/var/lib/postgresql/data
echo       - ./data/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
echo     ports:
echo       - "5432:5432"
echo     networks:
echo       - crm-network
echo     restart: unless-stopped
echo.
echo   crm-app:
echo     build: .
echo     container_name: crm-application
echo     environment:
echo       - NODE_ENV=production
echo       - DATABASE_URL=postgresql://crm_user:crm_password_2025@postgres:5432/crm_database
echo       - SESSION_SECRET=crm_secret_key_2025_production
echo       - PORT=3000
echo     ports:
echo       - "3000:3000"
echo     depends_on:
echo       - postgres
echo     networks:
echo       - crm-network
echo     restart: unless-stopped
echo.
echo volumes:
echo   postgres_data:
echo.
echo networks:
echo   crm-network:
echo     driver: bridge
) > docker-compose.yml

:: Tworzenie Dockerfile
echo [INFO] Tworzenie Dockerfile...
(
echo FROM node:18-alpine
echo.
echo WORKDIR /app
echo COPY package*.json ./
echo RUN npm ci --only=production
echo COPY . .
echo RUN npm run build
echo EXPOSE 3000
echo CMD ["npm", "start"]
) > Dockerfile

:: Tworzenie skryptów zarządzania Windows
echo [INFO] Tworzenie skryptów zarządzania...

:: start.bat
(
echo @echo off
echo echo Uruchamianie systemu CRM...
echo docker-compose up -d
echo echo System CRM uruchomiony!
echo echo Aplikacja dostępna pod adresem: http://localhost:3000
echo pause
) > start.bat

:: stop.bat
(
echo @echo off
echo echo Zatrzymywanie systemu CRM...
echo docker-compose down
echo echo System CRM zatrzymany!
echo pause
) > stop.bat

:: status.bat
(
echo @echo off
echo echo Status systemu CRM:
echo echo ===================
echo docker-compose ps
echo echo.
echo echo Logi aplikacji:
echo echo ===============
echo docker-compose logs --tail=20 crm-app
echo pause
) > status.bat

:: backup.bat
(
echo @echo off
echo set BACKUP_FILE=backups\crm-backup-%%date:~0,4%%%%date:~5,2%%%%date:~8,2%%-%%time:~0,2%%%%time:~3,2%%%%time:~6,2%%.sql
echo echo Tworzenie kopii zapasowej...
echo docker-compose exec postgres pg_dump -U crm_user crm_database ^> "%%BACKUP_FILE%%"
echo echo Kopia zapasowa utworzona: %%BACKUP_FILE%%
echo pause
) > backup.bat

:: Konfiguracja aplikacji
echo [INFO] Tworzenie plików konfiguracyjnych...
(
echo NODE_ENV=production
echo PORT=3000
echo DATABASE_URL=postgresql://crm_user:crm_password_2025@postgres:5432/crm_database
echo SESSION_SECRET=crm_secret_key_2025_production
) > config\app.env

:: Budowanie i uruchamianie
echo [INFO] Budowanie obrazu Docker...
docker-compose build

echo [INFO] Uruchamianie systemu...
docker-compose up -d

:: Oczekiwanie na uruchomienie
echo [INFO] Oczekiwanie na uruchomienie systemu...
timeout /t 30 /nobreak >nul

:: Sprawdzenie statusu
docker-compose ps | findstr "Up" >nul
if %errorLevel% == 0 (
    echo [SUCCESS] System CRM został pomyślnie zainstalowany!
) else (
    echo [ERROR] Wystąpił problem podczas uruchamiania
    echo Sprawdź logi: docker-compose logs
    pause
    exit /b 1
)

goto success

:native_install
echo.
echo [INFO] Wybrano instalację natywną
echo.

:: Sprawdzenie Node.js
echo [INFO] Sprawdzanie Node.js...
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Node.js nie jest zainstalowany!
    echo Pobierz i zainstaluj Node.js 18+ z: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=1 delims=." %%a in ('node --version') do set NODE_MAJOR=%%a
set NODE_MAJOR=%NODE_MAJOR:v=%
if %NODE_MAJOR% lss 18 (
    echo [ERROR] Wymagana wersja Node.js 18 lub nowsza!
    echo Aktualna wersja: 
    node --version
    pause
    exit /b 1
)

echo [SUCCESS] Node.js jest dostępny

:: Sprawdzenie PostgreSQL
echo [INFO] Sprawdzanie PostgreSQL...
psql --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] PostgreSQL nie jest zainstalowany!
    echo Pobierz i zainstaluj PostgreSQL z: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

echo [SUCCESS] PostgreSQL jest dostępny

:: Tworzenie katalogów
echo [INFO] Tworzenie struktury katalogów...
if not exist "crm-system" mkdir crm-system
cd crm-system

:: Kopiowanie plików
echo [INFO] Kopiowanie plików aplikacji...
xcopy /E /I ..\client client >nul
xcopy /E /I ..\server server >nul
xcopy /E /I ..\shared shared >nul
copy ..\package.json . >nul
copy ..\package-lock.json . >nul
copy ..\tsconfig.json . >nul
copy ..\vite.config.ts . >nul
copy ..\tailwind.config.ts . >nul
copy ..\postcss.config.js . >nul
copy ..\components.json . >nul
copy ..\drizzle.config.ts . >nul

:: Instalacja zależności
echo [INFO] Instalacja zależności...
npm install

:: Budowanie aplikacji
echo [INFO] Budowanie aplikacji...
npm run build

:: Konfiguracja bazy danych
echo [INFO] Konfiguracja bazy danych...
echo Wprowadź dane do połączenia z PostgreSQL:
set /p DB_HOST="Host bazy danych (localhost): "
if "%DB_HOST%"=="" set DB_HOST=localhost

set /p DB_PORT="Port bazy danych (5432): "
if "%DB_PORT%"=="" set DB_PORT=5432

set /p DB_NAME="Nazwa bazy danych (crm_database): "
if "%DB_NAME%"=="" set DB_NAME=crm_database

set /p DB_USER="Użytkownik bazy danych (postgres): "
if "%DB_USER%"=="" set DB_USER=postgres

set /p DB_PASS="Hasło bazy danych: "

:: Tworzenie pliku .env
(
echo NODE_ENV=production
echo PORT=3000
echo DATABASE_URL=postgresql://%DB_USER%:%DB_PASS%@%DB_HOST%:%DB_PORT%/%DB_NAME%
echo SESSION_SECRET=crm_secret_key_2025_production
) > .env

:: Migracje bazy danych
echo [INFO] Uruchamianie migracji bazy danych...
npm run db:push

:: Tworzenie skryptów startowych
(
echo @echo off
echo echo Uruchamianie systemu CRM...
echo npm start
) > start.bat

(
echo @echo off
echo taskkill /f /im node.exe 2^>nul
echo echo System CRM zatrzymany!
echo pause
) > stop.bat

echo [SUCCESS] Instalacja natywna zakończona!

goto success

:success
echo.
echo ==================================================
echo           INSTALACJA ZAKOŃCZONA POMYŚLNIE!
echo ==================================================
echo.
echo System CRM jest dostępny pod adresem:
echo http://localhost:3000
echo.
echo Domyślne dane logowania:
echo Login: admin
echo Hasło: admin123
echo.
echo WAŻNE: Zmień domyślne hasło po pierwszym logowaniu!
echo.
echo Przydatne pliki:
echo • start.bat - uruchomienie systemu
echo • stop.bat - zatrzymanie systemu
echo • status.bat - status systemu
echo • backup.bat - kopia zapasowa
echo.
cd ..
pause
exit /b 0

:exit
echo Anulowano instalację.
pause
exit /b 0