#!/usr/bin/env sh
set -e

echo "NODE_ENV=$NODE_ENV — running migrations..."
# Если CLI в deps: просто sequelize; если глобально — тоже сработает
sequelize db:migrate --env "$NODE_ENV"

echo "Starting app..."
exec "$@"
