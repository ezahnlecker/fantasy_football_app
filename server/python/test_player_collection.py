#!/usr/bin/env python3
import json
import requests
import sys
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get values from environment variables or use defaults
LEAGUE_ID = os.getenv("ESPN_LEAGUE_ID", "")
SEASON_ID = os.getenv("ESPN_SEASON_ID", "2024")
SWID = os.getenv("ESPN_SWID", "")
ESPN_S2 = os.getenv("ESPN_S2", "")

def test_player_collection():
    # Check if we have the required credentials
    if not LEAGUE_ID or not SWID or not ESPN_S2:
        print("Error: Missing required environment variables.")
        print("Please set ESPN_LEAGUE_ID, ESPN_SWID, and ESPN_S2 in your .env file.")
        sys.exit(1)
        
    # Test the player collection endpoint
    url = "http://localhost:3001/api/players/collect"
    payload = {
        "leagueId": LEAGUE_ID,
        "seasonId": SEASON_ID,
        "swid": SWID,
        "espnS2": ESPN_S2
    }
    
    print("Sending request to collect player data...")
    print(f"League ID: {LEAGUE_ID}, Season ID: {SEASON_ID}")
    try:
        response = requests.post(url, json=payload)
        
        if response.status_code == 200:
            print("Success! Response:")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_player_collection() 