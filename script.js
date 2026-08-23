const persisted = envistaService.getState();
const state = {
  role: persisted.session?.role || 'participant',
  page: 'home',
  user: persisted.user || persisted.participant,
  teams: persisted.teams,
  projects: persisted.projects
};

const participantNav = [
  ['home', '⌂', 'Início'], ['explore', '⌕', 'Explorar'], ['projects', '▱', 'Projetos'], ['teams', '♟', 'Equipes'],
  ['competitions', '♜', 'Competições'], ['courses', '▤', 'Aprender'], ['chat', '◌', 'Mensagens', '3'], ['profile', '♙', 'Perfil']
];
const investorNav = [
  ['investor-home', '⌕', 'Descobrir'], ['saved', '▱', 'Projetos salvos'], ['portfolio', '▥', 'Acompanhando'],
  ['chat', '◌', 'Mensagens', '2'], ['profile', '♙', 'Perfil']
];

const $ = (selector) => document.querySelector(selector);
const formatMoney = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
let authMode = 'login';

document.querySelectorAll('.landing-login').forEach(button => button.addEventListener('click', () => showPublic('login')));
document.querySelectorAll('[data-public]').forEach(button => button.addEventListener('click', () => showPublic(button.dataset.public)));
document.querySelectorAll('[data-demo]').forEach(button => button.addEventListener('click', () => {
  setRole(button.dataset.demo);
  state.user = envistaService.loginAs(button.dataset.demo);
  enterApp();
}));

function showPublic(page) {
  $('#landingPage').classList.add('hidden'); $('#authPage').classList.add('hidden'); $('#publicPage').classList.add('hidden');
  if (page === 'login') { $('#authPage').classList.remove('hidden'); history.replaceState({}, '', '#/login'); return; }
  const schools = page === 'schools';
  const items = schools ? [['Aulas','Material didático próprio e aprendizagem prática.'],['Equipes','Formação de times com funções e objetivos claros.'],['Competições','Preparação para desafios internos e externos.'],['Continuidade','Portfólio e evolução registrados na plataforma.']] : [['De onde viemos','Robótica, viagens, apresentações e desafios técnicos.'],['O problema','Ideias promissoras perdiam estrutura depois da etapa final.'],['O que construímos','Um ecossistema para aprender, executar e encontrar apoio.'],['Nossa visão','Educação, equipes, projetos e oportunidades conectados.']];
  $('#publicPage').innerHTML = `<header class="landing-nav"><a class="logo logo-light" href="#"><span class="logo-symbol"><i></i></span><strong>envista</strong></a><button class="landing-login">Entrar</button></header><main class="public-content"><span class="eyebrow">${schools ? 'ENVISTA PARA ESCOLAS' : 'NOSSA HISTÓRIA'}</span><h1>${schools ? 'Transforme ideias dos seus alunos em projetos reais.' : 'Boas ideias precisam de um próximo passo.'}</h1><p>${schools ? 'Metodologia, aulas, equipes e preparação para competições em uma jornada que mantém os projetos vivos.' : 'Nascemos dentro de uma equipe de robótica do SESI SENAI, depois de ver projetos excelentes desaparecerem ao fim de cada competição.'}</p><section class="public-grid">${items.map(([title,text]) => `<article><h2>${title}</h2><p>${text}</p></article>`).join('')}</section>${schools ? '<button class="primary-button school-contact">Quero levar o Envista para minha escola</button>' : ''}</main>`;
  $('#publicPage').classList.remove('hidden'); history.replaceState({}, '', `#/${page}`);
  $('#publicPage').querySelector('.landing-login').addEventListener('click', () => showPublic('login'));
  $('.school-contact')?.addEventListener('click', () => { openGeneric('Leve o Envista para sua escola', '<label>Nome da escola<input id="schoolName" placeholder="Instituição"></label><label>Seu contato<input type="email" placeholder="voce@escola.com.br"></label><button class="primary-button overlay-action">Enviar interesse</button>'); $('.overlay-action').onclick = () => { $('#overlayDialog').close(); showToast('Recebemos seu interesse. Vamos construir juntos!'); }; });
}

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
  if (!persisted.session && authMode === 'login') state.user = envistaService.loginAs(state.role);
  envistaService.updateUser(state.user);
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
  $('#mobileNav').innerHTML = items.slice(0, 5).map(([page, icon, label]) => `<button class="${state.page === page ? 'active' : ''}" data-mobile-page="${page}"><span>${icon}</span>${label}</button>`).join('');
  document.querySelectorAll('[data-mobile-page]').forEach(button => button.addEventListener('click', () => { state.page = button.dataset.mobilePage; renderNav(); renderPage(); }));
}

