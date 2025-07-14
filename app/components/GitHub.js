import React, { useState } from 'react';
import SearchUser from './SearchUser';
import UserInfo from './UserInfo';

const GitHub = () => {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);

  const updateUser = (userData) => {
    setUser(userData);
  };

  const updateRepos = (reposData) => {
    setRepos(reposData);
  };

  const clearData = () => {
    setUser(null);
    setRepos([]);
  };

  return (
    <div className="min-vh-100">
      {/* Header */}
      <header className="bg-dark text-white py-3 mb-4">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <i className="fab fa-github fs-2 me-3"></i>
              <div>
                <h1 className="h3 mb-0">GitHub Explorer</h1>
                <small className="text-light opacity-75">
                  Powered by React 19 <i className="fas fa-rocket ms-1"></i>
                </small>
              </div>
            </div>
            {user && (
              <button 
                className="btn btn-outline-light btn-sm"
                onClick={clearData}
                title="Nova busca"
              >
                <i className="fas fa-search me-1"></i>
                Nova Busca
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container">
        {!user ? (
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="text-center mb-4">
                <i className="fab fa-github display-1 text-muted mb-3"></i>
                <h2 className="text-muted">Explore perfis do GitHub</h2>
                <p className="text-muted">
                  Digite um nome de usuário para ver informações detalhadas 
                  sobre o perfil e repositórios.
                </p>
              </div>
              <SearchUser 
                updateUser={updateUser}
                updateRepos={updateRepos}
              />
            </div>
          </div>
        ) : (
          <UserInfo
            user={user}
            repos={repos}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-muted py-4 mt-5">
        <div className="container">
          <hr className="mb-3" />
          <small>
            Feito com <i className="fas fa-heart text-danger"></i> usando{' '}
            <strong>React 19</strong> | {' '}
            <a 
              href="https://docs.github.com/en/rest" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-decoration-none"
            >
              GitHub API
            </a>
          </small>
        </div>
      </footer>
    </div>
  );
};

export default GitHub;