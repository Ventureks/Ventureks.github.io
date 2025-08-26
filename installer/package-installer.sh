#!/bin/bash

# Skrypt tworzenia pakietu instalacyjnego dla Systemu CRM
# Wersja: 1.0.0

set -e

echo "=================================================="
echo "      TWORZENIE PAKIETU INSTALACYJNEGO CRM"
echo "=================================================="
echo ""

# Kolory
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Sprawdzenie czy jesteśmy w głównym katalogu projektu
if [ ! -f "../package.json" ] || [ ! -d "../client" ] || [ ! -d "../server" ]; then
    echo "Błąd: Uruchom skrypt z katalogu installer w głównym projekcie CRM"
    exit 1
fi

cd ..

VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "1.0.0")
PACKAGE_NAME="crm-system-installer-v$VERSION"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
PACKAGE_DIR="$PACKAGE_NAME-$TIMESTAMP"

log_info "Tworzenie pakietu instalacyjnego: $PACKAGE_NAME"

# Tworzenie struktury pakietu
log_info "Tworzenie struktury katalogów..."
mkdir -p "$PACKAGE_DIR"/{source,installer,docs,tools}

# Kopiowanie plików źródłowych aplikacji
log_info "Kopiowanie plików źródłowych..."
cp -r client "$PACKAGE_DIR/source/"
cp -r server "$PACKAGE_DIR/source/"
cp -r shared "$PACKAGE_DIR/source/"
cp package.json "$PACKAGE_DIR/source/"
cp package-lock.json "$PACKAGE_DIR/source/"
cp tsconfig.json "$PACKAGE_DIR/source/"
cp vite.config.ts "$PACKAGE_DIR/source/"
cp tailwind.config.ts "$PACKAGE_DIR/source/"
cp postcss.config.js "$PACKAGE_DIR/source/"
cp components.json "$PACKAGE_DIR/source/"
cp drizzle.config.ts "$PACKAGE_DIR/source/"

# Kopiowanie instalatorów
log_info "Kopiowanie skryptów instalacyjnych..."
cp installer/install-docker.sh "$PACKAGE_DIR/installer/"
cp installer/install-native.sh "$PACKAGE_DIR/installer/"
cp installer/installer-windows.bat "$PACKAGE_DIR/installer/"
cp installer/README.md "$PACKAGE_DIR/"
cp installer/INSTRUKCJA_INSTALACJI.md "$PACKAGE_DIR/docs/"

# Tworzenie dodatkowych narzędzi
log_info "Tworzenie narzędzi pomocniczych..."

# Skrypt weryfikacji środowiska
cat > "$PACKAGE_DIR/tools/verify-environment.sh" << 'EOF'
#!/bin/bash

echo "Weryfikacja środowiska dla Systemu CRM"
echo "======================================"
echo ""

# Funkcje sprawdzające
check_command() {
    if command -v "$1" &> /dev/null; then
        echo "✅ $1 jest zainstalowany"
        if [ "$1" = "node" ]; then
            echo "   Wersja: $(node --version)"
        elif [ "$1" = "npm" ]; then
            echo "   Wersja: $(npm --version)"
        elif [ "$1" = "docker" ]; then
            echo "   Wersja: $(docker --version)"
        elif [ "$1" = "psql" ]; then
            echo "   Wersja: $(psql --version)"
        fi
    else
        echo "❌ $1 nie jest zainstalowany"
    fi
}

echo "Sprawdzanie wymaganych narzędzi:"
echo "-------------------------------"
check_command "node"
check_command "npm"
check_command "git"

echo ""
echo "Sprawdzanie opcjonalnych narzędzi:"
echo "---------------------------------"
check_command "docker"
check_command "docker-compose"
check_command "psql"

echo ""
echo "Sprawdzanie systemu:"
echo "-------------------"
echo "System operacyjny: $(uname -s)"
echo "Architektura: $(uname -m)"
echo "Dostępna pamięć RAM: $(free -h 2>/dev/null | grep Mem | awk '{print $2}' || echo 'Nieznana')"
echo "Dostępne miejsce na dysku: $(df -h . | tail -1 | awk '{print $4}')"

