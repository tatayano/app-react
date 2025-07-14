import React, { useState, useCallback } from 'react';
import { useApp, useDependencies } from '../context/AppContext.js';
import { useUser } from '../hooks/useUser.js';
import { SearchForm } from '../components/SearchForm.js';
import { UserProfile } from '../components/UserProfile.js';
import { RepositoryList } from '../components/RepositoryList.js';
import { Analytics } from '../components/Analytics.js';
import { ErrorBoundary } from '../components/ErrorBoundary.js';
import { LoadingState } from '../components/LoadingState.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * GitHubExplorer - Componente principal da aplicação
 * Implementa Clean Architecture na camada de apresentação
 */
export const GitHubExplorer = () => {
  const { 
    appState, 
    toggleTheme, 
    showError, 
    showSuccess, 
    showInfo 
  } = useApp();
  
  const { 
    getUserUseCase, 
    getUserRepositoriesUseCase 
  } = useDependencies();

  // Hook personalizado que encapsula a lógica de usuários
  const {
    user,
    repositories,
    analytics,
    isLoading,
    isLoadingUser,
    isLoadingRepositories,
    hasErrors,
    userError,
    repositoriesError,
    userFromCache,
    repositoriesFromCache,
    hasData,
    hasRepositories,
    hasAnalytics,
    fetchUserProfile,
    refreshUser,
    refreshRepositories,
    clearData,
    filterRepositories,
    sortRepositories,
    getCalculatedStats,
    getErrorMessage,
    isUserNotFoundError,
    isNetworkError
  } = useUser(getUserUseCase, getUserRepositoriesUseCase);

  // Estados da interface
  const [searchHistory, setSearchHistory] = useState([]);
  const [activeView, setActiveView] = useState('profile'); // 'profile', 'repositories', 'analytics'
  const [repositoryFilters, setRepositoryFilters] = useState({
    language: '',
    type: 'all', // 'all', 'source', 'fork'
    sort: 'updated',
    minStars: 0,
    activeOnly: false
  });

  /**
   * Manipula a busca de usuário
   */
  const handleSearch = useCallback(async (username) => {
    try {
      clearData();
      
      // Mostra loading info
      showInfo(`Buscando informações do usuário ${username}...`);

      // Executa busca completa
      const result = await fetchUserProfile(username, {
        userOptions: { useCache: true },
        repositoriesOptions: { 
          useCache: true,
          includeAnalytics: true,
          perPage: 50
        }
      });

      // Atualiza histórico de busca
      setSearchHistory(prev => {
        const newHistory = [username, ...prev.filter(u => u !== username)];
        return newHistory.slice(0, 10); // Mantém apenas os últimos 10
      });

      // Mostra mensagens de sucesso
      if (result.user) {
        const cacheMsg = result.user.fromCache ? ' (do cache)' : '';
        showSuccess(`Usuário ${username} encontrado${cacheMsg}!`);
      }

      // Mostra warnings se houver problemas com repositórios
      if (result.userError) {
        showError('Erro ao buscar dados do usuário', result.userError.message);
      }
      
      if (result.repositoriesError && !isUserNotFoundError) {
        showError('Erro ao buscar repositórios', result.repositoriesError.message);
      }

    } catch (error) {
      showError('Erro na busca', getErrorMessage());
    }
  }, [
    fetchUserProfile, 
    clearData, 
    showInfo, 
    showSuccess, 
    showError, 
    getErrorMessage, 
    isUserNotFoundError
  ]);

  /**
   * Manipula refresh dos dados
   */
  const handleRefresh = useCallback(async () => {
    if (!user) return;

    try {
      showInfo('Atualizando dados...');
      
      if (activeView === 'profile') {
        await refreshUser(user.login);
        showSuccess('Dados do usuário atualizados!');
      } else {
        await refreshRepositories(user.login);
        showSuccess('Repositórios atualizados!');
      }
    } catch (error) {
      showError('Erro ao atualizar', getErrorMessage());
    }
  }, [user, activeView, refreshUser, refreshRepositories, showInfo, showSuccess, showError, getErrorMessage]);

  /**
   * Aplica filtros nos repositórios
   */
  const getFilteredRepositories = useCallback(() => {
    if (!repositories.length) return [];

    return filterRepositories(repo => {
      // Filtro por linguagem
      if (repositoryFilters.language && repo.language !== repositoryFilters.language) {
        return false;
      }

      // Filtro por tipo
      if (repositoryFilters.type === 'source' && repo.isFork) return false;
      if (repositoryFilters.type === 'fork' && !repo.isFork) return false;

      // Filtro por estrelas mínimas
      if (repo.stargazersCount < repositoryFilters.minStars) return false;

      // Filtro por atividade
      if (repositoryFilters.activeOnly && !repo.isActiveRepository) return false;

      return true;
    });
  }, [repositories, repositoryFilters, filterRepositories]);

  /**
   * Ordena repositórios filtrados
   */
  const getSortedRepositories = useCallback(() => {
    const filtered = getFilteredRepositories();
    
    return sortRepositories((a, b) => {
      switch (repositoryFilters.sort) {
        case 'stars':
          return b.stargazersCount - a.stargazersCount;
        case 'forks':
          return b.forksCount - a.forksCount;
        case 'updated':
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [getFilteredRepositories, sortRepositories, repositoryFilters.sort]);

  /**
   * Obtém linguagens disponíveis para filtro
   */
  const getAvailableLanguages = useCallback(() => {
    if (!repositories.length) return [];
    
    const languages = new Set(
      repositories
        .map(repo => repo.language)
        .filter(lang => lang !== null)
    );
    
    return Array.from(languages).sort();
  }, [repositories]);

  /**
   * Obtém estatísticas calculadas
   */
  const stats = getCalculatedStats();

  return (
    <ErrorBoundary>
      <div className="github-explorer">
        {/* Header */}
        <Header 
          theme={appState.theme}
          isOnline={appState.isOnline}
          onToggleTheme={toggleTheme}
          onRefresh={handleRefresh}
          canRefresh={hasData && !isLoading}
          showCache={userFromCache || repositoriesFromCache}
        />

        {/* Main Content */}
        <main className="container-fluid py-4">
          <div className="row">
            {/* Sidebar - Search and Filters */}
            <div className="col-lg-3 mb-4">
              <div className="sticky-top" style={{ top: '1rem' }}>
                <SearchForm
                  onSearch={handleSearch}
                  isLoading={isLoading}
                  searchHistory={searchHistory}
                  placeholder="Digite o username do GitHub..."
                />

                {hasData && (
                  <>
                    {/* View Selector */}
                    <ViewSelector
                      activeView={activeView}
                      onViewChange={setActiveView}
                      hasRepositories={hasRepositories}
                      hasAnalytics={hasAnalytics}
                    />

                    {/* Repository Filters */}
                    {activeView === 'repositories' && hasRepositories && (
                      <RepositoryFilters
                        filters={repositoryFilters}
                        onFiltersChange={setRepositoryFilters}
                        availableLanguages={getAvailableLanguages()}
                        totalRepositories={repositories.length}
                        filteredCount={getFilteredRepositories().length}
                      />
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="col-lg-9">
              {/* Loading State */}
              {isLoading && !hasData && (
                <LoadingState 
                  message="Buscando informações do usuário..."
                  isLoadingUser={isLoadingUser}
                  isLoadingRepositories={isLoadingRepositories}
                />
              )}

              {/* Error State */}
              {hasErrors && !hasData && (
                <ErrorState
                  error={userError || repositoriesError}
                  onRetry={() => user && handleSearch(user.login)}
                  isNetworkError={isNetworkError}
                  isUserNotFound={isUserNotFoundError}
                />
              )}

              {/* Empty State */}
              {!hasData && !isLoading && !hasErrors && (
                <EmptyState 
                  onSampleSearch={handleSearch}
                />
              )}

              {/* Content Views */}
              {hasData && (
                <>
                  {activeView === 'profile' && (
                    <UserProfile
                      user={user}
                      stats={stats?.user}
                      isLoading={isLoadingUser}
                      fromCache={userFromCache}
                    />
                  )}

                  {activeView === 'repositories' && (
                    <RepositoryList
                      repositories={getSortedRepositories()}
                      totalRepositories={repositories.length}
                      isLoading={isLoadingRepositories}
                      fromCache={repositoriesFromCache}
                      filters={repositoryFilters}
                      onFiltersChange={setRepositoryFilters}
                    />
                  )}

                  {activeView === 'analytics' && hasAnalytics && (
                    <Analytics
                      analytics={analytics}
                      user={user}
                      repositories={repositories}
                      stats={stats}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

/**
 * Componente Header
 */
const Header = ({ theme, isOnline, onToggleTheme, onRefresh, canRefresh, showCache }) => (
  <header className="border-bottom">
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center py-3">
        <div className="d-flex align-items-center">
          <i className="fab fa-github fs-2 me-3"></i>
          <div>
            <h1 className="h3 mb-0">GitHub Explorer</h1>
            <small className="text-muted">React 19 + Clean Architecture</small>
          </div>
        </div>
        
        <div className="d-flex align-items-center gap-2">
          {!isOnline && (
            <span className="badge bg-warning">
              <i className="fas fa-wifi me-1"></i>
              Offline
            </span>
          )}
          
          {showCache && (
            <span className="badge bg-info">
              <i className="fas fa-database me-1"></i>
              Cache
            </span>
          )}
          
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={onRefresh}
            disabled={!canRefresh}
            title="Atualizar dados"
          >
            <i className="fas fa-sync-alt"></i>
          </button>
          
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={onToggleTheme}
            title={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
          >
            <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`}></i>
          </button>
        </div>
      </div>
    </div>
  </header>
);

/**
 * Componente View Selector
 */
const ViewSelector = ({ activeView, onViewChange, hasRepositories, hasAnalytics }) => (
  <div className="card mt-3">
    <div className="card-header">
      <h6 className="card-title mb-0">Visualização</h6>
    </div>
    <div className="card-body p-2">
      <div className="btn-group w-100" role="group">
        <input
          type="radio"
          className="btn-check"
          name="view"
          id="view-profile"
          checked={activeView === 'profile'}
          onChange={() => onViewChange('profile')}
        />
        <label className="btn btn-outline-primary btn-sm" htmlFor="view-profile">
          <i className="fas fa-user me-1"></i>
          Perfil
        </label>

        <input
          type="radio"
          className="btn-check"
          name="view"
          id="view-repositories"
          checked={activeView === 'repositories'}
          onChange={() => onViewChange('repositories')}
          disabled={!hasRepositories}
        />
        <label className="btn btn-outline-primary btn-sm" htmlFor="view-repositories">
          <i className="fas fa-code-branch me-1"></i>
          Repos
        </label>

        <input
          type="radio"
          className="btn-check"
          name="view"
          id="view-analytics"
          checked={activeView === 'analytics'}
          onChange={() => onViewChange('analytics')}
          disabled={!hasAnalytics}
        />
        <label className="btn btn-outline-primary btn-sm" htmlFor="view-analytics">
          <i className="fas fa-chart-bar me-1"></i>
          Analytics
        </label>
      </div>
    </div>
  </div>
);

/**
 * Componente Repository Filters
 */
const RepositoryFilters = ({ 
  filters, 
  onFiltersChange, 
  availableLanguages, 
  totalRepositories, 
  filteredCount 
}) => (
  <div className="card mt-3">
    <div className="card-header">
      <h6 className="card-title mb-0">
        Filtros 
        <span className="badge bg-secondary ms-2">
          {filteredCount}/{totalRepositories}
        </span>
      </h6>
    </div>
    <div className="card-body">
      {/* Language Filter */}
      <div className="mb-3">
        <label className="form-label">Linguagem</label>
        <select
          className="form-select form-select-sm"
          value={filters.language}
          onChange={(e) => onFiltersChange({ ...filters, language: e.target.value })}
        >
          <option value="">Todas</option>
          {availableLanguages.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>

      {/* Type Filter */}
      <div className="mb-3">
        <label className="form-label">Tipo</label>
        <select
          className="form-select form-select-sm"
          value={filters.type}
          onChange={(e) => onFiltersChange({ ...filters, type: e.target.value })}
        >
          <option value="all">Todos</option>
          <option value="source">Originais</option>
          <option value="fork">Forks</option>
        </select>
      </div>

      {/* Sort */}
      <div className="mb-3">
        <label className="form-label">Ordenar por</label>
        <select
          className="form-select form-select-sm"
          value={filters.sort}
          onChange={(e) => onFiltersChange({ ...filters, sort: e.target.value })}
        >
          <option value="updated">Atualização</option>
          <option value="created">Criação</option>
          <option value="stars">Estrelas</option>
          <option value="forks">Forks</option>
          <option value="name">Nome</option>
        </select>
      </div>

      {/* Min Stars */}
      <div className="mb-3">
        <label className="form-label">Estrelas mínimas</label>
        <input
          type="number"
          className="form-control form-control-sm"
          min="0"
          value={filters.minStars}
          onChange={(e) => onFiltersChange({ ...filters, minStars: parseInt(e.target.value) || 0 })}
        />
      </div>

      {/* Active Only */}
      <div className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          id="activeOnly"
          checked={filters.activeOnly}
          onChange={(e) => onFiltersChange({ ...filters, activeOnly: e.target.checked })}
        />
        <label className="form-check-label" htmlFor="activeOnly">
          Apenas ativos
        </label>
      </div>
    </div>
  </div>
);

/**
 * Componente Error State
 */
const ErrorState = ({ error, onRetry, isNetworkError, isUserNotFound }) => (
  <div className="text-center py-5">
    <div className="mb-4">
      <i className={`fas fa-${isUserNotFound ? 'user-slash' : 'exclamation-triangle'} fa-4x text-muted`}></i>
    </div>
    <h4>{isUserNotFound ? 'Usuário não encontrado' : 'Ops! Algo deu errado'}</h4>
    <p className="text-muted mb-4">
      {error?.message || 'Ocorreu um erro inesperado'}
    </p>
    
    {isNetworkError && (
      <div className="alert alert-warning">
        <i className="fas fa-wifi me-2"></i>
        Verifique sua conexão com a internet e tente novamente.
      </div>
    )}
    
    {onRetry && !isUserNotFound && (
      <button className="btn btn-primary" onClick={onRetry}>
        <i className="fas fa-redo me-2"></i>
        Tentar novamente
      </button>
    )}
  </div>
);

/**
 * Componente Footer
 */
const Footer = () => (
  <footer className="border-top py-3 mt-5">
    <div className="container-fluid">
      <div className="row align-items-center">
        <div className="col-md-6">
          <small className="text-muted">
            GitHub Explorer • React 19 + Clean Architecture
          </small>
        </div>
        <div className="col-md-6 text-md-end">
          <small className="text-muted">
            Desenvolvido com ❤️ usando as melhores práticas
          </small>
        </div>
      </div>
    </div>
  </footer>
);