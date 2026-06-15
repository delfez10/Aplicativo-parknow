# ParkNow — Sistema de Gestão de Estacionamento

Este é um projeto de aplicação web para gestão e controle de pátio de estacionamento, desenvolvido como **Trabalho Acadêmico**. O sistema oferece uma interface limpa e moderna com tema escuro (*Dark Mode*), dividida em dois grandes módulos: **Área do Cliente (Operador)** e **Painel do Administrador**.

---

## 🚀 Funcionalidades Principais

### 👤 1. Portal do Cliente / Operador (`user.html`)
* **Gestão de Vagas Automatizada:** Visualização em tempo real do pátio do estacionamento com identificação visual do status de cada vaga.
* **Entrada de Veículos:** Registro de entrada simplificado informando a placa do veículo (validação de formato padrão antigo e Mercosul) e a categoria do veículo.
* **Categorias Suportadas e Tarifas:**
  * 🚗 **Carro Pequeno:** R$ 5,00 / hora
  * 🚙 **Carro Grande:** R$ 7,00 / hora
  * 🏍️ **Moto:** R$ 3,00 / hora
* **Saída de Veículos com Cálculo Proporcional:** Ao liberar uma vaga, o sistema calcula automaticamente o tempo de permanência exato em minutos e gera o valor total a ser pago com base na tarifa por hora da categoria.
* **Customização do Pátio:** Permite alterar dinamicamente a quantidade de vagas disponíveis no pátio.

### ⚙️ 2. Painel do Administrador (`admin.html`)
* **Aprovação de Cadastros:** Novos clientes/operadores que se registram entram em uma fila de aprovação pendente. O administrador pode definir o tempo de plano de uso (em dias) ao aprovar.
* **Gestão de Contas:** Listagem completa de usuários com a capacidade de estender planos expirados, bloquear ou desbloquear o acesso de contas ativas e recusar novas solicitações.
* **Métricas em Tempo Real:** Indicadores rápidos no topo do painel mostrando o total de solicitações Pendentes, Contas Ativas e Contas Bloqueadas.

### 🔐 3. Sistema de Autenticação e Persistência (`js/auth.js`)
* Autenticação baseada em papéis (*Role-Based Access Control* - RBAC) que impede clientes de acessarem o painel admin e vice-versa.
* **Persistência Local:** Todo o estado do pátio, registros de usuários, planos de acesso e sessões ativas são persistidos no `localStorage` do navegador, eliminando a necessidade inicial de um banco de dados externo e facilitando a execução imediata do projeto.
* **Credenciais de Administrador Padrão:**
  * **Usuário:** `Viny`
  * **Senha:** `Vinicius.05`

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando tecnologias web nativas para garantir máxima performance, portabilidade e aderência aos conceitos fundamentais de desenvolvimento frontend:

* **HTML5:** Estruturação semântica das páginas de login, painel do cliente e painel administrativo.
* **CSS3 (Custom Properties & Modern Layouts):** Estilização moderna e responsiva utilizando variáveis CSS, sistema de cores sólidas e sóbrias, além de componentes customizados nativamente (sem dependência de frameworks externos como Tailwind ou Bootstrap).
* **JavaScript (ES6 Vanilla):** Lógica de negócios, manipulação dinâmica do DOM, validações de formulários e expressões regulares (Regex), gerenciamento de estados e persistência de dados.

---

## 📂 Estrutura de Arquivos

```text
parknow/
├── index.html        # Tela de login unificada (Cliente e Administrador) e Cadastro
├── user.html         # Painel operacional do pátio de estacionamento (Área do Cliente)
├── admin.html        # Painel de controle de usuários e planos (Área do Administrator)
├── favicon.png       # Ícone da aplicação
├── css/
│   └── styles.css    # Arquivo centralizador de estilos (Tematização Dark e Componentes)
└── js/
    ├── auth.js       # Sistema de login, registro, controle de sessão e validação de rotas
    ├── parking.js    # Lógica operacional do pátio, entrada/saída de veículos e cálculos
    └── admin.js      # Lógica de aprovação, bloqueio e extensão de planos de usuários

```

## 🧑‍🎓 Informações Acadêmicas

Instituição: Unifacvest

Curso: Ciência da Computação

Desenvolvedores:

Alan Delfes
Vinícius Ricardo

Turma: 0103NA / 3º Semestre
