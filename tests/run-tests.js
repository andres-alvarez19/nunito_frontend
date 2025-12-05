const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const assert = require('assert');
const Module = require('module');
const originalRequire = Module.prototype.require;

// Minimal test harness
const tests = [];
let currentSuite = '';

global.describe = (name, fn) => {
  const previous = currentSuite;
  currentSuite = previous ? `${previous} ${name}` : name;
  fn();
  currentSuite = previous;
};

global.it = (name, fn) => {
  const fullName = currentSuite ? `${currentSuite} ${name}` : name;
  tests.push({ name: fullName, fn });
};

// TS require hook with simple alias support (@/ -> src/)
require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const patched = source.replace(/from ['"]@\/(.*?)['"]/g, (_m, p1) => {
    const resolved = path.join(process.cwd(), 'src', p1);
    return `from "${resolved}"`;
  });
  const { outputText } = ts.transpileModule(patched, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
    },
  });
  return module._compile(outputText, filename);
};

// Simple mock registry
const mockMap = new Map();
global.__registerMock = (id, mock) => {
  mockMap.set(id, mock);
};
Module.prototype.require = function (id) {
  if (id === '@/controllers') {
    if (mockMap.has(id)) return mockMap.get(id);
    // default noop axios-like client to avoid network calls
    const noop = async () => ({ data: {} });
    return { apiClient: { post: noop, get: noop } };
  }
  if (id.includes(`${path.sep}src${path.sep}controllers`)) {
    const mock = mockMap.get('@/controllers');
    if (mock) return mock;
    const noop = async () => ({ data: {} });
    return { apiClient: { post: noop, get: noop } };
  }
  if (id === '@react-native-async-storage/async-storage') {
    return {
      default: {
        getItem: async () => null,
        setItem: async () => undefined,
        removeItem: async () => undefined,
      },
      getItem: async () => null,
      setItem: async () => undefined,
      removeItem: async () => undefined,
    };
  }
  if (mockMap.has(id)) {
    return mockMap.get(id);
  }
  return originalRequire.call(this, id);
};

const testsDir = path.join(process.cwd(), 'tests');
fs.readdirSync(testsDir)
  .filter((file) => file.endsWith('.test.ts'))
  .forEach((file) => require(path.join(testsDir, file)));

(async () => {
  let failed = 0;
  for (const { name, fn } of tests) {
    try {
      const result = fn();
      if (result instanceof Promise) {
        await result;
      }
      console.log(`✓ ${name}`);
    } catch (error) {
      failed += 1;
      console.error(`✗ ${name}`);
      console.error(error);
    }
  }

  if (failed > 0) {
    console.error(`\n${failed} test(s) failed.`);
    process.exit(1);
  } else {
    console.log(`\nAll ${tests.length} tests passed.`);
  }
})();
