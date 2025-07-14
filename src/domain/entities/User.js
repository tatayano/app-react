/**
 * User Entity - Representa um usuário do GitHub no domínio da aplicação
 * Contém as regras de negócio e validações básicas
 */
export class User {
  constructor({
    id,
    login,
    name,
    email,
    bio,
    avatarUrl,
    htmlUrl,
    location,
    company,
    blog,
    twitterUsername,
    followers,
    following,
    publicRepos,
    createdAt,
    updatedAt
  }) {
    this.validateRequiredFields({ id, login, avatarUrl, htmlUrl });
    
    this.id = id;
    this.login = login;
    this.name = name || null;
    this.email = email || null;
    this.bio = bio || null;
    this.avatarUrl = avatarUrl;
    this.htmlUrl = htmlUrl;
    this.location = location || null;
    this.company = company || null;
    this.blog = this.formatBlogUrl(blog);
    this.twitterUsername = twitterUsername || null;
    this.followers = Math.max(0, followers || 0);
    this.following = Math.max(0, following || 0);
    this.publicRepos = Math.max(0, publicRepos || 0);
    this.createdAt = this.parseDate(createdAt);
    this.updatedAt = this.parseDate(updatedAt);
  }

  /**
   * Valida campos obrigatórios da entidade
   */
  validateRequiredFields({ id, login, avatarUrl, htmlUrl }) {
    if (!id) throw new Error('User ID is required');
    if (!login || typeof login !== 'string') throw new Error('User login is required and must be a string');
    if (!avatarUrl) throw new Error('User avatar URL is required');
    if (!htmlUrl) throw new Error('User HTML URL is required');
  }

  /**
   * Formata URL do blog para incluir protocolo se necessário
   */
  formatBlogUrl(blog) {
    if (!blog || typeof blog !== 'string') return null;
    
    const trimmedBlog = blog.trim();
    if (!trimmedBlog) return null;
    
    // Adiciona https:// se não tiver protocolo
    if (!trimmedBlog.startsWith('http://') && !trimmedBlog.startsWith('https://')) {
      return `https://${trimmedBlog}`;
    }
    
    return trimmedBlog;
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
   * Getters formatados para apresentação
   */
  get formattedFollowers() {
    return this.formatNumber(this.followers);
  }

  get formattedFollowing() {
    return this.formatNumber(this.following);
  }

  get formattedPublicRepos() {
    return this.formatNumber(this.publicRepos);
  }

  get formattedCreatedAt() {
    return this.createdAt ? this.createdAt.toLocaleDateString('pt-BR') : null;
  }

  get formattedUpdatedAt() {
    return this.updatedAt ? this.updatedAt.toLocaleDateString('pt-BR') : null;
  }

  /**
   * Verifica se o usuário tem informações completas
   */
  get hasCompleteProfile() {
    return !!(this.name && this.bio && this.location);
  }

  /**
   * Calcula o score de engajamento baseado em seguidores e repos
   */
  get engagementScore() {
    const followersWeight = this.followers * 0.7;
    const reposWeight = this.publicRepos * 0.3;
    return Math.round(followersWeight + reposWeight);
  }

  /**
   * Verifica se é um usuário ativo (atualizado recentemente)
   */
  get isActiveUser() {
    if (!this.updatedAt) return false;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.updatedAt > thirtyDaysAgo;
  }

  /**
   * Converte para objeto simples para serialização
   */
  toJSON() {
    return {
      id: this.id,
      login: this.login,
      name: this.name,
      email: this.email,
      bio: this.bio,
      avatarUrl: this.avatarUrl,
      htmlUrl: this.htmlUrl,
      location: this.location,
      company: this.company,
      blog: this.blog,
      twitterUsername: this.twitterUsername,
      followers: this.followers,
      following: this.following,
      publicRepos: this.publicRepos,
      createdAt: this.createdAt?.toISOString(),
      updatedAt: this.updatedAt?.toISOString(),
      // Propriedades calculadas
      hasCompleteProfile: this.hasCompleteProfile,
      engagementScore: this.engagementScore,
      isActiveUser: this.isActiveUser
    };
  }

  /**
   * Cria uma instância User a partir de dados da API do GitHub
   */
  static fromGitHubAPI(apiData) {
    return new User({
      id: apiData.id,
      login: apiData.login,
      name: apiData.name,
      email: apiData.email,
      bio: apiData.bio,
      avatarUrl: apiData.avatar_url,
      htmlUrl: apiData.html_url,
      location: apiData.location,
      company: apiData.company,
      blog: apiData.blog,
      twitterUsername: apiData.twitter_username,
      followers: apiData.followers,
      following: apiData.following,
      publicRepos: apiData.public_repos,
      createdAt: apiData.created_at,
      updatedAt: apiData.updated_at
    });
  }
}