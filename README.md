# Telegram Audio Transcription Bot

A multilingual Telegram bot that transcribes audio messages and files into text, with support for English, Persian (Farsi), and Swedish. The bot includes proofreading capabilities and user access control through a whitelist system.

## Features

- 🎤 Audio transcription using Google Speech-to-Text API
- 🌐 Multi-language support (English, Persian, Swedish)
- ✍️ Text proofreading and improvement
- 🔒 Whitelist-based access control
- 👥 Group chat support
- 📝 Comprehensive logging system
- 🐛 Debug mode for troubleshooting

## Prerequisites

- Node.js v16 or higher
- FFmpeg installed on your system
- Google Cloud account with Speech-to-Text API enabled
- Telegram Bot Token (from BotFather)

## Installation

### Standard Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/transcribe-TB.git
cd transcribe-TB
```

2. Install dependencies:
```bash
npm install
```

3. Create and configure .env file:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up Google Cloud credentials:
- Create a service account in Google Cloud Console
- Download the credentials JSON file
- Set the path in GOOGLE_APPLICATION_CREDENTIALS

### Docker Installation

1. Build the Docker image:
```bash
docker build -t transcribe-tb .
```

2. Create a `.env` file from the example:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run the container:
```bash
docker run -d \
  --name transcribe-bot \
  --env-file .env \
  -v $(pwd)/logs:/usr/src/app/logs \
  -v $(pwd)/temp:/usr/src/app/temp \
  -v /path/to/google-credentials.json:/usr/src/app/google-credentials.json \
  transcribe-tb
```

Replace `/path/to/google-credentials.json` with the actual path to your Google Cloud credentials file.

4. View logs:
```bash
docker logs -f transcribe-bot
```

5. Stop the container:
```bash
docker stop transcribe-bot
```

## Configuration

Configure the bot through environment variables in `.env`:

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

# Group Chat Settings
GROUP_COMMANDS_ONLY=true
GROUP_ALLOWED_COMMANDS=start,help,language
```

## Usage

1. Start the bot:
```bash
npm start
```

2. Available commands:
- `/start` - Initialize bot
- `/help` - Show available commands
- `/language [en|fa|sv]` - Set language
- `/transcribe` - Reply to audio for transcription
- `/proofread` - Improve transcribed text
- `/settings` - View current settings

Admin commands:
- `/adduser <user_id>` - Add user to whitelist
- `/removeuser <user_id>` - Remove user from whitelist
- `/listusers` - List whitelisted users
- `/debug [on|off]` - Toggle debug mode

## Group Chat Usage

The bot can be used in group chats with restricted functionality:
- Only responds to configured commands
- Ignores non-command messages
- Maintains whitelist restrictions
- Logs group interactions

## Development

For development:
```bash
npm run dev
```

This will start the bot with nodemon for automatic reloading.

## Logging

Logs are stored in the `logs` directory:
- Daily rotating log files
- Different log levels (debug, info, warn, error)
- Structured JSON format
- Sensitive data redaction

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Grammy](https://grammy.dev/) - Telegram Bot Framework
- [Google Cloud Speech-to-Text](https://cloud.google.com/speech-to-text) - Transcription API
- [FFmpeg](https://ffmpeg.org/) - Audio Processing
