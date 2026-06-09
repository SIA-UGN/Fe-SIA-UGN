#!/usr/bin/env bash
# setup-vps.sh
# Inisialisasi Ubuntu 22.04 untuk menjalankan Docker Next.js app di VPS.

set -Eeuo pipefail

# -------------------------------
# Basic error handling
# -------------------------------
err_report() {
  local exit_code=$?
  local line_no=$1
  echo "[ERROR] Gagal di baris ${line_no} (exit code: ${exit_code})."
  exit "${exit_code}"
}
trap 'err_report $LINENO' ERR

log() {
  echo
  echo "==> $1"
}

# -------------------------------
# Validate environment
# -------------------------------
if [[ "${EUID}" -ne 0 ]]; then
  echo "[ERROR] Jalankan script ini sebagai root (contoh: sudo bash setup-vps.sh)."
  exit 1
fi

if ! grep -qi "ubuntu" /etc/os-release; then
  echo "[WARNING] Script ini ditargetkan untuk Ubuntu 22.04."
fi

DEPLOY_USER="deploy"
APP_DIR="/home/${DEPLOY_USER}/apps/myapp"
SSH_KEY_PATH="/home/${DEPLOY_USER}/.ssh/github_actions_deploy_ed25519"

# -------------------------------
# 1) Update & upgrade packages
# -------------------------------
log "Update & upgrade system packages"
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

# Install paket dasar yang dibutuhkan
apt-get install -y \
  ca-certificates \
  curl \
  gnupg \
  lsb-release \
  ufw \
  snapd

# -------------------------------
# 2) Install Docker Engine
# -------------------------------
log "Install Docker Engine"

# Hapus paket docker lama jika ada (optional, aman)
apt-get remove -y docker docker-engine docker.io containerd runc || true

# Tambah Docker official GPG key
install -m 0755 -d /etc/apt/keyrings
if [[ ! -f /etc/apt/keyrings/docker.asc ]]; then
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
fi

# Tambah Docker apt repository
ARCH="$(dpkg --print-architecture)"
CODENAME="$(. /etc/os-release && echo "${VERSION_CODENAME}")"
echo \
  "deb [arch=${ARCH} signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${CODENAME} stable" \
  > /etc/apt/sources.list.d/docker.list

apt-get update -y

# Install Docker Engine + komponen inti
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin

systemctl enable docker
systemctl start docker

# -------------------------------
# 3) Install Docker Compose v2 plugin
# -------------------------------
log "Install Docker Compose v2 plugin"
apt-get install -y docker-compose-plugin

# -------------------------------
# 4) Buat user deploy & tambahkan ke group docker
# -------------------------------
log "Setup user deploy"

if id "${DEPLOY_USER}" >/dev/null 2>&1; then
  echo "User ${DEPLOY_USER} sudah ada, skip create."
else
  adduser --disabled-password --gecos "" "${DEPLOY_USER}"
fi

# Pastikan group docker ada
if ! getent group docker >/dev/null; then
  groupadd docker
fi

usermod -aG docker "${DEPLOY_USER}"

# -------------------------------
# 5) Setup UFW firewall: allow 22,80,443
# -------------------------------
log "Setup UFW firewall"

ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# -------------------------------
# 6) Buat direktori ~/apps/myapp/{nginx,ssl,logs}
# -------------------------------
log "Create app directories"

install -d -m 0755 "${APP_DIR}/nginx" "${APP_DIR}/ssl" "${APP_DIR}/logs"
chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "/home/${DEPLOY_USER}/apps"

# -------------------------------
# 7) Install Certbot via snap
# -------------------------------
log "Install Certbot via snap"

systemctl enable --now snapd
snap install core
snap refresh core

if ! snap list certbot >/dev/null 2>&1; then
  snap install --classic certbot
fi

# Symlink certbot command (idempotent)
if [[ ! -L /usr/bin/certbot ]]; then
  ln -s /snap/bin/certbot /usr/bin/certbot
fi

# -------------------------------
# 8) Generate SSH key untuk GitHub Actions deploy
# -------------------------------
log "Generate SSH key untuk GitHub Actions"

# Pastikan folder .ssh milik deploy user
install -d -m 0700 -o "${DEPLOY_USER}" -g "${DEPLOY_USER}" "/home/${DEPLOY_USER}/.ssh"

if [[ -f "${SSH_KEY_PATH}" ]]; then
  echo "SSH key sudah ada di ${SSH_KEY_PATH}, skip generate."
else
  sudo -u "${DEPLOY_USER}" ssh-keygen -t ed25519 \
    -C "github-actions-deploy@$(hostname)" \
    -f "${SSH_KEY_PATH}" \
    -N ""
fi

chmod 600 "${SSH_KEY_PATH}"
chmod 644 "${SSH_KEY_PATH}.pub"
chown "${DEPLOY_USER}:${DEPLOY_USER}" "${SSH_KEY_PATH}" "${SSH_KEY_PATH}.pub"

# -------------------------------
# 9) Tampilkan public key di akhir script
# -------------------------------
log "Public key untuk GitHub Secrets / Deploy Keys"
echo "----- BEGIN PUBLIC KEY -----"
cat "${SSH_KEY_PATH}.pub"
echo "----- END PUBLIC KEY -----"

echo
echo "Setup selesai."
echo "Catatan:"
echo "- Login ulang sebagai user ${DEPLOY_USER} agar grup docker aktif."
echo "- Verifikasi: su - ${DEPLOY_USER} && docker --version && docker compose version"
echo "- Jalankan certbot saat domain sudah diarahkan ke VPS."
