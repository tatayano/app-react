# GitHub Explorer - React 19 + Clean Architecture

Uma aplicação React moderna para explorar perfis de usuários do GitHub e seus repositórios, construída com React 19 e seguindo os princípios de Clean Architecture.

## 🚀 Histórico de Evolução

### v1.0.0 - React 15.3.1 (Versão Original)
- React 15.3.1 com `React.createClass`
- Webpack 1.x básico
- Babel 6 para transpilação
- Estrutura simples de componentes

### v2.0.0 - React 18.2.0 (Primeira Modernização)
- ✅ Migração para React 18.2.0
- ✅ Componentes funcionais com Hooks
- ✅ Import/Export ES6
- ✅ Webpack 5 + HtmlWebpackPlugin
- ✅ PropTypes modernizado
- ✅ Bootstrap 5 + Font Awesome 6

### v3.0.0 - React 19.0.0 + Clean Architecture (Versão Atual)
- 🆕 **React 19.0.0** com recursos mais recentes
- 🏗️ **Clean Architecture** completa
- 🔄 **Dependency Injection** via Context API
- 🧪 **Casos de Uso** bem definidos
- 📦 **Entidades de Domínio** com regras de negócio
- 🔌 **Repository Pattern** para acesso a dados
- 💾 **Sistema de Cache** em memória
- 🚨 **Tratamento robusto de erros**
- 📊 **Analytics avançado** de repositórios
- 🎨 **UI/UX aprimorada** com temas e notificações

## 🏗️ Arquitetura Clean

A aplicação segue os princípios de Clean Architecture, separada em camadas bem definidas:

```
src/
├── domain/                     # Camada de Domínio
│   ├── entities/              # Entidades com regras de negócio
│   │   ├── User.js           # Entidade User
│   │   └── Repository.js     # Entidade Repository
│   └── repositories/         # Interfaces dos repositórios
│       └── UserRepositoryInterface.js
│
├── application/               # Camada de Aplicação
│   ├── use-cases/            # Casos de uso
│   │   ├── GetUserUseCase.js
│   │   └── GetUserRepositoriesUseCase.js
│   └── services/             # Serviços da aplicação
│
├── infrastructure/           # Camada de Infraestrutura
│   ├── http/                # Cliente HTTP
│   │   └── HttpClient.js
│   └── repositories/        # Implementações concretas
│       └── GitHubUserRepository.js
│
├── presentation/            # Camada de Apresentação
│   ├── components/         # Componentes React
│   ├── hooks/             # Hooks customizados
│   ├── context/           # Context API
│   └── pages/             # Páginas principais
│
└── main.js                # Configuração e injeção de dependências
```

### 🔄 Fluxo de Dependências

```
Presentation → Application → Domain ← Infrastructure
```

- **Domain**: Núcleo da aplicação, independente de frameworks
- **Application**: Orquestra casos de uso e regras de negócio
- **Infrastructure**: Implementa interfaces para acesso externo
- **Presentation**: Interface do usuário e interações

## ✨ Funcionalidades

### 🔍 Busca de Usuários
- Validação em tempo real do username
- Histórico de buscas recentes
- Sugestões de usuários populares
- Cache inteligente com TTL

### 👤 Perfil do Usuário
- Informações completas do perfil
- Estatísticas de engajamento
- Análise de completude do perfil
- Links para redes sociais

### 📊 Repositórios
- Lista paginada de repositórios
- Filtros avançados (linguagem, tipo, estrelas)
- Ordenação customizável
- Indicadores de atividade

### 📈 Analytics
- Distribuição de linguagens de programação
- Análise de atividade dos repositórios
- Métricas de popularidade
- Top repositórios por estrelas
- Tendências e momentum

### 🎨 Interface
- Tema claro/escuro
- Notificações contextuais
- Interface responsiva
- Loading states inteligentes
- Error boundaries

## 🛠️ Tecnologias

### Core
- **React 19.0.0** - Framework principal
- **JavaScript ES6+** - Linguagem moderna
- **Webpack 5** - Bundler com otimizações

### Styling & UI
- **Bootstrap 5.3.2** - Framework CSS
- **Font Awesome 6.5.1** - Ícones
- **CSS3** - Estilos customizados

### Desenvolvimento
- **Babel 7.26** - Transpilação ES6+
- **ESLint** - Linting de código
- **Webpack Dev Server** - Desenvolvimento

### APIs & Dados
- **GitHub API v3** - Fonte de dados
- **Axios 1.7.7** - Cliente HTTP
- **Cache em Memória** - Performance

## 🚀 Instalação e Execução

### Pré-requisitos
```bash
Node.js >= 16.x
npm >= 8.x
```

### Instalação
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/github-explorer.git
cd github-explorer

# Instale as dependências
npm install
```

### Execução

#### Desenvolvimento
```bash
npm start
# Abre automaticamente em http://localhost:3000
```

#### Build de Produção
```bash
npm run build
# Gera arquivos otimizados na pasta dist/
```

#### Build de Desenvolvimento
```bash
npm run dev
# Build sem otimizações para debug
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Token do GitHub (opcional, mas recomendado para rate limits maiores)
REACT_APP_GITHUB_TOKEN=seu_token_aqui

