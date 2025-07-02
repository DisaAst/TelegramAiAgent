# Telegram AI Agent

A modular Telegram bot powered by AI with smart web search, cost-effective caching, multimedia support, and multilingual capabilities.

## ✨ Features

- 🤖 **Smart Q&A System** powered by Google Gemini 2.0 Flash
- 🔍 **Smart Web Search** - cost-effective basic search + advanced for critical queries
- 🎯 **Search Caching** - 30-minute cache for speed and cost savings
- 🎤 **Voice Message Processing** - automatic transcription and responses
- 🖼️ **Image Analysis** - comprehensive content analysis and OCR
- 💭 **Chat History** - remembers recent messages including media files
- 🛠️ **Modular Architecture** - scalable with dependency injection
- 🧠 **Smart Routing** - AI decides when web search is needed
- 🕐 **Timezone Support** - knows current date and time for each user
- 🌍 **Multilingual** - responds in the same language as the question
- 💰 **Cost-Effective** - optimized API usage with intelligent caching

## 🏗️ Architecture

### Modular Design
```
src/
├── agents/              # AI agents (audio, image, text, multimedia)
├── tools/               # AI tools (web search, etc.)
├── modules/             # Main modules (telegram bot)
├── services/            # Business services
├── infrastructure/      # Infrastructure concerns
├── config/              # Configuration
├── constants/           # All text constants
├── container/           # Dependency injection
├── types/               # TypeScript types
└── utils/               # Utilities
```

### Dependency Injection
- **Clean separation** of concerns
- **Easy testing** with interface-based design
- **Scalable** - add new features without breaking existing code
- **Configurable** - swap implementations easily

### AI Agents
- **TextAgent** - processes text with web search integration
- **AudioAgent** - transcribes and processes voice messages
- **ImageAgent** - analyzes images with optional web search
- **MultimediaAgent** - orchestrates multimedia processing

### Smart Tools
- **WebSearchTool** - basic/advanced search with caching
- **MediaProcessor** - handles Telegram file downloads
- **DateTimeUtils** - timezone-aware time handling

## 🤖 How It Works

### Core Logic:
1. **Gemini 2.0 Flash** processes all text requests with date/time context
2. **Smart Tools** automatically called when needed (web search)
3. **Intelligent Routing**: basic search (cost-effective) or advanced (critical)
4. **Caching**: frequently asked questions cached for 30 minutes

### Search System:
- **💰 Basic Search (GPT-3.5)**: for most queries - fast and cheap
- **🚀 Advanced Search (Perplexity)**: only for critical/urgent queries
- **🎯 Caching**: instant answers for frequent questions
- **🧠 Automatic Selection**: AI chooses optimal search type

### Full Media Processing:
- **🎤 Voice**: automatic speech-to-text transcription + response to commands
- **🖼️ Images**: detailed content analysis, OCR, object recognition
- **📝 Multimodal**: combination of audio/images with text queries
- **💾 Memory**: complete media files saved in history for context

### Automatic Web Search:
AI automatically determines when search is needed for questions about:
- 📰 News and current events
- 🌤️ Real-time weather
- 💱 Currency rates and stock quotes
- 📊 Current statistics and data
- 🕐 Fresh events and information

## 🚀 Bot Commands

### Basic Commands:
- `/start` - Start the bot
- `/help` - Detailed help

### Time Management:
- `/time` - Show current time
- `/timezone` - Timezone settings
- `/timezone Europe/Moscow` - Set Moscow time
- `/timezone list` - List popular timezones
- `/timezone reset` - Reset to UTC

### History Management:
- `/history` - Show recent messages (including media)
- `/clear` - Clear chat history
- `/stats` - Usage statistics
- `/clearcache` - Clear search cache

## 📋 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create `.env` file in the project root:

```env
# Telegram Bot Token (get from @BotFather)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Google Gemini API Key (get from Google AI Studio)
GEMINI_API_KEY=your_gemini_api_key_here

# Openrouter API Key (get from https://openrouter.ai/)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Chat history limit (number of messages for context, 1-20)
CHAT_HISTORY_LIMIT=7

# Environment
NODE_ENV=development
```

### 3. Get API Keys

#### Telegram Bot Token:
1. Find @BotFather in Telegram
2. Send `/newbot`
3. Follow instructions to create bot
4. Copy the provided token

#### Gemini API Key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key
3. Copy the key

