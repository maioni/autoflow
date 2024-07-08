module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true, // Coletar cobertura de código
  coverageDirectory: 'coverage', // Diretório onde os relatórios de cobertura serão salvos
  collectCoverageFrom: ['src/**/*.ts'], // Arquivos de onde a cobertura será coletada
  coveragePathIgnorePatterns: ['src/index.ts'], // Arquivos a serem ignorados na coleta de cobertura
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'], // Formatos de relatório de cobertura
  testMatch: ['**/tests/**/*.test.ts'], // Padrão para localizar arquivos de teste
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
};
