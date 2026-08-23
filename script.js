const state = {
  role: 'participant',
  page: 'home',
  user: { name: 'Marcos Silva', handle: '@marcossilva' },
  teams: [
    { name: 'Núcleo Solar', category: 'Energia limpa', role: 'Fundador', members: 8, color: 'orange' },
    { name: 'AquaLab', category: 'Impacto social', role: 'Product Designer', members: 5, color: 'blue' },
    { name: 'Impulso', category: 'Educação', role: 'Mentor', members: 11, color: 'purple' }
  ],
  projects: [
    { name: 'EcoTrack', author: 'Núcleo Solar', text: 'Monitoramento inteligente do consumo de energia em escolas públicas.', tag: 'Sustentabilidade', likes: 128, progress: 82, color: 'project-green' },
    { name: 'Água para Todos', author: 'AquaLab', text: 'Solução de baixo custo para análise da qualidade da água em comunidades.', tag: 'Impacto social', likes: 94, progress: 64, color: 'project-blue' },
    { name: 'ReAprender', author: 'Marcos Silva', text: 'Plataforma que conecta alunos a trilhas personalizadas de aprendizagem.', tag: 'Educação', likes: 76, progress: 45, color: 'project-purple' }
  ]
};

const participantNav = [
  ['home', '⌂', 'Visão geral'], ['projects', '▱', 'Projetos'], ['teams', '♟', 'Minhas equipes'],
  ['courses', '▤', 'Cursos'], ['competitions', '♜', 'Competições'], ['chat', '◌', 'Mensagens', '3'], ['invest', '↗', 'Investidores']
];
const investorNav = [
  ['investor-home', '⌂', 'Visão geral'], ['discover', '⌕', 'Descobrir projetos'], ['portfolio', '▥', 'Meu portfólio'],
  ['chat', '◌', 'Mensagens', '2'], ['profile', '♙', 'Perfil de investidor']
];

const $ = (selector) => document.querySelector(selector);
const formatMoney = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
let authMode = 'login';

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

function setRole(role) {
  state.role = role;
  document.querySelectorAll('.type-button').forEach(button => button.classList.toggle('active', button.dataset.role === role));
  $('#email').value = role === 'investor' ? 'investidor@envista.com' : 'marcos@envista.com';
}

document.querySelectorAll('.type-button').forEach(button => button.addEventListener('click', () => setRole(button.dataset.role)));
$('#togglePassword').addEventListener('click', () => {
  const field = $('#password');
  field.type = field.type === 'password' ? 'text' : 'password';
});
$('#loginForm').addEventListener('submit', event => { event.preventDefault(); enterApp(); });
$('#googleLogin').addEventListener('click', () => {
  if (authMode === 'register') {
    state.user = { name: 'Novo participante', handle: '@participante' };
  }
  enterApp();
});
$('#openRegister').addEventListener('click', () => {
  authMode = authMode === 'login' ? 'register' : 'login';
  const registering = authMode === 'register';
  $('#authTitle').textContent = registering ? 'Crie sua conta' : 'Entre na sua conta';
  $('#authSubtitle').textContent = registering ? 'Seu próximo projeto começa por aqui.' : 'Continue construindo ideias que transformam.';
  $('.submit-button').innerHTML = registering ? 'Criar conta gratuita <span>→</span>' : 'Entrar na plataforma <span>→</span>';
  $('#registerFields').hidden = !registering;
  $('#registerName').required = registering;
  $('#registerHandle').required = registering;
  $('#authPrompt').textContent = registering ? 'Já possui uma conta?' : 'Ainda não faz parte?';
  $('#openRegister').textContent = registering ? 'Voltar para o login' : 'Crie sua conta gratuitamente';
  if (registering) {
    $('#email').value = '';
    $('#password').value = '';
    $('#registerName').focus();
  } else {
    setRole(state.role);
    $('#password').value = 'envista123';
    $('#email').focus();
  }
});

function enterApp() {
  if (authMode === 'register' && $('#registerName').value.trim()) {
    state.user.name = $('#registerName').value.trim();
    state.user.handle = `@${$('#registerHandle').value.trim().replace(/^@/, '')}`;
  }
  $('#authPage').classList.add('hidden');
  $('#app').classList.remove('hidden');
  state.page = state.role === 'investor' ? 'investor-home' : 'home';
  $('#miniRole').textContent = state.role === 'investor' ? 'Investidor' : 'Participante';
  $('#miniName').textContent = state.user.name;
  $('.user-avatar').textContent = state.user.name.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();
  renderNav();
  renderPage();
}

