# Diagnostic Reporters

Модули для сбора и структурированной отчетности ESLint и TypeScript диагностик с security-first подходом и потоковой обработкой.

## Структура директорий

```
.omnyreporter/
├── eslint/
│   └── errors/
│       ├── src_file1.ts.eslint-errors.json
│       └── src_file2.ts.eslint-errors.json
├── typescript/
│   └── errors/
│       ├── src_file1.ts.tsc-errors.json
│       └── src_file2.ts.tsc-errors.json
└── report.json (сводный отчёт)
```

## Использование

### CLI

```bash
# Все диагностики
npm run report:all

# Только ESLint
npm run report:lint

# Только TypeScript
npm run report:tsc

# С опциями
node bin/omny.js diagnostics --run all --verbose --output ./custom-reports
```

### Programmatic API

```typescript
import { ReportingFacade, ReportingOrchestrator } from './src/reporters/index.js';

// Простой вариант - фасад
const facade = new ReportingFacade(process.cwd());
const { result, writeStats } = await facade.collectEslintDiagnostics();

// Полный контроль - оркестратор
const config = {
	run: 'all',
	outputDir: '.omnyreporter',
	verbose: true,
	exitCodeOnError: true,
	cwd: process.cwd(),
};

const orchestrator = new ReportingOrchestrator(config);
const result = await orchestrator.execute();
orchestrator.printResults(result);
```

## Архитектура

### Принципы

1. **Абстракция**: все компоненты зависят от интерфейсов, не от реализаций
2. **Security-first**: валидация путей, санитизация сообщений, проверка прав доступа
3. **Потоковость**: обработка больших объёмов данных через async iterables
4. **SOLID**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
5. **Dependency Injection**: все зависимости инъектируются через конструкторы

### Модули

#### Shared (`src/reporters/shared/`)
- **PathNormalizer**: кроссплатформенная нормализация путей с кешированием
- **SecurityValidator**: валидация путей, санитизация сообщений
- **DirectoryManager**: управление структурой `.omnyreporter`
- **Logger**: обёртка над pino с настройкой
- **JsonReportWriter**: потоковая запись JSON отчётов
- **DiagnosticsAggregator**: агрегация диагностик с подсчётом статистики
- **BaseDiagnosticSource**: базовый класс для репортеров

#### ESLint Reporter (`src/reporters/eslint/`)
- **EslintLinter**: обёртка над ESLint API
- **LintMessageParser**: преобразование ESLint сообщений в `Diagnostic`
- **LintStreamProcessor**: потоковая обработка результатов
- **FileCollector**: сбор файлов для линтинга
- **EslintReporter**: главный класс репортера
- **EslintReporterFactory**: фабрика для создания экземпляров

#### TypeScript Reporter (`src/reporters/typescript/`)
- **TypeScriptCompiler**: обёртка над TypeScript Compiler API
- **TypeScriptMessageFormatter**: форматирование диагностик
- **DiagnosticsParser**: преобразование `ts.Diagnostic` в `Diagnostic`
- **TscStreamProcessor**: потоковая обработка диагностик
- **TypeScriptReporter**: главный класс репортера
- **TypeScriptReporterFactory**: фабрика для создания экземпляров

#### Orchestration
- **ReportingFacade**: упрощённый API для запуска репортеров
- **ReportingOrchestrator**: координация нескольких репортеров

## Формат диагностик

### Diagnostic

```typescript
interface Diagnostic {
	filePath: string;        // нормализованный относительный путь
	line: number;            // 1-based
	column: number;          // 1-based
	severity: 'error' | 'warning';
	ruleId?: string;         // ESLint: имя правила; TypeScript: TS-код
	message: string;         // очищенное сообщение
	suggestion?: string;     // опциональное предложение по исправлению
	source: 'eslint' | 'typescript';
}
```

### DiagnosticsResult

```typescript
interface DiagnosticsResult {
	diagnostics: Diagnostic[];
	summary: {
		totalFiles: number;
		totalErrors: number;
		totalWarnings: number;
		processingTimeMs: number;
	};
	metadata: {
		reportedAt: Date;
		sourceVersion?: string;
		executedOn: string;
	};
}
```

## Безопасность

### Path Validation
- Проверка, что пути не выходят за пределы проекта
- Блокировка системных директорий (`/etc`, `C:\Windows`)
- Поддержка строгого (`strict`) и умеренного (`moderate`) режимов

### Message Sanitization
- Удаление абсолютных путей с именами пользователей
- Маскировка API ключей и токенов
- Удаление переменных окружения
- Замена путей на относительные

## Производительность

- **Кеширование**: нормализованные пути кешируются
- **Batch Processing**: обработка по 100 диагностик за раз
- **Async Iterables**: потоковая обработка без загрузки всего в память
- **Параллелизм**: ESLint и TypeScript запускаются параллельно

## Расширение

### Добавление нового репортера

1. Создать директорию `src/reporters/<name>/`
2. Реализовать `DiagnosticSource` интерфейс
3. Создать фабрику
4. Добавить в оркестратор

### Кастомная обработка диагностик

```typescript
import { EslintReporterFactory } from './src/reporters/index.js';

const reporter = EslintReporterFactory.create({
	cwd: process.cwd(),
	sanitize: true,
	securityPolicy: 'strict',
});

const result = await reporter.collect(config);

// Фильтрация только ошибок
const errors = result.diagnostics.filter(d => d.severity === 'error');
```

## Тестирование

```bash
# Запуск тестов
npm test

# С coverage
npm run test:coverage
```

## API для LLM

Диагностики структурированы для удобной обработки LLM:
- Каждый файл в отдельном JSON
- Стандартизированная схема
- Очищенные сообщения без технических деталей
- Контекст: файл, строка, колонка, severity, правило

### Пример использования для LLM-обработки

```typescript
import fs from 'fs/promises';

const errorsDir = '.omnyreporter/eslint/errors';
const files = await fs.readdir(errorsDir);

for (const file of files) {
	const content = await fs.readFile(`${errorsDir}/${file}`, 'utf8');
	const diagnostics = JSON.parse(content);
	
	// Отправить в LLM для анализа и генерации фиксов
	const fixes = await llm.generateFixes(diagnostics);
}
```
