// Camada local substituível por uma API sem alterar os componentes de interface.
window.envistaService = (() => {
  const KEY = 'envista-mvp-v2';
  const defaults = window.ENVISTA_DATA;
  const clone = value => JSON.parse(JSON.stringify(value));
  const load = () => {
    try { return { ...clone(defaults), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
    catch { return clone(defaults); }
  };
  let db = load();
  const persist = () => localStorage.setItem(KEY, JSON.stringify(db));
  return {
    getState: () => db,
    loginAs: role => { db.session = { role }; db.user = clone(db[role]); persist(); return db.user; },
    updateUser: data => { db.user = { ...(db.user || db.participant), ...data }; persist(); return db.user; },
    getProjects: () => db.projects,
    getProject: id => db.projects.find(project => project.id === id || project.slug === id),
    createProject: project => { db.projects.unshift(project); persist(); return project; },
    updateProject: (id, data) => { const project = db.projects.find(item => item.id === id); Object.assign(project, data); persist(); return project; },
    toggleSaved: id => { const project = db.projects.find(item => item.id === id); project.saved = !project.saved; persist(); return project.saved; },
    createTeam: team => { db.teams.push(team); persist(); return team; },
    saveProgress: value => { db.courseProgress = value; persist(); },
    addMessage: message => { db.messages = [...(db.messages || []), message]; persist(); },
    notify: text => { db.notifications = [{ id: Date.now(), text, read: false }, ...(db.notifications || [])]; persist(); },
    markNotificationsRead: () => { (db.notifications || []).forEach(item => item.read = true); persist(); },
    logout: () => { delete db.session; persist(); }
  };
})();
