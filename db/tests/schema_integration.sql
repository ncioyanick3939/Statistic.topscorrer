-- CI-only integration checks. Run against a disposable PostgreSQL database.
BEGIN;
INSERT INTO seasons (season_end_year, display_name, starts_on, ends_on)
VALUES (2099, 'CI Test', '2098-09-01', '2099-05-01');
INSERT INTO teams (code, name) VALUES ('CI_HOME', 'CI Home'), ('CI_AWAY', 'CI Away');
INSERT INTO players (full_name, normalized_name, primary_position)
VALUES ('CI Skater', 'ci skater', 'F');
INSERT INTO data_import_runs (source, dataset, season_end_year, status)
VALUES ('ci', 'games', 2099, 'succeeded');
INSERT INTO games (sihf_game_id, season_end_year, starts_at, home_team_id, away_team_id)
SELECT 2099000001, 2099, '2099-01-01T18:00:00Z',
       (SELECT id FROM teams WHERE code = 'CI_HOME'),
       (SELECT id FROM teams WHERE code = 'CI_AWAY');
INSERT INTO player_game_stats (sihf_game_id, player_id, team_id, position, goals)
SELECT 2099000001, p.id, t.id, 'F', 2
FROM players p CROSS JOIN teams t
WHERE p.normalized_name = 'ci skater' AND t.code = 'CI_HOME';
DO $$
DECLARE actual integer;
BEGIN
  SELECT COUNT(*) INTO actual FROM player_game_stats
  WHERE sihf_game_id = 2099000001 AND goals = 2;
  IF actual <> 1 THEN
    RAISE EXCEPTION 'Skater/game relation failed';
  END IF;
END $$;
SAVEPOINT invalid_data;
DO $$
BEGIN
  BEGIN
    INSERT INTO games (sihf_game_id, season_end_year, starts_at, home_team_id, away_team_id)
    SELECT 2099000002, 2099, NOW(), id, id FROM teams WHERE code = 'CI_HOME';
    RAISE EXCEPTION 'CHECK constraint unexpectedly accepted same home and away team';
  EXCEPTION
    WHEN check_violation THEN NULL;
  END;
END $$;
ROLLBACK TO SAVEPOINT invalid_data;
ROLLBACK;
