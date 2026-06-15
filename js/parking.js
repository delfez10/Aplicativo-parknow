/* ====== ParkNow — Estacionamento (simples) ====== */

var session = requireAuth("user");
document.getElementById("welcome").textContent = "Olá, " + session.name;

// Valores POR HORA (cobrança proporcional ao minuto)
var RATES  = { small: 5, large: 7, moto: 3 };
var ICONS  = { small: "🚗", large: "🚙", moto: "🏍️" };
var LABELS = { small: "Carro pequeno", large: "Carro grande", moto: "Moto" };

// Placa: 7 caracteres. Antiga ABC1234 ou Mercosul ABC1D23.
var PLATE_REGEX = /^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$/;

var STATE_KEY = "parknow_lot_" + session.id;
var state = JSON.parse(localStorage.getItem(STATE_KEY));
if (!state) {
  state = { count: 12, spots: [], names: [] };
  for (var i = 0; i < 12; i++) { state.spots.push(null); state.names.push("Vaga " + (i + 1)); }
}

function save() { localStorage.setItem(STATE_KEY, JSON.stringify(state)); }

function flash(text, ok) {
  var msg = document.getElementById("msg");
  msg.className = "auth-msg" + (ok ? " ok" : "");
  msg.textContent = text;
  setTimeout(function () { msg.textContent = ""; }, 3000);
}

// ---- Render do pátio ----
function render() {
  var grid = document.getElementById("spotsGrid");
  grid.innerHTML = "";
  var ocupadas = 0;

  for (var i = 0; i < state.spots.length; i++) {
    var v = state.spots[i];
    var nome = state.names[i] || ("Vaga " + (i + 1));
    var div = document.createElement("div");
    div.className = "spot " + (v ? "occupied " + v.type : "free");

    if (v) {
      ocupadas++;
      div.innerHTML =
        '<span class="spot-num">' + nome + ' ✎</span>' +
        '<span class="vehicle-icon">' + ICONS[v.type] + '</span>' +
        '<span class="plate">' + v.plate + '</span>';
      // clique no nome renomeia, clique no resto abre saída
      (function (idx) {
        div.querySelector(".spot-num").onclick = function (e) { e.stopPropagation(); renameSpot(idx); };
        div.onclick = function () { openExit(idx); };
      })(i);
    } else {
      div.innerHTML =
        '<span class="spot-num">' + nome + ' ✎</span>' +
        '<span class="spot-label">Livre</span>';
      (function (idx) {
        div.querySelector(".spot-num").onclick = function (e) { e.stopPropagation(); renameSpot(idx); };
      })(i);
    }
    grid.appendChild(div);
  }

  document.getElementById("statOcc").textContent   = ocupadas;
  document.getElementById("statFree").textContent  = state.spots.length - ocupadas;
  document.getElementById("statTotal").textContent = state.spots.length;
  document.getElementById("spotCount").value = state.count;
}

// ---- Configurar número de vagas ----
function setCount(n) {
  n = parseInt(n, 10);
  if (!n || n < 1) n = 1;
  if (n > 200) n = 200;

  var removidos = 0;
  for (var i = n; i < state.spots.length; i++) if (state.spots[i]) removidos++;
  if (removidos > 0 && !confirm("Reduzir vagas removerá " + removidos + " veículo(s). Continuar?")) return;

  var novosSpots = [], novosNomes = [];
  for (var j = 0; j < n; j++) {
    novosSpots.push(state.spots[j] || null);
    novosNomes.push(state.names[j] || ("Vaga " + (j + 1)));
  }
  state.count = n;
  state.spots = novosSpots;
  state.names = novosNomes;
  save();
  render();
}

// ---- Estacionar ----
function park() {
  var plate = document.getElementById("plate").value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  var type  = document.getElementById("vType").value;

  if (!plate) return flash("Informe a placa.");
  if (plate.length !== 7 || !PLATE_REGEX.test(plate))
    return flash("Placa inválida. Use 7 caracteres (ex.: ABC1234 ou ABC1D23).");

  for (var i = 0; i < state.spots.length; i++)
    if (state.spots[i] && state.spots[i].plate === plate) return flash("Placa já está no pátio.");

  var idx = -1;
  for (var k = 0; k < state.spots.length; k++) if (state.spots[k] === null) { idx = k; break; }
  if (idx === -1) return flash("Pátio cheio.");

  state.spots[idx] = { plate: plate, type: type, entry: Date.now() };
  save();
  render();
  document.getElementById("plate").value = "";
  flash("Veículo estacionado em " + state.names[idx] + ".", true);
}

// ---- Renomear vaga ----
function renameSpot(i) {
  var atual = state.names[i] || ("Vaga " + (i + 1));
  var nome = prompt("Nome da vaga:", atual);
  if (nome === null) return;
  nome = nome.trim();
  if (!nome) return flash("O nome não pode ficar vazio.");
  state.names[i] = nome.slice(0, 24);
  save();
  render();
}

// ---- Saída + cálculo ----
var saindoIdx = null;
function openExit(idx) {
  var v = state.spots[idx];
  if (!v) return;
  var ms = Date.now() - v.entry;
  var minutos = Math.max(1, Math.ceil(ms / 60000));
  var horas = Math.floor(minutos / 60);
  var min = minutos % 60;
  var duracao = horas > 0 ? (horas + "h " + min + "min") : (min + "min");
  var rate = RATES[v.type];
  var total = (minutos / 60) * rate;

  saindoIdx = idx;
  document.getElementById("exitInfo").innerHTML =
    '<div class="info-row"><span>Vaga</span><strong>' + state.names[idx] + '</strong></div>' +
    '<div class="info-row"><span>Placa</span><strong>' + v.plate + '</strong></div>' +
    '<div class="info-row"><span>Tipo</span><strong>' + LABELS[v.type] + '</strong></div>' +
    '<div class="info-row"><span>Entrada</span><strong>' + new Date(v.entry).toLocaleString("pt-BR") + '</strong></div>' +
    '<div class="info-row"><span>Permanência</span><strong>' + duracao + ' (' + minutos + ' min)</strong></div>' +
    '<div class="info-row"><span>Valor / hora</span><strong>R$ ' + rate.toFixed(2) + '</strong></div>' +
    '<div class="info-row"><span>Total</span><span class="total">R$ ' + total.toFixed(2) + '</span></div>';

  document.getElementById("exitModal").classList.remove("hidden");
}

document.getElementById("cancelExit").onclick = function () {
  document.getElementById("exitModal").classList.add("hidden");
  saindoIdx = null;
};
document.getElementById("confirmExit").onclick = function () {
  if (saindoIdx === null) return;
  state.spots[saindoIdx] = null;
  save();
  document.getElementById("exitModal").classList.add("hidden");
  saindoIdx = null;
  render();
  flash("Saída registrada.", true);
};

// ---- Botões / inputs ----
document.getElementById("applySpots").onclick = function () { setCount(document.getElementById("spotCount").value); };
document.getElementById("parkBtn").onclick = park;

var plateInput = document.getElementById("plate");
plateInput.setAttribute("maxlength", "7");
plateInput.setAttribute("placeholder", "ABC1234");
plateInput.oninput = function () {
  this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
};
plateInput.onkeydown = function (e) { if (e.key === "Enter") park(); };

render();
