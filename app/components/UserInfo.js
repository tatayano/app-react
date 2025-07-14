import React from 'react';
import PropTypes from 'prop-types';
import UserRepos from './UserRepos';

const UserInfo = ({ user, repos }) => {
  if (!user) return null;

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <img 
                src={user.avatar_url} 
                alt={`Avatar de ${user.login}`} 
                className="rounded-circle mb-3 shadow" 
                height="150" 
                width="150"
                style={{ objectFit: 'cover' }}
              />
              
              <h2 className="card-title mb-1">{user.login}</h2>
              {user.name && (
                <h5 className="text-muted mb-3">{user.name}</h5>
              )}
              
              {user.bio && (
                <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
                  <i className="fas fa-quote-left me-1"></i>
                  {user.bio}
                </p>
              )}

              <div className="row text-center mb-3">
                <div className="col-4">
                  <div className="border-end">
                    <h5 className="mb-0 text-primary">{formatNumber(user.followers)}</h5>
                    <small className="text-muted">Seguidores</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="border-end">
                    <h5 className="mb-0 text-success">{formatNumber(user.following)}</h5>
                    <small className="text-muted">Seguindo</small>
                  </div>
                </div>
                <div className="col-4">
                  <h5 className="mb-0 text-warning">{formatNumber(user.public_repos)}</h5>
                  <small className="text-muted">Repos</small>
                </div>
              </div>

              <div className="mb-3">
                {user.location && (
                  <div className="mb-2">
                    <i className="fas fa-map-marker-alt text-muted me-2"></i>
                    <span className="text-muted">{user.location}</span>
                  </div>
                )}
                
                {user.company && (
                  <div className="mb-2">
                    <i className="fas fa-building text-muted me-2"></i>
                    <span className="text-muted">{user.company}</span>
                  </div>
                )}
                
                {user.blog && (
                  <div className="mb-2">
                    <i className="fas fa-link text-muted me-2"></i>
                    <a 
                      href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-decoration-none"
                    >
                      {user.blog}
                    </a>
                  </div>
                )}
                
                {user.email && (
                  <div className="mb-2">
                    <i className="fas fa-envelope text-muted me-2"></i>
                    <a 
                      href={`mailto:${user.email}`}
                      className="text-decoration-none"
                    >
                      {user.email}
                    </a>
                  </div>
                )}

                <div className="mb-2">
                  <i className="fas fa-calendar text-muted me-2"></i>
                  <span className="text-muted">
                    Criado em {formatDate(user.created_at)}
                  </span>
                </div>
              </div>

              <div className="d-grid gap-2">
                <a 
                  href={user.html_url} 
                  className="btn btn-primary"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-github me-2"></i>
                  Ver Perfil no GitHub
                </a>
                
                {user.twitter_username && (
                  <a 
                    href={`https://twitter.com/${user.twitter_username}`}
                    className="btn btn-outline-info"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-twitter me-2"></i>
                    @{user.twitter_username}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-8">
          <UserRepos repos={repos} />
        </div>
      </div>
    </div>
  );
};

UserInfo.propTypes = {
  user: PropTypes.object,
  repos: PropTypes.array
};

export default UserInfo;
		