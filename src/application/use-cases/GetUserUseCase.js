import { UserNotFoundError, ValidationError, NetworkError } from '../../domain/repositories/UserRepositoryInterface.js';

/**
 * GetUserUseCase - Caso de uso para buscar informações de um usuário do GitHub
 * Contém a lógica de negócio para validação, cache e busca de usuários
 */
export class GetUserUseCase {
  constructor(userRepository, logger = console) {
    this.userRepository = userRepository;
    this.logger = logger;
  }

  /**
   * Executa o caso de uso para buscar um usuário
   * @param {string} username - Nome de usuário do GitHub
   * @param {Object} options - Opções de configuração
   * @param {boolean} options.useCache - Se deve usar cache (padrão: true)
   * @param {boolean} options.forceRefresh - Força atualização ignorando cache (padrão: false)
   * @returns {Promise<{user: User, fromCache: boolean}>} Usuário encontrado e origem
   */
  async execute(username, options = {}) {
    const { useCache = true, forceRefresh = false } = options;

    try {
      // 1. Validação de entrada
      this.validateInput(username);

      // 2. Normalização do username
      const normalizedUsername = this.normalizeUsername(username);

      // 3. Log da operação
      this.logger.info(`[GetUserUseCase] Searching for user: ${normalizedUsername}`);

      // 4. Tentativa de busca no cache (se habilitado e não forçando refresh)
      if (useCache && !forceRefresh) {
        const cachedUser = await this.getCachedUser(normalizedUsername);
        if (cachedUser) {
          this.logger.info(`[GetUserUseCase] User found in cache: ${normalizedUsername}`);
          return {
            user: cachedUser,
            fromCache: true,
            timestamp: new Date().toISOString()
          };
        }
      }

      // 5. Busca na fonte de dados externa
      const user = await this.fetchUserFromRepository(normalizedUsername);

      // 6. Cache do resultado (se habilitado)
      if (useCache) {
        await this.cacheUser(normalizedUsername, user);
      }

      // 7. Log de sucesso
      this.logger.info(`[GetUserUseCase] User successfully retrieved: ${normalizedUsername}`);

      // 8. Retorno do resultado
      return {
        user,
        fromCache: false,
        timestamp: new Date().toISOString(),
        metadata: this.generateUserMetadata(user)
      };

    } catch (error) {
      // Log do erro
      this.logger.error(`[GetUserUseCase] Error searching user ${username}:`, error);

      // Re-lança o erro com contexto adicional
      throw this.handleError(error, username);
    }
  }

