/**
 * Repository Entity - Representa um repositório do GitHub no domínio da aplicação
 * Contém as regras de negócio e validações para repositórios
 */
export class Repository {
  constructor({
    id,
    name,
    fullName,
    description,
    htmlUrl,
    language,
    stargazersCount,
    forksCount,
    watchersCount,
    size,
    defaultBranch,
    isPrivate,
    isFork,
    hasIssues,
    hasProjects,
    hasWiki,
    hasPages,
    createdAt,
    updatedAt,
    pushedAt,
    owner
  }) {
    this.validateRequiredFields({ id, name, fullName, htmlUrl });
    
    this.id = id;
    this.name = name;
    this.fullName = fullName;
    this.description = description || null;
    this.htmlUrl = htmlUrl;
    this.language = language || null;
    this.stargazersCount = Math.max(0, stargazersCount || 0);
    this.forksCount = Math.max(0, forksCount || 0);
    this.watchersCount = Math.max(0, watchersCount || 0);
    this.size = Math.max(0, size || 0);
    this.defaultBranch = defaultBranch || 'main';
    this.isPrivate = Boolean(isPrivate);
    this.isFork = Boolean(isFork);
    this.hasIssues = Boolean(hasIssues);
    this.hasProjects = Boolean(hasProjects);
    this.hasWiki = Boolean(hasWiki);
    this.hasPages = Boolean(hasPages);
    this.createdAt = this.parseDate(createdAt);
    this.updatedAt = this.parseDate(updatedAt);
    this.pushedAt = this.parseDate(pushedAt);
    this.owner = owner;
  }

  /**
   * Valida campos obrigatórios da entidade
   */
  validateRequiredFields({ id, name, fullName, htmlUrl }) {
    if (!id) throw new Error('Repository ID is required');
    if (!name || typeof name !== 'string') throw new Error('Repository name is required and must be a string');
    if (!fullName || typeof fullName !== 'string') throw new Error('Repository full name is required and must be a string');
    if (!htmlUrl) throw new Error('Repository HTML URL is required');
  }

  /**
   * Converte string de data para objeto Date
   */
  parseDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }

  /**
   * Formata número para exibição (ex: 1000 -> 1k)
   */
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }

  /**
   * Formata tamanho do repositório em KB/MB
   */
  formatSize() {
    if (this.size >= 1024) {
      return (this.size / 1024).toFixed(1) + ' MB';
    }
    return this.size + ' KB';
  }

  /**
   * Getters formatados para apresentação
   */
  get formattedStars() {
    return this.formatNumber(this.stargazersCount);
  }

  get formattedForks() {
    return this.formatNumber(this.forksCount);
  }

  get formattedWatchers() {
    return this.formatNumber(this.watchersCount);
  }

  get formattedSize() {
    return this.formatSize();
  }

  get formattedCreatedAt() {
    return this.createdAt ? this.createdAt.toLocaleDateString('pt-BR') : null;
  }

  get formattedUpdatedAt() {
    return this.updatedAt ? this.updatedAt.toLocaleDateString('pt-BR') : null;
  }

  get formattedPushedAt() {
    return this.pushedAt ? this.pushedAt.toLocaleDateString('pt-BR') : null;
  }

  /**
   * Calcula o score de popularidade do repositório
   */
  get popularityScore() {
    const starsWeight = this.stargazersCount * 3;
    const forksWeight = this.forksCount * 2;
    const watchersWeight = this.watchersCount * 1;
    return Math.round(starsWeight + forksWeight + watchersWeight);
  }

  /**
   * Verifica se é um repositório ativo (atualizado recentemente)
   */
  get isActiveRepository() {
    if (!this.pushedAt) return false;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.pushedAt > thirtyDaysAgo;
  }

  /**
   * Verifica se é um repositório popular (baseado em stars)
   */
  get isPopular() {
    return this.stargazersCount >= 100;
  }

  /**
   * Verifica se é um repositório bem mantido
   */
  get isWellMaintained() {
    return this.hasIssues && this.hasWiki && this.isActiveRepository;
  }

  /**
   * Calcula a idade do repositório em dias
   */
  get ageInDays() {
    if (!this.createdAt) return null;
    const now = new Date();
    const diffTime = Math.abs(now - this.createdAt);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Verifica se é um repositório novo (criado nos últimos 30 dias)
   */
  get isNewRepository() {
    return this.ageInDays !== null && this.ageInDays <= 30;
  }

  /**
   * Gera URLs úteis do repositório
   */
  get issuesUrl() {
    return `${this.htmlUrl}/issues`;
  }

  get pullRequestsUrl() {
    return `${this.htmlUrl}/pulls`;
  }

  get wikiUrl() {
    return this.hasWiki ? `${this.htmlUrl}/wiki` : null;
  }

  get releasesUrl() {
    return `${this.htmlUrl}/releases`;
  }

  get contributorsUrl() {
    return `${this.htmlUrl}/graphs/contributors`;
  }

  /**
   * Retorna um resumo das estatísticas do repositório
   */
  get statsummary() {
    return {
      stars: this.stargazersCount,
      forks: this.forksCount,
      watchers: this.watchersCount,
      language: this.language,
      isActive: this.isActiveRepository,
      isPopular: this.isPopular,
      isWellMaintained: this.isWellMaintained,
      popularityScore: this.popularityScore
    };
  }

  /**
   * Converte para objeto simples para serialização
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      fullName: this.fullName,
      description: this.description,
      htmlUrl: this.htmlUrl,
      language: this.language,
      stargazersCount: this.stargazersCount,
      forksCount: this.forksCount,
      watchersCount: this.watchersCount,
      size: this.size,
      defaultBranch: this.defaultBranch,
      isPrivate: this.isPrivate,
      isFork: this.isFork,
      hasIssues: this.hasIssues,
      hasProjects: this.hasProjects,
      hasWiki: this.hasWiki,
      hasPages: this.hasPages,
      createdAt: this.createdAt?.toISOString(),
      updatedAt: this.updatedAt?.toISOString(),
      pushedAt: this.pushedAt?.toISOString(),
      owner: this.owner,
      // Propriedades calculadas
      popularityScore: this.popularityScore,
      isActiveRepository: this.isActiveRepository,
      isPopular: this.isPopular,
      isWellMaintained: this.isWellMaintained,
      ageInDays: this.ageInDays,
      isNewRepository: this.isNewRepository
    };
  }

  /**
   * Cria uma instância Repository a partir de dados da API do GitHub
   */
  static fromGitHubAPI(apiData) {
    return new Repository({
      id: apiData.id,
      name: apiData.name,
      fullName: apiData.full_name,
      description: apiData.description,
      htmlUrl: apiData.html_url,
      language: apiData.language,
      stargazersCount: apiData.stargazers_count,
      forksCount: apiData.forks_count,
      watchersCount: apiData.watchers_count,
      size: apiData.size,
      defaultBranch: apiData.default_branch,
      isPrivate: apiData.private,
      isFork: apiData.fork,
      hasIssues: apiData.has_issues,
      hasProjects: apiData.has_projects,
      hasWiki: apiData.has_wiki,
      hasPages: apiData.has_pages,
      createdAt: apiData.created_at,
      updatedAt: apiData.updated_at,
      pushedAt: apiData.pushed_at,
      owner: apiData.owner
    });
  }
}