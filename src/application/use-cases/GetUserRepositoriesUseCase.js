import { UserNotFoundError, ValidationError, NetworkError } from '../../domain/repositories/UserRepositoryInterface.js';

/**
 * GetUserRepositoriesUseCase - Caso de uso para buscar repositórios de um usuário
 * Contém lógica de negócio para filtragem, ordenação e análise de repositórios
 */
export class GetUserRepositoriesUseCase {
  constructor(userRepository, logger = console) {
    this.userRepository = userRepository;
    this.logger = logger;
    
    // Configurações padrão
    this.defaultOptions = {
      page: 1,
      perPage: 30,
      sort: 'updated',
      direction: 'desc',
      useCache: true,
      forceRefresh: false,
      includeAnalytics: true
    };
  }

  /**
   * Executa o caso de uso para buscar repositórios de um usuário
   * @param {string} username - Nome de usuário do GitHub
   * @param {Object} options - Opções de configuração
   * @returns {Promise<Object>} Repositórios e análises
   */
  async execute(username, options = {}) {
    const config = { ...this.defaultOptions, ...options };

    try {
      // 1. Validação de entrada
      this.validateInput(username, config);

      // 2. Normalização do username
      const normalizedUsername = this.normalizeUsername(username);

      // 3. Log da operação
      this.logger.info(`[GetUserRepositoriesUseCase] Fetching repositories for: ${normalizedUsername}`);

      // 4. Tentativa de busca no cache
      if (config.useCache && !config.forceRefresh) {
        const cachedResult = await this.getCachedRepositories(normalizedUsername, config);
        if (cachedResult) {
          this.logger.info(`[GetUserRepositoriesUseCase] Repositories found in cache: ${normalizedUsername}`);
          return {
            ...cachedResult,
            fromCache: true,
            timestamp: new Date().toISOString()
          };
        }
      }

      // 5. Busca na fonte de dados externa
      const repositories = await this.fetchRepositoriesFromRepository(normalizedUsername, config);

      // 6. Processamento e análise dos dados
      const processedResult = await this.processRepositories(repositories, config);

      // 7. Cache do resultado
      if (config.useCache) {
        await this.cacheRepositories(normalizedUsername, processedResult, config);
      }

      // 8. Log de sucesso
      this.logger.info(`[GetUserRepositoriesUseCase] Successfully retrieved ${repositories.length} repositories for: ${normalizedUsername}`);

      // 9. Retorno do resultado
      return {
        ...processedResult,
        fromCache: false,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error(`[GetUserRepositoriesUseCase] Error fetching repositories for ${username}:`, error);
      throw this.handleError(error, username);
    }
  }

  /**
   * Valida os dados de entrada
   */
  validateInput(username, options) {
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      throw new ValidationError('username', username, 'Username is required and must be a non-empty string');
    }

    if (options.page && (!Number.isInteger(options.page) || options.page < 1)) {
      throw new ValidationError('page', options.page, 'Page must be a positive integer');
    }

    if (options.perPage && (!Number.isInteger(options.perPage) || options.perPage < 1 || options.perPage > 100)) {
      throw new ValidationError('perPage', options.perPage, 'PerPage must be an integer between 1 and 100');
    }

    const validSortOptions = ['created', 'updated', 'pushed', 'full_name'];
    if (options.sort && !validSortOptions.includes(options.sort)) {
      throw new ValidationError('sort', options.sort, `Sort must be one of: ${validSortOptions.join(', ')}`);
    }

    const validDirections = ['asc', 'desc'];
    if (options.direction && !validDirections.includes(options.direction)) {
      throw new ValidationError('direction', options.direction, `Direction must be one of: ${validDirections.join(', ')}`);
    }
  }

  /**
   * Normaliza o username
   */
  normalizeUsername(username) {
    return username.trim().toLowerCase();
  }

  /**
   * Busca repositórios no cache
   */
  async getCachedRepositories(username, options) {
    try {
      const cacheKey = this.generateCacheKey(username, options);
      return await this.userRepository.getCachedUserRepositories(cacheKey);
    } catch (error) {
      this.logger.warn(`[GetUserRepositoriesUseCase] Cache read error for ${username}:`, error);
      return null;
    }
  }

  /**
   * Busca repositórios no repositório
   */
  async fetchRepositoriesFromRepository(username, options) {
    return await this.userRepository.findUserRepositories(username, {
      page: options.page,
      perPage: options.perPage,
      sort: options.sort,
      direction: options.direction
    });
  }

