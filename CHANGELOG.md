# Changelog

## [Unreleased]

### Added
- Automated CI/CD pipeline with NPM publishing
- Path traversal security protection
- Pre-push git hooks for testing
- Version management scripts

### Security
- Fixed path traversal vulnerability
- Added security audit in CI pipeline

## [2.0.0-beta.1] - 2024-11-14

### Added
- Colon-to-slash icon format conversion (`fluent:home-24-filled` → `fluent/home-24-filled`)
- Batch icon downloads with comma-separated lists
- TypeScript support with `--withts` flag
- Comprehensive test suite with 39+ tests
- CLI commands: `download` and `search`
- Interactive icon selection
- Progress tracking for batch operations
- Concurrency control for API requests
- TSConfig validation and path mapping suggestions

### Changed
- Improved error handling and user feedback
- Better component name generation
- Enhanced CLI interface with Commander.js

### Fixed
- Icon name parsing edge cases
- Component generation for complex icon names
- File path handling improvements
