// Capa de servicios: lógica de negocio (RF-01 a RF-09)
class ServicioAcceso {
  constructor(db) { this.db = db; }

  _hoy() { return new Date().toISOString().slice(0, 10); }
  _ahora() { return new Date().toISOString().slice(0, 19); }

  mensualidadActiva(idUsuario) {
    const hoy = this._hoy();
    return !!this.db.prepare(
      "SELECT 1 FROM mensualidad WHERE id_usuario=? AND estado='ACTIVA' AND fecha_inicio<=? AND fecha_fin>=?"
    ).get(idUsuario, hoy, hoy);
  }

  registrarEntrada(placaEntrada) {
    const placa = String(placaEntrada || "").trim().toUpperCase();
    const v = this.db.prepare("SELECT * FROM vehiculo WHERE placa=?").get(placa);
    if (!v) return { ok: false, mensaje: `La placa ${placa} no está registrada.` };
    if (!this.mensualidadActiva(v.id_usuario))
      return { ok: false, mensaje: `El usuario de ${placa} no tiene mensualidad vigente.` };
    if (this.db.prepare("SELECT 1 FROM registro_acceso WHERE id_vehiculo=? AND fecha_salida IS NULL").get(v.id_vehiculo))
      return { ok: false, mensaje: `El vehículo ${placa} ya se encuentra dentro del parqueadero.` };
    const celda = this.db.prepare(
      "SELECT * FROM celda WHERE estado='LIBRE' AND tipo_vehiculo=? ORDER BY codigo LIMIT 1").get(v.tipo);
    if (!celda) return { ok: false, mensaje: "No hay celdas disponibles para este tipo de vehículo." };

    this.db.transaction(() => {
      this.db.prepare("INSERT INTO registro_acceso(id_vehiculo,id_celda,fecha_entrada) VALUES (?,?,?)")
        .run(v.id_vehiculo, celda.id_celda, this._ahora());
      this.db.prepare("UPDATE celda SET estado='OCUPADA' WHERE id_celda=?").run(celda.id_celda);
    })();
    return { ok: true, mensaje: `Entrada registrada: ${placa} en celda ${celda.codigo}.` };
  }

  registrarSalida(placaEntrada, observacion = "") {
    const placa = String(placaEntrada || "").trim().toUpperCase();
    const r = this.db.prepare(
      `SELECT r.id_registro, r.id_celda, c.codigo FROM registro_acceso r
       JOIN vehiculo v ON v.id_vehiculo=r.id_vehiculo JOIN celda c ON c.id_celda=r.id_celda
       WHERE v.placa=? AND r.fecha_salida IS NULL`).get(placa);
    if (!r) return { ok: false, mensaje: `No hay una entrada abierta para la placa ${placa}.` };
    this.db.transaction(() => {
      this.db.prepare("UPDATE registro_acceso SET fecha_salida=?, observacion=? WHERE id_registro=?")
        .run(this._ahora(), observacion || null, r.id_registro);
      this.db.prepare("UPDATE celda SET estado='LIBRE' WHERE id_celda=?").run(r.id_celda);
    })();
    return { ok: true, mensaje: `Salida registrada: ${placa} liberó la celda ${r.codigo}.` };
  }

  celdas() { return this.db.prepare("SELECT * FROM celda ORDER BY codigo").all(); }

  vehiculosDentro() {
    return this.db.prepare(
      `SELECT v.placa, c.codigo, r.fecha_entrada FROM registro_acceso r
       JOIN vehiculo v ON v.id_vehiculo=r.id_vehiculo JOIN celda c ON c.id_celda=r.id_celda
       WHERE r.fecha_salida IS NULL ORDER BY r.fecha_entrada`).all();
  }

  historial(placa = "") {
    const p = String(placa).trim().toUpperCase();
    const base = `SELECT v.placa, c.codigo, r.fecha_entrada, r.fecha_salida, r.observacion
      FROM registro_acceso r JOIN vehiculo v ON v.id_vehiculo=r.id_vehiculo
      JOIN celda c ON c.id_celda=r.id_celda `;
    return p
      ? this.db.prepare(base + "WHERE v.placa=? ORDER BY r.fecha_entrada DESC").all(p)
      : this.db.prepare(base + "ORDER BY r.fecha_entrada DESC").all();
  }
}
module.exports = ServicioAcceso;
