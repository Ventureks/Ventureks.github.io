#!/bin/bash

# Instalator Docker dla Systemu CRM
# Wersja: 1.0.0

set -e

echo "=================================================="
echo "    INSTALATOR SYSTEMU CRM - WERSJA DOCKER"
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

# Sprawdzenie czy uruchomiono jako root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_warning "Instalator uruchomiony jako root. Zalecane jest uruchomienie jako zwykły użytkownik."
        read -p "Czy chcesz kontynuować? (t/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Tt]$ ]]; then
            exit 1
        fi
    fi
}

# Sprawdzenie systemu operacyjnego
check_os() {
    log_info "Sprawdzanie systemu operacyjnego..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        log_success "Wykryto Linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        log_success "Wykryto macOS"
    else
        log_error "Nieobsługiwany system operacyjny: $OSTYPE"
        exit 1
    fi
}

# Sprawdzenie Docker
check_docker() {
    log_info "Sprawdzanie Docker..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker nie jest zainstalowany!"
        echo ""
        echo "Instrukcje instalacji Docker:"
        echo "Linux: https://docs.docker.com/engine/install/"
        echo "macOS: https://docs.docker.com/docker-for-mac/install/"
        echo ""
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose nie jest zainstalowany!"
        echo ""
        echo "Instrukcje instalacji Docker Compose:"
        echo "https://docs.docker.com/compose/install/"
        echo ""
        exit 1
    fi
    
    # Sprawdzenie czy Docker działa
    if ! docker info &> /dev/null; then
        log_error "Docker nie jest uruchomiony!"
        echo ""
        echo "Uruchom Docker i spróbuj ponownie."
        echo "Linux: sudo systemctl start docker"
        echo "macOS: Uruchom Docker Desktop"
        echo ""
        exit 1
    fi
    
    log_success "Docker jest dostępny"
}

