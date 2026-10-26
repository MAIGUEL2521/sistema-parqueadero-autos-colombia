-- Modelo físico (SQLite para ejecución local; ver schema_mysql.sql para MySQL)
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS usuario (
  id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
  documento TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  telefono TEXT,
  correo TEXT
);
CREATE TABLE IF NOT EXISTS celda (
  id_celda INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT NOT NULL UNIQUE,
  tipo_vehiculo TEXT NOT NULL CHECK (tipo_vehiculo IN ('CARRO','MOTO')),
  estado TEXT NOT NULL DEFAULT 'LIBRE' CHECK (estado IN ('LIBRE','OCUPADA','MANTENIMIENTO'))
);
CREATE TABLE IF NOT EXISTS vehiculo (
  id_vehiculo INTEGER PRIMARY KEY AUTOINCREMENT,
  placa TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL CHECK (tipo IN ('CARRO','MOTO')),
  marca TEXT,
  color TEXT,
  id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario)
);
CREATE TABLE IF NOT EXISTS mensualidad (
  id_mensualidad INTEGER PRIMARY KEY AUTOINCREMENT,
  id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario),
  fecha_inicio TEXT NOT NULL,
  fecha_fin TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'ACTIVA' CHECK (estado IN ('ACTIVA','VENCIDA'))
);
CREATE TABLE IF NOT EXISTS registro_acceso (
  id_registro INTEGER PRIMARY KEY AUTOINCREMENT,
  id_vehiculo INTEGER NOT NULL REFERENCES vehiculo(id_vehiculo),
  id_celda INTEGER NOT NULL REFERENCES celda(id_celda),
  fecha_entrada TEXT NOT NULL,
  fecha_salida TEXT,
  observacion TEXT
);
