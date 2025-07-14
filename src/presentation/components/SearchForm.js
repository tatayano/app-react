import React, { useState, useRef, useEffect } from 'react';

/**
 * SearchForm - Componente de busca de usuários do GitHub
 * Inclui validação, histórico e sugestões
 */
export const SearchForm = ({ 
  onSearch, 
  isLoading = false, 
  searchHistory = [], 
  placeholder = "Digite o username..." 
}) => {
  const [query, setQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [validationError, setValidationError] = useState('');
  const inputRef = useRef(null);
  const formRef = useRef(null);

  /**
   * Valida o username do GitHub
   */
  const validateUsername = (username) => {
    if (!username.trim()) {
      return 'Username é obrigatório';
    }

    if (username.length > 39) {
      return 'Username deve ter no máximo 39 caracteres';
    }

    // Regex básico para username do GitHub
    const githubUsernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]){0,38}$/;
    if (!githubUsernameRegex.test(username.trim())) {
      return 'Username inválido. Use apenas letras, números e hífens.';
    }

    return '';
  };

  /**
   * Manipula o submit do formulário
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmedQuery = query.trim();
    const error = validateUsername(trimmedQuery);
    
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError('');
    setShowHistory(false);
    onSearch(trimmedQuery);
  };

  /**
   * Manipula mudanças no input
   */
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    // Limpa erro de validação quando usuário começa a digitar
    if (validationError) {
      setValidationError('');
    }
  };

  /**
   * Manipula foco no input
   */
  const handleInputFocus = () => {
    if (searchHistory.length > 0) {
      setShowHistory(true);
    }
  };

  /**
   * Manipula seleção do histórico
   */
  const handleHistorySelect = (username) => {
    setQuery(username);
    setShowHistory(false);
    setValidationError('');
    
    // Foca no input após seleção
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  /**
   * Fecha histórico ao clicar fora
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Manipula teclas especiais
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowHistory(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h6 className="card-title mb-0">
          <i className="fab fa-github me-2"></i>
          Buscar Usuário
        </h6>
      </div>
      
      <div className="card-body">
        <form ref={formRef} onSubmit={handleSubmit} className="position-relative">
          <div className="input-group">
            <span className="input-group-text">
              <i className="fas fa-user"></i>
            </span>
            
            <input
              ref={inputRef}
              type="text"
              className={`form-control ${validationError ? 'is-invalid' : ''}`}
              placeholder={placeholder}
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              autoComplete="off"
              data-testid="search-input"
            />
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !query.trim()}
              data-testid="search-button"
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Carregando...</span>
                  </span>
                  Buscando...
                </>
              ) : (
                <>
                  <i className="fas fa-search me-2"></i>
                  Buscar
                </>
              )}
            </button>
          </div>

          {/* Erro de validação */}
          {validationError && (
            <div className="invalid-feedback d-block mt-2">
              <i className="fas fa-exclamation-triangle me-1"></i>
              {validationError}
            </div>
          )}

          {/* Histórico de buscas */}
          {showHistory && searchHistory.length > 0 && (
            <div className="position-absolute w-100 mt-1" style={{ zIndex: 1000 }}>
              <div className="card shadow-sm">
                <div className="card-header py-2">
                  <small className="text-muted">
                    <i className="fas fa-history me-1"></i>
                    Buscas recentes
                  </small>
                  <button
                    type="button"
                    className="btn-close btn-close-sm float-end"
                    onClick={() => setShowHistory(false)}
                    aria-label="Fechar histórico"
                  ></button>
                </div>
                <div className="list-group list-group-flush">
                  {searchHistory.map((username, index) => (
                    <HistoryItem
                      key={`${username}-${index}`}
                      username={username}
                      onSelect={handleHistorySelect}
                      isActive={username === query}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Dicas de uso */}
        <div className="mt-3">
          <small className="text-muted">
            <i className="fas fa-lightbulb me-1"></i>
            <strong>Dicas:</strong> Digite um username válido do GitHub (ex: octocat, defunkt)
          </small>
        </div>

        {/* Exemplos populares */}
        <div className="mt-2">
          <small className="text-muted d-block mb-2">Experimente:</small>
          <div className="d-flex flex-wrap gap-1">
            {POPULAR_USERS.map(username => (
              <SampleButton
                key={username}
                username={username}
                onSelect={handleHistorySelect}
                disabled={isLoading}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Item do histórico de buscas
 */
const HistoryItem = ({ username, onSelect, isActive }) => (
  <button
    type="button"
    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
      isActive ? 'active' : ''
    }`}
    onClick={() => onSelect(username)}
  >
    <div className="d-flex align-items-center">
      <i className="fab fa-github me-2 text-muted"></i>
      <span>{username}</span>
    </div>
    <small className="text-muted">
      <i className="fas fa-arrow-right"></i>
    </small>
  </button>
);

/**
 * Botão de exemplo
 */
const SampleButton = ({ username, onSelect, disabled }) => (
  <button
    type="button"
    className="btn btn-outline-secondary btn-sm"
    onClick={() => onSelect(username)}
    disabled={disabled}
  >
    {username}
  </button>
);

/**
 * Lista de usuários populares para exemplo
 */
const POPULAR_USERS = [
  'octocat',
  'torvalds',
  'gaearon',
  'addyosmani',
  'sindresorhus'
];