import React from 'react';
import { createRoot } from 'react-dom/client';

// Infraestrutura
import { HttpClient } from './infrastructure/http/HttpClient.js';
import { GitHubUserRepository } from './infrastructure/repositories/GitHubUserRepository.js';

// Casos de uso (Application Layer)
import { GetUserUseCase } from './application/use-cases/GetUserUseCase.js';
import { GetUserRepositoriesUseCase } from './application/use-cases/GetUserRepositoriesUseCase.js';

// Apresentação
import { AppProvider } from './presentation/context/AppContext.js';
import { GitHubExplorer } from './presentation/pages/GitHubExplorer.js';

/**
 * Configuração da aplicação seguindo Clean Architecture
 * Dependency Injection e inversão de controle
 */
class AppConfig {
  constructor() {
    this.initializeInfrastructure();
    this.initializeApplication();
  }

  /**
   * Inicializa a camada de infraestrutura
   */
  initializeInfrastructure() {
    // Logger customizado para produção
    this.logger = this.createLogger();

    // Cliente HTTP configurado
    this.httpClient = new HttpClient({
      baseURL: 'https://api.github.com',
      timeout: 15000,
      retryAttempts: 3,
      retryDelay: 1000,
      logger: this.logger,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Explorer-React19-Clean/1.0.0'
      }
    });

    // Cache simples em memória (pode ser substituído por Redis, etc.)
    this.cache = this.createMemoryCache();

    // Repositório de usuários
    this.userRepository = new GitHubUserRepository(
      this.httpClient,
      this.cache,
      this.logger
    );

    // Configurar token de autenticação se disponível
    const githubToken = process.env.REACT_APP_GITHUB_TOKEN;
    if (githubToken) {
      this.userRepository.setAuthToken(githubToken);
    }
  }

  /**
   * Inicializa a camada de aplicação (casos de uso)
   */
  initializeApplication() {
    // Casos de uso
    this.getUserUseCase = new GetUserUseCase(this.userRepository, this.logger);
    this.getUserRepositoriesUseCase = new GetUserRepositoriesUseCase(this.userRepository, this.logger);
  }

  /**
   * Cria logger customizado baseado no ambiente
   */
  createLogger() {
    const isDevelopment = process.env.NODE_ENV === 'development';

    return {
      debug: isDevelopment ? console.debug.bind(console) : () => {},
      info: isDevelopment ? console.info.bind(console) : () => {},
      warn: console.warn.bind(console),
      error: console.error.bind(console)
    };
  }

  /**
   * Cria cache simples em memória
   * Em produção, seria substituído por Redis ou similar
   */
  createMemoryCache() {
    const store = new Map();

    return {
      async get(key) {
        const item = store.get(key);
        if (!item) return null;

        // Verifica expiração
        if (item.expiresAt && Date.now() > item.expiresAt) {
          store.delete(key);
          return null;
        }

        return item.value;
      },

      async set(key, value, ttlSeconds = 300) {
        const expiresAt = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null;
        store.set(key, { value, expiresAt });
      },

      async del(key) {
        return store.delete(key);
      },

      async flush() {
        store.clear();
      },

      // Estatísticas do cache
      getStats() {
        return {
          size: store.size,
          keys: Array.from(store.keys())
        };
      }
    };
  }

  /**
   * Retorna dependências para injeção
   */
  getDependencies() {
    return {
      // Casos de uso
      getUserUseCase: this.getUserUseCase,
      getUserRepositoriesUseCase: this.getUserRepositoriesUseCase,
      
      // Infraestrutura (para debugging/monitoring)
      httpClient: this.httpClient,
      userRepository: this.userRepository,
      cache: this.cache,
      logger: this.logger
    };
  }

  /**
   * Verifica saúde da aplicação
   */
  async healthCheck() {
    try {
      const repoHealth = await this.userRepository.healthCheck();
      const cacheStats = this.cache.getStats();

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        repository: repoHealth,
        cache: cacheStats,
        environment: {
          nodeEnv: process.env.NODE_ENV,
          hasGitHubToken: !!process.env.REACT_APP_GITHUB_TOKEN
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }
}

/**
 * Inicialização da aplicação
 */
async function initializeApp() {
  try {
    // Configuração da aplicação
    const appConfig = new AppConfig();
    const dependencies = appConfig.getDependencies();

    // Verificação de saúde inicial
    const health = await appConfig.healthCheck();
    console.info('[App] Health check:', health);

    // Configurações globais do React
    if (process.env.NODE_ENV === 'development') {
      // Debug info para desenvolvimento
      window.githubExplorer = {
        config: appConfig,
        dependencies,
        health
      };
    }

    // Renderização da aplicação
    const container = document.getElementById('app');
    if (!container) {
      throw new Error('Root container element not found');
    }

    const root = createRoot(container);

    root.render(
      <React.StrictMode>
        <AppProvider dependencies={dependencies}>
          <GitHubExplorer />
        </AppProvider>
      </React.StrictMode>
    );

    console.info('[App] GitHub Explorer initialized successfully');

  } catch (error) {
    console.error('[App] Failed to initialize application:', error);
    
    // Fallback UI em caso de erro crítico
    const container = document.getElementById('app');
    if (container) {
      container.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #dc3545;">
          <h1>Erro de Inicialização</h1>
          <p>Falha ao carregar a aplicação. Recarregue a página.</p>
          <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 10px;">
            Recarregar
          </button>
        </div>
      `;
    }
  }
}

// Performance monitoring
if (process.env.NODE_ENV === 'development') {
  // Métricas de performance
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0];
    console.info('[Performance] Page load:', {
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
      totalTime: perfData.loadEventEnd - perfData.fetchStart
    });
  });
}

// Error boundary global
window.addEventListener('error', (event) => {
  console.error('[Global Error]', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', event.reason);
});

// Inicializar aplicação
initializeApp();