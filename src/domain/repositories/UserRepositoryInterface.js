/**
 * UserRepositoryInterface - Interface que define o contrato para o repositório de usuários
 * Seguindo o padrão Repository Pattern e Dependency Inversion Principle
 */
export class UserRepositoryInterface {
  /**
   * Busca um usuário pelo username
   * @param {string} username - Nome de usuário do GitHub
   * @returns {Promise<User>} Retorna uma Promise com a entidade User
   * @throws {UserNotFoundError} Quando o usuário não é encontrado
   * @throws {NetworkError} Quando há problemas de conectividade
   */
  async findByUsername(username) {
    throw new Error('Method findByUsername must be implemented');
  }

  /**
   * Busca os repositórios de um usuário
   * @param {string} username - Nome de usuário do GitHub
   * @param {Object} options - Opções de paginação e filtros
   * @param {number} options.page - Página atual (padrão: 1)
   * @param {number} options.perPage - Itens por página (padrão: 30)
   * @param {string} options.sort - Campo para ordenação (padrão: 'updated')
   * @param {string} options.direction - Direção da ordenação (padrão: 'desc')
   * @returns {Promise<Repository[]>} Retorna uma Promise com array de entidades Repository
   * @throws {UserNotFoundError} Quando o usuário não é encontrado
   * @throws {NetworkError} Quando há problemas de conectividade
   */
  async findUserRepositories(username, options = {}) {
    throw new Error('Method findUserRepositories must be implemented');
  }

  /**
   * Busca usuários por critério de pesquisa
   * @param {string} query - Termo de busca
   * @param {Object} options - Opções de paginação e filtros
   * @param {number} options.page - Página atual (padrão: 1)
   * @param {number} options.perPage - Itens por página (padrão: 30)
   * @param {string} options.sort - Campo para ordenação (padrão: 'best-match')
   * @returns {Promise<{users: User[], totalCount: number}>} Usuários encontrados e total
   * @throws {NetworkError} Quando há problemas de conectividade
   */
  async searchUsers(query, options = {}) {
    throw new Error('Method searchUsers must be implemented');
  }

  /**
   * Verifica se um usuário existe
   * @param {string} username - Nome de usuário do GitHub
   * @returns {Promise<boolean>} Retorna true se o usuário existe
   */
  async userExists(username) {
    throw new Error('Method userExists must be implemented');
  }

  /**
   * Obtém informações de rate limit da API
   * @returns {Promise<{limit: number, remaining: number, reset: Date}>} Informações de rate limit
   */
  async getRateLimit() {
    throw new Error('Method getRateLimit must be implemented');
  }

  /**
   * Cache methods (opcionais para implementações que suportam cache)
   */

  /**
   * Salva usuário no cache
   * @param {string} username - Nome de usuário
   * @param {User} user - Entidade User
   * @param {number} ttl - Time to live em segundos (opcional)
   */
  async cacheUser(username, user, ttl) {
    // Implementação opcional
  }

  /**
   * Salva repositórios no cache
   * @param {string} username - Nome de usuário
   * @param {Repository[]} repositories - Array de entidades Repository
   * @param {number} ttl - Time to live em segundos (opcional)
   */
  async cacheUserRepositories(username, repositories, ttl) {
    // Implementação opcional
  }

  /**
   * Busca usuário no cache
   * @param {string} username - Nome de usuário
   * @returns {Promise<User|null>} Usuário do cache ou null
   */
  async getCachedUser(username) {
    // Implementação opcional
    return null;
  }

  /**
   * Busca repositórios no cache
   * @param {string} username - Nome de usuário
   * @returns {Promise<Repository[]|null>} Repositórios do cache ou null
   */
  async getCachedUserRepositories(username) {
    // Implementação opcional
    return null;
  }

  /**
   * Limpa cache de um usuário específico
   * @param {string} username - Nome de usuário
   */
  async clearUserCache(username) {
    // Implementação opcional
  }

  /**
   * Limpa todo o cache
   */
  async clearAllCache() {
    // Implementação opcional
  }
}

/**
 * Errors específicos do domínio
 */
export class UserNotFoundError extends Error {
  constructor(username) {
    super(`User '${username}' not found`);
    this.name = 'UserNotFoundError';
    this.username = username;
  }
}

export class NetworkError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

export class RateLimitError extends Error {
  constructor(limit, reset) {
    super(`API rate limit exceeded. Limit: ${limit}, Reset: ${reset}`);
    this.name = 'RateLimitError';
    this.limit = limit;
    this.reset = reset;
  }
}

export class ValidationError extends Error {
  constructor(field, value, message) {
    super(`Validation failed for field '${field}' with value '${value}': ${message}`);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}