// Pruebas con el módulo assert de Node (sin dependencias extra)
const assert = require("assert");
const os = require("os"), path = require("path");
const { abrir } = require("./src/db");
const ServicioAcceso = require("./src/servicioAcceso");

const db = abrir(path.join(os.tmpdir(), `ac_test_${Date.now()}.db`));
db.exec("UPDATE mensualidad SET fecha_inicio='2000-01-01', fecha_fin='2999-12-31' WHERE id_usuario=1");
const s = new ServicioAcceso(db);
const estado = c => db.prepare("SELECT estado FROM celda WHERE codigo=?").get(c).estado;

assert.strictEqual(s.registrarEntrada("zzz000").ok, false, "placa inexistente");
assert.strictEqual(s.registrarEntrada("XYZ98A").ok, false, "mensualidad vencida");
assert.strictEqual(s.registrarEntrada("abc123").ok, true, "entrada válida");
assert.strictEqual(s.registrarEntrada("ABC123").ok, false, "ya está dentro");
assert.strictEqual(estado("C-01"), "OCUPADA");
assert.strictEqual(s.registrarSalida("ABC123", "Rayón en puerta").ok, true, "salida válida");
assert.strictEqual(estado("C-01"), "LIBRE");
assert.strictEqual(s.registrarSalida("ABC123").ok, false, "sin entrada abierta");
assert.strictEqual(s.historial("ABC123")[0].observacion, "Rayón en puerta");

(async () => {
  const { crearApp } = require("./app");
  const server = crearApp(db).listen(0);
  const port = server.address().port;
  for (const r of ["/", "/entrada", "/salida", "/historial"]) {
    const res = await fetch(`http://127.0.0.1:${port}${r}`);
    assert.strictEqual(res.status, 200, r);
  }
  server.close();
  console.log("TODAS LAS PRUEBAS PASARON");
})();
