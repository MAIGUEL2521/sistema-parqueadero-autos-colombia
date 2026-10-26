// Capa de datos: conexión SQLite e inicialización del modelo físico
const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

function abrir(archivo = path.join(__dirname, "..", "parqueadero.db")) {
  const db = new Database(archivo);
  db.pragma("foreign_keys = ON");
  db.exec(fs.readFileSync(path.join(__dirname, "..", "schema.sql"), "utf8"));
  if (db.prepare("SELECT COUNT(*) n FROM celda").get().n === 0) sembrar(db);
  return db;
}

function sembrar(db) {
  const celda = db.prepare("INSERT INTO celda(codigo,tipo_vehiculo) VALUES (?,?)");
  for (let i = 1; i <= 5; i++) celda.run(`C-${String(i).padStart(2, "0")}`, "CARRO");
  for (let i = 1; i <= 3; i++) celda.run(`M-${String(i).padStart(2, "0")}`, "MOTO");
  db.exec(`
    INSERT INTO usuario(documento,nombre,telefono) VALUES ('1000000001','Camila Rojas','3001112233');
    INSERT INTO usuario(documento,nombre,telefono) VALUES ('1000000002','Andrés Pérez','3004445566');
    INSERT INTO vehiculo(placa,tipo,marca,color,id_usuario) VALUES ('ABC123','CARRO','Mazda','Rojo',1);
    INSERT INTO vehiculo(placa,tipo,marca,color,id_usuario) VALUES ('XYZ98A','MOTO','Yamaha','Negro',2);
    INSERT INTO mensualidad(id_usuario,fecha_inicio,fecha_fin) VALUES (1,'2026-10-01','2026-12-31');
    INSERT INTO mensualidad(id_usuario,fecha_inicio,fecha_fin) VALUES (2,'2026-01-01','2026-01-31');
  `);
}

module.exports = { abrir };
