import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Contexto da aplicação que fornece acesso às dependências e casos de uso
 * Implementa Dependency Injection via Context API
 */
const AppContext = createContext();

/**
 * Provider do contexto da aplicação
 */
export const AppProvider = ({ children, dependencies }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState(null);
  const [appState, setAppState] = useState({
    theme: 'light',
    notifications: [],
    isOnline: navigator.onLine
  });

  // Inicialização do contexto
  useEffect(() => {
    const initializeContext = async () => {
      try {
        // Verifica se todas as dependências necessárias estão disponíveis
        const requiredDependencies = [
          'getUserUseCase',
          'getUserRepositoriesUseCase',
          'logger'
        ];

        for (const dep of requiredDependencies) {
          if (!dependencies[dep]) {
            throw new Error(`Missing required dependency: ${dep}`);
          }
        }

        // Configurações adicionais se necessário
        await performAdditionalSetup();

        setIsInitialized(true);
        dependencies.logger.info('[AppContext] Context initialized successfully');

      } catch (error) {
        setInitError(error);
        dependencies.logger?.error('[AppContext] Failed to initialize context:', error);
      }
    };

    initializeContext();
  }, [dependencies]);

  // Monitora status de conexão
  useEffect(() => {
    const handleOnline = () => setAppState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setAppState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Configurações adicionais durante a inicialização
   */
  const performAdditionalSetup = async () => {
    // Verificar conectividade
    if (dependencies.userRepository) {
      try {
        await dependencies.userRepository.healthCheck();
      } catch (error) {
        dependencies.logger?.warn('[AppContext] Repository health check failed:', error);
      }
    }

    // Carregar configurações do usuário do localStorage
    const savedTheme = localStorage.getItem('github-explorer-theme');
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      setAppState(prev => ({ ...prev, theme: savedTheme }));
    }
  };

  /**
   * Alterna o tema da aplicação
   */
  const toggleTheme = () => {
    setAppState(prev => {
      const newTheme = prev.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('github-explorer-theme', newTheme);
      return { ...prev, theme: newTheme };
    });
  };

  /**
   * Adiciona uma notificação
   */
  const addNotification = (notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      timestamp: new Date(),
      type: 'info',
      autoHide: true,
      duration: 5000,
      ...notification
    };

    setAppState(prev => ({
      ...prev,
      notifications: [...prev.notifications, newNotification]
    }));

    // Auto remove se configurado
    if (newNotification.autoHide) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  };

  /**
   * Remove uma notificação
   */
  const removeNotification = (id) => {
    setAppState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    }));
  };

  /**
   * Limpa todas as notificações
   */
  const clearNotifications = () => {
    setAppState(prev => ({ ...prev, notifications: [] }));
  };

  /**
   * Mostra notificação de erro
   */
  const showError = (message, details = null) => {
    return addNotification({
      type: 'error',
      title: 'Erro',
      message,
      details,
      autoHide: false
    });
  };

  /**
   * Mostra notificação de sucesso
   */
  const showSuccess = (message) => {
    return addNotification({
      type: 'success',
      title: 'Sucesso',
      message
    });
  };

  /**
   * Mostra notificação de aviso
   */
  const showWarning = (message) => {
    return addNotification({
      type: 'warning',
      title: 'Aviso',
      message
    });
  };

  /**
   * Mostra notificação de informação
   */
  const showInfo = (message) => {
    return addNotification({
      type: 'info',
      title: 'Informação',
      message
    });
  };

  // Helpers para debugging
  const getDebugInfo = () => {
    if (process.env.NODE_ENV !== 'development') return null;

    return {
      isInitialized,
      initError,
      appState,
      dependencies: Object.keys(dependencies),
      cacheStats: dependencies.cache?.getStats(),
      repositoryStats: dependencies.userRepository?.getStats()
    };
  };

  const contextValue = {
    // Estados principais
    isInitialized,
    initError,
    appState,

    // Dependências (casos de uso e infraestrutura)
    ...dependencies,

    // Ações do app
    toggleTheme,
    addNotification,
    removeNotification,
    clearNotifications,
    showError,
    showSuccess,
    showWarning,
    showInfo,

    // Debug
    getDebugInfo
  };

  // Loading state durante inicialização
  if (!isInitialized && !initError) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <h4>Inicializando GitHub Explorer</h4>
          <p className="text-muted">Configurando a aplicação...</p>
        </div>
      </div>
    );
  }

  // Error state se a inicialização falhou
  if (initError) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Erro de Inicialização</h4>
            <p>Falha ao inicializar a aplicação:</p>
            <hr />
            <p className="mb-0">{initError.message}</p>
          </div>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => window.location.reload()}
          >
            Recarregar Página
          </button>
        </div>
      </div>
    );
  }

  // Estado normal - aplica tema
  const themeClass = appState.theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark';

  return (
    <AppContext.Provider value={contextValue}>
      <div className={`min-vh-100 ${themeClass}`} data-bs-theme={appState.theme}>
        {children}
        
        {/* Container de notificações */}
        <NotificationContainer 
          notifications={appState.notifications}
          onRemove={removeNotification}
        />
      </div>
    </AppContext.Provider>
  );
};

/**
 * Hook para usar o contexto da aplicação
 */
export const useApp = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  
  return context;
};

/**
 * Hook para usar apenas as dependências (casos de uso)
 */
export const useDependencies = () => {
  const context = useApp();
  
  return {
    getUserUseCase: context.getUserUseCase,
    getUserRepositoriesUseCase: context.getUserRepositoriesUseCase,
    logger: context.logger
  };
};

/**
 * Componente para exibir notificações
 */
const NotificationContainer = ({ notifications, onRemove }) => {
  if (!notifications.length) return null;

  return (
    <div 
      className="position-fixed top-0 end-0 p-3" 
      style={{ zIndex: 1050, maxWidth: '400px' }}
    >
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

/**
 * Item individual de notificação
 */
const NotificationItem = ({ notification, onRemove }) => {
  const getAlertClass = (type) => {
    const classes = {
      error: 'alert-danger',
      success: 'alert-success',
      warning: 'alert-warning',
      info: 'alert-info'
    };
    return classes[type] || 'alert-info';
  };

  const getIcon = (type) => {
    const icons = {
      error: '❌',
      success: '✅',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
  };

  return (
    <div className={`alert ${getAlertClass(notification.type)} alert-dismissible fade show mb-2`} role="alert">
      <div className="d-flex align-items-start">
        <span className="me-2">{getIcon(notification.type)}</span>
        <div className="flex-grow-1">
          {notification.title && (
            <h6 className="alert-heading mb-1">{notification.title}</h6>
          )}
          <div>{notification.message}</div>
          {notification.details && (
            <small className="text-muted d-block mt-1">{notification.details}</small>
          )}
        </div>
        <button
          type="button"
          className="btn-close"
          onClick={() => onRemove(notification.id)}
          aria-label="Close"
        />
      </div>
    </div>
  );
};