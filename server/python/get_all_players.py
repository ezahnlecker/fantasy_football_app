#!/usr/bin/env python3
import argparse
import json
import requests
import sys

def get_all_players(league_id, season_id, week, swid=None, espn_s2=None):
    """Fetch all players (rostered and free agents) from ESPN Fantasy Football API"""
    
    # Base URL for ESPN Fantasy Football API
    base_url = "https://fantasy.espn.com/apis/v3/games/ffl/seasons"
    
    # Headers and cookies for authentication
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    cookies = {}
    if swid and espn_s2:
        cookies = {
            "swid": swid,
            "espn_s2": espn_s2
        }
    
    # Parameters for the API request
    params = {
        "view": ["mRoster", "mTeam", "mMatchup", "mScoreboard"],
        "scoringPeriodId": week
    }
    
    # First, get all rostered players
    rostered_players = []
    try:
        # Get league teams
        teams_url = f"{base_url}/{season_id}/segments/0/leagues/{league_id}"
        teams_response = requests.get(teams_url, headers=headers, cookies=cookies, params=params)
        teams_data = teams_response.json()
        
        # Process each team's roster
        for team in teams_data.get("teams", []):
            team_id = team.get("id")
            team_name = team.get("name", "Unknown Team")
            
            # Get team roster
            roster_url = f"{base_url}/{season_id}/segments/0/leagues/{league_id}/teams/{team_id}"
            roster_response = requests.get(roster_url, headers=headers, cookies=cookies, params=params)
            roster_data = roster_response.json()
            
            # Process each player in the roster
            for entry in roster_data.get("roster", {}).get("entries", []):
                player_data = entry.get("playerPoolEntry", {}).get("player", {})
                player_id = player_data.get("id")
                
                # Get player details
                name = player_data.get("fullName", "Unknown Player")
                position = player_data.get("defaultPositionId")
                
                # Convert position ID to string
                position_map = {1: "QB", 2: "RB", 3: "WR", 4: "TE", 5: "K", 16: "DST"}
                position = position_map.get(position, "FLEX")
                
                # Get team abbreviation
                team_abbrev = "FA"
                if player_data.get("proTeamId") != 0:
                    pro_team_id = player_data.get("proTeamId")
                    pro_teams = teams_data.get("teams", [])
                    for pro_team in pro_teams:
                        if pro_team.get("proTeamId") == pro_team_id:
                            team_abbrev = pro_team.get("abbrev", "FA")
                            break
                
                # Get player status
                status = entry.get("lineupSlotId")
                status_map = {0: "Active", 20: "Bench", 21: "Injured Reserve", 23: "FLEX"}
                status = status_map.get(status, "Bench")
                
                # Get injury status
                injury_status = player_data.get("injuryStatus", "ACTIVE")
                
                # Get projected and actual points
                projected_points = 0
                actual_points = 0
                for stat in player_data.get("stats", []):
                    if stat.get("scoringPeriodId") == week:
                        if stat.get("statSourceId") == 0:  # Projected
                            projected_points = stat.get("appliedTotal", 0)
                        elif stat.get("statSourceId") == 1:  # Actual
                            actual_points = stat.get("appliedTotal", 0)
                
                # Get lineup slot
                lineup_slot = entry.get("lineupSlotId")
                lineup_slot_map = {0: "QB", 2: "RB", 4: "WR", 6: "TE", 16: "DST", 17: "K", 23: "FLEX"}
                lineup_slot = lineup_slot_map.get(lineup_slot, "Bench")
                
                # Get opponent info
                opponent = None
                opponent_rank = None
                # TODO: Add opponent and rank logic
                
                # Get player photo URL
                photo_url = f"https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/{player_id}.png"
                
                # Create player object
                player = {
                    "id": str(player_id),
                    "name": name,
                    "position": position,
                    "team": team_abbrev,
                    "teamId": team_id,
                    "status": status,
                    "injuryStatus": injury_status,
                    "projectedPoints": projected_points,
                    "actualPoints": actual_points,
                    "lineupSlot": lineup_slot,
                    "opponent": opponent,
                    "opponentRank": opponent_rank,
                    "photoUrl": photo_url
                }
                
                rostered_players.append(player)
        
        # Now get free agents
        free_agents_url = f"{base_url}/{season_id}/segments/0/leagues/{league_id}/players"
        free_agents_params = params.copy()
        free_agents_params["status"] = "FREEAGENT"
        free_agents_response = requests.get(free_agents_url, headers=headers, cookies=cookies, params=free_agents_params)
        free_agents_data = free_agents_response.json()
        
        for player_entry in free_agents_data:
            player_data = player_entry.get("player", {})
            player_id = player_data.get("id")
            
            # Get player details
            name = player_data.get("fullName", "Unknown Player")
            position = player_data.get("defaultPositionId")
            
            # Convert position ID to string
            position_map = {1: "QB", 2: "RB", 3: "WR", 4: "TE", 5: "K", 16: "DST"}
            position = position_map.get(position, "FLEX")
            
            # Get team abbreviation
            team_abbrev = "FA"
            if player_data.get("proTeamId") != 0:
                pro_team_id = player_data.get("proTeamId")
                pro_teams = teams_data.get("teams", [])
                for pro_team in pro_teams:
                    if pro_team.get("proTeamId") == pro_team_id:
                        team_abbrev = pro_team.get("abbrev", "FA")
                        break
            
            # Get injury status
            injury_status = player_data.get("injuryStatus", "ACTIVE")
            
            # Get projected and actual points
            projected_points = 0
            actual_points = 0
            for stat in player_data.get("stats", []):
                if stat.get("scoringPeriodId") == week:
                    if stat.get("statSourceId") == 0:  # Projected
                        projected_points = stat.get("appliedTotal", 0)
                    elif stat.get("statSourceId") == 1:  # Actual
                        actual_points = stat.get("appliedTotal", 0)
            
            # Get player photo URL
            photo_url = f"https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/{player_id}.png"
            
            # Create player object
            player = {
                "id": str(player_id),
                "name": name,
                "position": position,
                "team": team_abbrev,
                "status": "Free Agent",
                "injuryStatus": injury_status,
                "projectedPoints": projected_points,
                "actualPoints": actual_points,
                "lineupSlot": None,
                "opponent": None,
                "opponentRank": None,
                "photoUrl": photo_url
            }
            
            rostered_players.append(player)
        
        return rostered_players
    
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        return []

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fetch all players from ESPN Fantasy Football")
    parser.add_argument("--league-id", required=True, help="ESPN league ID")
    parser.add_argument("--season-id", required=True, help="Season ID (year)")
    parser.add_argument("--week", type=int, required=True, help="Week number")
    parser.add_argument("--swid", help="ESPN SWID cookie")
    parser.add_argument("--espn-s2", help="ESPN S2 cookie")
    
    args = parser.parse_args()
    
    players = get_all_players(
        args.league_id,
        args.season_id,
        args.week,
        args.swid,
        args.espn_s2
    )
    
    print(json.dumps(players)) 