  /**
   * Processa e analisa os repositórios
   */
  async processRepositories(repositories, options) {
    // 1. Filtros básicos
    const filteredRepositories = this.applyFilters(repositories, options);

    // 2. Ordenação customizada
    const sortedRepositories = this.applySorting(filteredRepositories, options);

    // 3. Análises (se habilitadas)
    const analytics = options.includeAnalytics 
      ? this.generateAnalytics(repositories)
      : null;

    // 4. Categorização
    const categorization = this.categorizeRepositories(repositories);

    // 5. Estatísticas
    const statistics = this.generateStatistics(repositories);

    return {
      repositories: sortedRepositories,
      totalCount: repositories.length,
      filteredCount: filteredRepositories.length,
      analytics,
      categorization,
      statistics,
      pagination: {
        page: options.page,
        perPage: options.perPage,
        hasMore: sortedRepositories.length === options.perPage
      }
    };
  }

  /**
   * Aplica filtros nos repositórios
   */
  applyFilters(repositories, options) {
    let filtered = [...repositories];

    // Filtro por linguagem
    if (options.language) {
      filtered = filtered.filter(repo => 
        repo.language && repo.language.toLowerCase() === options.language.toLowerCase()
      );
    }

    // Filtro por tipo (fork/original)
    if (options.type === 'fork') {
      filtered = filtered.filter(repo => repo.isFork);
    } else if (options.type === 'source') {
      filtered = filtered.filter(repo => !repo.isFork);
    }

    // Filtro por popularidade mínima
    if (options.minStars) {
      filtered = filtered.filter(repo => repo.stargazersCount >= options.minStars);
    }

    // Filtro por atividade (repositórios ativos)
    if (options.activeOnly) {
      filtered = filtered.filter(repo => repo.isActiveRepository);
    }

    return filtered;
  }

  /**
   * Aplica ordenação customizada
   */
  applySorting(repositories, options) {
    const sorted = [...repositories];

    // Ordenações customizadas além das padrão da API
    if (options.customSort) {
      switch (options.customSort) {
        case 'popularity':
          return sorted.sort((a, b) => b.popularityScore - a.popularityScore);
        
        case 'stars':
          return sorted.sort((a, b) => b.stargazersCount - a.stargazersCount);
        
        case 'forks':
          return sorted.sort((a, b) => b.forksCount - a.forksCount);
        
        case 'size':
          return sorted.sort((a, b) => b.size - a.size);
        
        case 'name':
          return sorted.sort((a, b) => a.name.localeCompare(b.name));
        
        case 'language':
          return sorted.sort((a, b) => {
            if (!a.language && !b.language) return 0;
            if (!a.language) return 1;
            if (!b.language) return -1;
            return a.language.localeCompare(b.language);
          });
        
        default:
          return sorted;
      }
    }

    return sorted;
  }

  /**
   * Gera análises dos repositórios
   */
  generateAnalytics(repositories) {
    const totalRepos = repositories.length;
    if (totalRepos === 0) return null;

    // Análise de linguagens
    const languageAnalysis = this.analyzeLanguages(repositories);
    
    // Análise de atividade
    const activityAnalysis = this.analyzeActivity(repositories);
    
    // Análise de popularidade
    const popularityAnalysis = this.analyzePopularity(repositories);
    
    // Tendências
    const trends = this.analyzeTrends(repositories);

    return {
      overview: {
        totalRepositories: totalRepos,
        publicRepositories: repositories.filter(r => !r.isPrivate).length,
        forkedRepositories: repositories.filter(r => r.isFork).length,
        originalRepositories: repositories.filter(r => !r.isFork).length
      },
      languages: languageAnalysis,
      activity: activityAnalysis,
      popularity: popularityAnalysis,
      trends
    };
  }

  /**
   * Analisa distribuição de linguagens
   */
  analyzeLanguages(repositories) {
    const languageCount = {};
    const languageStars = {};

    repositories.forEach(repo => {
      if (repo.language) {
        languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
        languageStars[repo.language] = (languageStars[repo.language] || 0) + repo.stargazersCount;
      }
    });

    const languages = Object.entries(languageCount)
      .map(([language, count]) => ({
        language,
        repositories: count,
        totalStars: languageStars[language],
        percentage: Math.round((count / repositories.length) * 100)
      }))
      .sort((a, b) => b.repositories - a.repositories);

    return {
      total: Object.keys(languageCount).length,
      mostUsed: languages[0]?.language || null,
      distribution: languages.slice(0, 10), // Top 10
      diversity: Math.round((Object.keys(languageCount).length / repositories.length) * 100)
    };
  }

  /**
   * Analisa atividade dos repositórios
   */
  analyzeActivity(repositories) {
    const activeRepos = repositories.filter(r => r.isActiveRepository);
    const inactiveRepos = repositories.filter(r => !r.isActiveRepository);

    // Análise por idade
    const newRepos = repositories.filter(r => r.isNewRepository);
    
    return {
      activeRepositories: activeRepos.length,
      inactiveRepositories: inactiveRepos.length,
      newRepositories: newRepos.length,
      activityPercentage: Math.round((activeRepos.length / repositories.length) * 100),
      averageAge: this.calculateAverageAge(repositories)
    };
  }

