#!/bin/bash

# Instalator natywny dla Systemu CRM
# Wersja: 1.0.0

set -e

echo "=================================================="
echo "    INSTALATOR SYSTEMU CRM - WERSJA NATYWNA"
echo "=================================================="
echo ""

# Kolory dla komunikatów
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funkcje pomocnicze
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Sprawdzenie systemu operacyjnego
check_os() {
    log_info "Sprawdzanie systemu operacyjnego..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        # Sprawdzenie dystrybucji
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            DISTRO=$ID
            VERSION=$VERSION_ID
        fi
        log_success "Wykryto Linux ($DISTRO $VERSION)"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        log_success "Wykryto macOS"
    else
        log_error "Nieobsługiwany system operacyjny: $OSTYPE"
        exit 1
    fi
}

# Sprawdzenie uprawnień
check_permissions() {
    log_info "Sprawdzanie uprawnień..."
    
    if [[ $EUID -eq 0 ]]; then
        log_warning "Instalator uruchomiony jako root. Zalecane jest uruchomienie jako zwykły użytkownik."
        read -p "Czy chcesz kontynuować? (t/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Tt]$ ]]; then
            exit 1
        fi
    fi
}

# Sprawdzenie Node.js
check_nodejs() {
    log_info "Sprawdzanie Node.js..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js nie jest zainstalowany!"
        echo ""
        echo "Instrukcje instalacji Node.js:"
        if [[ "$OS" == "linux" ]]; then
            echo "Ubuntu/Debian: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
            echo "CentOS/RHEL: curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash - && sudo yum install -y nodejs"
            echo "Arch Linux: sudo pacman -S nodejs npm"
        elif [[ "$OS" == "macos" ]]; then
            echo "Homebrew: brew install node"
            echo "MacPorts: sudo port install nodejs18"
            echo "Lub pobierz z: https://nodejs.org/"
        fi
        echo ""
        exit 1
    fi
    
    # Sprawdzenie wersji Node.js
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Wymagana wersja Node.js 18 lub nowsza! Aktualna: $(node --version)"
        exit 1
    fi
    
    log_success "Node.js $(node --version) jest dostępny"
}

# Sprawdzenie npm
check_npm() {
    log_info "Sprawdzanie npm..."
    
    if ! command -v npm &> /dev/null; then
        log_error "npm nie jest zainstalowany!"
        exit 1
    fi
    
    log_success "npm $(npm --version) jest dostępny"
}

# Sprawdzenie PostgreSQL
check_postgresql() {
    log_info "Sprawdzanie PostgreSQL..."
    
    if ! command -v psql &> /dev/null && ! command -v pg_isready &> /dev/null; then
        log_warning "PostgreSQL nie został wykryty w systemie"
        echo ""
        echo "Opcje instalacji PostgreSQL:"
        if [[ "$OS" == "linux" ]]; then
            echo "Ubuntu/Debian: sudo apt update && sudo apt install postgresql postgresql-contrib"
            echo "CentOS/RHEL: sudo yum install postgresql-server postgresql-contrib"
            echo "Arch Linux: sudo pacman -S postgresql"
        elif [[ "$OS" == "macos" ]]; then
            echo "Homebrew: brew install postgresql"
            echo "MacPorts: sudo port install postgresql14-server"
            echo "Postgres.app: https://postgresapp.com/"
        fi
        echo ""
        read -p "Czy chcesz kontynuować bez PostgreSQL? Będziesz musiał skonfigurować bazę danych ręcznie (t/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Tt]$ ]]; then
            exit 1
        fi
        POSTGRES_AVAILABLE=false
    else
        log_success "PostgreSQL jest dostępny"
        POSTGRES_AVAILABLE=true
    fi
}

# Sprawdzenie git
check_git() {
    log_info "Sprawdzanie Git..."
    
    if ! command -v git &> /dev/null; then
        log_warning "Git nie jest zainstalowany - niektóre funkcje mogą być niedostępne"
        GIT_AVAILABLE=false
    else
        log_success "Git jest dostępny"
        GIT_AVAILABLE=true
    fi
}

