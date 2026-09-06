.github/copilot-instructions.md
# 🤖 GitHub Copilot Instructions for AI Code Agent

## Context
This is an autonomous AI code development agent with:
- Full code generation capabilities
- PR creation and management
- Automatic code analysis and optimization
- Skill orchestration system
- HuggingFace model integration

## Key Guidelines for Copilot

### Code Generation
- Generate production-ready code with error handling
- Follow Node.js best practices
- Use async/await patterns
- Include comprehensive logging
- Add JSDoc comments for all functions

### PR & Commits
- Create descriptive commit messages
- Reference issues when applicable
- Include changelog entries
- Add tests for new features

### Performance Optimization (for Poco F5 & low-resource devices)
- Minimize memory usage
- Use streams for large files
- Implement caching strategies
- Optimize module bundling
- Support offline functionality

### Architecture
- Modular design with clear separation of concerns
- Event-driven architecture
- Plugin-based skill system
- Support for custom extensions

### Security
- Sanitize all inputs
- Validate API responses
- Use environment variables for secrets
- No hardcoded credentials

### Documentation
- Keep README updated
- Document all APIs
- Add examples for features
- Maintain CHANGELOG

## Useful Prompts

```
# Generate a new skill
"Create a skill module for [task] that integrates with the orchestrator"

# Optimize code
"Optimize this code for low-memory devices and improve performance"

# Create PR
"Generate a pull request for [feature] with tests and documentation"

# Analyze code
"Analyze this code for issues, security concerns, and optimization opportunities"

# Extend functionality
"Add support for [feature] following the existing architecture patterns"
```