  /**
   * Analisa popularidade dos repositórios
   */
  analyzePopularity(repositories) {
    const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazersCount, 0);
    const totalForks = repositories.reduce((sum, repo) => sum + repo.forksCount, 0);
    const popularRepos = repositories.filter(r => r.isPopular);

    const topRepos = repositories
      .filter(r => r.stargazersCount > 0)
      .sort((a, b) => b.stargazersCount - a.stargazersCount)
      .slice(0, 5);

    return {
      totalStars,
      totalForks,
      popularRepositories: popularRepos.length,
      averageStars: Math.round(totalStars / repositories.length),
      topRepositories: topRepos.map(repo => ({
        name: repo.name,
        stars: repo.stargazersCount,
        forks: repo.forksCount,
        language: repo.language
      }))
    };
  }

  /**
   * Analisa tendências
   */
  analyzeTrends(repositories) {
    // Atividade recente (últimos 30 dias)
    const recentActivity = repositories.filter(repo => repo.isActiveRepository);
    
    // Crescimento (repositórios novos)
    const growth = repositories.filter(repo => repo.isNewRepository);

    return {
      recentActivity: recentActivity.length,
      growth: growth.length,
      momentum: this.calculateMomentum(repositories)
    };
  }

  /**
   * Categoriza repositórios
   */
  categorizeRepositories(repositories) {
    return {
      byType: {
        original: repositories.filter(r => !r.isFork),
        forked: repositories.filter(r => r.isFork)
      },
      byActivity: {
        active: repositories.filter(r => r.isActiveRepository),
        inactive: repositories.filter(r => !r.isActiveRepository)
      },
      byPopularity: {
        popular: repositories.filter(r => r.isPopular),
        standard: repositories.filter(r => !r.isPopular)
      },
      byMaintenance: {
        wellMaintained: repositories.filter(r => r.isWellMaintained),
        needsAttention: repositories.filter(r => !r.isWellMaintained)
      }
    };
  }

  /**
   * Gera estatísticas gerais
   */
  generateStatistics(repositories) {
    return {
      total: repositories.length,
      totalStars: repositories.reduce((sum, repo) => sum + repo.stargazersCount, 0),
      totalForks: repositories.reduce((sum, repo) => sum + repo.forksCount, 0),
      totalWatchers: repositories.reduce((sum, repo) => sum + repo.watchersCount, 0),
      averageSize: Math.round(repositories.reduce((sum, repo) => sum + repo.size, 0) / repositories.length),
      languageCount: new Set(repositories.map(r => r.language).filter(Boolean)).size
    };
  }

  /**
   * Calcula idade média dos repositórios
   */
  calculateAverageAge(repositories) {
    const ages = repositories
      .map(repo => repo.ageInDays)
      .filter(age => age !== null);
    
    return ages.length > 0 
      ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length)
      : 0;
  }

  /**
   * Calcula momentum baseado em atividade recente
   */
  calculateMomentum(repositories) {
    const recentActivity = repositories.filter(r => r.isActiveRepository).length;
    const totalRepos = repositories.length;
    
    if (totalRepos === 0) return 0;
    
    const activityRatio = recentActivity / totalRepos;
    const averageStars = repositories.reduce((sum, repo) => sum + repo.stargazersCount, 0) / totalRepos;
    
    // Fórmula simples para momentum
    return Math.round((activityRatio * 50) + (Math.log(averageStars + 1) * 10));
  }

  /**
   * Gera chave de cache
   */
  generateCacheKey(username, options) {
    const keyParts = [
      username,
      options.page,
      options.perPage,
      options.sort,
      options.direction,
      options.language || 'all',
      options.type || 'all'
    ];
    return keyParts.join('_');
  }

  /**
   * Salva no cache
   */
  async cacheRepositories(username, result, options) {
    try {
      const cacheKey = this.generateCacheKey(username, options);
      // Cache por 10 minutos
      await this.userRepository.cacheUserRepositories(cacheKey, result, 600);
      this.logger.debug(`[GetUserRepositoriesUseCase] Repositories cached: ${cacheKey}`);
    } catch (error) {
      this.logger.warn(`[GetUserRepositoriesUseCase] Cache write error:`, error);
    }
  }

  /**
   * Trata erros
   */
  handleError(error, username) {
    if (error instanceof UserNotFoundError) {
      return error;
    }

    if (error instanceof ValidationError) {
      return error;
    }

    if (error instanceof NetworkError) {
      return new NetworkError(
        `Failed to fetch repositories for '${username}': ${error.message}`,
        error
      );
    }

    return new NetworkError(
      `Unexpected error while fetching repositories for '${username}': ${error.message}`,
      error
    );
  }
}