const pageHeader = (kicker, title, subtitle, action = '') => `
  <div class="page-heading"><div><span class="eyebrow">${kicker}</span><h1>${title}</h1><p>${subtitle}</p></div>${action}</div>`;
const stat = (icon, label, value, note, color = 'teal') => `
  <article class="stat-card"><span class="stat-icon ${color}">${icon}</span><div><small>${label}</small><strong>${value}</strong><p>${note}</p></div></article>`;

function renderPage() {
  const renderers = { home: homePage, explore: explorePage, projects: projectsPage, teams: teamsPage, courses: coursesPage, competitions: competitionsPage, chat: chatPage, invest: investPage, 'investor-home': investorHomePage, discover: discoverPage, saved: savedPage, portfolio: portfolioPage, profile: profilePage, settings: settingsPage, 'project-detail': projectDetailPage };
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
  return `<article class="project-card"><div class="project-cover ${project.color}"><span>${project.stage || project.tag}</span><b>${project.name.charAt(0)}</b></div><div class="project-body"><small>POR ${project.author.toUpperCase()}</small><h3>${project.name}</h3><p>${project.text}</p><div class="project-tags">${(project.tags || [project.tag]).slice(0,2).map(tag => `<span>${tag}</span>`).join('')}</div><footer><button class="save-project ${project.saved ? 'saved' : ''}" data-id="${project.id}">${project.saved ? '✓ Salvo' : '＋ Salvar'}</button><button class="link-button project-open" data-id="${project.id}">Ver projeto →</button></footer></div></article>`;
}
function activity(initials, title, text, time) { return `<div class="activity"><span>${initials}</span><div><b>${title}</b><p>${text}</p></div><small>${time}</small></div>`; }

function projectsPage() {
  return `${pageHeader('SEU PORTFÓLIO', 'Projetos', 'Registre o processo, compartilhe materiais e mantenha suas ideias evoluindo.', '<button class="primary-button modal-project">＋ Novo projeto</button>')}
    <div class="tabs"><button class="active">Meus projetos</button><button>Projetos das equipes</button><button>Salvos</button></div><div class="filter-bar"><label>⌕ <input class="filter-input" placeholder="Buscar projetos..."></label><button class="filter active">Todos</button><button class="filter">Sustentabilidade</button><button class="filter">Educação</button><button class="filter">Tecnologia</button></div>
    <section class="projects-grid">${state.projects.map(projectCard).join('')}</section>`;
}

function explorePage() { return `${pageHeader('EXPLORAR', 'Descubra o que está sendo construído.', 'Projetos, equipes e pessoas trabalhando em problemas reais.')}<div class="filter-bar"><label>⌕ <input class="filter-input" placeholder="Buscar projetos, pessoas ou equipes..."></label><button class="filter active">Todos</button><button class="filter">Protótipo</button><button class="filter">MVP</button><button class="filter">Rio de Janeiro</button></div><div class="section-title"><div><h2>Projetos em destaque</h2><p>Selecionados pela curadoria Envista</p></div></div><section class="projects-grid">${state.projects.map(projectCard).join('')}</section><div class="section-title"><div><h2>Equipes que estão construindo</h2><p>Conheça diferentes competências</p></div></div><section class="team-strip">${state.teams.map(team => `<article><span>${team.name[0]}</span><div><h3>${team.name}</h3><p>${team.category} · ${team.members} integrantes</p></div><button class="secondary-button follow-team">Seguir</button></article>`).join('')}</section>`; }

