#!/data/data/com.termux/files/usr/bin/bash
# ============================================================
# NEXO Lab — Red vs Blue :: instalador para Termux (Android)
#
# Uso:
#   1. Instale o Termux pelo F-Droid (recomendado):
#        https://f-droid.org/packages/com.termux/
#      (a versão da Play Store está desatualizada — evite)
#   2. Copie este projeto para o celular (ou baixe o zip)
#   3. No Termux:
#        termux-setup-storage          # libera acesso ao armazenamento
#        cd ~/nexo-lab                 # pasta deste projeto
#        bash install-termux.sh
#   4. Abra no navegador: http://localhost:8080
#
# O servidor Node (server/servidor.mjs) serve o site E executa
# comandos Linux REAIS no Android para o console do azul
# (whitelist segura: scan, net, status, mem, ps, disk, sys…).
# ============================================================
set -e

echo "==> Atualizando pacotes do Termux..."
pkg update -y && pkg upgrade -y

echo "==> Instalando dependências (nodejs + ferramentas de rede)..."
pkg install -y nodejs iproute2 procps termux-tools

cd "$(dirname "$0")"

if [ -d "dist" ] && [ -f "dist/index.html" ]; then
  echo "==> Build encontrado em ./dist — nada a compilar."
else
  echo "==> Build não encontrado. Compilando a partir do código-fonte..."
  npm install
  npm run build
fi

echo ""
echo "============================================================"
echo " NEXO Lab instalado!"
echo " Iniciando servidor em http://localhost:8080"
echo " Console do azul com execução REAL via /api/exec"
echo " (Ctrl+C para parar — para rodar de novo: bash servir.sh)"
echo "============================================================"
echo ""

# atalho para religar depois
cat > servir.sh <<'EOF'
#!/data/data/com.termux/files/usr/bin/bash
cd "$(dirname "$0")"
node server/servidor.mjs 8080
EOF
chmod +x servir.sh

node server/servidor.mjs 8080