  /**
   * Valida os dados de entrada
   * @param {string} username - Nome de usuário a ser validado
   * @throws {ValidationError} Se a validação falhar
   */
  validateInput(username) {
    if (!username) {
      throw new ValidationError('username', username, 'Username is required');
    }

    if (typeof username !== 'string') {
      throw new ValidationError('username', username, 'Username must be a string');
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length === 0) {
      throw new ValidationError('username', username, 'Username cannot be empty');
    }

    // Validação de formato básico do GitHub username
    const githubUsernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]){0,38}$/;
    if (!githubUsernameRegex.test(trimmedUsername)) {
      throw new ValidationError(
        'username', 
        username, 
        'Username must contain only alphanumeric characters and hyphens, cannot start or end with hyphen, and be up to 39 characters'
      );
    }
  }

  /**
   * Normaliza o username removendo espaços e convertendo para lowercase
   * @param {string} username - Username a ser normalizado
   * @returns {string} Username normalizado
   */
  normalizeUsername(username) {
    return username.trim().toLowerCase();
  }

  /**
   * Busca usuário no cache
   * @param {string} username - Nome de usuário
   * @returns {Promise<User|null>} Usuário do cache ou null
   */
  async getCachedUser(username) {
    try {
      return await this.userRepository.getCachedUser(username);
    } catch (error) {
      // Log do erro mas não falha a operação
      this.logger.warn(`[GetUserUseCase] Cache read error for ${username}:`, error);
      return null;
    }
  }

  /**
   * Busca usuário no repositório
   * @param {string} username - Nome de usuário
   * @returns {Promise<User>} Usuário encontrado
   */
  async fetchUserFromRepository(username) {
    return await this.userRepository.findByUsername(username);
  }

  /**
   * Salva usuário no cache
   * @param {string} username - Nome de usuário
   * @param {User} user - Entidade User
   */
  async cacheUser(username, user) {
    try {
      // Cache por 5 minutos (300 segundos)
      await this.userRepository.cacheUser(username, user, 300);
      this.logger.debug(`[GetUserUseCase] User cached: ${username}`);
    } catch (error) {
      // Log do erro mas não falha a operação principal
      this.logger.warn(`[GetUserUseCase] Cache write error for ${username}:`, error);
    }
  }

  /**
   * Gera metadados adicionais sobre o usuário
   * @param {User} user - Entidade User
   * @returns {Object} Metadados do usuário
   */
  generateUserMetadata(user) {
    return {
      hasCompleteProfile: user.hasCompleteProfile,
      engagementScore: user.engagementScore,
      isActiveUser: user.isActiveUser,
      formattedStats: {
        followers: user.formattedFollowers,
        following: user.formattedFollowing,
        publicRepos: user.formattedPublicRepos
      },
      profileCompleteness: this.calculateProfileCompleteness(user)
    };
  }

  /**
   * Calcula a completude do perfil do usuário
   * @param {User} user - Entidade User
   * @returns {Object} Informações sobre completude do perfil
   */
  calculateProfileCompleteness(user) {
    const fields = [
      { name: 'name', value: user.name, weight: 20 },
      { name: 'bio', value: user.bio, weight: 15 },
      { name: 'location', value: user.location, weight: 10 },
      { name: 'company', value: user.company, weight: 10 },
      { name: 'blog', value: user.blog, weight: 10 },
      { name: 'email', value: user.email, weight: 15 },
      { name: 'twitter', value: user.twitterUsername, weight: 10 }
    ];

    const completedFields = fields.filter(field => field.value);
    const totalWeight = fields.reduce((sum, field) => sum + field.weight, 0);
    const completedWeight = completedFields.reduce((sum, field) => sum + field.weight, 0);
    
    const percentage = Math.round((completedWeight / totalWeight) * 100);

    return {
      percentage,
      completedFields: completedFields.map(f => f.name),
      missingFields: fields.filter(f => !f.value).map(f => f.name),
      suggestions: this.generateProfileSuggestions(user)
    };
  }

  /**
   * Gera sugestões para melhorar o perfil
   * @param {User} user - Entidade User
   * @returns {string[]} Array de sugestões
   */
  generateProfileSuggestions(user) {
    const suggestions = [];

    if (!user.name) suggestions.push('Adicione seu nome completo');
    if (!user.bio) suggestions.push('Escreva uma bio descrevendo suas atividades');
    if (!user.location) suggestions.push('Adicione sua localização');
    if (!user.company) suggestions.push('Mencione sua empresa ou organização');
    if (!user.blog) suggestions.push('Adicione um link para seu website ou blog');
    if (!user.email) suggestions.push('Torne seu email público se desejar');

    return suggestions;
  }

  /**
   * Trata erros específicos do caso de uso
   * @param {Error} error - Erro original
   * @param {string} username - Username que causou o erro
   * @returns {Error} Erro tratado
   */
  handleError(error, username) {
    if (error instanceof UserNotFoundError) {
      return error; // Re-lança como está
    }

    if (error instanceof ValidationError) {
      return error; // Re-lança como está
    }

    if (error instanceof NetworkError) {
      return new NetworkError(
        `Failed to fetch user '${username}': ${error.message}`,
        error
      );
    }

    // Para outros erros, envolve em NetworkError
    return new NetworkError(
      `Unexpected error while fetching user '${username}': ${error.message}`,
      error
    );
  }

  /**
   * Verifica se um usuário existe sem buscar dados completos
   * @param {string} username - Nome de usuário
   * @returns {Promise<boolean>} True se o usuário existe
   */
  async userExists(username) {
    try {
      this.validateInput(username);
      const normalizedUsername = this.normalizeUsername(username);
      return await this.userRepository.userExists(normalizedUsername);
    } catch (error) {
      this.logger.error(`[GetUserUseCase] Error checking if user exists ${username}:`, error);
      if (error instanceof ValidationError) {
        throw error;
      }
      return false;
    }
  }
}