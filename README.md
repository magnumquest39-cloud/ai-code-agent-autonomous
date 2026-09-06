# 🤖 AI Code Agent Autonomous

**Полностью автономный ИИ агент для разработки с поддержкой:**
- ✅ CodeLlama + Hugging Face моделей
- ✅ Модульной системы навыков (Skills)
- ✅ Оркестрации и режимов работы
- ✅ Автономного анализа кода и создания PR
- ✅ Загрузки моделей из HF и GitHub
- ✅ Пошагового расширения функционала

## 📁 Структура Проекта

```
ai-code-agent-autonomous/
├── 📂 src/
│   ├── agent/
│   │   ├── core.js              # Основной агент
│   │   ├── executor.js          # Исполнитель команд
│   │   └── orchestrator.js      # Оркестрация навыков
│   ├── models/
│   │   ├── ollama.js            # Интеграция Ollama
│   │   ├── huggingface.js       # HuggingFace API
│   │   ├── codemodel.js         # CodeLlama специально
│   │   └── loader.js            # Загрузчик моделей
│   ├── skills/
│   │   ├── code-analyzer.js     # Анализ кода
│   │   ├── pr-generator.js      # Создание PR
│   │   ├── code-writer.js       # Написание кода
│   │   ├── data-processor.js    # Обработка данных
│   │   ├── skill-registry.js    # Реестр навыков
│   │   └── custom-skills/       # Пользовательские навыки
│   ├── github/
│   │   ├── api.js               # GitHub API
│   │   ├── search.js            # Поиск данных
│   │   ├── repo-manager.js      # Управление репо
│   │   └── pr-handler.js        # Обработка PR
│   ├── config/
│   │   ├── models.js            # Конфиг моделей
│   │   ├── skills.js            # Конфиг навыков
│   │   └── modes.js             # Режимы работы
│   └── utils/
│       ├── logger.js            # Логирование
│       ├── cache.js             # Кеширование
│       └── validators.js        # Валидация
├── 📂 data/
│   ├── models-index.json        # Индекс моделей
│   ├── skills-registry.json     # Реестр навыков
│   └── examples/                # Примеры использования
├── 📂 .github/
│   └── workflows/
│       ├── agent-run.yml        # Автозапуск агента
│       └── model-sync.yml       # Синхронизация моделей
├── package.json
├── .env.example
└── ARCHITECTURE.md
```

## 🔧 Установка

```bash
git clone https://github.com/magnumquest39-cloud/ai-code-agent-autonomous.git
cd ai-code-agent-autonomous
npm install
cp .env.example .env
```

## 📚 Основные компоненты

### 1. **Модели ИИ** (Бесплатно)
- CodeLlama (локально или HF)
- Mistral
- DeepSeek-Coder
- Ollama (оффлайн)

### 2. **Навыки (Skills)**
- Анализ кода
- Создание PR
- Генерация кода
- Обработка данных
- Поиск и исправление ошибок

### 3. **Режимы работы**
- `autonomous` - полностью автономно
- `supervised` - с подтверждениями
- `interactive` - диалоговый режим
- `scheduled` - по расписанию

### 4. **Оркестрация**
- Цепочка навыков
- Параллельное выполнение
- Обработка ошибок
- Логирование операций

## 🎯 Быстрый старт

```javascript
const Agent = require('./src/agent/core');

const agent = new Agent({
  model: 'codemodel',
  mode: 'autonomous',
  skills: ['code-analyzer', 'pr-generator']
});

await agent.analyze('https://github.com/user/repo');
await agent.generatePR('Fix: Optimize performance');
```

## 🌐 Бесплатные источники данных

- **GitHub API** - поиск репо, кода, issues
- **Hugging Face Hub** - 10k+ моделей
- **Open Source Models** - CodeLlama, Mistral, DeepSeek
- **GitHub Raw Content** - доступ к файлам
- **Community Datasets** - на GitHub

## 📖 Документация

- [Architecture](./ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Skills Guide](./docs/SKILLS.md)
- [Configuration](./docs/CONFIG.md)

---

**Создатель:** magnumquest39-cloud  
**Лицензия:** MIT  
**Статус:** 🚀 In Development
