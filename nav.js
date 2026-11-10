// Die vier Bereiche der App. Seitenleiste (Desktop) und untere Leiste (Handy) lesen beide von hier.
import { state, closePlayer } from './store.js'

export const TABS = [
  { id: 'heute', label: 'Heute', icon: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z' },
  { id: 'markt', label: 'Markt', icon: 'M3 17l6-6 4 4 8-8M15 7h6v6' },
  { id: 'spieler', label: 'Kader', icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0' },
  { id: 'daten', label: 'Daten', icon: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3' }
]
export function go(id) { state.tab = id; if (id === 'spieler') closePlayer() }