# Instalacja zależności systemowych
install_system_dependencies() {
    log_info "Sprawdzanie zależności systemowych..."
    
    if [[ "$OS" == "linux" ]]; then
        # Sprawdzenie pakietów systemowych
        MISSING_PACKAGES=""
        
        if ! command -v curl &> /dev/null; then
            MISSING_PACKAGES="$MISSING_PACKAGES curl"
        fi
        
        if ! command -v wget &> /dev/null; then
            MISSING_PACKAGES="$MISSING_PACKAGES wget"
        fi
        
        if ! command -v unzip &> /dev/null; then
            MISSING_PACKAGES="$MISSING_PACKAGES unzip"
        fi
        
        if [ ! -z "$MISSING_PACKAGES" ]; then
            log_warning "Brakujące pakiety systemowe:$MISSING_PACKAGES"
            echo "Instalując brakujące pakiety..."
            
            if [[ "$DISTRO" == "ubuntu" ]] || [[ "$DISTRO" == "debian" ]]; then
                sudo apt update && sudo apt install -y $MISSING_PACKAGES
            elif [[ "$DISTRO" == "centos" ]] || [[ "$DISTRO" == "rhel" ]] || [[ "$DISTRO" == "fedora" ]]; then
                sudo yum install -y $MISSING_PACKAGES
            elif [[ "$DISTRO" == "arch" ]]; then
                sudo pacman -S --noconfirm $MISSING_PACKAGES
            else
                log_warning "Nieznana dystrybucja - zainstaluj ręcznie: $MISSING_PACKAGES"
            fi
        fi
    fi
    
    log_success "Zależności systemowe sprawdzone"
}

# Tworzenie struktury katalogów
create_directories() {
    log_info "Tworzenie struktury katalogów..."
    
    mkdir -p crm-system/{config,logs,backups,tmp}
    
    log_success "Katalogi utworzone"
}

# Kopiowanie plików aplikacji
copy_application_files() {
    log_info "Kopiowanie plików aplikacji..."
    
    # Kopiuj całą aplikację do katalogu crm-system
    cp -r ../client crm-system/
    cp -r ../server crm-system/
    cp -r ../shared crm-system/
    cp ../package.json crm-system/
    cp ../package-lock.json crm-system/
    cp ../tsconfig.json crm-system/
    cp ../vite.config.ts crm-system/
    cp ../tailwind.config.ts crm-system/
    cp ../postcss.config.js crm-system/
    cp ../components.json crm-system/
    cp ../drizzle.config.ts crm-system/
    
    log_success "Pliki aplikacji skopiowane"
}

# Instalacja zależności NPM
install_npm_dependencies() {
    log_info "Instalacja zależności NPM..."
    
    cd crm-system
    
    # Instalacja zależności
    npm install
    
    log_success "Zależności NPM zainstalowane"
    
    cd ..
}

# Budowanie aplikacji
build_application() {
    log_info "Budowanie aplikacji..."
    
    cd crm-system
    
    # Budowanie aplikacji frontend
    npm run build
    
    log_success "Aplikacja zbudowana"
    
    cd ..
}

# Konfiguracja bazy danych
configure_database() {
    log_info "Konfiguracja bazy danych..."
    
    if [ "$POSTGRES_AVAILABLE" = true ]; then
        echo ""
        echo "Konfiguracja połączenia z bazą danych PostgreSQL:"
        echo "Naciśnij Enter dla wartości domyślnych"
        echo ""
        
        read -p "Host bazy danych [localhost]: " DB_HOST
        DB_HOST=${DB_HOST:-localhost}
        
        read -p "Port bazy danych [5432]: " DB_PORT
        DB_PORT=${DB_PORT:-5432}
        
        read -p "Nazwa bazy danych [crm_database]: " DB_NAME
        DB_NAME=${DB_NAME:-crm_database}
        
        read -p "Użytkownik bazy danych [postgres]: " DB_USER
        DB_USER=${DB_USER:-postgres}
        
        read -s -p "Hasło bazy danych: " DB_PASS
        echo ""
        
        DATABASE_URL="postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME"
        
        # Test połączenia
        log_info "Sprawdzanie połączenia z bazą danych..."
        if PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &> /dev/null; then
            log_success "Połączenie z bazą danych działa"
        else
            log_warning "Nie można połączyć się z bazą danych - sprawdź konfigurację"
            echo "Spróbujesz później skonfigurować bazę danych ręcznie"
        fi
    else
        echo ""
        echo "Wprowadź URL połączenia z bazą danych:"
        read -p "DATABASE_URL: " DATABASE_URL
    fi
    
    # Tworzenie pliku konfiguracyjnego
    cat > crm-system/.env << EOF
# Konfiguracja aplikacji CRM
NODE_ENV=production
PORT=3000

# Baza danych
DATABASE_URL=$DATABASE_URL

# Sesje
SESSION_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "crm_secret_key_2025_production")

