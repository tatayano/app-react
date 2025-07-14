import React from 'react';

/**
 * LoadingState - Componente para exibir estados de carregamento
 */
export const LoadingState = ({ 
  message = "Carregando...", 
  isLoadingUser = false, 
  isLoadingRepositories = false 
}) => {
  return (
    <div className="text-center py-5">
      <div className="mb-4">
        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Carregando...</span>
        </div>
        <h4>{message}</h4>
        
        {/* Indicadores específicos */}
        <div className="mt-3">
          {isLoadingUser && (
            <div className="mb-2">
              <div className="spinner-border spinner-border-sm text-secondary me-2" role="status">
                <span className="visually-hidden">Carregando usuário...</span>
              </div>
              <small className="text-muted">Buscando dados do usuário...</small>
            </div>
          )}
          
          {isLoadingRepositories && (
            <div className="mb-2">
              <div className="spinner-border spinner-border-sm text-secondary me-2" role="status">
                <span className="visually-hidden">Carregando repositórios...</span>
              </div>
              <small className="text-muted">Buscando repositórios...</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};