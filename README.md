# Envista — MVP web

Protótipo funcional e responsivo do ecossistema Envista. O MVP inclui landing pública, páginas institucionais, dois fluxos de acesso (participante e investidor), equipes com funções diferentes, portfólio de projetos, cursos modulares, competições, mensagens e descoberta para investidores.

O projeto não possui backend, autenticação real ou banco de dados. As ações principais usam dados mockados e `localStorage`, permitindo demonstrar criação e salvamento de projetos, equipes, mensagens, progresso e notificações entre recarregamentos.

## Organização

- `data.js`: catálogo coerente de projetos, equipes, perfis, cursos e competições.
- `services.js`: camada de acesso e persistência local que poderá ser substituída por uma API.
- `script.js`: navegação, renderização das experiências e interações da interface.
- `styles.css`: sistema visual responsivo e componentes da aplicação.

## Executar localmente

```bash
python3 -m http.server 4173
```

Abra `http://localhost:4173` no navegador.

## Fluxos disponíveis

- Use **Demo Participante** para entrar como Lucas Ferreira e acessar projetos, equipes, cursos, competições e mensagens.
- Use **Demo Investidor** para entrar como Marina Alves e descobrir, salvar, acompanhar projetos e demonstrar interesse.
- Pressione `Ctrl + K` para testar a busca global por projetos, equipes, pessoas, cursos e competições.
- Use qualquer e-mail válido e uma senha de pelo menos seis caracteres. As credenciais preenchidas são apenas demonstrativas.