function savedPage() { const saved = state.projects.filter(project => project.saved); return `${pageHeader('CURADORIA PESSOAL', 'Projetos salvos', 'Organize oportunidades e registre observações privadas.')}<section class="projects-grid">${saved.map(projectCard).join('') || '<div class="empty-state"><h2>Nenhum projeto salvo</h2><p>Salve projetos para analisá-los com calma.</p></div>'}</section>`; }

function projectDetailPage() {
  const project = state.activeProject || state.projects[0];
  return `<button class="back-button" data-go="${state.role === 'investor' ? 'investor-home' : 'projects'}">← Voltar</button><section class="project-detail-hero"><div class="project-mark ${project.color}">${project.name[0]}</div><div><span class="tag">${project.stage}</span><h1>${project.name}</h1><p>${project.text}</p><div class="project-tags">${project.tags.map(tag => `<span>${tag}</span>`).join('')}</div></div><div class="detail-actions"><button class="secondary-button save-project" data-id="${project.id}">${project.saved ? '✓ Projeto salvo' : '＋ Salvar projeto'}</button><button class="primary-button ${state.role === 'investor' ? 'interest-action' : 'share-action'}">${state.role === 'investor' ? 'Tenho interesse' : 'Compartilhar'}</button></div></section><div class="detail-layout"><article class="project-readme"><nav><button class="active">Visão geral</button><button>README</button><button>Arquivos</button><button>Atualizações</button><button>Equipe</button></nav><h2>O problema</h2><p>${project.problem}</p><h2>A solução</h2><p>${project.solution}</p><h2>Como estamos desenvolvendo</h2><p>O time combina pesquisa com usuários, prototipação rápida e testes em ambiente escolar. Cada decisão e aprendizado fica registrado para que o projeto continue evoluindo.</p><div class="readme-callout"><b>Próximo objetivo</b><p>Concluir o piloto com duas escolas e publicar os resultados da validação.</p></div></article><aside class="project-facts"><h3>Sobre o projeto</h3><dl><dt>Autoria</dt><dd>${project.author}</dd><dt>Estágio</dt><dd>${project.stage}</dd><dt>Localização</dt><dd>Rio de Janeiro, RJ</dd><dt>Última atualização</dt><dd>${project.updated}</dd></dl><h3>Materiais</h3><button class="file-row">PDF <span>Apresentação do projeto<small>2,4 MB</small></span></button><button class="file-row">DOC <span>Relatório de validação<small>860 KB</small></span></button></aside></div>`;
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
    ['Envista Challenge 2026','Envista','12 SET','R$ 10.000','Tecnologia, educação, sustentabilidade e impacto social.','open','envista'],
    ['Olimpíada Brasileira de Tecnologia','Organização externa','—','Consulte o site oficial','Oportunidade nacional de projetos científicos, inovação e tecnologia.','open','external'],
    ['Desafio Jovens Inovadores','Envista','15 NOV','Mentoria + premiação','Soluções construídas por estudantes para desafios de suas comunidades.','soon','envista']
  ];
  return `${pageHeader('DESAFIOS', 'Competições', 'Coloque seu projeto à prova, receba feedback e concorra a oportunidades.')}
    <div class="tabs"><button class="active">Explorar</button><button>Minhas inscrições <span>1</span></button><button>Encerradas</button></div>
    <section class="events-list">${events.map(([name,org,date,prize,desc,status,type]) => `<article class="event-card"><div class="event-date"><b>${date.split(' ')[0]}</b><small>${date.split(' ')[1] || ''}</small></div><div class="event-info"><span class="tag ${status === 'open' ? '' : 'tag-orange'}">${type === 'external' ? 'COMPETIÇÃO EXTERNA' : status === 'open' ? 'INSCRIÇÕES ABERTAS' : 'EM BREVE'}</span><small>REALIZAÇÃO: ${org.toUpperCase()}</small><h2>${name}</h2><p>${desc}</p><div><span>Premiação: ${prize}</span><span>Equipes de 2 a 6 pessoas</span></div></div><button class="primary-button ${type === 'external' ? 'external-event' : 'event-join'}">${type === 'external' ? 'Ver site oficial' : status === 'open' ? 'Inscrever projeto' : 'Lembrar-me'}</button></article>`).join('')}</section>`;
}

