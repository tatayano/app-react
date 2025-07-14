# 🔐 Guia de Configuração de Tokens - GitHub Explorer

## 🎯 Overview

A aplicação GitHub Explorer utiliza a API do GitHub para buscar informações de usuários e repositórios. Para evitar limitações de rate limiting e acessar recursos privados, é necessário configurar um token de acesso pessoal.

## 📊 Rate Limiting GitHub API

| Tipo de Acesso | Requests por Hora | Recomendação |
|----------------|-------------------|--------------|
| **Sem Token** | 60 | ❌ Muito limitado |
| **Com Token** | 5,000 | ✅ Recomendado |
| **Token Autenticado** | 15,000 | 🚀 Ideal para produção |

## 🔑 Como Obter o GitHub Token

### Passo 1: Acesse as Configurações do GitHub
```
https://github.com/settings/tokens
```

### Passo 2: Generate New Token
1. Clique em **"Generate new token (classic)"**
2. Dê um nome descritivo: `GitHub Explorer App`
3. Defina expiração conforme necessário

### Passo 3: Selecione os Scopes Necessários

#### ✅ Scopes Obrigatórios:
- `public_repo` - Acesso a repositórios públicos
- `read:user` - Leitura de informações do usuário

#### 🔧 Scopes Opcionais:
- `read:org` - Informações de organizações
- `repo` - Acesso completo a repositórios (se precisar de privados)

### Passo 4: Gerar e Copiar Token
1. Clique em **"Generate token"**
2. **⚠️ IMPORTANTE**: Copie o token imediatamente (não será mostrado novamente)
3. Guarde em local seguro

## 🛠️ Configuração na Aplicação

### Método 1: Arquivo .env.local (Recomendado)

```bash
# 1. Copie o template
cp .env.example .env.local

# 2. Edite o arquivo .env.local
nano .env.local

# 3. Substitua o token
REACT_APP_GITHUB_TOKEN=ghp_your_real_token_here
```

### Método 2: Variáveis de Ambiente do Sistema

```bash
# Linux/Mac
export REACT_APP_GITHUB_TOKEN=ghp_your_real_token_here
npm start

# Windows (PowerShell)
$env:REACT_APP_GITHUB_TOKEN="ghp_your_real_token_here"
npm start

# Windows (CMD)
set REACT_APP_GITHUB_TOKEN=ghp_your_real_token_here
npm start
```

## ✅ Verificação da Configuração

### 1. Via Console do Navegador
```javascript
// Abra o console (F12) e execute:
console.log('Token configurado:', !!process.env.REACT_APP_GITHUB_TOKEN);
```

### 2. Via Logs da Aplicação
Procure por estas mensagens no console:
```
✅ [GitHubUserRepository] Authentication token configured
✅ [HttpClient] Authentication token configured
```

### 3. Testando Rate Limit
Faça uma busca e verifique no console:
```
ℹ️ Rate Limit Status: 4999/5000 remaining
```

## 🔒 Segurança dos Tokens

### ✅ Boas Práticas:
- ✅ Use `.env.local` para desenvolvimento
- ✅ Tokens ficam em `.gitignore`
- ✅ Defina expiração nos tokens
- ✅ Use scopes mínimos necessários
- ✅ Rotacione tokens periodicamente

### ❌ Nunca Faça:
- ❌ Commitar tokens no git
- ❌ Compartilhar tokens em chat/email
- ❌ Usar tokens em produção sem HTTPS
- ❌ Dar scopes desnecessários

## 🛠️ Configurações Avançadas

### Configuração para Desenvolvimento
```env
# .env.local
REACT_APP_GITHUB_TOKEN=ghp_your_dev_token
REACT_APP_DEBUG_MODE=true
REACT_APP_CACHE_TTL=5
NODE_ENV=development
```

### Configuração para Produção
```env
# .env.production
REACT_APP_GITHUB_TOKEN=ghp_your_prod_token
REACT_APP_DEBUG_MODE=false
REACT_APP_CACHE_TTL=30
NODE_ENV=production
```

## 🆘 Troubleshooting

### ❌ Erro 401 - Unauthorized
```
Causa: Token inválido ou expirado
Solução: 
1. Verifique se o token está correto
2. Confirme se não expirou
3. Regenere o token se necessário
```

### ❌ Erro 403 - Rate Limit Exceeded
```
Causa: Rate limit atingido
Solução:
1. Configure um token válido
2. Aguarde o reset (1 hora)
3. Reduza frequência de requests
```

### ❌ Erro 404 - Not Found
```
Causa: Usuário/repo não existe ou é privado
Solução:
1. Verifique se o usuário existe
2. Para repos privados, use scope 'repo'
3. Confirme permissões do token
```

## 📝 Exemplo de Configuração Completa

### 1. Criar .env.local
```bash
cp .env.example .env.local
```

### 2. Configurar token
```env
# .env.local
REACT_APP_GITHUB_TOKEN=ghp_1234567890abcdef
REACT_APP_DEBUG_MODE=true
REACT_APP_CACHE_TTL=15
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_THEMES=true
REACT_APP_ENABLE_SEARCH_HISTORY=true
NODE_ENV=development
```

### 3. Executar aplicação
```bash
npm start
```

### 4. Verificar funcionamento
1. Abra `http://localhost:3000`
2. Busque por um usuário (ex: "octocat")
3. Verifique logs no console
4. Confirme que não há erros de rate limit

## 🔗 Links Úteis

- [GitHub Personal Access Tokens](https://github.com/settings/tokens)
- [GitHub API Rate Limiting](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting)
- [GitHub API Authentication](https://docs.github.com/en/rest/guides/getting-started-with-the-rest-api#authentication)
- [Scopes for OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps)

---

**📋 Checklist de Configuração:**
- [ ] Token GitHub gerado
- [ ] Scopes corretos selecionados
- [ ] Arquivo .env.local criado
- [ ] Token configurado no .env.local
- [ ] Aplicação executando sem erros
- [ ] Rate limit verificado (5000 requests)
- [ ] Busca de usuário funcionando