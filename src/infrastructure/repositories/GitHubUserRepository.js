import { UserRepositoryInterface, UserNotFoundError, NetworkError } from '../../domain/repositories/UserRepositoryInterface.js';
import { User } from '../../domain/entities/User.js';
import { Repository } from '../../domain/entities/Repository.js';

/**
 * GitHubUserRepository - Implementação concreta do repositório de usuários
 * Comunica-se com a API do GitHub usando HttpClient
 */
export class GitHubUserRepository extends UserRepositoryInterface {
  constructor(httpClient, cache = null, logger = console) {
    super();
    this.httpClient = httpClient;
    this.cache = cache;
    this.logger = logger;
    
    // Configurações de cache
    this.defaultTTL = {
      user: 300,        // 5 minutos
      repositories: 600, // 10 minutos
      search: 180       // 3 minutos
    };
  }

  /**
   * Busca um usuário pelo username
   */
  async findByUsername(username) {
    try {
      this.logger.info(`[GitHubUserRepository] Fetching user: ${username}`);
      
      const response = await this.httpClient.get(`/users/${username}`);
      
      if (!response.data) {
        throw new UserNotFoundError(username);
      }

      // Converte dados da API para entidade de domínio
      const user = User.fromGitHubAPI(response.data);
      
      this.logger.info(`[GitHubUserRepository] User found: ${username}`);
      
      return user;

    } catch (error) {
      if (error instanceof NetworkError) {
        throw error;
      }

      // Verifica se é erro 404 (usuário não encontrado)
      if (error.response?.status === 404) {
        throw new UserNotFoundError(username);
      }

      // Para outros erros HTTP, transforma em NetworkError
      throw new NetworkError(
        `Failed to fetch user ${username}: ${error.message}`,
        error
      );
    }
  }

  /**
   * Busca os repositórios de um usuário
   */
  async findUserRepositories(username, options = {}) {
    const {
      page = 1,
      perPage = 30,
      sort = 'updated',
      direction = 'desc'
    } = options;

    try {
      this.logger.info(`[GitHubUserRepository] Fetching repositories for user: ${username}`);
      
      const params = {
        page,
        per_page: perPage,
        sort,
        direction
      };

      const response = await this.httpClient.get(`/users/${username}/repos`, { params });
      
      if (!response.data || !Array.isArray(response.data)) {
        this.logger.warn(`[GitHubUserRepository] Invalid repositories data for user: ${username}`);
        return [];
      }

      // Converte dados da API para entidades de domínio
      const repositories = response.data.map(repoData => Repository.fromGitHubAPI(repoData));
      
      this.logger.info(`[GitHubUserRepository] Found ${repositories.length} repositories for user: ${username}`);
      
      return repositories;

    } catch (error) {
      if (error instanceof NetworkError) {
        throw error;
      }

      // Verifica se é erro 404 (usuário não encontrado)
      if (error.response?.status === 404) {
        throw new UserNotFoundError(username);
      }

      // Para outros erros HTTP, transforma em NetworkError
      throw new NetworkError(
        `Failed to fetch repositories for user ${username}: ${error.message}`,
        error
      );
    }
  }

  /**
   * Busca usuários por critério de pesquisa
   */
  async searchUsers(query, options = {}) {
    const {
      page = 1,
      perPage = 30,
      sort = 'best-match'
    } = options;

    try {
      this.logger.info(`[GitHubUserRepository] Searching users: ${query}`);
      
      const params = {
        q: query,
        page,
        per_page: perPage,
        sort: sort === 'best-match' ? undefined : sort
      };

      const response = await this.httpClient.get('/search/users', { params });
      
      if (!response.data || !response.data.items) {
        return { users: [], totalCount: 0 };
      }

      // Converte dados da API para entidades de domínio
      const users = response.data.items.map(userData => User.fromGitHubAPI(userData));
      
      this.logger.info(`[GitHubUserRepository] Found ${users.length} users for query: ${query}`);
      
      return {
        users,
        totalCount: response.data.total_count || 0
      };

    } catch (error) {
      if (error instanceof NetworkError) {
        throw error;
      }

      throw new NetworkError(
        `Failed to search users with query "${query}": ${error.message}`,
        error
      );
    }
  }

  /**
   * Verifica se um usuário existe
   */
  async userExists(username) {
    try {
      await this.httpClient.get(`/users/${username}`);
      return true;
    } catch (error) {
      if (error.response?.status === 404) {
        return false;
      }
      
      // Para outros erros, assume que o usuário pode existir
      this.logger.warn(`[GitHubUserRepository] Error checking if user exists ${username}:`, error);
      return false;
    }
  }

  /**
   * Obtém informações de rate limit da API
   */
  async getRateLimit() {
    try {
      const response = await this.httpClient.get('/rate_limit');
      
      if (!response.data || !response.data.rate) {
        throw new NetworkError('Invalid rate limit response');
      }

      const rateData = response.data.rate;
      
      return {
        limit: rateData.limit,
        remaining: rateData.remaining,
        reset: new Date(rateData.reset * 1000)
      };

    } catch (error) {
      if (error instanceof NetworkError) {
        throw error;
      }

      throw new NetworkError(
        `Failed to fetch rate limit: ${error.message}`,
        error
      );
    }
  }

