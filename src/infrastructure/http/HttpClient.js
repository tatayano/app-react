import axios from 'axios';
import { NetworkError, RateLimitError } from '../../domain/repositories/UserRepositoryInterface.js';

/**
 * HttpClient - Cliente HTTP configurado para comunicação com APIs externas
 * Implementa retry logic, timeouts, e tratamento de erros específicos
 */
export class HttpClient {
  constructor(config = {}) {
    this.baseURL = config.baseURL || 'https://api.github.com';
    this.timeout = config.timeout || 10000; // 10 segundos
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000; // 1 segundo
    this.logger = config.logger || console;

    // Configuração do axios
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Explorer-React19/1.0.0',
        ...config.headers
      }
    });

    this.setupInterceptors();
  }

  /**
   * Configura interceptors de request e response
   */
  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        this.logger.debug(`[HttpClient] Making request: ${config.method?.toUpperCase()} ${config.url}`);
        
        // Adiciona timestamp para tracking
        config.metadata = {
          startTime: Date.now(),
          requestId: this.generateRequestId()
        };

        return config;
      },
      (error) => {
        this.logger.error('[HttpClient] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        const duration = Date.now() - response.config.metadata.startTime;
        this.logger.debug(`[HttpClient] Request completed in ${duration}ms: ${response.status} ${response.config.url}`);
        
        // Adiciona metadata à resposta
        response.metadata = {
          ...response.config.metadata,
          duration,
          rateLimitRemaining: response.headers['x-ratelimit-remaining'],
          rateLimitReset: response.headers['x-ratelimit-reset']
        };

        return response;
      },
      (error) => {
        return this.handleResponseError(error);
      }
    );
  }

  /**
   * Realiza uma requisição GET com retry automático
   */
  async get(url, config = {}) {
    return this.request('GET', url, config);
  }

  /**
   * Realiza uma requisição POST
   */
  async post(url, data, config = {}) {
    return this.request('POST', url, { ...config, data });
  }

  /**
   * Realiza uma requisição PUT
   */
  async put(url, data, config = {}) {
    return this.request('PUT', url, { ...config, data });
  }

  /**
   * Realiza uma requisição DELETE
   */
  async delete(url, config = {}) {
    return this.request('DELETE', url, config);
  }

  /**
   * Método genérico para realizar requisições com retry
   */
  async request(method, url, config = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await this.client.request({
          method,
          url,
          ...config
        });

        return response;

      } catch (error) {
        lastError = error;
        
        // Não faz retry para alguns tipos de erro
        if (!this.shouldRetry(error, attempt)) {
          break;
        }

        // Log do retry
        this.logger.warn(`[HttpClient] Request failed (attempt ${attempt}/${this.retryAttempts}): ${error.message}`);
        
        // Aguarda antes do próximo retry
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    // Se chegou aqui, todos os retries falharam
    throw this.transformError(lastError);
  }

  /**
   * Determina se deve fazer retry baseado no tipo de erro e tentativa
   */
  shouldRetry(error, attempt) {
    // Não faz retry se já é a última tentativa
    if (attempt >= this.retryAttempts) {
      return false;
    }

    // Não faz retry para erros 4xx (exceto 429 - rate limit)
    if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
      return false;
    }

    // Faz retry para:
    // - Erros de rede (ECONNRESET, ETIMEDOUT, etc.)
    // - Erros 5xx (servidor)
    // - Rate limit (429)
    // - Timeout
    const retryableErrors = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED'];
    const isNetworkError = retryableErrors.some(errCode => error.code === errCode);
    const isServerError = error.response?.status >= 500;
    const isRateLimit = error.response?.status === 429;
    const isTimeout = error.code === 'ECONNABORTED';

    return isNetworkError || isServerError || isRateLimit || isTimeout;
  }

  /**
   * Transforma erros do axios em erros do domínio
   */
  transformError(error) {
    // Rate limit error
    if (error.response?.status === 429) {
      const resetTime = error.response.headers['x-ratelimit-reset'];
      const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000) : new Date();
      
      return new RateLimitError(
        error.response.headers['x-ratelimit-limit'] || 'unknown',
        resetDate
      );
    }

    // Network errors
    if (!error.response) {
      return new NetworkError(
        `Network error: ${error.message}`,
        error
      );
    }

    // HTTP errors
    const status = error.response.status;
    const statusText = error.response.statusText;
    const message = error.response.data?.message || statusText;

    return new NetworkError(
      `HTTP ${status}: ${message}`,
      error
    );
  }

  /**
   * Trata erros de resposta
   */
  async handleResponseError(error) {
    const duration = error.config?.metadata 
      ? Date.now() - error.config.metadata.startTime 
      : 0;

    this.logger.error(`[HttpClient] Request failed after ${duration}ms:`, {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });

    return Promise.reject(error);
  }

  /**
   * Aguarda um determinado tempo (para retry)
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Gera ID único para tracking de requests
   */
  generateRequestId() {
    return Math.random().toString(36).substring(2, 15);
  }

  /**
   * Obtém informações de rate limit das últimas headers de resposta
   */
  getLastRateLimitInfo() {
    return this.lastRateLimitInfo || null;
  }

  /**
   * Configura token de autenticação
   */
  setAuthToken(token) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `token ${token}`;
      this.logger.info('[HttpClient] Authentication token configured');
    } else {
      delete this.client.defaults.headers.common['Authorization'];
      this.logger.info('[HttpClient] Authentication token removed');
    }
  }

  /**
   * Configura headers customizados
   */
  setHeaders(headers) {
    Object.assign(this.client.defaults.headers.common, headers);
  }

  /**
   * Remove headers específicos
   */
  removeHeaders(headerNames) {
    headerNames.forEach(name => {
      delete this.client.defaults.headers.common[name];
    });
  }

  /**
   * Verifica se o cliente está configurado corretamente
   */
  async healthCheck() {
    try {
      const response = await this.get('/');
      return {
        status: 'healthy',
        baseURL: this.baseURL,
        responseTime: response.metadata.duration,
        rateLimitRemaining: response.metadata.rateLimitRemaining
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        baseURL: this.baseURL,
        error: error.message
      };
    }
  }

  /**
   * Obtém estatísticas do cliente
   */
  getStats() {
    return {
      baseURL: this.baseURL,
      timeout: this.timeout,
      retryAttempts: this.retryAttempts,
      retryDelay: this.retryDelay,
      hasAuthToken: !!this.client.defaults.headers.common['Authorization']
    };
  }

  /**
   * Reseta configurações para padrão
   */
  reset() {
    this.client.defaults.headers.common = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitHub-Explorer-React19/1.0.0'
    };
    this.logger.info('[HttpClient] Configuration reset to defaults');
  }
}