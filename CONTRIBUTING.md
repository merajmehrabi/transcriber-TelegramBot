# Contributing to Telegram Audio Transcription Bot

First off, thank you for considering contributing to this project! 

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include logs if relevant (with sensitive information removed)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* Use a clear and descriptive title
* Provide a step-by-step description of the suggested enhancement
* Provide specific examples to demonstrate the steps
* Describe the current behavior and explain which behavior you expected to see instead
* Explain why this enhancement would be useful

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Include screenshots and animated GIFs in your pull request whenever possible
* Follow the JavaScript/Node.js styleguides
* Include thoughtfully-worded, well-structured tests
* Document new code
* End all files with a newline

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* Consider starting the commit message with an applicable emoji:
    * 🎨 `:art:` when improving the format/structure of the code
    * 🐎 `:racehorse:` when improving performance
    * 📝 `:memo:` when writing docs
    * 🐛 `:bug:` when fixing a bug
    * 🔥 `:fire:` when removing code or files
    * ✅ `:white_check_mark:` when adding tests
    * 🔒 `:lock:` when dealing with security
    * ⬆️ `:arrow_up:` when upgrading dependencies
    * ⬇️ `:arrow_down:` when downgrading dependencies

### JavaScript Styleguide

* Use ES modules (`import`/`export`)
* Use template literals instead of string concatenation
* Use `const` for all references; avoid `var`
* Use arrow functions over anonymous function expressions
* Use parentheses around arrow function arguments
* Use async/await over callbacks
* Add trailing commas
* Use meaningful variable names

### Documentation Styleguide

* Use [JSDoc](https://jsdoc.app/) for code documentation
* Use Markdown for project documentation
* Reference methods and classes in markdown with backticks
* Include code examples in documentation when relevant
* Keep documentation up to date with code changes

## Project Structure

```
transcribe-TB/
├── src/               # Source code
│   ├── config/       # Configuration files
│   │   ├── config.js       # Main configuration
│   │   └── languages.js    # Language settings
│   ├── services/     # Core services
│   │   ├── telegramBot.js  # Telegram bot service
│   │   ├── speechToText.js # Speech recognition
│   │   └── proofreader.js  # Text improvement
│   └── utils/        # Utility functions
│       ├── audioProcessor.js # Audio handling
│       ├── languageUtils.js  # Language utilities
│       └── logger.js         # Logging system
├── locales/          # Language files
│   ├── en/          # English translations
│   ├── fa/          # Persian translations
│   └── sv/          # Swedish translations
├── logs/            # Application logs
├── temp/            # Temporary files
├── memory-bank/     # Project documentation
├── .env.example     # Environment variables template
├── .gitignore       # Git ignore rules
├── LICENSE          # MIT license
├── README.md        # Project documentation
├── CONTRIBUTING.md  # Contribution guidelines
└── package.json     # Project dependencies
```

## Development Process

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Setting Up Development Environment

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your settings
```

3. Start development server:
```bash
npm run dev
```

## Testing

* Write tests for new features
* Ensure all tests pass before submitting PR
* Follow existing test patterns
* Include both unit and integration tests

## Questions?

Feel free to open an issue with your question or contact the maintainers directly.
