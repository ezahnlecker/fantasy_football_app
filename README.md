# Fantasy Football Analytics App

A comprehensive fantasy football analytics application that helps you make better decisions for your ESPN fantasy football league.

## Features

- **ESPN Integration**: Connect to your ESPN fantasy football league
- **Player Trends**: See which players are trending up or down based on recent performance
- **Team Analysis**: Get insights into your team's strengths and weaknesses
- **Weekly Projections**: View projected points for players
- **Historical Data**: Track player performance over time

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Python 3.8+ (for data collection scripts)
- SQLite (for database)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/fantasy-football-app.git
   cd fantasy-football-app
   ```

2. Install Node.js dependencies:
   ```
   npm install
   ```

3. Install Python dependencies:
   ```
   pip install -r server/python/requirements.txt
   ```

4. Create your environment file:
   ```
   cp .env.example .env
   ```
   Then edit the `.env` file with your ESPN credentials.

5. Start the development server:
   ```
   npm run dev
   ```

### Connecting to ESPN

1. Log in to your ESPN Fantasy Football account in a web browser
2. Find your `SWID` and `ESPN_S2` cookies (using browser developer tools)
3. Enter these values along with your league ID in the app's connection form

## Testing

To test the player data collection:

```
python server/python/test_player_collection.py
```

## Contributing

### Committing to GitHub

You can use the provided script to commit your changes to GitHub:

1. Make the script executable:
   ```
   chmod +x commit-to-github.sh
   ```

2. Run the script:
   ```
   ./commit-to-github.sh
   ```

3. Follow the prompts to enter your commit message and push to GitHub.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- ESPN Fantasy API
- All the fantasy football enthusiasts who provided feedback 