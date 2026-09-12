/**
 * Google Gemini API Integration
 * Интеграция с Google Gemini для генерации текста, кода и анализа
 */

const axios = require('axios');

class GeminiClient {
  constructor(config = {}) {
    this.apiKey = process.env.GEMINI_API_KEY || config.apiKey;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    this.model = config.model || 'gemini-pro';
    this.timeout = config.timeout || 30000;

    if (!this.apiKey) {
      console.warn('⚠️  GEMINI_API_KEY не установлен');
    }
  }

  /**
   * Отправить запрос к Gemini
   */
  async generateContent(prompt, options = {}) {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY не установлен');
    }

    try {
      const payload = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: options.temperature || 0.7,
          topK: options.topK || 40,
          topP: options.topP || 0.95,
          maxOutputTokens: options.maxOutputTokens || 2048,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      };

      const response = await axios.post(
        `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: this.timeout,
        }
      );

      if (
        response.data.candidates &&
        response.data.candidates.length > 0
      ) {
        const candidate = response.data.candidates[0];
        if (candidate.content && candidate.content.parts) {
          return {
            text: candidate.content.parts[0].text,
            finishReason: candidate.finishReason,
            safetyRatings: candidate.safetyRatings,
          };
        }
      }

      throw new Error('Пустой ответ от Gemini');
    } catch (error) {
      throw new Error(
        `Gemini API ошибка: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  /**
   * Анализ кода
   */
  async analyzeCode(code, language = 'javascript') {
    const prompt = `
Проанализируй этот ${language} код и дай подробную оценку:
1. Качество кода
2. Потенциальные проблемы
3. Оптимизации
4. Рекомендации безопасности
5. Отсутствующие тесты

Код:
\`\`\`${language}
${code}
\`\`\`

Дай структурированный ответ в формате JSON.
    `;

    return this.generateContent(prompt, {
      temperature: 0.3,
      maxOutputTokens: 2048,
    });
  }

  /**
   * Генерация кода
   */
  async generateCode(description, language = 'python', framework = 'fastapi') {
    const prompt = `
Сгенерируй готовый к использованию ${language} код используя ${framework}.

Требование: ${description}

Код должен:
- Быть production-ready
- Иметь обработку ошибок
- Иметь документацию
- Следовать best practices
- Быть оптимизирован для производства

Верни только код без объяснений.
    `;

    return this.generateContent(prompt, {
      temperature: 0.2,
      maxOutputTokens: 4096,
    });
  }

  /**
   * Создать документацию
   */
  async generateDocumentation(code, title = 'API Documentation') {
    const prompt = `
Создай подробную документацию для этого кода в формате Markdown.

Заголовок: ${title}

Код:
\`\`\`
${code}
\`\`\`

Документация должна включать:
1. Описание
2. Установка
3. Использование
4. API Reference
5. Примеры
6. Troubleshooting
    `;

    return this.generateContent(prompt, {
      temperature: 0.5,
      maxOutputTokens: 4096,
    });
  }

  /**
   * Оптимизация кода
   */
  async optimizeCode(code, language = 'python') {
    const prompt = `
Оптимизируй этот ${language} код для:
1. Производительности
2. Читаемости
3. Памяти
4. Масштабируемости

Исходный код:
\`\`\`${language}
${code}
\`\`\`

Верни оптимизированный код с объяснениями изменений.
    `;

    return this.generateContent(prompt, {
      temperature: 0.3,
      maxOutputTokens: 4096,
    });
  }

  /**
   * Создать юнит-тесты
   */
  async generateTests(code, language = 'python', testFramework = 'pytest') {
    const prompt = `
Создай комплексные юнит-тесты для этого ${language} кода используя ${testFramework}.

Код:
\`\`\`${language}
${code}
\`\`\`

Тесты должны:
- Покрывать все функции
- Тестировать edge cases
- Использовать mocks когда нужно
- Проверять error handling
- Быть читаемыми и поддерживаемыми

Верни только тесты.
    `;

    return this.generateContent(prompt, {
      temperature: 0.4,
      maxOutputTokens: 4096,
    });
  }

  /**
   * Рефакторинг кода
   */
  async refactorCode(code, language = 'python', guidelines = '') {
    const prompt = `
Сделай рефакторинг этого ${language} кода.

Рекомендации:
${guidelines || '- Улучшить читаемость\n- Упростить логику\n- Уменьшить duplication'}

Код:
\`\`\`${language}
${code}
\`\`\`

Верни рефакторенный код с объяснениями.
    `;

    return this.generateContent(prompt, {
      temperature: 0.5,
      maxOutputTokens: 4096,
    });
  }

  /**
   * Найти проблемы безопасности
   */
  async securityAudit(code, language = 'python') {
    const prompt = `
Проведи полный security audit этого ${language} кода.

Код:
\`\`\`${language}
${code}
\`\`\`

Найди и объясни:
1. SQL Injection уязвимости
2. XSS уязвимости
3. CSRF уязвимости
4. Authentication проблемы
5. Authorization проблемы
6. Data exposure риски
7. Другие security issues

Дай рекомендации по исправлению.
    `;

    return this.generateContent(prompt, {
      temperature: 0.3,
      maxOutputTokens: 4096,
    });
  }

  /**
   * Объяснить код
   */
  async explainCode(code, language = 'python', detail = 'medium') {
    const prompt = `
Объясни этот ${language} код на русском языке с уровнем детали ${detail}.

Код:
\`\`\`${language}
${code}
\`\`\`

Объяснение должно быть ${detail === 'simple' ? 'простым и понятным для новичка' : detail === 'medium' ? 'подробным с примерами' : 'очень детальным с анализом сложности и оптимизаций'}.
    `;

    return this.generateContent(prompt, {
      temperature: 0.5,
      maxOutputTokens: 2048,
    });
  }

  /**
   * Перевести код между языками
   */
  async translateCode(code, fromLang = 'javascript', toLang = 'python') {
    const prompt = `
Переведи этот код с ${fromLang} на ${toLang}, сохраняя функциональность.

Исходный код (${fromLang}):
\`\`\`${fromLang}
${code}
\`\`\`

Требования:
- Следовать best practices ${toLang}
- Сохранить все функции
- Оптимизировать для ${toLang}
- Добавить типизацию если возможно

Верни только код на ${toLang}.
    `;

    return this.generateContent(prompt, {
      temperature: 0.3,
      maxOutputTokens: 4096,
    });
  }

  /**
   * Создать API спецификацию
   */
  async generateAPISpec(code, apiName = 'API') {
    const prompt = `
Создай полную OpenAPI/Swagger спецификацию для этого API в формате YAML.

Код:
\`\`\`
${code}
\`\`\`

Спецификация должна включать:
- Все endpoints
- Request/Response schemas
- Parameters и types
- Error responses
- Authentication
- Examples

Верни готовый YAML.
    `;

    return this.generateContent(prompt, {
      temperature: 0.3,
      maxOutputTokens: 4096,
    });
  }

  /**
   * Анализировать проект
   */
  async analyzeProject(projectDescription, files = []) {
    const filesList = files
      .map((f) => `- ${f.name}: ${f.description}`)
      .join('\n');

    const prompt = `
Проанализируй этот проект:

Описание: ${projectDescription}

Файлы:
${filesList}

Дай анализ:
1. Архитектура
2. Best practices соответствие
3. Потенциальные проблемы
4. Рекомендации улучшения
5. Пути развития

Структурируй ответ в JSON.
    `;

    return this.generateContent(prompt, {
      temperature: 0.4,
      maxOutputTokens: 4096,
    });
  }

  /**
   * Проверить модель доступности
   */
  async checkModelsAvailable() {
    try {
      const response = await axios.get(
        `${this.baseUrl}?key=${this.apiKey}`,
        {
          timeout: this.timeout,
        }
      );

      return response.data.models || [];
    } catch (error) {
      console.error('Ошибка проверки моделей:', error.message);
      return [];
    }
  }
}

module.exports = GeminiClient;
