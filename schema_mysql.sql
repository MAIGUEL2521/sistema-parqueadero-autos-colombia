CREATE DATABASE IF NOT EXISTS autos_colombia CHARACTER SET utf8mb4;
USE autos_colombia;
CREATE TABLE usuario (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  documento VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  correo VARCHAR(100)
);
CREATE TABLE celda (
  id_celda INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(10) NOT NULL UNIQUE,
  tipo_vehiculo ENUM('CARRO','MOTO') NOT NULL,
  estado ENUM('LIBRE','OCUPADA','MANTENIMIENTO') NOT NULL DEFAULT 'LIBRE'
);
CREATE TABLE vehiculo (
  id_vehiculo INT AUTO_INCREMENT PRIMARY KEY,
  placa VARCHAR(10) NOT NULL UNIQUE,
  tipo ENUM('CARRO','MOTO') NOT NULL,
  marca VARCHAR(50),
  color VARCHAR(30),
  id_usuario INT NOT NULL,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);
CREATE TABLE mensualidad (
  id_mensualidad INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado ENUM('ACTIVA','VENCIDA') NOT NULL DEFAULT 'ACTIVA',
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);
CREATE TABLE registro_acceso (
  id_registro INT AUTO_INCREMENT PRIMARY KEY,
  id_vehiculo INT NOT NULL,
  id_celda INT NOT NULL,
  fecha_entrada DATETIME NOT NULL,
  fecha_salida DATETIME NULL,
  observacion VARCHAR(255),
  FOREIGN KEY (id_vehiculo) REFERENCES vehiculo(id_vehiculo),
  FOREIGN KEY (id_celda) REFERENCES celda(id_celda)
);