# Konfiguracja SMTP (opcjonalne)
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@crm-system.local

# Logowanie
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Bezpieczeństwo
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=24h
EOF
    
    log_success "Konfiguracja bazy danych utworzona"
}

# Uruchomienie migracji bazy danych
run_database_migrations() {
    log_info "Uruchamianie migracji bazy danych..."
    
    cd crm-system
    
    # Próba uruchomienia migracji
    if npm run db:push; then
        log_success "Migracje bazy danych zakończone"
    else
        log_warning "Migracje nie powiodły się - skonfiguruj bazę danych ręcznie później"
    fi
    
    cd ..
}

# Tworzenie skryptów zarządzania
create_management_scripts() {
    log_info "Tworzenie skryptów zarządzania..."
    
    # Skrypt start.sh
    cat > crm-system/start.sh << 'EOF'
#!/bin/bash
echo "Uruchamianie systemu CRM..."

# Sprawdzenie czy proces już działa
if pgrep -f "npm.*start" > /dev/null; then
    echo "System CRM już działa!"
    echo "Zatrzymaj go najpierw: ./stop.sh"
    exit 1
fi

# Uruchomienie w tle
nohup npm start > logs/app.log 2>&1 &
PID=$!
echo $PID > tmp/crm.pid

echo "System CRM uruchomiony (PID: $PID)"
echo "Aplikacja dostępna pod adresem: http://localhost:3000"
echo "Logi: tail -f logs/app.log"
EOF

    # Skrypt stop.sh
    cat > crm-system/stop.sh << 'EOF'
#!/bin/bash
echo "Zatrzymywanie systemu CRM..."

if [ -f tmp/crm.pid ]; then
    PID=$(cat tmp/crm.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "System CRM zatrzymany (PID: $PID)"
        rm -f tmp/crm.pid
    else
        echo "Proces już nie działa"
        rm -f tmp/crm.pid
    fi
else
    # Fallback - zabij wszystkie procesy npm start
    pkill -f "npm.*start" && echo "System CRM zatrzymany" || echo "Brak działających procesów"
fi
EOF

    # Skrypt restart.sh
    cat > crm-system/restart.sh << 'EOF'
#!/bin/bash
echo "Restartowanie systemu CRM..."
./stop.sh
sleep 2
./start.sh
EOF

    # Skrypt status.sh
    cat > crm-system/status.sh << 'EOF'
#!/bin/bash
echo "Status systemu CRM:"
echo "==================="

if [ -f tmp/crm.pid ]; then
    PID=$(cat tmp/crm.pid)
    if kill -0 $PID 2>/dev/null; then
        echo "✅ System działa (PID: $PID)"
        echo "📊 Zużycie pamięci: $(ps -p $PID -o rss= | awk '{print $1/1024 " MB"}')"
        echo "⏱️  Czas działania: $(ps -p $PID -o etime= | tr -d ' ')"
    else
        echo "❌ System nie działa (błędny PID)"
        rm -f tmp/crm.pid
    fi
else
    if pgrep -f "npm.*start" > /dev/null; then
        echo "⚠️  System działa, ale brak pliku PID"
    else
        echo "❌ System nie działa"
    fi
fi

echo ""
echo "Sprawdzenie portu 3000:"
if netstat -tuln 2>/dev/null | grep -q ":3000 " || ss -tuln 2>/dev/null | grep -q ":3000 "; then
    echo "✅ Port 3000 jest używany"
else
    echo "❌ Port 3000 jest wolny"
fi

echo ""
echo "Ostatnie logi:"
echo "=============="
if [ -f logs/app.log ]; then
    tail -10 logs/app.log
else
    echo "Brak logów"
fi
EOF

    # Skrypt logs.sh
    cat > crm-system/logs.sh << 'EOF'
#!/bin/bash
if [ "$1" = "-f" ]; then
    echo "Logi w czasie rzeczywistym (Ctrl+C aby zakończyć):"
    tail -f logs/app.log
elif [ "$1" = "-e" ]; then
    echo "Logi błędów:"
    grep -i "error\|exception\|fail" logs/app.log | tail -20
else
    echo "Ostatnie 50 linii logów:"
    tail -50 logs/app.log
fi
EOF

    # Skrypt backup.sh
    cat > crm-system/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="backups"
BACKUP_DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/crm-backup-$BACKUP_DATE.sql"

echo "Tworzenie kopii zapasowej..."

# Sprawdzenie czy katalog backups istnieje
mkdir -p "$BACKUP_DIR"

# Pobranie URL bazy danych z .env
if [ -f .env ]; then
    source .env
    if [ -n "$DATABASE_URL" ]; then
        echo "Eksportowanie bazy danych..."
        pg_dump "$DATABASE_URL" > "$BACKUP_FILE" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "✅ Kopia zapasowa utworzona: $BACKUP_FILE"
            echo "📁 Rozmiar: $(du -h "$BACKUP_FILE" | cut -f1)"
        else
            echo "❌ Błąd podczas tworzenia kopii zapasowej"
            rm -f "$BACKUP_FILE"
            exit 1
        fi
    else
        echo "❌ Brak konfiguracji bazy danych w .env"
        exit 1
    fi
else
    echo "❌ Brak pliku .env"
    exit 1
fi

# Usuwanie starych kopii zapasowych (zachowaj 10 najnowszych)
cd "$BACKUP_DIR"
ls -t crm-backup-*.sql 2>/dev/null | tail -n +11 | xargs rm -f
echo "🧹 Stare kopie zapasowe zostały usunięte"
EOF

    # Skrypt restore.sh
    cat > crm-system/restore.sh << 'EOF'
#!/bin/bash
if [ -z "$1" ]; then
    echo "Użycie: ./restore.sh <plik-kopii-zapasowej>"
    echo ""
    echo "Dostępne kopie zapasowe:"
    ls -la backups/*.sql 2>/dev/null || echo "Brak kopii zapasowych"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Plik nie istnieje: $BACKUP_FILE"
    exit 1
fi

echo "Przywracanie z kopii zapasowej: $BACKUP_FILE"
echo "⚠️  UWAGA: To usunie wszystkie aktualne dane!"
read -p "Czy na pewno chcesz kontynuować? (t/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Tt]$ ]]; then
    # Zatrzymanie systemu
    echo "Zatrzymywanie systemu..."
    ./stop.sh
    
    # Pobranie URL bazy danych z .env
    if [ -f .env ]; then
        source .env
        if [ -n "$DATABASE_URL" ]; then
            echo "Przywracanie bazy danych..."
            psql "$DATABASE_URL" < "$BACKUP_FILE"
            
            if [ $? -eq 0 ]; then
                echo "✅ Przywracanie zakończone!"
                echo "Uruchamianie systemu..."
                ./start.sh
            else
                echo "❌ Błąd podczas przywracania"
                exit 1
            fi
        else
            echo "❌ Brak konfiguracji bazy danych w .env"
            exit 1
        fi
    else
        echo "❌ Brak pliku .env"
        exit 1
    fi
else
    echo "Anulowano."
fi
EOF

    # Skrypt update.sh
    cat > crm-system/update.sh << 'EOF'
#!/bin/bash
echo "Aktualizowanie systemu CRM..."

# Kopia zapasowa przed aktualizacją
echo "1. Tworzenie kopii zapasowej..."
./backup.sh

# Zatrzymanie systemu
echo "2. Zatrzymywanie systemu..."
./stop.sh

# Aktualizacja zależności
echo "3. Aktualizowanie zależności..."
npm update

# Rebuild aplikacji
echo "4. Przebudowywanie aplikacji..."
npm run build

# Migracje bazy danych
echo "5. Uruchamianie migracji..."
npm run db:push

# Uruchomienie systemu
echo "6. Uruchamianie systemu..."
./start.sh

echo "✅ Aktualizacja zakończona!"
EOF

    # Skrypt uninstall.sh
    cat > crm-system/uninstall.sh << 'EOF'
#!/bin/bash
echo "⚠️  UWAGA: To usunie cały system CRM i wszystkie dane!"
echo "Zostanie utworzona ostatnia kopia zapasowa."
echo ""
read -p "Czy na pewno chcesz kontynuować? (t/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Tt]$ ]]; then
    # Ostatnia kopia zapasowa
    echo "Tworzenie ostatniej kopii zapasowej..."
    ./backup.sh
    
    # Zatrzymanie systemu
    echo "Zatrzymywanie systemu..."
    ./stop.sh
    
    # Informacja o plikach
    echo ""
    echo "Katalogi do ręcznego usunięcia:"
    echo "- $(pwd)"
    echo "- Kopie zapasowe w: $(pwd)/backups"
    echo ""
    echo "System CRM został zatrzymany."
    echo "Usuń katalog ręcznie gdy będziesz gotowy."
else
    echo "Anulowano."
fi
EOF

    # Nadanie uprawnień wykonywania
    chmod +x crm-system/*.sh
    
    log_success "Skrypty zarządzania utworzone"
}

# Tworzenie usługi systemowej (opcjonalne)
create_system_service() {
    if [[ "$OS" == "linux" ]] && command -v systemctl &> /dev/null; then
        log_info "Czy chcesz utworzyć usługę systemową dla automatycznego uruchamiania?"
        read -p "Utwórz usługę systemową? (t/n): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Tt]$ ]]; then
            SERVICE_NAME="crm-system"
            SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"
            INSTALL_DIR="$(pwd)/crm-system"
            
            sudo tee "$SERVICE_FILE" > /dev/null << EOF
[Unit]
Description=System CRM
Documentation=https://github.com/example/crm-system
After=network.target postgresql.service
Wants=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$INSTALL_DIR
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
ExecReload=/bin/kill -s HUP \$MAINPID
KillMode=mixed
KillSignal=SIGINT
TimeoutStopSec=5
Restart=always
RestartSec=5
SyslogIdentifier=crm-system

# Limity zasobów
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
EOF

            sudo systemctl daemon-reload
            sudo systemctl enable "$SERVICE_NAME"
            
            log_success "Usługa systemowa utworzona i włączona"
            echo "Zarządzanie usługą:"
            echo "  sudo systemctl start $SERVICE_NAME"
            echo "  sudo systemctl stop $SERVICE_NAME"
            echo "  sudo systemctl restart $SERVICE_NAME"
            echo "  sudo systemctl status $SERVICE_NAME"
        fi
    fi
}

# Test instalacji
test_installation() {
    log_info "Sprawdzanie instalacji..."
    
    cd crm-system
    
    # Test uruchomienia w tle
    timeout 30s npm start &
    SERVER_PID=$!
    
    sleep 10
    
    # Test dostępności
    if curl -f http://localhost:3000 &> /dev/null; then
        log_success "Serwer odpowiada poprawnie"
        kill $SERVER_PID 2>/dev/null || true
    else
        log_warning "Serwer może nie działać poprawnie - sprawdź konfigurację"
        kill $SERVER_PID 2>/dev/null || true
    fi
    
    cd ..
}

# Wyświetlenie informacji końcowych
show_final_info() {
    echo ""
    echo "=================================================="
    echo "           INSTALACJA ZAKOŃCZONA POMYŚLNIE!"
    echo "=================================================="
    echo ""
    echo "System CRM został zainstalowany w katalogu:"
    echo "📁 $(pwd)/crm-system"
    echo ""
    echo "Uruchomienie systemu:"
    echo "🚀 cd crm-system && ./start.sh"
    echo ""
    echo "System będzie dostępny pod adresem:"
    echo "🌐 http://localhost:3000"
    echo ""
    echo "Domyślne dane logowania:"
    echo "👤 Login: admin"
    echo "🔑 Hasło: admin123"
    echo ""
    echo "⚠️  WAŻNE: Zmień domyślne hasło po pierwszym logowaniu!"
    echo ""
    echo "Przydatne polecenia:"
    echo "• Uruchom: ./start.sh"
    echo "• Zatrzymaj: ./stop.sh"
    echo "• Status: ./status.sh"
    echo "• Logi: ./logs.sh"
    echo "• Kopia zapasowa: ./backup.sh"
    echo "• Aktualizacja: ./update.sh"
    echo ""
    echo "Pliki konfiguracyjne:"
    echo "• Główna konfiguracja: .env"
    echo "• Logi: logs/app.log"
    echo "• Kopie zapasowe: backups/"
    echo ""
}

# Główna funkcja instalacyjna
main() {
    echo "Rozpoczynanie instalacji natywnej systemu CRM..."
    echo ""
    
    check_permissions
    check_os
    install_system_dependencies
    check_nodejs
    check_npm
    check_postgresql
    check_git
    create_directories
    copy_application_files
    install_npm_dependencies
    build_application
    configure_database
    run_database_migrations
    create_management_scripts
    create_system_service
    test_installation
    show_final_info
    
    log_success "Instalacja natywna zakończona pomyślnie!"
}

# Uruchomienie instalatora
main "$@"