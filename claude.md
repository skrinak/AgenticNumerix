# Claude Code Instructions

## Project Organization

### Documents Folder
All documentation, explanations, guides, and narrative documents should be placed in the `/Documents` folder:

- **Technical explanations** (NOTEBOOK_EXPLAINED.md, ARCHITECTURE_NARRATIVE.md)
- **Presentation materials** (Documents/Presentation/)
- **Task planning documents** (TASKS_*.md files)
- **Architecture descriptions**
- **User guides and tutorials**
- **API documentation**

**Exceptions** (kept in root):
- `README.md` - Main project overview
- `claude.md` - This instructions file
- `.env.example` - Environment configuration template

### Utils Folder
All utility scripts, automation tools, and helper scripts should be placed in the `/utils` folder:

- **Architecture diagrams** (Python diagrams framework)
- **Data generation scripts**
- **Deployment automation scripts**
- **Testing utilities**
- **Code generation tools**
- **Analysis scripts**

### Example Structure
```bash
Documents/
├── NOTEBOOK_EXPLAINED.md           # Technical notebook explanation
├── ARCHITECTURE_NARRATIVE.md       # Architecture workflow narrative
├── TASKS_REACT_FRONTEND.md         # Frontend implementation tasks
├── TASKS_AWS_DEPLOYMENT.md         # AWS deployment tasks
└── Presentation/                   # Executive presentation materials
    ├── EXECUTIVE_SUMMARY.md
    ├── TECHNICAL_ARCHITECTURE.md
    └── ROI_CALCULATION.md

utils/
├── architecture_diagram.py          # AWS architecture visualization
├── generate_mock_data.py           # Mock data generation
├── deploy_infrastructure.sh        # Deployment automation
└── run_optimization_test.py        # Testing utilities
```

## Code Style & Conventions

### Python
- Use type hints for function parameters and return values
- Follow PEP 8 style guidelines
- Include docstrings for all functions and classes
- Use descriptive variable names

### TypeScript/React
- Use functional components with hooks
- Implement proper TypeScript types (no `any`)
- Follow React best practices for state management
- Keep components focused and single-purpose

### Documentation
- Update README.md when adding new features
- Document all environment variables in .env.example
- Add inline comments for complex logic
- Keep TASKS_*.md files updated with progress

## AWS Deployment
- All infrastructure deploys to **us-west-2 (Oregon)**
- Use Terraform for infrastructure as code
- Follow least-privilege security principles
- Enable logging and monitoring for all services

## Git Workflow
- Create meaningful commit messages
- Include Claude Code attribution in commits
- Test changes locally before committing
- Keep commits focused on single features/fixes
