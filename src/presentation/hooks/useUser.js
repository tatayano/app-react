import { useState, useCallback, useRef } from 'react';
import { UserNotFoundError, ValidationError, NetworkError } from '../../domain/repositories/UserRepositoryInterface.js';

/**
 * Hook customizado para gerenciar operações relacionadas a usuários
 * Encapsula os casos de uso GetUser e GetUserRepositories
 */
export const useUser = (getUserUseCase, getUserRepositoriesUseCase) => {
  // Estados principais
  const [user, setUser] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  // Estados de loading
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isLoadingRepositories, setIsLoadingRepositories] = useState(false);
  
  // Estados de erro
  const [userError, setUserError] = useState(null);
  const [repositoriesError, setRepositoriesError] = useState(null);
  
  // Estados de cache
  const [userFromCache, setUserFromCache] = useState(false);
  const [repositoriesFromCache, setRepositoriesFromCache] = useState(false);
  
  // Metadados
  const [userMetadata, setUserMetadata] = useState(null);
  const [repositoriesStats, setRepositoriesStats] = useState(null);
  
  // Ref para cancelar requests em andamento
  const currentUserRequest = useRef(null);
  const currentRepositoriesRequest = useRef(null);

  /**
   * Busca um usuário pelo username
   */
  const fetchUser = useCallback(async (username, options = {}) => {
    // Cancela request anterior se existir
    if (currentUserRequest.current) {
      currentUserRequest.current.cancelled = true;
    }

    const requestId = Date.now();
    currentUserRequest.current = { id: requestId, cancelled: false };

    try {
      setIsLoadingUser(true);
      setUserError(null);
      
      // Executa o caso de uso
      const result = await getUserUseCase.execute(username, options);
      
      // Verifica se o request não foi cancelado
      if (currentUserRequest.current?.id === requestId && !currentUserRequest.current?.cancelled) {
        setUser(result.user);
        setUserFromCache(result.fromCache);
        setUserMetadata(result.metadata);
      }

      return result;

    } catch (error) {
      if (currentUserRequest.current?.id === requestId && !currentUserRequest.current?.cancelled) {
        setUserError(error);
        setUser(null);
        setUserFromCache(false);
        setUserMetadata(null);
      }
      throw error;
    } finally {
      if (currentUserRequest.current?.id === requestId) {
        setIsLoadingUser(false);
        currentUserRequest.current = null;
      }
    }
  }, [getUserUseCase]);

  /**
   * Busca repositórios de um usuário
   */
  const fetchUserRepositories = useCallback(async (username, options = {}) => {
    // Cancela request anterior se existir
    if (currentRepositoriesRequest.current) {
      currentRepositoriesRequest.current.cancelled = true;
    }

    const requestId = Date.now();
    currentRepositoriesRequest.current = { id: requestId, cancelled: false };

    try {
      setIsLoadingRepositories(true);
      setRepositoriesError(null);
      
      // Executa o caso de uso
      const result = await getUserRepositoriesUseCase.execute(username, options);
      
      // Verifica se o request não foi cancelado
      if (currentRepositoriesRequest.current?.id === requestId && !currentRepositoriesRequest.current?.cancelled) {
        setRepositories(result.repositories);
        setAnalytics(result.analytics);
        setRepositoriesStats(result.statistics);
        setRepositoriesFromCache(result.fromCache);
      }

      return result;

    } catch (error) {
      if (currentRepositoriesRequest.current?.id === requestId && !currentRepositoriesRequest.current?.cancelled) {
        setRepositoriesError(error);
        setRepositories([]);
        setAnalytics(null);
        setRepositoriesStats(null);
        setRepositoriesFromCache(false);
      }
      throw error;
    } finally {
      if (currentRepositoriesRequest.current?.id === requestId) {
        setIsLoadingRepositories(false);
        currentRepositoriesRequest.current = null;
      }
    }
  }, [getUserRepositoriesUseCase]);

  /**
   * Busca usuário e repositórios simultaneamente
   */
  const fetchUserProfile = useCallback(async (username, options = {}) => {
    const { userOptions = {}, repositoriesOptions = {} } = options;

    try {
      // Executa ambas as operações em paralelo
      const [userResult, repositoriesResult] = await Promise.allSettled([
        fetchUser(username, userOptions),
        fetchUserRepositories(username, repositoriesOptions)
      ]);

      return {
        user: userResult.status === 'fulfilled' ? userResult.value : null,
        repositories: repositoriesResult.status === 'fulfilled' ? repositoriesResult.value : null,
        userError: userResult.status === 'rejected' ? userResult.reason : null,
        repositoriesError: repositoriesResult.status === 'rejected' ? repositoriesResult.reason : null
      };

    } catch (error) {
      throw error;
    }
  }, [fetchUser, fetchUserRepositories]);

  /**
   * Recarrega dados do usuário (ignora cache)
   */
  const refreshUser = useCallback(async (username) => {
    return fetchUser(username, { forceRefresh: true });
  }, [fetchUser]);

  /**
   * Recarrega repositórios (ignora cache)
   */
  const refreshRepositories = useCallback(async (username) => {
    return fetchUserRepositories(username, { forceRefresh: true });
  }, [fetchUserRepositories]);

  /**
   * Limpa todos os dados
   */
  const clearData = useCallback(() => {
    // Cancela requests em andamento
    if (currentUserRequest.current) {
      currentUserRequest.current.cancelled = true;
      currentUserRequest.current = null;
    }
    if (currentRepositoriesRequest.current) {
      currentRepositoriesRequest.current.cancelled = true;
      currentRepositoriesRequest.current = null;
    }

    // Limpa estados
    setUser(null);
    setRepositories([]);
    setAnalytics(null);
    setUserError(null);
    setRepositoriesError(null);
    setUserFromCache(false);
    setRepositoriesFromCache(false);
    setUserMetadata(null);
    setRepositoriesStats(null);
    setIsLoadingUser(false);
    setIsLoadingRepositories(false);
  }, []);

  /**
   * Verifica se um usuário existe
   */
  const checkUserExists = useCallback(async (username) => {
    try {
      return await getUserUseCase.userExists(username);
    } catch (error) {
      return false;
    }
  }, [getUserUseCase]);

  /**
   * Filtra repositórios no estado atual
   */
  const filterRepositories = useCallback((filterFn) => {
    if (!repositories.length) return [];
    return repositories.filter(filterFn);
  }, [repositories]);

  /**
   * Ordena repositórios no estado atual
   */
  const sortRepositories = useCallback((sortFn) => {
    if (!repositories.length) return [];
    return [...repositories].sort(sortFn);
  }, [repositories]);

  /**
   * Obtém estatísticas calculadas
   */
  const getCalculatedStats = useCallback(() => {
    if (!user || !repositories.length) return null;

    return {
      user: {
        hasCompleteProfile: user.hasCompleteProfile,
        engagementScore: user.engagementScore,
        isActiveUser: user.isActiveUser,
        profileCompleteness: userMetadata?.profileCompleteness
      },
      repositories: repositoriesStats,
      analytics: analytics
    };
  }, [user, repositories, userMetadata, repositoriesStats, analytics]);

  /**
   * Verifica se há dados carregados
   */
  const hasData = user !== null;
  const hasRepositories = repositories.length > 0;
  const hasAnalytics = analytics !== null;

  /**
   * Estados combinados de loading
   */
  const isLoading = isLoadingUser || isLoadingRepositories;
  const hasErrors = userError !== null || repositoriesError !== null;

  /**
   * Helpers para tipos de erro
   */
  const isUserNotFoundError = userError instanceof UserNotFoundError;
  const isValidationError = userError instanceof ValidationError || repositoriesError instanceof ValidationError;
  const isNetworkError = userError instanceof NetworkError || repositoriesError instanceof NetworkError;

  /**
   * Obtém mensagem de erro amigável
   */
  const getErrorMessage = useCallback(() => {
    const error = userError || repositoriesError;
    if (!error) return null;

    if (error instanceof UserNotFoundError) {
      return `Usuário "${error.username}" não encontrado.`;
    }

    if (error instanceof ValidationError) {
      return `Erro de validação: ${error.message}`;
    }

    if (error instanceof NetworkError) {
      return 'Erro de rede. Verifique sua conexão e tente novamente.';
    }

    return 'Ocorreu um erro inesperado. Tente novamente.';
  }, [userError, repositoriesError]);

  return {
    // Estados principais
    user,
    repositories,
    analytics,
    
    // Estados de loading
    isLoadingUser,
    isLoadingRepositories,
    isLoading,
    
    // Estados de erro
    userError,
    repositoriesError,
    hasErrors,
    
    // Estados de cache
    userFromCache,
    repositoriesFromCache,
    
    // Metadados
    userMetadata,
    repositoriesStats,
    
    // Ações
    fetchUser,
    fetchUserRepositories,
    fetchUserProfile,
    refreshUser,
    refreshRepositories,
    clearData,
    checkUserExists,
    
    // Utilitários
    filterRepositories,
    sortRepositories,
    getCalculatedStats,
    getErrorMessage,
    
    // Estados computados
    hasData,
    hasRepositories,
    hasAnalytics,
    isUserNotFoundError,
    isValidationError,
    isNetworkError
  };
};