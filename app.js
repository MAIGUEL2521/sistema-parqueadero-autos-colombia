// Capa de controladores: rutas Express
const express = require("express");
const path = require("path");
const { abrir } = require("./src/db");
const ServicioAcceso = require("./src/servicioAcceso");

function crearApp(db = abrir()) {
  const app = express();
  const servicio = new ServicioAcceso(db);
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));
  app.use(express.urlencoded({ extended: false }));

  // Mensajes tipo "flash" simples (un solo usuario operando)
  let aviso = null;
  app.use((req, res, next) => { res.locals.aviso = aviso; aviso = null; next(); });

  app.get("/", (req, res) =>
    res.render("index", { celdas: servicio.celdas(), dentro: servicio.vehiculosDentro() }));

  app.get("/entrada", (req, res) => res.render("entrada"));
  app.post("/entrada", (req, res) => {
    aviso = servicio.registrarEntrada(req.body.placa);
    res.redirect("/entrada");
  });

  app.get("/salida", (req, res) => res.render("salida"));
  app.post("/salida", (req, res) => {
    aviso = servicio.registrarSalida(req.body.placa, req.body.observacion);
    res.redirect("/salida");
  });

  app.get("/historial", (req, res) => {
    const placa = req.query.placa || "";
    res.render("historial", { rows: servicio.historial(placa), placa });
  });
  return app;
}

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  crearApp().listen(PORT, () => console.log(`Autos Colombia en http://localhost:${PORT}`));
}
module.exports = { crearApp };
