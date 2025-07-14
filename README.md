# GitHub Info - React 18 App

Uma aplicação React moderna para buscar informações de usuários do GitHub e seus repositórios.

## 🚀 Migração para React 18

Esta aplicação foi completamente migrada do React 15.3.1 para o React 18.2.0, incluindo:

### ✅ Principais Melhorias

- **React 18.2.0**: Atualização completa com createRoot API
- **Webpack 5**: Configuração moderna com HtmlWebpackPlugin
- **Babel 7**: Transpilação ES6+ atualizada
- **Axios 1.6.2**: Cliente HTTP atualizado
- **Bootstrap 5**: UI moderna e responsiva
- **PropTypes**: Pacote separado para validação de tipos

### 🔄 Refatorações Realizadas

- Conversão de `React.createClass` para **componentes funcionais**
- Migração para **React Hooks** (useState, useEffect, useRef)
- Substituição de `require/module.exports` por **import/export ES6**
- Atualização de `React.PropTypes` para **prop-types** package
- Modernização de refs com **useRef**
- Implementação de **async/await** para promises
- Adição de **error handling** robusto

## 🛠 Instalação e Uso

```bash
# Instalar dependências
npm install

# Desenvolvimento (servidor local)
npm start

# Build para produção
npm run build

# Build de desenvolvimento
npm run dev
```

## 📁 Estrutura do Projeto

```
app/
├── App.js                 # Componente raiz com createRoot
├── components/
│   ├── GitHub.js          # Componente principal com hooks
│   ├── SearchUser.js      # Formulário de busca
│   ├── UserInfo.js        # Informações do usuário
│   └── UserRepos.js       # Lista de repositórios
└── services/
    └── GitHubUserService.js # Serviço API GitHub
```

## 🌐 Funcionalidades

- Busca de usuários do GitHub por username
- Exibição de informações do perfil
- Lista de repositórios com contagem de stars
- Interface responsiva com Bootstrap 5
- Links para perfil e issues dos repositórios

## 🔧 Tecnologias

- React 18.2.0
- Webpack 5
- Babel 7
- Axios 1.6.2
- Bootstrap 5
- PropTypes

## 📝 Notas da Migração

- Todos os componentes foram convertidos para componentes funcionais
- Estado local gerenciado com `useState`
- Efeitos colaterais com `useEffect`
- Refs modernizados com `useRef`
- Promises convertidas para async/await
- Melhor tratamento de erros
- Código mais limpo e maintível
