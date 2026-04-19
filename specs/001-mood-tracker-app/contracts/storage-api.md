# Contract: storage.js API

**Phase**: 1 | **Date**: 2026-04-19

`utils/storage.js` is the **sole** module that touches `localStorage`. All reads and writes go through this API — no other file may call `localStorage` directly.

---

## Functions

### `load() => AppState`

Read and deserialise state from `localStorage`.

- Key: `"mood-tracker-v1"`
- If key absent: returns `DEFAULT_STATE`
- If JSON parse fails: logs `console.warn`, returns `DEFAULT_STATE`
- Converts `workableDays` array → `Set<string>` before returning

```js
import { load } from '../utils/storage';
const state = load(); // always returns a valid AppState
```

---

### `save(state: AppState) => void`

Serialise and write state to `localStorage`.

- Converts `workableDays` `Set` → `string[]` before `JSON.stringify`
- Silently swallows `QuotaExceededError` (no crash, data may not persist)

```js
import { save } from '../utils/storage';
save(nextState);
```

---

### `clear() => void`

Remove the `"mood-tracker-v1"` key from `localStorage`. Used only in tests and the "storage cleared" recovery path.

```js
import { clear } from '../utils/storage';
clear();
```

---

## Constants (exported)

```js
export const STORAGE_KEY = 'mood-tracker-v1';

export const DEFAULT_STATE = {
  entries: {},
  reminder: { enabled: false, time: '18:00' },
  workableDays: new Set(),
};
```

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| `localStorage` not available (private browsing quota = 0) | `save()` swallows error; `load()` returns `DEFAULT_STATE` |
| Corrupted JSON in key | `load()` returns `DEFAULT_STATE` + `console.warn` |
| Storage quota exceeded | `save()` swallows `QuotaExceededError`; state continues in memory |
| User clears browser storage | Next `load()` call returns `DEFAULT_STATE`; no error surfaced to user |
