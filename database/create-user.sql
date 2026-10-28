-- Crea un usuario de MySQL exclusivo para la API (no usar root en la app).
-- Cambia la contraseña y usa la misma en api/.env (DB_PASSWORD).
CREATE USER IF NOT EXISTS 'ducky_app'@'localhost' IDENTIFIED BY 'DuckyApp2026!';
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON biblioteca_ducky.* TO 'ducky_app'@'localhost';
FLUSH PRIVILEGES;
