/**
 * Hugging Face Integration Module
 * Интеграция с Hugging Face для загрузки и управления моделями
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class HuggingFaceClient {
  constructor(config = {}) {
    this.apiUrl = 'https://huggingface.co/api';
    this.apiToken = process.env.HF_API_TOKEN || config.token;
    this.modelsPath = config.modelsPath || './models/hf';
    this.cache = new Map();
    this.timeout = config.timeout || 30000;
  }

  /**
   * Получить информацию о модели
   */
  async getModelInfo(modelId) {
    if (this.cache.has(modelId)) {
      return this.cache.get(modelId);
    }

    try {
      const response = await axios.get(
        `${this.apiUrl}/models/${modelId}`,
        {
          headers: this.getHeaders(),
          timeout: this.timeout,
        }
      );
      
      const modelInfo = response.data;
      this.cache.set(modelId, modelInfo);
      return modelInfo;
    } catch (error) {
      throw new Error(`Failed to fetch model ${modelId}: ${error.message}`);
    }
  }

  /**
   * Поиск моделей по тегам и фильтрам
   */
  async searchModels(query, options = {}) {
    try {
      const params = new URLSearchParams({
        search: query,
        sort: options.sort || 'downloads',
        direction: options.direction || -1,
        limit: options.limit || 20,
        filter: options.filter || 'text-generation',
      });

      const response = await axios.get(
        `${this.apiUrl}/models?${params.toString()}`,
        {
          headers: this.getHeaders(),
          timeout: this.timeout,
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  /**
   * Найти модели для кодирования
   */
  async findCodeModels(limit = 10) {
    const codeKeywords = [
      'code',
      'programming',
      'codelama',
      'codegen',
      'copilot',
    ];

    let allModels = [];

    for (const keyword of codeKeywords) {
      try {
        const models = await this.searchModels(keyword, {
          filter: 'text-generation',
          limit: 5,
        });
        allModels = allModels.concat(models);
      } catch (error) {
        console.warn(`Error searching for ${keyword}:`, error.message);
      }
    }

    // Удалить дубликаты и вернуть топ модели
    const uniqueModels = Array.from(
      new Map(allModels.map((m) => [m.id, m])).values()
    );

    return uniqueModels.slice(0, limit);
  }

  /**
   * Получить файлы модели
   */
  async getModelFiles(modelId) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/models/${modelId}/tree`,
        {
          headers: this.getHeaders(),
          timeout: this.timeout,
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get model files: ${error.message}`);
    }
  }

  /**
   * Скачать модель (gguf, safetensors, bin)
   */
  async downloadModel(modelId, fileName, options = {}) {
    try {
      const fileUrl = `https://huggingface.co/${modelId}/resolve/main/${fileName}`;
      const savePath = path.join(this.modelsPath, modelId, fileName);

      // Создать директорию если не существует
      await fs.mkdir(path.dirname(savePath), { recursive: true });

      console.log(`⬇️  Downloading: ${modelId}/${fileName}`);
      console.log(`📁 Path: ${savePath}`);

      const response = await axios.get(fileUrl, {
        headers: this.getHeaders(),
        responseType: 'stream',
        timeout: this.timeout * 2,
      });

      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;

      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk) => {
          downloadedSize += chunk.length;
          const percent = ((downloadedSize / totalSize) * 100).toFixed(2);
          process.stdout.write(
            `\r Progress: ${percent}% (${(downloadedSize / 1024 / 1024).toFixed(2)}MB)`
          );
        });

        const file = fs.createWriteStream(savePath);
        response.data.pipe(file);

        file.on('finish', () => {
          console.log('\n✅ Download complete!');
          resolve(savePath);
        });

        file.on('error', reject);
      });
    } catch (error) {
      throw new Error(`Download failed: ${error.message}`);
    }
  }

  /**
   * Получить информацию о популярных моделях для разработки
   */
  async getPopularDevModels() {
    const models = [
      {
        id: 'meta-llama/Llama-2-7b-hf',
        name: 'Llama 2 (7B)',
        description: 'Meta LLM для генерации текста',
        type: 'general',
      },
      {
        id: 'TheBloke/Mistral-7B-Instruct-v0.1-GGUF',
        name: 'Mistral 7B Instruct',
        description: 'Оптимизированная для инструкций',
        type: 'instruct',
      },
      {
        id: 'codellama/CodeLlama-7b-Instruct-hf',
        name: 'CodeLlama 7B Instruct',
        description: 'Специально для кодирования',
        type: 'code',
      },
      {
        id: 'TheBloke/deepseek-coder-6.7B-instruct-GGUF',
        name: 'DeepSeek Coder 6.7B',
        description: 'Мощная модель для кода',
        type: 'code',
      },
      {
        id: 'TheBloke/neural-chat-7B-v3-1-GGUF',
        name: 'Neural Chat 7B',
        description: 'Чат модель общего назначения',
        type: 'chat',
      },
    ];

    return models;
  }

  /**
   * Загрузить модель локально
   */
  async loadModel(modelId, quantization = 'q4_k_m') {
    try {
      console.log(`\n🔍 Searching for model: ${modelId}`);

      const modelInfo = await this.getModelInfo(modelId);
      const files = await this.getModelFiles(modelId);

      // Найти подходящий файл
      let targetFile = null;

      if (quantization) {
        // Поиск квантированного файла
        targetFile = files.find((f) => f.name.includes(quantization));
      }

      // Если не найден квантированный, использовать .gguf или .bin
      if (!targetFile) {
        targetFile =
          files.find((f) => f.name.endsWith('.gguf')) ||
          files.find((f) => f.name.endsWith('.bin')) ||
          files.find((f) => f.name.endsWith('.safetensors'));
      }

      if (!targetFile) {
        throw new Error('No suitable model file found');
      }

      console.log(`📦 Found file: ${targetFile.name}`);

      // Скачать модель
      const localPath = await this.downloadModel(modelId, targetFile.name);

      return {
        modelId,
        localPath,
        fileName: targetFile.name,
        size: targetFile.size,
        modelInfo,
      };
    } catch (error) {
      throw new Error(`Failed to load model: ${error.message}`);
    }
  }

  /**
   * Получить локальные кешированные модели
   */
  async getLocalModels() {
    try {
      const models = [];
      const dirs = await fs.readdir(this.modelsPath);

      for (const dir of dirs) {
        const dirPath = path.join(this.modelsPath, dir);
        const files = await fs.readdir(dirPath);
        models.push({
          id: dir,
          files,
          path: dirPath,
        });
      }

      return models;
    } catch (error) {
      return [];
    }
  }

  /**
   * Получить заголовки для запросов
   */
  getHeaders() {
    const headers = {
      'User-Agent': 'ai-code-agent-autonomous/1.0',
    };

    if (this.apiToken) {
      headers['Authorization'] = `Bearer ${this.apiToken}`;
    }

    return headers;
  }

  /**
   * Проверить доступность модели
   */
  async checkModelAvailability(modelId) {
    try {
      const response = await axios.head(
        `https://huggingface.co/${modelId}`,
        {
          timeout: 5000,
        }
      );
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Получить информацию о лицензии модели
   */
  async getModelLicense(modelId) {
    try {
      const modelInfo = await this.getModelInfo(modelId);
      return {
        license: modelInfo.license,
        tags: modelInfo.tags,
        private: modelInfo.private,
      };
    } catch (error) {
      return null;
    }
  }
}

module.exports = HuggingFaceClient;
