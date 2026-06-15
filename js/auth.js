/* ====== ParkNow — Login simples ======
   Guarda usuários e sessão no localStorage do navegador. */

// Chaves usadas no localStorage
var USERS_KEY = "parknow_users";
var SESSION_KEY = "parknow_session";

// ---- Cria o administrador padrão (Viny / Vinicius.05) ----
var users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
// remove qualquer admin antigo e adiciona o novo
users = users.filter(function (u) { return u.role !== "admin"; });
users.unshift({
  id: "admin1",
  name: "Viny",
  username: "Viny",
  password: "Vinicius.05",
  role: "admin",
  status: "active",
  blocked: false,
  planStart: null,
  planEnd: null,
  createdAt: new Date().toISOString()
});
localStorage.setItem(USERS_KEY, JSON.stringify(users));

// ---- Funções utilitárias ----
function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}
function saveUsers(list) {
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
}
function getSession() {
  return JSON.parse(localStorage.getItem(SESSION_KEY));
}
function setSession(s) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}
function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "index.html";
}

// Cadastro (vai como pendente)
function registerUser(name, username, password) {
  var list = getUsers();
  for (var i = 0; i < list.length; i++) {
    if (list[i].username.toLowerCase() === username.toLowerCase()) {
      throw new Error("Usuário já existe.");
    }
  }
  list.push({
    id: "u" + Date.now(),
    name: name,
    username: username,
    password: password,
    role: "user",
    status: "pending",
    blocked: false,
    planStart: null,
    planEnd: null,
    createdAt: new Date().toISOString()
  });
  saveUsers(list);
}

// Login
function loginUser(username, password, expectedRole) {
  var list = getUsers();
  var user = null;
  for (var i = 0; i < list.length; i++) {
    if (list[i].username.toLowerCase() === username.toLowerCase() &&
        list[i].password === password) {
      user = list[i];
      break;
    }
  }
  if (!user) throw new Error("Usuário ou senha inválidos.");
  if (user.role !== expectedRole) {
    throw new Error(expectedRole === "admin"
      ? "Esta conta não é administradora."
      : "Use a aba de administrador.");
  }
  if (user.role === "user") {
    if (user.status === "pending")  throw new Error("Cadastro aguardando aprovação.");
    if (user.status === "rejected") throw new Error("Cadastro recusado.");
    if (user.blocked)               throw new Error("Conta bloqueada.");
    if (user.planEnd && new Date(user.planEnd) < new Date())
      throw new Error("Plano expirado.");
  }
  setSession({ id: user.id, name: user.name, username: user.username, role: user.role });
}

// Protege páginas internas
function requireAuth(role) {
  var s = getSession();
  if (!s) { window.location.href = "index.html"; return null; }
  if (s.role !== role) {
    window.location.href = s.role === "admin" ? "admin.html" : "user.html";
    return null;
  }
  return s;
}

// ====== Tela de login (index.html) ======
var clientPanel = document.getElementById("clientPanel");
if (clientPanel) {
  // já logado? redireciona
  var s = getSession();
  if (s) {
    window.location.href = s.role === "admin" ? "admin.html" : "user.html";
  }

  var adminPanel = document.getElementById("adminPanel");
  var authMsg = document.getElementById("authMsg");
  var adminMsg = document.getElementById("adminAuthMsg");

  // Alterna Cliente / Administrador
  var modeBtns = document.querySelectorAll(".mode-btn");
  for (var i = 0; i < modeBtns.length; i++) {
    modeBtns[i].onclick = function () {
      for (var j = 0; j < modeBtns.length; j++) modeBtns[j].classList.remove("active");
      this.classList.add("active");
      var mode = this.dataset.mode;
      clientPanel.classList.toggle("active", mode === "client");
      adminPanel.classList.toggle("active", mode === "admin");
    };
  }

  // Alterna Entrar / Cadastrar
  var tabs = document.querySelectorAll(".tab");
  for (var k = 0; k < tabs.length; k++) {
    tabs[k].onclick = function () {
      for (var j = 0; j < tabs.length; j++) tabs[j].classList.remove("active");
      this.classList.add("active");
      document.getElementById("loginForm").classList.remove("active");
      document.getElementById("registerForm").classList.remove("active");
      document.getElementById(this.dataset.tab + "Form").classList.add("active");
      authMsg.textContent = "";
    };
  }

  // Login do cliente
  document.getElementById("loginForm").onsubmit = function (e) {
    e.preventDefault();
    authMsg.className = "auth-msg";
    try {
      loginUser(
        document.getElementById("loginUser").value.trim(),
        document.getElementById("loginPass").value,
        "user"
      );
      window.location.href = "user.html";
    } catch (err) {
      authMsg.textContent = err.message;
    }
  };

  // Cadastro
  document.getElementById("registerForm").onsubmit = function (e) {
    e.preventDefault();
    authMsg.className = "auth-msg";
    try {
      registerUser(
        document.getElementById("regName").value.trim(),
        document.getElementById("regUser").value.trim(),
        document.getElementById("regPass").value
      );
      authMsg.className = "auth-msg ok";
      authMsg.textContent = "Solicitação enviada! Aguarde aprovação do administrador.";
      this.reset();
    } catch (err) {
      authMsg.textContent = err.message;
    }
  };

  // Login do administrador
  document.getElementById("adminLoginForm").onsubmit = function (e) {
    e.preventDefault();
    adminMsg.className = "auth-msg";
    try {
      loginUser(
        document.getElementById("adminUser").value.trim(),
        document.getElementById("adminPass").value,
        "admin"
      );
      window.location.href = "admin.html";
    } catch (err) {
      adminMsg.textContent = err.message;
    }
  };
}

// Botão sair (em qualquer página)
var logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) logoutBtn.onclick = logout;
