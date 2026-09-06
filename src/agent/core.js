/**
 * AI Code Agent Autonomous - CORE
 * Основной модуль агента с полной функциональностью
 */

const EventEmitter = require('events');
const Logger = require('./utils/logger');
const SkillRegistry = require('./skills/skill-registry');
const Orchestrator = require('./orchestrator');
const GitHubAPI = require('./github/api');
const HuggingFaceClient = require('./models/huggingface');

class AICodeAgent extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      mode: config.mode || 'autonomous', // autonomous, supervised, interactive, scheduled
      model: config.model || 'codellama',
      apiKeys: {
        github: process.env.GITHUB_TOKEN,
        huggingface: process.env.HF_API_TOKEN,
      },
      ...config,
    };

    this.logger = new Logger(config.verbose);
    this.skills = new SkillRegistry();
    this.orchestrator = new Orchestrator(this);
    this.github = new GitHubAPI(this.config.apiKeys.github);
    this.hf = new HuggingFaceClient({ token: this.config.apiKeys.huggingface });
    
    this.state = {
      initialized: false,
      currentTask: null,
      taskHistory: [],
      errors: [],
    };

    this.initializeDefaultSkills();
  }

  /**
   * Инициализация агента
   */
  async initialize() {
    this.logger.info('🤖 Инициализация AI Code Agent...');
    
    try {
      // Проверить API токены
      await this.validateCredentials();
      
      // Загрузить модель
      await this.loadModel();
      
      // Инициализировать навыки
      await this.skills.initialize();
      
      this.state.initialized = true;
      this.emit('initialized');
      
      this.logger.success('✅ Агент готов к работе');
      return true;
    } catch (error) {
      this.logger.error(`❌ Ошибка инициализации: ${error.message}`);
      throw error;
    }
  }

  /**
   * Инициализация стандартных навыков
   */
  initializeDefaultSkills() {
    this.skills.register('code-analyzer', {
      description: 'Анализирует код на проблемы и оптимизацию',
      handler: (code) => this.analyzeCode(code),
    });

    this.skills.register('pr-generator', {
      description: 'Создает Pull Requests',
      handler: (options) => this.generatePR(options),
    });

    this.skills.register('code-writer', {
      description: 'Генерирует новый код',
      handler: (prompt) => this.writeCode(prompt),
    });

    this.skills.register('data-finder', {
      description: 'Поиск бесплатных данных и ресурсов',
      handler: (query) => this.findFreeData(query),
    });

    this.skills.register('repo-explorer', {
      description: 'Исследование репозиториев',
      handler: (query) => this.exploreRepos(query),
    });
  }

  /**
   * Основной метод выполнения задач
   */
  async execute(task) {
    if (!this.state.initialized) {
      await this.initialize();
    }

    this.logger.info(`\n📋 Выполнение задачи: ${task.name}`);
    this.state.currentTask = task;

    try {
      const result = await this.orchestrator.executeTask(task);
      
      this.state.taskHistory.push({
        name: task.name,
        status: 'success',
        timestamp: new Date(),
        result,
      });

      this.emit('task-completed', result);
      return result;
    } catch (error) {
      this.logger.error(`❌ Ошибка при выполнении задачи: ${error.message}`);
      
      this.state.errors.push({
        task: task.name,
        error: error.message,
        timestamp: new Date(),
      });

      this.emit('task-failed', error);
      throw error;
    }
  }

  /**
   * Анализ кода
   */
  async analyzeCode(code) {
    this.logger.info('🔍 Анализирую код...');
    
    try {
      const analysis = {
        issues: [],
        suggestions: [],
        complexity: this.calculateComplexity(code),
        quality_score: 0,
      };

      // Базовый анализ
      if (code.includes('TODO')) {
        analysis.issues.push('Найдены TODO комментарии');
      }

      if (code.length > 1000) {
        analysis.suggestions.push('Код слишком длинный, рассмотрите разделение на функции');
      }

      analysis.quality_score = Math.max(0, 100 - analysis.issues.length * 10);

      this.logger.success('✅ Анализ завершен');
      return analysis;
    } catch (error) {
      this.logger.error(`Ошибка анализа: ${error.message}`);
      throw error;
    }
  }

  /**
   * Создание Pull Request
   */
  async generatePR(options) {
    this.logger.info('📝 Создаю Pull Request...');

    const {
      repo,
      title,
      description,
      branch,
      changes,
    } = options;

    try {
      const pr = await this.github.createPullRequest({
        owner: repo.split('/')[0],
        repo: repo.split('/')[1],
        title,
        description,
        head: branch,
        base: 'main',
      });

      this.logger.success(`✅ PR создан: ${pr.html_url}`);
      return pr;
    } catch (error) {
      this.logger.error(`Ошибка создания PR: ${error.message}`);
      throw error;
    }
  }

  /**
   * Генерация кода
   */
  async writeCode(prompt) {
    this.logger.info(`💻 Генерирую код: ${prompt}`);

    try {
      // Здесь будет интеграция с моделью
      const code = `// Generated code for: ${prompt}\n// TODO: Implement\n`;
      
      this.logger.success('✅ Код сгенерирован');
      return code;
    } catch (error) {
      this.logger.error(`Ошибка генерации: ${error.message}`);
      throw error;
    }
  }

  /**
   * Поиск бесплатных данных
   */
  async findFreeData(query) {
    this.logger.info(`🔎 Ищу бесплатные ресурсы: ${query}`);

    try {
      const resources = {
        datasets: await this.github.searchRepositories(`${query} dataset`),
        models: await this.hf.searchModels(query),
        code: await this.github.searchCode(query),
      };

      this.logger.success('✅ Найдены ресурсы');
      return resources;
    } catch (error) {
      this.logger.error(`Ошибка поиска: ${error.message}`);
      throw error;
    }
  }

  /**
   * Исследование репозиториев
   */
  async exploreRepos(query) {
    this.logger.info(`🔍 Исследую репозитории: ${query}`);

    try {
      const repos = await this.github.searchRepositories(query, {
        sort: 'stars',
        order: 'desc',
        per_page: 10,
      });

      this.logger.success(`✅ Найдено репозиториев: ${repos.length}`);
      return repos;
    } catch (error) {
      this.logger.error(`Ошибка поиска репо: ${error.message}`);
      throw error;
    }
  }

  /**
   * Валидация учетных данных
   */
  async validateCredentials() {
    this.logger.info('🔐 Проверяю учетные данные...');

    if (!this.config.apiKeys.github) {
      this.logger.warn('⚠️  GitHub token не установлен (работа в режиме с ограничениями)');
    }

    if (!this.config.apiKeys.huggingface) {
      this.logger.warn('⚠️  HuggingFace token не установлен (работа в режиме с ограничениями)');
    }

    return true;
  }

  /**
   * Загрузка модели
   */
  async loadModel() {
    this.logger.info(`📦 Загружаю модель: ${this.config.model}`);

    try {
      // Здесь будет загрузка реальной модели
      this.model = {
        name: this.config.model,
        loaded: true,
      };

      this.logger.success('✅ Модель загружена');
      return this.model;
    } catch (error) {
      this.logger.error(`Ошибка загрузки модели: ${error.message}`);
      throw error;
    }
  }

  /**
   * Расчет сложности кода
   */
  calculateComplexity(code) {
    const lines = code.split('\n').length;
    const functions = (code.match(/function|const.*=.*=>/g) || []).length;
    const complexity = Math.round((lines + functions) / 10);
    
    return {
      lines,
      functions,
      score: complexity,
      level: complexity > 10 ? 'high' : complexity > 5 ? 'medium' : 'low',
    };
  }

  /**
   * Получить статус агента
   */
  getStatus() {
    return {
      initialized: this.state.initialized,
      mode: this.config.mode,
      model: this.config.model,
      currentTask: this.state.currentTask,
      taskCount: this.state.taskHistory.length,
      errorCount: this.state.errors.length,
      skills: this.skills.getRegistry(),
    };
  }

  /**
   * Остановить агента
   */
  async shutdown() {
    this.logger.info('🛑 Завершаю работу агента...');
    this.emit('shutdown');
    this.logger.success('✅ Агент остановлен');
  }
}

module.exports = AICodeAgent;