echo ""
echo "Sprawdzanie portów:"
echo "------------------"
PORT_3000=$(netstat -tuln 2>/dev/null | grep ":3000 " || echo "")
PORT_5432=$(netstat -tuln 2>/dev/null | grep ":5432 " || echo "")

if [ -z "$PORT_3000" ]; then
    echo "✅ Port 3000 jest wolny"
else
    echo "⚠️  Port 3000 jest zajęty"
fi

if [ -z "$PORT_5432" ]; then
    echo "✅ Port 5432 jest wolny"
else
    echo "⚠️  Port 5432 jest zajęty"
fi

echo ""
echo "Rekomendowana metoda instalacji:"
echo "--------------------------------"
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "🚀 Docker (zalecana) - wszystkie zależności w kontenerach"
    echo "   Uruchom: ./installer/install-docker.sh"
elif command -v node &> /dev/null && command -v npm &> /dev/null; then
    echo "🔧 Natywna - instalacja na systemie lokalnym"
    echo "   Uruchom: ./installer/install-native.sh"
else
    echo "⚠️  Zainstaluj najpierw Node.js i npm lub Docker"
fi
EOF

chmod +x "$PACKAGE_DIR/tools/verify-environment.sh"

# Skrypt migracji danych
cat > "$PACKAGE_DIR/tools/migrate-data.sh" << 'EOF'
#!/bin/bash

echo "Narzędzie migracji danych CRM"
echo "============================"
echo ""

if [ "$#" -ne 2 ]; then
    echo "Użycie: $0 <stara_baza_url> <nowa_baza_url>"
    echo ""
    echo "Przykład:"
    echo "  $0 'postgresql://user:pass@old_host:5432/old_db' 'postgresql://user:pass@new_host:5432/new_db'"
    exit 1
fi

OLD_DB="$1"
NEW_DB="$2"
TEMP_FILE="/tmp/migration_$(date +%s).sql"

echo "Eksportowanie danych ze starej bazy..."
if pg_dump "$OLD_DB" > "$TEMP_FILE"; then
    echo "✅ Eksport zakończony"
else
    echo "❌ Błąd eksportu"
    exit 1
fi

echo "Importowanie do nowej bazy..."
if psql "$NEW_DB" < "$TEMP_FILE"; then
    echo "✅ Import zakończony"
    rm -f "$TEMP_FILE"
else
    echo "❌ Błąd importu"
    rm -f "$TEMP_FILE"
    exit 1
fi

echo "Migracja danych zakończona pomyślnie!"
EOF

chmod +x "$PACKAGE_DIR/tools/migrate-data.sh"

# Tworzenie skryptu głównego instalatora
cat > "$PACKAGE_DIR/install.sh" << 'EOF'
#!/bin/bash

echo "=================================================="
echo "           INSTALATOR SYSTEMU CRM"
echo "=================================================="
echo ""
echo "Witaj w instalatorze systemu CRM!"
echo ""

# Sprawdzenie środowiska
if [ -f "tools/verify-environment.sh" ]; then
    echo "Sprawdzanie środowiska..."
    ./tools/verify-environment.sh
    echo ""
fi

echo "Dostępne metody instalacji:"
echo "1. Docker (zalecana) - automatyczna instalacja w kontenerach"
echo "2. Natywna - instalacja bezpośrednio na systemie"
echo "3. Weryfikacja środowiska"
echo "4. Anuluj"
echo ""

read -p "Wybierz opcję (1-4): " choice

case $choice in
    1)
        echo ""
        echo "Uruchamianie instalatora Docker..."
        cd installer && ./install-docker.sh
        ;;
    2)
        echo ""
        echo "Uruchamianie instalatora natywnego..."
        cd installer && ./install-native.sh
        ;;
    3)
        echo ""
        ./tools/verify-environment.sh
        ;;
    4)
        echo "Anulowano instalację."
        exit 0
        ;;
    *)
        echo "Nieprawidłowy wybór!"
        exit 1
        ;;
