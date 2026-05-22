# 🐳 Docker Setup - Laravel BE-SIA

Setup Docker untuk project Laravel BE-SIA dengan dukungan lengkap untuk PHP-FPM, Nginx, MySQL, Redis, Queue Workers, dan Laravel Reverb (WebSocket).

## 📋 Prerequisites

-   Docker Desktop (Windows/Mac) atau Docker Engine (Linux)
-   Docker Compose v2.0+
-   Port yang tersedia: 8000 (Nginx), 3306 (MySQL), 6379 (Redis), 8080 (Reverb)

## 🚀 Quick Start

### 1. Setup Environment File

```bash
# Copy template environment untuk Docker
cp .env.docker .env

# Generate application key
docker compose run --rm app php artisan key:generate
```

### 2. Build dan Jalankan Containers

```bash
# Build images dan jalankan semua services
docker compose up -d --build

# Atau jalankan tanpa rebuild
docker compose up -d
```

### 3. Install Dependencies & Setup Database

```bash
# Install composer dependencies
docker compose exec app composer install

# Jalankan database migrations
docker compose exec app php artisan migrate

# (Optional) Seed database dengan data awal
docker compose exec app php artisan db:seed
```

### 4. Setup Storage & Cache

```bash
# Create storage link
docker compose exec app php artisan storage:link

# Clear dan cache config
docker compose exec app php artisan config:cache
docker compose exec app php artisan route:cache
docker compose exec app php artisan view:cache
```

## 🎯 Akses Aplikasi

-   **API Backend**: http://localhost:8000
-   **WebSocket (Reverb)**: ws://localhost:8080
-   **MySQL**: localhost:3306
-   **Redis**: localhost:6379

## 📦 Services yang Berjalan

| Service     | Container Name    | Description              |
| ----------- | ----------------- | ------------------------ |
| `app`       | laravel-app       | PHP-FPM 8.2              |
| `nginx`     | laravel-nginx     | Nginx web server         |
| `db`        | laravel-mysql     | MySQL 8.0 database       |
| `redis`     | laravel-redis     | Redis cache & queue      |
| `reverb`    | laravel-reverb    | Laravel Reverb WebSocket |
| `queue`     | laravel-queue     | Queue worker             |
| `scheduler` | laravel-scheduler | Task scheduler (cron)    |

## 🛠️ Perintah Docker Umum

### Melihat Status Containers

```bash
# Lihat semua containers yang berjalan
docker compose ps

# Lihat logs semua services
docker compose logs

# Lihat logs service tertentu
docker compose logs app
docker compose logs nginx
docker compose logs reverb
```

### Menjalankan Artisan Commands

```bash
# Format: docker compose exec app php artisan [command]

# Contoh: Membuat model
docker compose exec app php artisan make:model Product

# Contoh: Membuat controller
docker compose exec app php artisan make:controller API/ProductController

# Contoh: Clear cache
docker compose exec app php artisan cache:clear
docker compose exec app php artisan config:clear
```

### Akses Container Shell

```bash
# Masuk ke container app
docker compose exec app bash

# Masuk ke container MySQL
docker compose exec db mysql -u laravel -p

# Masuk ke container Redis
docker compose exec redis redis-cli
```

### Restart Services

```bash
# Restart semua services
docker compose restart

# Restart service tertentu
docker compose restart app
docker compose restart reverb
```

### Stop & Remove Containers

```bash
# Stop semua containers
docker compose stop

# Stop dan remove containers
docker compose down

# Stop dan remove containers + volumes (WARNING: Data akan hilang!)
docker compose down -v
```

## 🔧 Troubleshooting

### Permission Issues

Jika ada masalah permission pada folder storage atau bootstrap/cache:

```bash
docker compose exec app chmod -R 775 storage bootstrap/cache
docker compose exec app chown -R www-data:www-data storage bootstrap/cache
```

### Database Connection Issues

Pastikan database sudah ready sebelum menjalankan migration:

```bash
# Cek status database
docker compose exec db mysqladmin ping -h localhost

# Atau tunggu hingga healthy
docker compose ps
```

### WebSocket (Reverb) Tidak Terhubung

Pastikan service reverb berjalan dan accessible:

```bash
# Cek logs reverb
docker compose logs reverb

# Restart reverb service
docker compose restart reverb
```

### Rebuild dari Awal

Jika ada masalah yang persistent:

```bash
# Stop dan hapus semua containers & images
docker compose down --rmi all -v

# Build ulang dari awal
docker compose up -d --build

# Reinstall dependencies
docker compose exec app composer install
docker compose exec app php artisan migrate
```

## 📊 Database Management

### Backup Database

```bash
# Export database
docker compose exec db mysqldump -u laravel -psecret laravel > backup.sql
```

### Restore Database

```bash
# Import database
docker compose exec -T db mysql -u laravel -psecret laravel < backup.sql
```

### Akses MySQL Console

```bash
docker compose exec db mysql -u laravel -psecret laravel
```

## 🔒 Production Considerations

Untuk deployment production, pertimbangkan:

1. **Environment Variables**: Gunakan nilai production yang aman

    - `APP_ENV=production`
    - `APP_DEBUG=false`
    - Password database yang kuat
    - Ganti semua keys & secrets

2. **Volumes**: Setup proper volume backups untuk data persistence

3. **Security**:

    - Gunakan secrets management
    - Implementasi SSL/TLS
    - Restrict port exposure

4. **Performance**:
    - Enable PHP OpCache
    - Optimize MySQL configuration
    - Setup load balancer jika diperlukan

## 📝 Custom Configuration

### Mengubah Port

Edit file `.env`:

```env
APP_PORT=8080  # Ubah port Nginx
DB_PORT=3307   # Ubah port MySQL
REDIS_PORT=6380  # Ubah port Redis
REVERB_PORT=9090  # Ubah port Reverb
```

Kemudian restart containers:

```bash
docker compose down
docker compose up -d
```

### Menambah/Mengurangi Services

Edit file `docker-compose.yml` untuk customize services sesuai kebutuhan.

## 🆘 Support

Jika mengalami masalah:

1. Cek logs: `docker compose logs [service-name]`
2. Verifikasi environment variables di `.env`
3. Pastikan semua ports tidak conflict dengan aplikasi lain
4. Cek dokumentasi Docker: https://docs.docker.com/

## 📚 Additional Resources

-   [Laravel Documentation](https://laravel.com/docs)
-   [Docker Documentation](https://docs.docker.com/)
-   [Docker Compose Documentation](https://docs.docker.com/compose/)
-   [Laravel Reverb Documentation](https://reverb.laravel.com/)