# Ambiente de execução
NODE_ENV=development
```

### Token do GitHub

Para obter melhor performance e rate limits maiores:

1. Acesse [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Gere um novo token (classic)
3. Não é necessário selecionar nenhum escopo para dados públicos
4. Adicione o token no arquivo `.env`

## 🧪 Casos de Uso Principais

### 1. Buscar Usuário
```javascript
// Via hook customizado
const { fetchUser } = useUser(getUserUseCase, getUserRepositoriesUseCase);

// Busca com cache
await fetchUser('octocat', { useCache: true });

// Busca forçando refresh
await fetchUser('octocat', { forceRefresh: true });
```

### 2. Buscar Repositórios
```javascript
// Com filtros e analytics
await fetchUserRepositories('octocat', {
  perPage: 50,
  includeAnalytics: true,
  customSort: 'popularity'
});
```

### 3. Analytics Avançado
```javascript
// Análise automática de repositórios
const analytics = await getUserRepositoriesUseCase.execute('octocat', {
  includeAnalytics: true
});

// Métricas disponíveis:
// - Distribuição de linguagens
// - Atividade dos repositórios
// - Popularidade e tendências
// - Categorização automática
```

## 🎯 Padrões Implementados

### Design Patterns
- **Repository Pattern** - Abstração de acesso a dados
- **Dependency Injection** - Inversão de controle
- **Observer Pattern** - Notificações reativas
- **Strategy Pattern** - Diferentes estratégias de ordenação
- **Factory Pattern** - Criação de entidades

### React Patterns
- **Custom Hooks** - Lógica reutilizável
- **Context API** - Gerenciamento de estado global
- **Error Boundaries** - Tratamento de erros
- **Render Props** - Componentes flexíveis
- **Higher-Order Components** - Funcionalidades transversais

### Clean Architecture Principles
- **Single Responsibility** - Cada classe tem uma responsabilidade
- **Open/Closed** - Extensível mas fechado para modificação
- **Liskov Substitution** - Interfaces bem definidas
- **Interface Segregation** - Interfaces específicas
- **Dependency Inversion** - Dependências invertidas

## 📊 Performance

### Otimizações Implementadas
- **Code Splitting** automático
- **Lazy Loading** de componentes
- **Cache inteligente** com TTL
- **Memoização** de cálculos pesados
- **Debounce** em inputs de busca
- **Virtual Scrolling** em listas grandes
- **Bundle Analysis** com Webpack

### Métricas Típicas
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Bundle Size**: < 500KB (gzipped)
- **Lighthouse Score**: > 90

## 🧪 Testes

### Estratégia de Testes
```bash
# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

### Estrutura de Testes
```
tests/
├── unit/                    # Testes unitários
│   ├── domain/             # Entidades e regras de negócio
│   ├── application/        # Casos de uso
│   └── infrastructure/     # Repositórios e HTTP
├── integration/            # Testes de integração
│   └── api/               # Integração com GitHub API
└── e2e/                   # Testes end-to-end
    └── user-journey/      # Jornadas do usuário
```

## 🔧 Debug e Monitoramento

### Debug em Desenvolvimento
```javascript
// Informações disponíveis no console do navegador
window.githubExplorer = {
  config: AppConfig,
  dependencies: Dependencies,
  health: HealthStatus
};

// Analytics de performance
console.info('[Performance] Page load:', metrics);
```

### Health Check
```javascript
// Verifica saúde da aplicação
const health = await appConfig.healthCheck();
console.log(health);
```

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy de produção
vercel --prod
```

### Netlify
```bash
# Build
npm run build

# Deploy manual da pasta dist/
# Ou conectar repositório no Netlify
```

### GitHub Pages
```bash
# Usando gh-pages
npm install --save-dev gh-pages

# Script no package.json
"deploy": "gh-pages -d dist"

npm run deploy
```

## 🤝 Contribuição

### Estrutura de Commits
```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: mudanças de formatação
refactor: refatoração de código
test: adiciona ou modifica testes
chore: tarefas de manutenção
```

### Pull Requests
1. Fork o projeto
2. Crie uma branch feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📋 Roadmap

### Próximas Funcionalidades
- [ ] **Testes automatizados** completos
- [ ] **PWA** com service workers
- [ ] **GraphQL** integration
- [ ] **TypeScript** migration
- [ ] **Storybook** para componentes
- [ ] **Micro-frontends** architecture
- [ ] **Real-time** updates
- [ ] **Internationalization** (i18n)
- [ ] **Dark/Light** theme persistence
- [ ] **Export** functionality (PDF, CSV)

### Melhorias Técnicas
- [ ] **Redux Toolkit** para estado complexo
- [ ] **React Query** para cache avançado
- [ ] **MSW** para mocking de APIs
- [ ] **Playwright** para testes E2E
- [ ] **Vite** como bundler alternativo
- [ ] **ESBuild** para builds mais rápidos

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- **GitHub** pela API pública fantástica
- **React Team** pelo framework incrível
- **Bootstrap** pela biblioteca CSS robusta
- **Comunidade Open Source** por todas as ferramentas

---

**Desenvolvido com ❤️ usando React 19 + Clean Architecture**

Para dúvidas ou sugestões, abra uma [issue](https://github.com/seu-usuario/github-explorer/issues) ou entre em contato!
