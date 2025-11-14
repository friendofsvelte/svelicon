# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Pre-push git hooks to run tests before pushing
- GitHub Actions CI/CD pipeline
- Comprehensive security tests
- Path traversal protection

### Security
- Fixed path traversal vulnerability in output directory handling
- Added input sanitization for output paths

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
