# Contributing to Yubi App

We welcome contributions to improve the platform for robotics data collection and management!

## Quick Start for Contributors

### Development Setup

1. Fork the repository and clone your fork:
   ```bash
   git clone https://github.com/your-username/yubi-app.git
   cd yubi-app
   ```

2. Copy environment files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.sample frontend/.env
   ```

3. Start the development environment:
   ```bash
   make up PLATFORM=arm64  # Apple Silicon
   # or
   make up                 # Intel / Linux
   ```

4. Apply migrations and seed data:
   ```bash
   make migrate
   make seed
   ```

5. Verify everything works:
   ```bash
   make be-test    # Backend tests
   make fe-ci      # Frontend checks
   ```

## Development Workflow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes and add tests**
   - Add unit tests for new functionality
   - Update documentation as needed

3. **Run quality checks:**
   ```bash
   # Backend
   make be-fmt     # Format Go code
   make be-lint    # Run staticcheck
   make be-test    # Run tests

   # Frontend
   make fe-fmt     # Format with Prettier
   make fe-lint    # Run ESLint
   make fe-ci      # All checks (lint, format, typecheck, build)
   ```

4. **Commit your changes:**
   ```bash
   git commit -m "feat: add your descriptive commit message"
   ```
   - Use [Conventional Commits](https://www.conventionalcommits.org/) format
   - Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
   - Reference issue numbers when applicable

5. **Push and create a Pull Request:**
   ```bash
   git push origin feature/your-feature-name
   ```

## Pull Request Guidelines

- **Title**: Use Conventional Commits format (e.g., `feat(backend): add episode export`)
- **Description**: Explain what changes you made and why
- **Tests**: Include tests for new functionality
- **Quality**: All CI checks must pass
- **Documentation**: Update README.md if needed
- **Reference**: Link any related issues

## Reporting Issues

### Bug Reports

- Use clear, descriptive titles
- Include steps to reproduce
- Provide environment details (OS, Docker version, etc.)
- Include relevant log outputs (`make logs`)

### Feature Requests

- Describe the feature and its use case
- Explain how it would benefit the community
- Consider implementation complexity

## Types of Contributions

### Code Contributions

- Bug fixes
- New features
- Performance improvements
- Code refactoring

### Robot Integration

- New robot platform support
- Improvements to data collection workflows
- Configuration examples

### Documentation

- README improvements
- Code documentation
- Usage examples and tutorials

## Code Standards

### Backend (Go)

- Go 1.25+ compatible
- Format: `make be-fmt`
- Lint: `make be-lint` (staticcheck)
- Follow Clean Architecture patterns

### Frontend (TypeScript)

- TypeScript strict mode
- Format: `make fe-fmt` (Prettier)
- Lint: `make fe-lint` (ESLint)
- CI: `make fe-ci` (lint + format + typecheck + build)
- Use React Server Components where appropriate

### API Changes

- Edit `openapi/openapi.yaml` first (single source of truth)
- Regenerate code: `make be-generate-api && make fe-generate-api`
- Never edit generated files directly

## Questions & Support

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion

## License

By contributing to this project, you agree that your contributions will be licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.
