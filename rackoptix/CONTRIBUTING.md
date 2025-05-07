# Contributing to RackOptix

Thank you for your interest in contributing to RackOptix! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing](#testing)
8. [Documentation](#documentation)
9. [Issue Reporting](#issue-reporting)
10. [Feature Requests](#feature-requests)
11. [Contact](#contact)

## Code of Conduct

We are committed to providing a friendly, safe, and welcoming environment for all contributors. By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

### Prerequisites

- Docker and Docker Compose for local development
- Node.js 18+
- Python 3.9+
- PostgreSQL 14+ with PostGIS extension (if not using Docker)

### Setting Up the Development Environment

1. **Fork the repository** on GitHub.

2. **Clone your fork**:
   ```bash
   git clone https://github.com/yourusername/rackoptix.git
   cd rackoptix
   ```

3. **Add the upstream repository**:
   ```bash
   git remote add upstream https://github.com/originalusername/rackoptix.git
   ```

4. **Set up the environment**:
   Create a `.env` file in the root directory with the following variables:
   ```
   # Database Configuration
   POSTGRES_USER=rackoptix
   POSTGRES_PASSWORD=rackoptix_password
   POSTGRES_DB=rackoptix
   
   # API Configuration
   API_PORT=3000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret
   
   # Backend Configuration
   BACKEND_PORT=8000
   
   # Frontend Configuration
   FRONTEND_PORT=3001
   ```

5. **Start the services with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

6. **Initialize the database**:
   ```bash
   docker-compose exec db /bin/bash -c "cd /docker-entrypoint-initdb.d && ./run_migrations.sh"
   ```

7. **Access the application**:
   - Frontend: http://localhost:3001
   - API: http://localhost:3000
   - Backend: http://localhost:8000
   - Database: localhost:5432

## Development Workflow

1. **Create a new branch** for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bugfix-name
   ```

2. **Make your changes** and commit them following the [commit guidelines](#commit-guidelines).

3. **Keep your branch updated** with the upstream repository:
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```

4. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a pull request** following the [pull request process](#pull-request-process).

## Coding Standards

### Python

- Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/) style guide.
- Use [Black](https://black.readthedocs.io/) for code formatting.
- Use [Flake8](https://flake8.pycqa.org/) for linting.
- Use [MyPy](https://mypy.readthedocs.io/) for static type checking.
- Write docstrings for all functions, classes, and modules.

### TypeScript/JavaScript

- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript).
- Use [ESLint](https://eslint.org/) for linting.
- Use [Prettier](https://prettier.io/) for code formatting.
- Use TypeScript for type safety.
- Write JSDoc comments for all functions, classes, and interfaces.

### SQL

- Use uppercase for SQL keywords and lowercase for identifiers.
- Use singular names for tables.
- Use snake_case for column names.
- Include comments for complex queries.

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Changes that do not affect the meaning of the code (formatting, etc.)
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Changes to the build process or auxiliary tools

Examples:
- `feat(api): add endpoint for product categories`
- `fix(frontend): resolve layout issue in facility editor`
- `docs(readme): update installation instructions`

## Pull Request Process

1. **Create a pull request** from your feature branch to the `develop` branch of the upstream repository.

2. **Fill out the pull request template** with all required information.

3. **Ensure all tests pass** and the code meets the coding standards.

4. **Request a review** from at least one team member.

5. **Address any review comments** and make necessary changes.

6. **Once approved**, your pull request will be merged by a maintainer.

## Testing

All code changes must include appropriate tests:

### Backend Tests

```bash
cd backend
python -m pytest
```

### API Tests

```bash
cd api
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

### End-to-End Tests

```bash
cd e2e
npm test
```

## Documentation

- Update documentation for any changes to APIs, features, or behavior.
- Add inline documentation for complex code.
- Update the README.md if necessary.
- Add entries to the CHANGELOG.md for significant changes.

## Issue Reporting

When reporting issues, please use the issue template and include:

1. **Description**: A clear description of the issue.
2. **Steps to Reproduce**: Detailed steps to reproduce the issue.
3. **Expected Behavior**: What you expected to happen.
4. **Actual Behavior**: What actually happened.
5. **Environment**: Your operating system, browser, and versions.
6. **Screenshots**: If applicable, add screenshots to help explain the issue.

## Feature Requests

When requesting features, please use the feature request template and include:

1. **Description**: A clear description of the feature.
2. **Use Case**: Why this feature would be useful.
3. **Proposed Solution**: If you have ideas on how to implement the feature.
4. **Alternatives**: Any alternative solutions you've considered.

## Contact

If you have questions or need help, please:

1. **Check the documentation** first.
2. **Search for existing issues** that might address your question.
3. **Create a new issue** if you can't find an answer.
4. **Contact the maintainers** at [dev@rackoptix.com](mailto:dev@rackoptix.com) for urgent matters.

Thank you for contributing to RackOptix!