function renderNav() {
  const items = state.role === 'investor' ? investorNav : participantNav;
  $('#nav').innerHTML = items.map(([page, icon, label, badge]) => `
    <button class="nav-link ${state.page === page ? 'active' : ''}" data-page="${page}">
      <span>${icon}</span>${label}${badge ? `<i>${badge}</i>` : ''}
    </button>`).join('');
  document.querySelectorAll('[data-page]').forEach(button => button.addEventListener('click', event => {
    event.preventDefault();
    state.page = button.dataset.page;
    renderNav(); renderPage(); $('#sidebar').classList.remove('open');
  }));
}

const pageHeader = (kicker, title, subtitle, action = '') => `
  <div class="page-heading"><div><span class="eyebrow">${kicker}</span><h1>${title}</h1><p>${subtitle}</p></div>${action}</div>`;
const stat = (icon, label, value, note, color = 'teal') => `
  <article class="stat-card"><span class="stat-icon ${color}">${icon}</span><div><small>${label}</small><strong>${value}</strong><p>${note}</p></div></article>`;

function renderPage() {
  const renderers = { home: homePage, projects: projectsPage, teams: teamsPage, courses: coursesPage, competitions: competitionsPage, chat: chatPage, invest: investPage, 'investor-home': investorHomePage, discover: discoverPage, portfolio: portfolioPage, profile: profilePage, settings: settingsPage };
  $('#pageContent').innerHTML = (renderers[state.page] || homePage)();
  bindPageActions();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function homePage() {
  const firstName = state.user.name.split(/\s+/)[0];
  return `${pageHeader('DOMINGO, 23 DE AGOSTO', `Olá, ${firstName}! <span class="wave">👋</span>`, 'Acompanhe suas equipes e continue transformando ideias em projetos.')}
    <section class="stats-grid">${stat('♟','Equipes ativas','3','+1 neste mês','purple')}${stat('▱','Projetos publicados',state.projects.length,'+2 neste mês','blue')}${stat('▤','Aulas concluídas','18','72% da trilha','teal')}${stat('♜','Competições','2','1 inscrição aberta','orange')}</section>
    <div class="content-grid">
      <section class="panel span-two"><div class="panel-heading"><div><h2>Continue aprendendo</h2><p>Sua trilha em andamento</p></div><button data-go="courses" class="link-button">Ver curso →</button></div>
        <div class="featured-course"><div class="course-visual"><span>03</span><b>DO ZERO<br>AO MVP</b><i>✦</i></div><div class="featured-info"><span class="tag">MÓDULO 3 DE 6</span><h3>Validação de ideias</h3><p>Aprenda a conversar com usuários e validar o problema antes de construir sua solução.</p><div class="progress-label"><span>Seu progresso</span><b>62%</b></div><div class="progress"><i style="width:62%"></i></div><button class="primary-button lesson-action">Continuar aula <span>→</span></button></div></div>
      </section>
      <section class="panel"><div class="panel-heading"><div><h2>Próxima competição</h2><p>Não perca o prazo</p></div></div><div class="competition-mini"><span class="date-box"><b>12</b><small>SET</small></span><span class="tag tag-orange">INSCRIÇÕES ABERTAS</span><h3>Green Innovation Challenge</h3><p>Projetos para um futuro mais sustentável.</p><div class="mini-row"><span>🏆 R$ 15.000 em prêmios</span><span>19 dias</span></div><button data-go="competitions" class="secondary-button full">Ver competição</button></div></section>
      <section class="panel span-two"><div class="panel-heading"><div><h2>Projetos em destaque</h2><p>O que a comunidade está construindo</p></div><button data-go="projects" class="link-button">Explorar todos →</button></div><div class="project-row">${state.projects.slice(0,3).map(projectCard).join('')}</div></section>
      <section class="panel"><div class="panel-heading"><div><h2>Atividade recente</h2><p>Atualizações da sua rede</p></div></div><div class="activity-list">${activity('AS','Ana comentou no EcoTrack','“A validação ficou incrível!”','12 min')}${activity('PS','Pedro entrou no Núcleo Solar','Agora são 8 membros','2 h')}${activity('🏆','Vocês avançaram de fase','Green Innovation Challenge','Ontem')}</div></section>
    </div>`;
}

function projectCard(project) {
  return `<article class="project-card"><div class="project-cover ${project.color}"><span>${project.tag}</span><b>${project.name.charAt(0)}</b></div><div class="project-body"><small>POR ${project.author.toUpperCase()}</small><h3>${project.name}</h3><p>${project.text}</p><footer><button class="like-button">♡ ${project.likes}</button><button class="link-button project-open">Ver projeto →</button></footer></div></article>`;
}
function activity(initials, title, text, time) { return `<div class="activity"><span>${initials}</span><div><b>${title}</b><p>${text}</p></div><small>${time}</small></div>`; }

function projectsPage() {
  return `${pageHeader('COMUNIDADE', 'Projetos', 'Descubra ideias, compartilhe seu progresso e encontre colaboradores.', '<button class="primary-button modal-project">＋ Publicar projeto</button>')}
    <div class="filter-bar"><label>⌕ <input class="filter-input" placeholder="Buscar projetos..."></label><button class="filter active">Todos</button><button class="filter">Sustentabilidade</button><button class="filter">Educação</button><button class="filter">Tecnologia</button></div>
    <section class="projects-grid">${state.projects.map(projectCard).join('')}</section>`;
}

function teamsPage() {
  return `${pageHeader('COLABORAÇÃO', 'Minhas equipes', 'Uma pessoa pode participar de várias equipes e exercer uma função diferente em cada uma.', '<button class="primary-button modal-team">＋ Criar equipe</button>')}
    <section class="stats-grid compact">${stat('♟','Suas equipes',state.teams.length,'Em 3 áreas diferentes','purple')}${stat('♙','Pessoas na rede','24','Em todas as equipes','teal')}${stat('▱','Projetos em equipe','5','2 publicados','blue')}</section>
    <section class="teams-grid">${state.teams.map((team, index) => `<article class="team-card"><div class="team-banner ${team.color}"><span>${team.name.charAt(0)}</span><button>•••</button></div><div class="team-content"><span class="tag">${team.category}</span><h2>${team.name}</h2><p>Construindo soluções com impacto real por meio de pesquisa, colaboração e tecnologia.</p><div class="team-meta"><div><small>SUA FUNÇÃO</small><b>${team.role}</b></div><div><small>MEMBROS</small><b>${team.members} pessoas</b></div></div><div class="team-people"><span>MS</span><span>AS</span><span>PS</span><i>+${Math.max(team.members - 3, 0)}</i></div><button class="secondary-button full team-open">Abrir dashboard da equipe</button></div></article>`).join('')}</section>`;
}

function coursesPage() {
  const modules = [
    ['01','Da ideia ao problema','4 aulas • 38 min','100%'], ['02','Pesquisa e público','5 aulas • 52 min','100%'], ['03','Validação de ideias','6 aulas • 1h 12min','62%'],
    ['04','Prototipação e MVP','7 aulas • 1h 35min','0%'], ['05','Modelo de negócio','5 aulas • 58 min','0%'], ['06','Pitch e projeto final','6 aulas • 1h 20min','0%']
  ];
  return `${pageHeader('APRENDIZADO', 'Cursos', 'Método prático para tirar sua ideia do papel e construir um projeto completo.')}
    <section class="course-hero"><div><span class="tag tag-light">TRILHA EM ANDAMENTO</span><h1>Do zero ao MVP</h1><p>Aprenda a identificar problemas reais, validar soluções e apresentar um projeto que gera impacto.</p><div class="hero-meta"><span>▤ 33 aulas</span><span>◷ 6h 35min</span><span>♙ Certificado</span></div><button class="light-button lesson-action">Continuar de onde parei →</button></div><div class="course-ring"><b>62%</b><small>CONCLUÍDO</small></div></section>
    <div class="section-title"><div><h2>Conteúdo do curso</h2><p>6 módulos • PDFs, vídeos, atividades e projeto final</p></div></div>
    <section class="module-list">${modules.map(([number,title,meta,progress], index) => `<article class="module ${progress === '0%' ? 'locked' : ''}"><span class="module-number">${number}</span><div><small>MÓDULO ${number}</small><h3>${title}</h3><p>${meta} • Material complementar em PDF</p></div><div class="module-status"><b>${progress === '100%' ? '✓ Concluído' : progress === '0%' ? 'Bloqueado' : progress + ' concluído'}</b><div class="progress"><i style="width:${progress}"></i></div></div><button class="module-open">${index < 3 ? '→' : '⌕'}</button></article>`).join('')}</section>`;
}

function competitionsPage() {
  const events = [
    ['Green Innovation Challenge','Envista','12 SET','R$ 15.000','Projetos que proponham soluções para cidades e escolas mais sustentáveis.','open'],
    ['Olimpíada Brasileira de Tecnologia','Instituto Alpha','28 OUT','Troféus + mentoria','Competição nacional de projetos científicos, inovação e tecnologia.','open'],
    ['Desafio LED — Luz na Educação','Fundação Roberto Marinho','15 NOV','R$ 200.000','Iniciativas inovadoras que transformam a educação brasileira.','soon']
  ];
  return `${pageHeader('DESAFIOS', 'Competições', 'Coloque seu projeto à prova, receba feedback e concorra a oportunidades.')}
    <div class="tabs"><button class="active">Explorar</button><button>Minhas inscrições <span>1</span></button><button>Encerradas</button></div>
    <section class="events-list">${events.map(([name,org,date,prize,desc,status]) => `<article class="event-card"><div class="event-date"><b>${date.split(' ')[0]}</b><small>${date.split(' ')[1]}</small></div><div class="event-info"><span class="tag ${status === 'open' ? '' : 'tag-orange'}">${status === 'open' ? 'INSCRIÇÕES ABERTAS' : 'EM BREVE'}</span><small>REALIZAÇÃO: ${org.toUpperCase()}</small><h2>${name}</h2><p>${desc}</p><div><span>🏆 ${prize}</span><span>♟ Equipes de 2 a 6 pessoas</span></div></div><button class="primary-button event-join">${status === 'open' ? 'Inscrever equipe' : 'Lembrar-me'}</button></article>`).join('')}</section>`;
}

function chatPage() {
  return `${pageHeader('CONEXÕES', 'Mensagens', 'Converse com pessoas e equipes da comunidade Envista.')}
    <section class="chat-shell"><aside class="conversations"><label>⌕ <input placeholder="Buscar conversa"></label>${[['AS','Ana Souza','Enviei o novo protótipo','2 min','2'],['NS','Núcleo Solar','Pedro: reunião às 16h','32 min','1'],['RC','Rafael Costa','Adorei o projeto!','Ontem',''],['AL','Equipe AquaLab','Julia: documento atualizado','Ontem','']].map((c,i)=>`<button class="conversation ${i===0?'active':''}"><span>${c[0]}</span><div><b>${c[1]}</b><p>${c[2]}</p></div><small>${c[3]}${c[4]?`<i>${c[4]}</i>`:''}</small></button>`).join('')}</aside>
      <div class="chat-window"><header><span>AS</span><div><b>Ana Souza</b><small><i></i> Online agora</small></div><button>•••</button></header><div class="messages"><small>HOJE, 14:20</small><div class="bubble received">Oi, Marcos! Terminei a nova versão do protótipo do EcoTrack.</div><div class="bubble received attachment">▱ <span><b>ecotrack-prototipo.pdf</b><small>PDF • 4,2 MB</small></span><button>↓</button></div><div class="bubble sent">Ficou incrível! Vou adicionar ao README do projeto e compartilhar com a equipe.</div><div class="bubble received">Perfeito! Depois podemos revisar o pitch juntos 😊</div></div><form class="message-form"><button type="button">＋</button><input placeholder="Escreva uma mensagem..."><button type="submit">➤</button></form></div>
      <aside class="chat-details"><div class="large-avatar">AS</div><h3>Ana Souza</h3><p>@anasouza • Product Designer</p><button class="secondary-button full">Ver perfil</button><hr><h4>Arquivos compartilhados</h4><div class="shared-file">PDF <span><b>ecotrack-prototipo.pdf</b><small>4,2 MB</small></span></div><div class="privacy-note">⌾ <span><b>Privacidade e segurança</b><small>Mensagens protegidas. Adequação à LGPD em estudo.</small></span></div></aside></section>`;
}

function investPage() { return discoverPage(); }
function discoverPage() {
  return `${pageHeader('OPORTUNIDADES', 'Projetos para investir', 'Conheça projetos validados e conecte-se diretamente com as equipes.')}
    <div class="filter-bar"><label>⌕ <input class="filter-input" placeholder="Buscar por projeto ou área..."></label><button class="filter active">Todos</button><button class="filter">Em captação</button><button class="filter">Sustentabilidade</button><button class="filter">Educação</button></div>
    <section class="investment-grid">${state.projects.map((project,index)=>`<article class="investment-card"><div class="project-cover ${project.color}"><span>EM CAPTAÇÃO</span><b>${project.name.charAt(0)}</b></div><div class="investment-body"><small>${project.tag.toUpperCase()}</small><h2>${project.name}</h2><p>${project.text}</p><div class="founders"><span>${project.author.charAt(0)}</span><div><small>CRIADO POR</small><b>${project.author}</b></div></div><div class="funding"><div><span>Captado</span><b>${formatMoney([32000,18500,12000][index])}</b></div><div><span>Meta</span><b>${formatMoney([50000,40000,30000][index])}</b></div></div><div class="progress"><i style="width:${project.progress}%"></i></div><footer><span><b>${project.progress}%</b> da meta</span><button class="primary-button invest-action">Conhecer projeto →</button></footer></div></article>`).join('')}</section>`;
}

function investorHomePage() {
  return `${pageHeader('PAINEL DO INVESTIDOR', 'Boas-vindas, Marcos', 'Encontre projetos promissores e acompanhe seu impacto.')}
    <section class="stats-grid">${stat('◇','Capital investido','R$ 42 mil','Em 3 projetos','teal')}${stat('▱','Projetos acompanhados','12','4 novas atualizações','blue')}${stat('↗','Projetos no portfólio','3','2 em crescimento','purple')}${stat('◌','Conexões','18','3 novas mensagens','orange')}</section>
    <section class="investor-banner"><div><span class="eyebrow">CURADORIA ENVISTA</span><h2>Ideias validadas.<br>Impacto que você pode acelerar.</h2><p>Projetos formados por nossa metodologia e acompanhados de perto por mentores.</p><button data-go="discover" class="light-button">Explorar oportunidades →</button></div><div class="impact-number"><b>+120</b><span>projetos em desenvolvimento</span></div></section>
    <div class="section-title"><div><h2>Oportunidades em destaque</h2><p>Projetos selecionados pela curadoria Envista</p></div><button data-go="discover" class="link-button">Ver todos →</button></div><section class="project-row">${state.projects.map(projectCard).join('')}</section>`;
}

function portfolioPage() {
  return `${pageHeader('INVESTIMENTOS', 'Meu portfólio', 'Acompanhe os projetos em que você acredita e o impacto gerado.')}
    <section class="portfolio-summary"><div><span>VALOR TOTAL INVESTIDO</span><b>R$ 42.000</b><small>↗ 12,4% de valorização estimada</small></div><div><span>IMPACTO</span><b>3.280</b><small>Pessoas alcançadas pelos projetos</small></div><div><span>PRÓXIMA ATUALIZAÇÃO</span><b>28 ago</b><small>Relatório trimestral do EcoTrack</small></div></section>
    <section class="panel portfolio-table"><div class="panel-heading"><div><h2>Projetos investidos</h2><p>3 investimentos ativos</p></div></div>${state.projects.map((p,i)=>`<div class="portfolio-row"><span class="portfolio-logo ${p.color}">${p.name.charAt(0)}</span><div><b>${p.name}</b><small>${p.author}</small></div><div><small>INVESTIDO</small><b>${formatMoney([20000,14000,8000][i])}</b></div><div><small>STATUS</small><b class="status-good">● Em evolução</b></div><button class="secondary-button">Ver relatório</button></div>`).join('')}</section>`;
}

function profilePage() { return settingsPage('Perfil de investidor', 'Defina suas teses e preferências de investimento.'); }
function settingsPage(title = 'Configurações', subtitle = 'Gerencie seu perfil e preferências da plataforma.') {
  return `${pageHeader('SUA CONTA', title, subtitle)}<section class="settings-layout"><aside><button class="active">Perfil pessoal</button><button>Notificações</button><button>Privacidade e dados</button><button>Segurança</button></aside><form class="settings-card"><div class="profile-edit"><div class="large-avatar">MS</div><div><h3>Foto de perfil</h3><p>JPG ou PNG. Máximo de 5 MB.</p><button type="button" class="secondary-button">Alterar foto</button></div></div><div class="form-grid"><label>Nome completo<input value="Marcos Silva"></label><label>Identificador único<input value="@marcossilva"></label><label>E-mail<input type="email" value="marcos@envista.com"></label><label>Cidade<input value="Rio de Janeiro, RJ"></label><label class="wide">Sobre você<textarea>Entusiasta de inovação, educação e projetos que geram impacto.</textarea></label></div><button type="button" class="primary-button save-settings">Salvar alterações</button></form></section>`;
}

function bindPageActions() {
  document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => { state.page = button.dataset.go; renderNav(); renderPage(); }));
  document.querySelectorAll('.like-button').forEach(button => button.addEventListener('click', () => { button.classList.toggle('liked'); showToast(button.classList.contains('liked') ? 'Projeto salvo nos seus favoritos ♥' : 'Projeto removido dos favoritos'); }));
  document.querySelectorAll('.lesson-action,.module-open').forEach(button => button.addEventListener('click', () => showToast('Aula aberta! Seu progresso foi salvo.')));
  document.querySelectorAll('.event-join').forEach(button => button.addEventListener('click', () => { button.textContent = '✓ Inscrição registrada'; button.disabled = true; showToast('Equipe inscrita com sucesso!'); }));
  document.querySelectorAll('.invest-action,.project-open,.team-open').forEach(button => button.addEventListener('click', () => showToast('Detalhes abertos — esta área está pronta para receber o backend.')));
  const messageForm = $('.message-form'); if (messageForm) messageForm.addEventListener('submit', event => { event.preventDefault(); const input = messageForm.querySelector('input'); if (!input.value.trim()) return; $('.messages').insertAdjacentHTML('beforeend', `<div class="bubble sent">${input.value.replace(/[<>]/g, '')}</div>`); input.value = ''; });
  const filterInput = $('.filter-input'); if (filterInput) filterInput.addEventListener('input', event => { document.querySelectorAll('.project-card,.investment-card').forEach(card => card.hidden = !card.textContent.toLowerCase().includes(event.target.value.toLowerCase())); });
  $('.modal-project')?.addEventListener('click', () => openDialog('project'));
  $('.modal-team')?.addEventListener('click', () => openDialog('team'));
  $('.save-settings')?.addEventListener('click', () => showToast('Alterações salvas com sucesso!'));
}