function chatPage() {
  return `${pageHeader('CONEXÕES', 'Mensagens', 'Converse com pessoas e equipes da comunidade Envista.')}
    <section class="chat-shell"><aside class="conversations"><label>⌕ <input placeholder="Buscar conversa"></label>${[['AS','Ana Souza','Enviei o novo protótipo','2 min','2'],['NS','Núcleo Solar','Pedro: reunião às 16h','32 min','1'],['RC','Rafael Costa','Adorei o projeto!','Ontem',''],['AL','Equipe AquaLab','Julia: documento atualizado','Ontem','']].map((c,i)=>`<button class="conversation ${i===0?'active':''}"><span>${c[0]}</span><div><b>${c[1]}</b><p>${c[2]}</p></div><small>${c[3]}${c[4]?`<i>${c[4]}</i>`:''}</small></button>`).join('')}</aside>
      <div class="chat-window"><header><span>AS</span><div><b>Ana Souza</b><small><i></i> Online agora</small></div><button>•••</button></header><div class="messages"><small>HOJE, 14:20</small><div class="bubble received">Oi, Marcos! Terminei a nova versão do protótipo do EcoTrack.</div><div class="bubble received attachment">▱ <span><b>ecotrack-prototipo.pdf</b><small>PDF • 4,2 MB</small></span><button>↓</button></div><div class="bubble sent">Ficou incrível! Vou adicionar ao README do projeto e compartilhar com a equipe.</div><div class="bubble received">Perfeito! Depois podemos revisar o pitch juntos 😊</div></div><form class="message-form"><button type="button">＋</button><input placeholder="Escreva uma mensagem..."><button type="submit">➤</button></form></div>
      <aside class="chat-details"><div class="large-avatar">AS</div><h3>Ana Souza</h3><p>@anasouza • Product Designer</p><button class="secondary-button full">Ver perfil</button><hr><h4>Arquivos compartilhados</h4><div class="shared-file">PDF <span><b>aqua-prototipo.pdf</b><small>4,2 MB</small></span></div><div class="privacy-note">ⓘ <span><b>MVP demonstrativo</b><small>As mensagens são locais. Segurança, autenticação e adequação à LGPD serão implementadas no backend.</small></span></div></aside></section>`;
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

function profilePage() {
  const investor = state.role === 'investor';
  return `${pageHeader('PERFIL', state.user.name, `${state.user.handle} · ${state.user.city || 'Brasil'}`, '<button class="secondary-button edit-profile">Editar perfil</button>')}<section class="profile-hero"><div class="large-avatar">${state.user.name.split(/\s+/).map(item => item[0]).slice(0,2).join('')}</div><div><h2>${investor ? state.user.organization : state.user.school}</h2><p>${state.user.bio}</p><div class="project-tags">${(state.user.skills || []).map(skill => `<span>${skill}</span>`).join('')}</div></div></section><div class="tabs"><button class="active">${investor ? 'Sobre' : 'Projetos'}</button><button>${investor ? 'Interesses' : 'Equipes'}</button>${investor ? '' : '<button>Conquistas</button><button>Sobre</button>'}</div>${investor ? '<section class="panel profile-about"><h2>Tese de interesse</h2><p>Projetos em validação ou protótipo que combinam educação, tecnologia e impacto mensurável.</p></section>' : `<section class="projects-grid">${state.projects.filter(project => project.author.includes('Lucas') || project.author === state.user.name).map(projectCard).join('')}</section><section class="achievement-row"><article><b>✓</b><span>Primeiro projeto<small>Portfólio iniciado</small></span></article><article><b>◇</b><span>Primeira competição<small>Projeto inscrito</small></span></article><article><b>↗</b><span>Curso em andamento<small>42% concluído</small></span></article></section>`}`;
}
function settingsPage(title = 'Configurações', subtitle = 'Gerencie seu perfil e preferências da plataforma.') {
  return `${pageHeader('SUA CONTA', title, subtitle)}<section class="settings-layout"><aside><button class="active">Perfil pessoal</button><button>Notificações</button><button>Privacidade e dados</button><button>Segurança</button></aside><form class="settings-card"><div class="profile-edit"><div class="large-avatar">MS</div><div><h3>Foto de perfil</h3><p>JPG ou PNG. Máximo de 5 MB.</p><button type="button" class="secondary-button">Alterar foto</button></div></div><div class="form-grid"><label>Nome completo<input value="Marcos Silva"></label><label>Identificador único<input value="@marcossilva"></label><label>E-mail<input type="email" value="marcos@envista.com"></label><label>Cidade<input value="Rio de Janeiro, RJ"></label><label class="wide">Sobre você<textarea>Entusiasta de inovação, educação e projetos que geram impacto.</textarea></label></div><button type="button" class="primary-button save-settings">Salvar alterações</button></form></section>`;
}

function bindPageActions() {
  document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => { state.page = button.dataset.go; renderNav(); renderPage(); }));
  document.querySelectorAll('.save-project').forEach(button => button.addEventListener('click', () => { const saved = envistaService.toggleSaved(button.dataset.id); button.textContent = saved ? '✓ Projeto salvo' : '＋ Salvar projeto'; button.classList.toggle('saved', saved); showToast(saved ? 'Projeto salvo para acompanhar.' : 'Projeto removido dos salvos.'); }));
  document.querySelectorAll('.lesson-action,.module-open').forEach(button => button.addEventListener('click', () => { envistaService.saveProgress(Math.max(42, envistaService.getState().courseProgress || 0)); showToast('Aula aberta. Seu progresso foi salvo neste dispositivo.'); }));
  document.querySelectorAll('.event-join').forEach(button => button.addEventListener('click', () => { button.textContent = '✓ Inscrição registrada'; button.disabled = true; showToast('Equipe inscrita com sucesso!'); }));
  document.querySelectorAll('.external-event').forEach(button => button.addEventListener('click', () => showToast('Esta oportunidade abre no site oficial quando o link estiver disponível.')));
  document.querySelectorAll('.project-open,.invest-action').forEach(button => button.addEventListener('click', () => { state.activeProject = state.projects.find(project => project.id === button.dataset.id) || state.projects[0]; state.page = 'project-detail'; renderNav(); renderPage(); }));
  document.querySelectorAll('.team-open').forEach(button => button.addEventListener('click', () => showToast('Dashboard da equipe aberto.')));
  document.querySelectorAll('.follow-team').forEach(button => button.addEventListener('click', () => { button.textContent = '✓ Seguindo'; button.disabled = true; showToast('Agora você acompanha esta equipe.'); }));
  const messageForm = $('.message-form'); if (messageForm) messageForm.addEventListener('submit', event => { event.preventDefault(); const input = messageForm.querySelector('input'); if (!input.value.trim()) return; const text = input.value.replace(/[<>]/g, ''); $('.messages').insertAdjacentHTML('beforeend', `<div class="bubble sent">${text}</div>`); envistaService.addMessage({ text, sentAt: new Date().toISOString() }); input.value = ''; });
  const filterInput = $('.filter-input'); if (filterInput) filterInput.addEventListener('input', event => { document.querySelectorAll('.project-card,.investment-card').forEach(card => card.hidden = !card.textContent.toLowerCase().includes(event.target.value.toLowerCase())); });
  $('.modal-project')?.addEventListener('click', () => openDialog('project'));
  $('.modal-team')?.addEventListener('click', () => openDialog('team'));
  $('.save-settings')?.addEventListener('click', () => showToast('Alterações salvas com sucesso!'));
  $('.share-action')?.addEventListener('click', () => { navigator.clipboard?.writeText(location.href); showToast('Link do projeto copiado.'); });
  $('.interest-action')?.addEventListener('click', () => openInterest(state.activeProject));
  $('.edit-profile')?.addEventListener('click', () => { state.page = 'settings'; renderNav(); renderPage(); });
}

