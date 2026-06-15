/* ====== ParkNow — Painel do Administrador (simples) ====== */

requireAuth("admin");

var pendingBody = document.getElementById("pendingBody");
var clientsBody = document.getElementById("clientsBody");

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

function planInfo(u) {
  if (!u.planEnd) return "Sem plano";
  var end = new Date(u.planEnd);
  if (end < new Date()) return "Expirado";
  var dias = Math.ceil((end - new Date()) / 86400000);
  return dias + " dia(s) restante(s)";
}

function render() {
  var list = getUsers();
  var clients = list.filter(function (u) { return u.role === "user"; });
  var pending = clients.filter(function (u) { return u.status === "pending"; });
  var others  = clients.filter(function (u) { return u.status !== "pending"; });

  document.getElementById("statPending").textContent = pending.length;
  document.getElementById("statActive").textContent  =
    clients.filter(function (u) { return u.status === "active" && !u.blocked; }).length;
  document.getElementById("statBlocked").textContent =
    clients.filter(function (u) { return u.blocked; }).length;

  // ----- Pendentes -----
  if (pending.length === 0) {
    pendingBody.innerHTML =
      '<tr><td colspan="5" class="muted small" style="text-align:center;padding:1.2rem">Nenhuma solicitação pendente.</td></tr>';
  } else {
    var html1 = "";
    for (var i = 0; i < pending.length; i++) {
      var u = pending[i];
      html1 +=
        "<tr>" +
          "<td>" + u.name + "</td>" +
          "<td>" + u.username + "</td>" +
          "<td>" + fmtDate(u.createdAt) + "</td>" +
          '<td><input type="number" min="1" max="365" value="30" id="d_' + u.id + '" /></td>' +
          '<td>' +
            '<button class="btn primary sm" onclick="approve(\'' + u.id + '\')">Aprovar</button> ' +
            '<button class="btn danger sm" onclick="reject(\'' + u.id + '\')">Recusar</button>' +
          '</td>' +
        "</tr>";
    }
    pendingBody.innerHTML = html1;
  }

  // ----- Clientes -----
  if (others.length === 0) {
    clientsBody.innerHTML =
      '<tr><td colspan="5" class="muted small" style="text-align:center;padding:1.2rem">Nenhum cliente cadastrado.</td></tr>';
  } else {
    var html2 = "";
    for (var j = 0; j < others.length; j++) {
      var c = others[j];
      var badge;
      if (c.blocked) badge = '<span class="badge danger">Bloqueado</span>';
      else if (c.status === "rejected") badge = '<span class="badge">Recusado</span>';
      else if (c.planEnd && new Date(c.planEnd) < new Date()) badge = '<span class="badge danger">Expirado</span>';
      else badge = '<span class="badge ok">Ativo</span>';

      var botaoBloqueio = c.blocked
        ? '<button class="btn primary sm" onclick="setBlock(\'' + c.id + '\', false)">Desbloquear</button>'
        : '<button class="btn danger sm" onclick="setBlock(\'' + c.id + '\', true)">Bloquear</button>';

      html2 +=
        "<tr>" +
          "<td>" + c.name + "</td>" +
          "<td>" + c.username + "</td>" +
          "<td>" + badge + "</td>" +
          "<td>" +
            '<div class="small">' + fmtDate(c.planStart) + " → " + fmtDate(c.planEnd) + "</div>" +
            '<div class="muted small">' + planInfo(c) + "</div>" +
          "</td>" +
          "<td>" +
            '<input type="number" min="1" max="365" value="30" id="d_' + c.id + '" /> ' +
            '<button class="btn ghost sm" onclick="extend(\'' + c.id + '\')">+ Plano</button> ' +
            botaoBloqueio + " " +
            '<button class="btn danger sm" onclick="removeUser(\'' + c.id + '\')">Excluir</button>' +
          "</td>" +
        "</tr>";
    }
    clientsBody.innerHTML = html2;
  }
}

function getDays(id) {
  var el = document.getElementById("d_" + id);
  var v = parseInt(el && el.value, 10);
  return v > 0 ? v : 30;
}

// ----- Ações (chamadas direto pelo HTML com onclick) -----
function approve(id) {
  var dias = getDays(id);
  var list = getUsers();
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      var fim = new Date();
      fim.setDate(fim.getDate() + dias);
      list[i].status = "active";
      list[i].blocked = false;
      list[i].planStart = new Date().toISOString();
      list[i].planEnd = fim.toISOString();
    }
  }
  saveUsers(list);
  render();
}

function reject(id) {
  if (!confirm("Recusar este cadastro?")) return;
  var list = getUsers();
  for (var i = 0; i < list.length; i++) if (list[i].id === id) list[i].status = "rejected";
  saveUsers(list);
  render();
}

function setBlock(id, blocked) {
  var list = getUsers();
  for (var i = 0; i < list.length; i++) if (list[i].id === id) list[i].blocked = blocked;
  saveUsers(list);
  render();
}

function extend(id) {
  var dias = getDays(id);
  var list = getUsers();
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      var base = list[i].planEnd && new Date(list[i].planEnd) > new Date()
        ? new Date(list[i].planEnd) : new Date();
      base.setDate(base.getDate() + dias);
      list[i].planEnd = base.toISOString();
    }
  }
  saveUsers(list);
  render();
}

function removeUser(id) {
  if (!confirm("Excluir esta conta?")) return;
  var list = getUsers().filter(function (u) { return u.id !== id; });
  saveUsers(list);
  render();
}

render();