function openDialog(type) {
  const project = type === 'project';
  $('#dialogTitle').textContent = project ? 'Publicar novo projeto' : 'Criar uma equipe';
  $('#dialogFields').innerHTML = `<label>${project ? 'Nome do projeto' : 'Nome da equipe'}<input id="newName" required placeholder="Digite um nome"></label><label>${project ? 'Descrição' : 'Propósito da equipe'}<textarea id="newDescription" required placeholder="Conte um pouco sobre ${project ? 'a ideia' : 'a equipe'}"></textarea></label><label>Área<select id="newCategory"><option>Sustentabilidade</option><option>Educação</option><option>Tecnologia</option><option>Impacto social</option></select></label>`;
  $('#mainDialog').dataset.type = type;
  $('#mainDialog').showModal();
}

$('#dialogSubmit').addEventListener('click', event => {
  event.preventDefault(); const name = $('#newName')?.value.trim(); if (!name) { showToast('Informe um nome para continuar.'); return; }
  if ($('#mainDialog').dataset.type === 'project') state.projects.unshift({ name, author: 'Marcos Silva', text: $('#newDescription').value || 'Novo projeto da comunidade Envista.', tag: $('#newCategory').value, likes: 0, progress: 10, color: 'project-green' });
  else state.teams.push({ name, category: $('#newCategory').value, role: 'Fundador', members: 1, color: 'blue' });
  $('#mainDialog').close(); showToast('Criado com sucesso!'); renderPage();
});

$('#quickAction').addEventListener('click', () => openDialog('project'));
$('#openMenu').addEventListener('click', () => $('#sidebar').classList.add('open'));
$('#closeMenu').addEventListener('click', () => $('#sidebar').classList.remove('open'));
$('#logout').addEventListener('click', () => { $('#app').classList.add('hidden'); $('#authPage').classList.remove('hidden'); });