function openDialog(type) {
  const project = type === 'project';
  $('#dialogTitle').textContent = project ? 'Publicar novo projeto' : 'Criar uma equipe';
  $('#dialogFields').innerHTML = project ? `<label>Quem está publicando?<select id="newAuthor"><option>Em meu nome</option>${state.teams.map(team => `<option>${team.name}</option>`).join('')}</select></label><label>Nome do projeto<input id="newName" required placeholder="Ex.: Solução para escolas"></label><label>Descrição curta<textarea id="newDescription" required placeholder="Explique a proposta em poucas palavras"></textarea></label><div class="form-grid"><label>Categoria<select id="newCategory"><option>Sustentabilidade</option><option>Educação</option><option>Tecnologia</option><option>Impacto social</option></select></label><label>Estágio<select id="newStage"><option>Ideia</option><option>Validação</option><option>Protótipo</option><option>MVP</option><option>Projeto ativo</option></select></label></div><label>Problema<textarea id="newProblem" placeholder="Que problema real vocês observaram?"></textarea></label><label>Solução proposta<textarea id="newSolution" placeholder="Como a proposta resolve esse problema?"></textarea></label><label>Materiais<input id="newFiles" type="file" multiple accept=".pdf,image/*,video/*,.ppt,.pptx,.doc,.docx"></label>` : `<label>Nome da equipe<input id="newName" required placeholder="Ex.: Equipe Atlas"></label><label>Identificador<input id="newSlug" required placeholder="equipe-atlas"></label><label>Propósito da equipe<textarea id="newDescription" required placeholder="Qual problema vocês querem resolver?"></textarea></label><div class="form-grid"><label>Categoria<select id="newCategory"><option>Sustentabilidade</option><option>Educação</option><option>Tecnologia</option><option>Impacto social</option></select></label><label>Cidade<input id="newCity" placeholder="Cidade, UF"></label></div><label>Instituição ou escola<input id="newSchool" placeholder="Nome da instituição"></label>`;
  $('#mainDialog').dataset.type = type;
  $('#mainDialog').showModal();
}

