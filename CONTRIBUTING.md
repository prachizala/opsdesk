# Contributing to OpsDesk

Thank you for your interest in contributing to OpsDesk! This document outlines local setup instructions, testing procedures, commit conventions, and repository guidelines.

---

## License Notice
**LICENSE: TBD, team decision pending.**
This project does not yet include an open-source license file. All rights are reserved until formal team determination.

---

## 1. Local Environment Setup

### Prerequisites
- Python 3.11+
- Node.js 20.x + npm 10+
- SQLite 3.35+ (bundled with Python)

### Backend Setup
```bash
# Create and activate virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

### Frontend Setup
```bash
cd frontend
npm ci
```

---

## 2. Running Tests & Quality Checks

### Backend Tests
Always run backend tests against isolated temporary database copies. Never target `opsdesk.db` during test runs.
```bash
# Run pytest suite
pytest backend/tests -v
```

### Frontend Verification
```bash
cd frontend
npm run lint
npm run build
npm audit --omit=dev --audit-level=high
```

---

## 3. Commit Message Conventions

We follow Conventional Commits format with mandatory co-authorship trailers:

```
<type>(<scope>): <subject>

<body>

Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Gemini <noreply@google.com>
```

### Types:
- `feat`: A new feature or capability
- `fix`: A bug fix or defect resolution
- `perf`: Performance improvements
- `refactor`: Code reorganization without behavioral change
- `chore`: Maintenance, dependencies, or toolchain updates
- `ci`: Changes to CI/CD workflows and actions
- `docs`: Documentation updates or ADR additions

---

## 4. Pull Request Guidelines

1. Create a descriptive feature branch from the appropriate target base.
2. Ensure every commit compiles cleanly and passes all test suites.
3. Fill out the PR template with explicit verification output.
4. Do not commit secrets, environment tokens, `.venv`, or SQLite database files (`*.db`, `*.db-wal`, `*.db-shm`).