#### Openrouter API Key:
1. Register at [Openrouter](https://openrouter.ai/)
2. Go to Keys section
3. Create new API key
4. Copy the key

## 🏁 Running

### Development Mode:
```bash
npm run dev
```

### Production Mode:
```bash
npm run build
npm start
```

### Watch Mode (auto-recompilation):
```bash
npm run watch
```

## 💡 Usage Examples

### 🎤 Voice Commands:
- Record voice: "What's the weather today?" → 🔍🎤 transcription + search + response
- Voice: "What's the latest AI news?" → 🔍🎤 transcription + search + response
- Voice: "Explain quantum physics" → 🧠🎤 transcription + direct answer
- Multilingual: automatic language detection in speech

### 🖼️ Image Analysis:
- Send food photo → 🧠🖼️ "This is a delicious pasta dish with..."
- Code screenshot + "Explain this code" → 🧠🖼️ detailed code analysis
- Document photo → 🧠🖼️ text extraction and explanation (OCR)
- Photo + "Where to buy this?" → 🔍🖼️ analysis + product search

### 🎯 Combined Requests:
- **Photo + text**: city image + "What's the weather there now?" → analysis + search
- **Voice + history**: voice command considering previous messages
- **Multimedia + search**: AI automatically decides when additional info is needed
- **Contextual responses**: considers previous media messages in history

### Questions with Automatic Web Search:
- "What's the weather in Moscow today?" → 🔍 basic search + answer
- "Breaking news AI" → 🔍 advanced search (critical)
- "Current Bitcoin price" → 🔍 cache or search + answer
- "What's happening now?" → 🔍 advanced (real-time)

### Time-Aware Questions:
- "What day is today?" → 🧠 direct answer with current date
- "What time is it?" → 🧠 shows time in user's timezone
- "Events this week" → 🔍 search with week context

### Regular Questions without Search:
- "Explain quantum physics in simple terms" → 🧠 direct answer
- "How to cook pasta carbonara?" → 🧠 direct answer
- "Write a poem about programming" → 🧠 creative answer

### Multilingual Support:
- Russian question → Russian answer
- English question → English response  
- Chinese question → Chinese answer
- Any language in text → response in same language

## 🔧 Technical Details

### Modular Architecture:
- **Main Model**: Google Gemini 2.0 Flash (text)
- **Basic Search**: GPT-3.5-turbo via Openrouter (cost-effective)
- **Advanced Search**: Perplexity via Openrouter (for critical)
- **Max Steps**: 5 (for complex queries)
- **Smart Classification**: automatic search type selection
- **Time Context**: current date/time passed to each request
- **Fallback System** for errors

### Dependency Injection:
- **Container**: Simple but powerful DI container
- **Interfaces**: Clean separation between contracts and implementations
- **Modularity**: Easy to swap implementations
- **Testing**: Interface-based design enables easy mocking

### Caching System:
- **Duration**: 30 minutes for frequently asked questions
- **Cache Keys**: query + user timezone
- **Auto-cleanup**: removes expired entries
- **Cost Savings**: reduces repeated API calls

### Multimedia Processing:
- **Supported Audio**: MP3, WAV, OGG, AAC, FLAC (up to 20MB)
- **Supported Images**: JPEG, PNG, GIF, WebP, HEIC (up to 20MB)
- **In-Memory Processing**: files loaded directly into AI without disk storage
- **Audio Transcription**: speech-to-text conversion via Gemini
- **Image Analysis**: detailed content understanding including OCR
- **Security**: all media files processed only in memory

### Search Features:
- **Smart Classification**: basic for common, advanced for critical
- **Cost-Effectiveness**: basic search significantly cheaper
- **High Accuracy**: low temperature for factual information
- **Sources**: Perplexity references sources (in advanced mode)
- **Speed**: caching for instant responses

### Time Features:
- **Personal Timezones**: each user can set their own
- **Validation**: checks timezone validity
- **UTC Fallback**: if timezone not set
- **Context in Prompts**: date/time passed to AI for understanding "today", "now"

### Additional Features:
- **Smart History**: saves conversation context including media info
- **Automatic Emojis**: indicate processing and search type
- **Debug Logs** in development mode
- **Graceful Error Handling** with fallbacks
- **Multilingual Responses**: supports any language

## 🚀 Architecture Benefits

1. **Reliability**: stable operation with text and multimedia
2. **Cost-Effectiveness**: basic search + caching significantly cheaper
3. **Quality**: direct media processing for accurate results
4. **Security**: files processed only in memory, never saved to disk
5. **Speed**: instant processing without intermediate file saving
6. **Universality**: works with any media types
7. **Scalability**: easily add new media types
8. **Intelligence**: AI chooses optimal search type
9. **Caching**: instant answers for frequent queries
10. **Simplicity**: one approach for all request types
11. **Multilingual**: supports any languages
12. **Memory**: saves media message context
13. **Modularity**: clean separation of concerns with DI
14. **Testability**: interface-based design
15. **Maintainability**: easy to extend and modify

## 🔮 Extension Possibilities

- Extend media types (video, documents)
- Integration with other search providers
- Improve query classification for precise search selection
- Personalize caching based on user preferences
- Usage analytics for cost optimization
- Group chats with full media processing
- Scheduled notifications with timezone awareness
- Extended search statistics and savings
- A/B testing different search strategies
- Database integration for long-term caching
- Enhanced media processing through specialized APIs
- Add new AI agents for specific tasks
- Implement new tools for extended functionality
- Custom message handlers for different media types

The project is ready for scaling with focus on reliability, cost-effectiveness, modularity, and quality!

## 🧪 Development

### Adding New Agents:
1. Create agent class implementing appropriate interface
2. Add to DI configuration
3. Update main AI service if needed

### Adding New Tools:
1. Create tool class implementing ITool interface
2. Add to DI configuration
3. Integrate into agents that need it

### Adding New Commands:
1. Add constants to messages.ts
2. Implement handler in TelegramBot
3. Update help text

The modular architecture makes extending functionality straightforward and maintainable. 