  /**
   * Métodos de cache (implementados se cache estiver disponível)
   */

  /**
   * Salva usuário no cache
   */
  async cacheUser(username, user, ttl = null) {
    if (!this.cache) return;

    try {
      const key = this.getUserCacheKey(username);
      const value = JSON.stringify(user.toJSON());
      const cacheTTL = ttl || this.defaultTTL.user;
      
      await this.cache.set(key, value, cacheTTL);
      this.logger.debug(`[GitHubUserRepository] User cached: ${username}`);
    } catch (error) {
      this.logger.warn(`[GitHubUserRepository] Cache write error for user ${username}:`, error);
    }
  }

  /**
   * Salva repositórios no cache
   */
  async cacheUserRepositories(username, repositories, ttl = null) {
    if (!this.cache) return;

    try {
      const key = this.getRepositoriesCacheKey(username);
      const value = JSON.stringify(repositories);
      const cacheTTL = ttl || this.defaultTTL.repositories;
      
      await this.cache.set(key, value, cacheTTL);
      this.logger.debug(`[GitHubUserRepository] Repositories cached: ${username}`);
    } catch (error) {
      this.logger.warn(`[GitHubUserRepository] Cache write error for repositories ${username}:`, error);
    }
  }

  /**
   * Busca usuário no cache
   */
  async getCachedUser(username) {
    if (!this.cache) return null;

    try {
      const key = this.getUserCacheKey(username);
      const cachedValue = await this.cache.get(key);
      
      if (!cachedValue) return null;

      const userData = JSON.parse(cachedValue);
      return User.fromGitHubAPI(userData);

    } catch (error) {
      this.logger.warn(`[GitHubUserRepository] Cache read error for user ${username}:`, error);
      return null;
    }
  }

  /**
   * Busca repositórios no cache
   */
  async getCachedUserRepositories(username) {
    if (!this.cache) return null;

    try {
      const key = this.getRepositoriesCacheKey(username);
      const cachedValue = await this.cache.get(key);
      
      if (!cachedValue) return null;

      const repositoriesData = JSON.parse(cachedValue);
      
      // Se é um resultado processado (com analytics), retorna como está
      if (repositoriesData.repositories && Array.isArray(repositoriesData.repositories)) {
        return repositoriesData;
      }
      
      // Se é um array simples de repositórios, converte para entidades
      if (Array.isArray(repositoriesData)) {
        return repositoriesData.map(repoData => Repository.fromGitHubAPI(repoData));
      }

      return null;

    } catch (error) {
      this.logger.warn(`[GitHubUserRepository] Cache read error for repositories ${username}:`, error);
      return null;
    }
  }

  /**
   * Limpa cache de um usuário específico
   */
  async clearUserCache(username) {
    if (!this.cache) return;

    try {
      const userKey = this.getUserCacheKey(username);
      const reposKey = this.getRepositoriesCacheKey(username);
      
      await Promise.all([
        this.cache.del(userKey),
        this.cache.del(reposKey)
      ]);
      
      this.logger.debug(`[GitHubUserRepository] Cache cleared for user: ${username}`);
    } catch (error) {
      this.logger.warn(`[GitHubUserRepository] Cache clear error for user ${username}:`, error);
    }
  }

  /**
   * Limpa todo o cache
   */
  async clearAllCache() {
    if (!this.cache) return;

    try {
      // Se o cache suporta flush, usa ele
      if (typeof this.cache.flush === 'function') {
        await this.cache.flush();
      } else if (typeof this.cache.flushAll === 'function') {
        await this.cache.flushAll();
      } else {
        this.logger.warn('[GitHubUserRepository] Cache does not support flush operation');
      }
      
      this.logger.debug('[GitHubUserRepository] All cache cleared');
    } catch (error) {
      this.logger.warn('[GitHubUserRepository] Cache clear all error:', error);
    }
  }

  /**
   * Métodos auxiliares para chaves de cache
   */

  getUserCacheKey(username) {
    return `github:user:${username.toLowerCase()}`;
  }

  getRepositoriesCacheKey(username) {
    return `github:repos:${username.toLowerCase()}`;
  }

  getSearchCacheKey(query, options) {
    const optionsKey = Object.keys(options)
      .sort()
      .map(key => `${key}:${options[key]}`)
      .join('|');
    
    return `github:search:${query}:${optionsKey}`;
  }

  /**
   * Obtém estatísticas do repositório
   */
  getStats() {
    return {
      httpClient: this.httpClient.getStats(),
      cache: this.cache ? {
        enabled: true,
        defaultTTL: this.defaultTTL
      } : {
        enabled: false
      }
    };
  }

  /**
   * Configura token de autenticação
   */
  setAuthToken(token) {
    this.httpClient.setAuthToken(token);
    this.logger.info('[GitHubUserRepository] Authentication token configured');
  }

  /**
   * Verifica saúde do repositório
   */
  async healthCheck() {
    try {
      const httpHealth = await this.httpClient.healthCheck();
      const rateLimitInfo = await this.getRateLimit();
      
      return {
        status: 'healthy',
        httpClient: httpHealth,
        rateLimit: rateLimitInfo,
        cache: this.cache ? { enabled: true } : { enabled: false }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        httpClient: { status: 'unknown' },
        cache: this.cache ? { enabled: true } : { enabled: false }
      };
    }
  }
}