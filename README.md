# Envista — MVP web

Protótipo funcional e responsivo do ecossistema Envista. O MVP inclui dois fluxos de acesso (participante e investidor), equipes com funções diferentes, feed de projetos, cursos modulares, competições, chat, captação e portfólio de investimentos.

Os dados são demonstrativos e ficam apenas em memória durante a sessão. O projeto não possui backend, autenticação real ou persistência em banco de dados nesta etapa.

## Executar localmente

```bash
python3 -m http.server 4173
```

Abra `http://localhost:4173` no navegador.

## Fluxos disponíveis

- Entre como **Participante** para acessar projetos, equipes, cursos, competições, mensagens e oportunidades.
- Entre como **Investidor** para descobrir projetos em captação, acompanhar um portfólio e conversar com equipes.
- Use qualquer e-mail válido e uma senha de pelo menos seis caracteres. As credenciais preenchidas são apenas demonstrativas.
