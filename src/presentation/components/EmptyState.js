import React from 'react';

/**
 * EmptyState - Componente para quando não há dados para exibir
 */
export const EmptyState = ({ onSampleSearch }) => {
  const sampleUsers = ['octocat', 'torvalds', 'gaearon'];

  return (
    <div className="text-center py-5">
      <div className="mb-4">
        <i className="fab fa-github fa-4x text-muted mb-3"></i>
        <h3>Explore usuários do GitHub</h3>
        <p className="text-muted lead">
          Digite um username na barra de busca para começar a explorar perfis e repositórios.
        </p>
      </div>

      <div className="mb-4">
        <h6 className="text-muted mb-3">Ou experimente alguns usuários populares:</h6>
        <div className="d-flex justify-content-center gap-2 flex-wrap">
          {sampleUsers.map(username => (
            <button
              key={username}
              className="btn btn-outline-primary"
              onClick={() => onSampleSearch(username)}
            >
              <i className="fab fa-github me-2"></i>
              {username}
            </button>
          ))}
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">
                <i className="fas fa-info-circle me-2"></i>
                Sobre esta aplicação
              </h6>
              <p className="card-text small text-muted mb-0">
                GitHub Explorer é uma aplicação React 19 construída com Clean Architecture, 
                permitindo explorar perfis de usuários, repositórios e análises detalhadas 
                usando a API pública do GitHub.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};