esac
EOF

chmod +x "$PACKAGE_DIR/install.sh"

# Tworzenie skryptu dla Windows
cat > "$PACKAGE_DIR/install.bat" << 'EOF'
@echo off
chcp 65001 >nul
title Instalator Systemu CRM

echo ==================================================
echo           INSTALATOR SYSTEMU CRM
echo ==================================================
echo.
echo Witaj w instalatorze systemu CRM!
echo.
echo Ten skrypt uruchomi główny instalator Windows.
echo.

pause

cd installer
installer-windows.bat
EOF

# Tworzenie pliku informacyjnego
cat > "$PACKAGE_DIR/PACKAGE_INFO.txt" << EOF
Pakiet instalacyjny: $PACKAGE_NAME
Data utworzenia: $(date)
Wersja aplikacji: $VERSION
System: Multi-platform (Linux, macOS, Windows)

Zawartość pakietu:
- source/          Kod źródłowy aplikacji CRM
- installer/       Skrypty instalacyjne dla różnych platform
- docs/            Dokumentacja i przewodniki
- tools/           Narzędzia pomocnicze i diagnostyczne
- install.sh       Główny instalator (Linux/macOS)
- install.bat      Główny instalator (Windows)

Wymagania systemowe:
- RAM: min. 2 GB
- Dysk: min. 5 GB wolnego miejsca
- Node.js 18+ (dla instalacji natywnej)
- Docker 20+ (dla instalacji Docker)
- PostgreSQL 14+ (dla instalacji natywnej)

Wspierane systemy:
✅ Ubuntu 20.04+
✅ Debian 11+
✅ CentOS 8+
✅ macOS 10.15+
✅ Windows 10/11

Szybki start:
Linux/macOS: ./install.sh
Windows: install.bat (uruchom jako administrator)
EOF

# Kompresja pakietu
log_info "Tworzenie archiwum..."
tar -czf "$PACKAGE_NAME-$TIMESTAMP.tar.gz" "$PACKAGE_DIR"

# Tworzenie pliku zip dla Windows
if command -v zip &> /dev/null; then
    zip -r "$PACKAGE_NAME-$TIMESTAMP.zip" "$PACKAGE_DIR" > /dev/null
    log_success "Pakiet ZIP utworzony: $PACKAGE_NAME-$TIMESTAMP.zip"
fi

# Obliczanie sum kontrolnych
if command -v sha256sum &> /dev/null; then
    sha256sum "$PACKAGE_NAME-$TIMESTAMP.tar.gz" > "$PACKAGE_NAME-$TIMESTAMP.tar.gz.sha256"
    if [ -f "$PACKAGE_NAME-$TIMESTAMP.zip" ]; then
        sha256sum "$PACKAGE_NAME-$TIMESTAMP.zip" > "$PACKAGE_NAME-$TIMESTAMP.zip.sha256"
    fi
    log_success "Sumy kontrolne SHA256 utworzone"
fi

# Czyszczenie
rm -rf "$PACKAGE_DIR"

echo ""
echo "=================================================="
echo "         PAKIET INSTALACYJNY UTWORZONY!"
echo "=================================================="
echo ""
echo "Utworzone pliki:"
echo "📦 $PACKAGE_NAME-$TIMESTAMP.tar.gz"
if [ -f "$PACKAGE_NAME-$TIMESTAMP.zip" ]; then
    echo "📦 $PACKAGE_NAME-$TIMESTAMP.zip"
fi
echo ""
echo "Rozmiary:"
echo "$(ls -lh $PACKAGE_NAME-$TIMESTAMP.* | awk '{print $5 " " $9}')"
echo ""
echo "Instrukcje dystrybucji:"
echo "1. Przekaż odpowiedni pakiet użytkownikom"
echo "2. Rozpakuj pakiet: tar -xzf pakiet.tar.gz"
echo "3. Uruchom instalator: ./install.sh"
echo ""

log_success "Pakiet instalacyjny gotowy do dystrybucji!"