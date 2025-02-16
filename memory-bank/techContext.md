# Technical Context

## Technologies Used

### Core Technologies
- Node.js (ES Modules)
- Grammy (Telegram Bot Framework)
- Google Cloud Speech-to-Text API
- FFmpeg (Audio Processing)

### Dependencies
```json
{
  "@google-cloud/speech": "^6.0.0",
  "axios": "^1.6.2",
  "dotenv": "^16.3.1",
  "fluent-ffmpeg": "^2.1.2",
  "grammy": "^1.19.2"
}
```

## Development Setup

### Environment Variables
```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
ADMIN_USER_ID=your_telegram_user_id_here
TELEGRAM_USER_WHITELIST=user_id1,user_id2,user_id3

# Google Cloud Configuration
GOOGLE_APPLICATION_CREDENTIALS=path_to_credentials.json

# Bot Settings
MAX_AUDIO_SIZE=20971520
DEFAULT_LANGUAGE=en
WHITELIST_ENABLED=true

# Debug Configuration
DEBUG_MODE=false
LOG_LEVEL=info
```

## Project Structure
```
transcribe-TB/
├── src/
│   ├── config/          # Configuration files
│   ├── services/        # Core services
│   └── utils/           # Utility functions
├── locales/             # Language files
├── logs/                # Application logs
├── temp/                # Temporary files
└── memory-bank/         # Project documentation
```

## Technical Constraints
1. Audio File Limitations:
   - Maximum size: 20MB
   - Supported formats: OGG, MP3, WAV
   - Single channel audio required

2. API Requirements:
   - Google Cloud credentials
   - Telegram Bot token
   - Internet connectivity

3. System Requirements:
   - FFmpeg installed
   - Node.js v16+
   - Sufficient disk space for logs and temp files

## Development Tools
- VS Code (recommended IDE)
- FFmpeg for audio processing
- Git for version control
- Node.js package manager (npm)

## Security Considerations
1. Whitelist Access Control:
   - Admin-managed user access
   - User ID verification
   - Command restrictions

2. Data Protection:
   - Sensitive data redaction in logs
   - Temporary file cleanup
   - Environment variable security

3. API Security:
   - Token protection
   - Credential management
   - Request validation