$('#dialogSubmit').addEventListener('click', event => {
  event.preventDefault(); const name = $('#newName')?.value.trim(); if (!name) { showToast('Informe um nome para continuar.'); return; }
  if ($('#mainDialog').dataset.type === 'project') envistaService.createProject({ id: `project-${Date.now()}`, slug: name.toLowerCase().replace(/\W+/g, '-'), name, author: $('#newAuthor').value === 'Em meu nome' ? state.user.name : $('#newAuthor').value, authorType: $('#newAuthor').value === 'Em meu nome' ? 'user' : 'team', text: $('#newDescription').value, problem: $('#newProblem').value || 'Problema em validação.', solution: $('#newSolution').value || 'Solução em desenvolvimento.', tag: $('#newCategory').value, stage: $('#newStage').value, tags: [$('#newCategory').value], likes: 0, progress: 10, color: 'project-green', updated: 'Criado agora', saved: false });
  else envistaService.createTeam({ id: $('#newSlug').value, name, description: $('#newDescription').value, category: $('#newCategory').value, city: $('#newCity').value, school: $('#newSchool').value, role: 'Fundador / Líder', members: 1, projects: 0, color: 'blue' });
  $('#mainDialog').close(); showToast('Criado com sucesso!'); renderPage();
});

$('#quickAction').addEventListener('click', () => openDialog('project'));
$('#openMenu').addEventListener('click', () => $('#sidebar').classList.add('open'));
$('#closeMenu').addEventListener('click', () => $('#sidebar').classList.remove('open'));
$('#logout').addEventListener('click', () => { envistaService.logout(); $('#app').classList.add('hidden'); showPublic('login'); });

