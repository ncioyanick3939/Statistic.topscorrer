// Die vier Bereiche der App. Obere Leiste (Desktop) und untere Leiste (Handy) lesen beide von hier.
import { state, closePlayer } from './store.js'

export const TABS = [
  { id: 'heute', label: 'Arena', icon: 'M12 3l9 5v8l-9 5-9-5V8zM12 12V3M12 12l9-4M12 12l-9-4' },
  { id: 'liga', label: 'Liga', icon: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3' },
  { id: 'spieler', label: 'Karten', icon: 'M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM9 8h6M9 12h6M9 16h3' },
  { id: 'markt', label: 'Markt', icon: 'M3 17l6-6 4 4 8-8M15 7h6v6' },
  { id: 'daten', label: 'Daten', icon: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3' }
]
export function go(id) { state.tab = id; if (id === 'spieler') closePlayer() }
