import { ShiftType, Team60 } from '../types';
import { TEAMS_60, TEAM_60_CYCLE_STARTS } from '../constants';
import { calculateShiftForDate } from './shift60Calculator';

/**
 * Get all 60% teams that are working a specific shift on a given date
 * Used by System30 users to see which System60 teams they'll work with
 */
export function getTeams60WithShift(
  date: Date | string,
  targetShift: ShiftType
): Team60[] {
  const matchingTeams: Team60[] = [];

  for (const team of TEAMS_60) {
    const cycleStart = TEAM_60_CYCLE_STARTS[team];
    const teamShift = calculateShiftForDate(date, cycleStart);

    if (teamShift === targetShift) {
      matchingTeams.push(team);
    }
  }

  return matchingTeams;
}

/**
 * Get all 60% teams and their shifts for a given date
 * Returns a map of team -> shift
 */
export function getAllTeams60Shifts(
  date: Date | string
): Record<Team60, ShiftType> {
  const result = {} as Record<Team60, ShiftType>;

  for (const team of TEAMS_60) {
    const cycleStart = TEAM_60_CYCLE_STARTS[team];
    result[team] = calculateShiftForDate(date, cycleStart);
  }

  return result;
}

/**
 * Format matching teams as a display string
 * Example: "60A, 60C ile birlikte"
 */
export function formatMatchingTeams(teams: Team60[]): string {
  if (teams.length === 0) {
    return '';
  }
  return `${teams.join(', ')} ile birlikte`;
}