function openGeneric(title, content) {
  $('#overlayContent').innerHTML = `<div class="dialog-heading"><div><span class="eyebrow">ENVISTA</span><h2>${title}</h2></div><button class="dialog-close" aria-label="Fechar">×</button></div>${content}`;
  $('#overlayDialog').showModal();
  $('#overlayContent .dialog-close').onclick = () => $('#overlayDialog').close();
}

function openInterest(project) {
  openGeneric(`Demonstrar interesse em ${project.name}`, `<label>Objetivo do contato<select id="interestType"><option>Conhecer melhor o projeto</option><option>Mentoria</option><option>Parceria</option><option>Possível investimento</option><option>Outro</option></select></label><label>Mensagem<textarea id="interestMessage" placeholder="Apresente brevemente o contexto do contato"></textarea></label><button class="primary-button full interest-submit">Enviar interesse</button>`);
  $('.interest-submit').onclick = () => { envistaService.addMessage({ project: project.id, text: $('#interestMessage').value, type: $('#interestType').value }); envistaService.notify(`Interesse de ${state.user.name} enviado para ${project.author}.`); $('#overlayDialog').close(); showToast('Interesse enviado para a equipe.'); };
}

function openNotifications() {
  const fallback = [
    'Equipe Atlas convidou você para uma revisão.',
    'Seu projeto Aqua recebeu um novo comentário.',
    'Sua inscrição no Envista Challenge foi confirmada.'
  ];
  const notices = envistaService.getState().notifications || fallback.map((text, id) => ({ id, text, read: false }));
  openGeneric('Notificações', `<div class="notification-list">${notices.map(item => `<article class="${item.read ? '' : 'unread'}"><i></i><div><b>${item.text}</b><small>Atualização recente</small></div></article>`).join('')}</div><button class="secondary-button full mark-read">Marcar todas como lidas</button>`);
  $('.mark-read').onclick = () => { envistaService.markNotificationsRead(); $('#overlayDialog').close(); $('.notification-button i').remove(); showToast('Notificações marcadas como lidas.'); };
}

function openSearch(query = '') {
  const data = envistaService.getState();
  openGeneric('Buscar no Envista', `<label class="command-search">⌕ <input id="commandInput" value="${query.replace(/["<>]/g, '')}" placeholder="Projetos, equipes, pessoas, cursos..."></label><div id="searchResults" class="search-results"></div><small class="command-hint">ESC para fechar · Ctrl K para buscar</small>`);
  const render = value => { const q = value.toLowerCase(); const groups = [['Projetos', data.projects],['Equipes',data.teams],['Pessoas',data.people.map(name => ({ name }))],['Cursos',data.courses.map(name => ({ name }))],['Competições',data.competitions.map(name => ({ name }))]]; $('#searchResults').innerHTML = groups.map(([label, items]) => { const found = items.filter(item => item.name.toLowerCase().includes(q)).slice(0,4); return found.length ? `<section><small>${label}</small>${found.map(item => `<button>${item.name}<span>→</span></button>`).join('')}</section>` : ''; }).join('') || '<div class="empty-state"><p>Nenhum resultado encontrado.</p></div>'; };
  render(query); $('#commandInput').oninput = event => render(event.target.value); $('#commandInput').focus();
}

$('.notification-button').addEventListener('click', openNotifications);
$('#globalSearch').addEventListener('focus', event => { event.target.blur(); openSearch(); });
document.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch(); } });

// TODO: implementar camada real de mensagens, autenticação, criptografia e adequação LGPD no backend.

if (location.hash === '#/login') showPublic('login');