# Tworzenie struktury katalogów
create_directories() {
    log_info "Tworzenie struktury katalogów..."
    
    mkdir -p crm-system/{config,data,logs,backups}
    
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

# Tworzenie pliku Docker Compose
create_docker_compose() {
    log_info "Tworzenie konfiguracji Docker Compose..."
    
    cat > crm-system/docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: crm-postgres
    environment:
      POSTGRES_DB: crm_database
      POSTGRES_USER: crm_user
      POSTGRES_PASSWORD: crm_password_2025
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./data/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    ports:
      - "5432:5432"
    networks:
      - crm-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U crm_user -d crm_database"]
      interval: 10s
      timeout: 5s
      retries: 5

  crm-app:
    build: .
    container_name: crm-application
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://crm_user:crm_password_2025@postgres:5432/crm_database
      - SESSION_SECRET=crm_secret_key_2025_production
      - PORT=3000
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - crm-network
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
      - ./config:/app/config:ro

volumes:
  postgres_data:

networks:
  crm-network:
    driver: bridge
EOF

    log_success "Docker Compose skonfigurowany"
}

# Tworzenie Dockerfile
create_dockerfile() {
    log_info "Tworzenie Dockerfile..."
    
    cat > crm-system/Dockerfile << 'EOF'
FROM node:18-alpine

# Instalacja zależności systemowych
RUN apk add --no-cache \
    postgresql-client \
    curl \
    bash

# Utworzenie użytkownika aplikacji
RUN addgroup -g 1001 -S crm && \
    adduser -S crm -u 1001

# Ustawienie katalogu roboczego
WORKDIR /app

# Kopiowanie plików package.json
COPY package*.json ./

# Instalacja zależności
RUN npm ci --only=production && npm cache clean --force

# Kopiowanie kodu aplikacji
COPY . .

# Budowanie aplikacji
RUN npm run build

# Utworzenie katalogów dla logów
RUN mkdir -p logs config && \
    chown -R crm:crm /app

# Przełączenie na użytkownika aplikacji
USER crm

# Eksponowanie portu
EXPOSE 3000

# Skrypt startowy
COPY --chown=crm:crm docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

# Sprawdzenie zdrowia aplikacji
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Uruchomienie aplikacji
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["npm", "start"]
EOF

    log_success "Dockerfile utworzony"
}

# Tworzenie skryptu startowego Docker
create_docker_entrypoint() {
    log_info "Tworzenie skryptu startowego..."
    
    cat > crm-system/docker-entrypoint.sh << 'EOF'
#!/bin/bash
set -e

# Funkcja logowania
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Uruchamianie aplikacji CRM..."

# Sprawdzenie połączenia z bazą danych
log "Sprawdzanie połączenia z bazą danych..."
while ! pg_isready -h postgres -p 5432 -U crm_user; do
    log "Oczekiwanie na bazę danych..."
    sleep 2
done

log "Baza danych jest dostępna"

# Uruchomienie migracji bazy danych
log "Uruchamianie migracji bazy danych..."
npm run db:push

log "Migracje zakończone"

# Uruchomienie aplikacji
log "Uruchamianie serwera aplikacji..."
exec "$@"
EOF

    chmod +x crm-system/docker-entrypoint.sh
    
    log_success "Skrypt startowy utworzony"
}

# Tworzenie plików konfiguracyjnych
create_config_files() {
    log_info "Tworzenie plików konfiguracyjnych..."
    
    # Plik środowiskowy
    cat > crm-system/config/app.env << 'EOF'
# Konfiguracja aplikacji CRM
NODE_ENV=production
PORT=3000

# Baza danych
DATABASE_URL=postgresql://crm_user:crm_password_2025@postgres:5432/crm_database

# Sesje
SESSION_SECRET=crm_secret_key_2025_production

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

    # Inicjalizacja bazy danych
    cat > crm-system/data/init.sql << 'EOF'
-- Inicjalizacja bazy danych CRM
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tworzenie indeksów dla wydajności
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contractors_email ON contractors(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_offers_status ON offers(status);

-- Ustawienia bazy danych
ALTER DATABASE crm_database SET timezone TO 'Europe/Warsaw';
EOF

    log_success "Pliki konfiguracyjne utworzone"
}

# Tworzenie skryptów zarządzania
create_management_scripts() {
    log_info "Tworzenie skryptów zarządzania..."
    
    # Skrypt start
    cat > crm-system/start.sh << 'EOF'
#!/bin/bash
echo "Uruchamianie systemu CRM..."
docker-compose up -d
echo "System CRM uruchomiony!"
echo "Aplikacja dostępna pod adresem: http://localhost:3000"
EOF

    # Skrypt stop
    cat > crm-system/stop.sh << 'EOF'
#!/bin/bash
echo "Zatrzymywanie systemu CRM..."
docker-compose down
echo "System CRM zatrzymany!"
EOF

    # Skrypt restart
    cat > crm-system/restart.sh << 'EOF'
#!/bin/bash
echo "Restartowanie systemu CRM..."
docker-compose restart
echo "System CRM zrestartowany!"
EOF

    # Skrypt status
    cat > crm-system/status.sh << 'EOF'
#!/bin/bash
echo "Status systemu CRM:"
echo "==================="
docker-compose ps
echo ""
echo "Logi aplikacji:"
echo "==============="
docker-compose logs --tail=20 crm-app
EOF

    # Skrypt logs
    cat > crm-system/logs.sh << 'EOF'
#!/bin/bash
if [ "$1" = "-f" ]; then
    docker-compose logs -f
else
    docker-compose logs --tail=50
fi
EOF

    # Skrypt backup
    cat > crm-system/backup.sh << 'EOF'
#!/bin/bash
BACKUP_FILE="backups/crm-backup-$(date +%Y%m%d-%H%M%S).sql"
echo "Tworzenie kopii zapasowej..."
docker-compose exec postgres pg_dump -U crm_user crm_database > "$BACKUP_FILE"
echo "Kopia zapasowa utworzona: $BACKUP_FILE"
EOF

    # Skrypt restore
    cat > crm-system/restore.sh << 'EOF'
#!/bin/bash
if [ -z "$1" ]; then
    echo "Użycie: ./restore.sh <plik-kopii-zapasowej>"
    exit 1
fi

echo "Przywracanie z kopii zapasowej: $1"
echo "UWAGA: To usunie wszystkie aktualne dane!"
read -p "Czy na pewno chcesz kontynuować? (t/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Tt]$ ]]; then
    docker-compose exec postgres psql -U crm_user -d crm_database < "$1"
    echo "Przywracanie zakończone!"
else
    echo "Anulowano."
fi
EOF

    # Skrypt update
    cat > crm-system/update.sh << 'EOF'
#!/bin/bash
echo "Aktualizowanie systemu CRM..."
echo "1. Tworzenie kopii zapasowej..."
./backup.sh

echo "2. Zatrzymywanie systemu..."
docker-compose down

echo "3. Aktualizowanie obrazów..."
docker-compose pull

echo "4. Uruchamianie systemu..."
docker-compose up -d

echo "Aktualizacja zakończona!"
EOF

    # Skrypt uninstall
    cat > crm-system/uninstall.sh << 'EOF'
#!/bin/bash
echo "UWAGA: To usunie cały system CRM i wszystkie dane!"
read -p "Czy na pewno chcesz kontynuować? (t/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Tt]$ ]]; then
    echo "Zatrzymywanie i usuwanie kontenerów..."
    docker-compose down -v
    
    echo "Usuwanie obrazów..."
    docker rmi $(docker images | grep crm | awk '{print $3}') 2>/dev/null || true
    
    echo "Usuwanie wolumenów..."
    docker volume rm $(docker volume ls | grep crm | awk '{print $2}') 2>/dev/null || true
    
    echo "System CRM został usunięty!"
else
    echo "Anulowano."
fi
EOF

    # Nadanie uprawnień wykonywania
    chmod +x crm-system/*.sh
    
    log_success "Skrypty zarządzania utworzone"
}

# Instalacja systemu
install_system() {
    log_info "Budowanie i uruchamianie systemu..."
    
    cd crm-system
    
    # Budowanie obrazu
    log_info "Budowanie obrazu Docker..."
    docker-compose build
    
    # Uruchamianie systemu
    log_info "Uruchamianie systemu..."
    docker-compose up -d
    
    # Oczekiwanie na uruchomienie
    log_info "Oczekiwanie na uruchomienie systemu..."
    sleep 30
    
    # Sprawdzenie stanu
    if docker-compose ps | grep -q "Up"; then
        log_success "System CRM został pomyślnie zainstalowany i uruchomiony!"
    else
        log_error "Wystąpił problem podczas uruchamiania systemu"
        echo "Sprawdź logi: docker-compose logs"
        exit 1
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
    echo "System CRM jest dostępny pod adresem:"
    echo "🌐 http://localhost:3000"
    echo ""
    echo "Domyślne dane logowania:"
    echo "👤 Login: admin"
    echo "🔑 Hasło: admin123"
    echo ""
    echo "⚠️  WAŻNE: Zmień domyślne hasło po pierwszym logowaniu!"
    echo ""
    echo "Przydatne polecenia:"
    echo "• Zatrzymaj system: cd crm-system && ./stop.sh"
    echo "• Uruchom system: cd crm-system && ./start.sh"
    echo "• Status systemu: cd crm-system && ./status.sh"
    echo "• Logi systemu: cd crm-system && ./logs.sh"
    echo "• Kopia zapasowa: cd crm-system && ./backup.sh"
    echo ""
    echo "Dokumentacja: crm-system/README.md"
    echo ""
}

# Główna funkcja instalacyjna
main() {
    echo "Rozpoczynanie instalacji systemu CRM..."
    echo ""
    
    check_root
    check_os
    check_docker
    create_directories
    copy_application_files
    create_docker_compose
    create_dockerfile
    create_docker_entrypoint
    create_config_files
    create_management_scripts
    install_system
    show_final_info
    
    log_success "Instalacja zakończona pomyślnie!"
}

# Uruchomienie instalatora
main "$@"