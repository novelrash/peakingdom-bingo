import { useState } from 'react'

const ID_KEY = 'osrs_bingo_player_id'
const NAME_KEY = 'osrs_bingo_player_name'
const TEAM_KEY = 'osrs_bingo_player_team'

export function usePlayer() {
  const [playerId, setPlayerId] = useState(localStorage.getItem(ID_KEY) || '')
  const [playerName, setPlayerName] = useState(localStorage.getItem(NAME_KEY) || '')
  const [playerTeam, setPlayerTeam] = useState(() => {
    try { return JSON.parse(localStorage.getItem(TEAM_KEY)) } catch { return null }
  })

  function selectPlayer(player) {
    if (!player) {
      localStorage.removeItem(ID_KEY)
      localStorage.removeItem(NAME_KEY)
      localStorage.removeItem(TEAM_KEY)
      setPlayerId('')
      setPlayerName('')
      setPlayerTeam(null)
      return
    }
    const team = { id: player.team_id, ...player.teams }
    localStorage.setItem(ID_KEY, player.id)
    localStorage.setItem(NAME_KEY, player.username)
    localStorage.setItem(TEAM_KEY, JSON.stringify(team))
    setPlayerId(player.id)
    setPlayerName(player.username)
    setPlayerTeam(team)
  }

  return { playerId, playerName, playerTeam, selectPlayer }
}
