# Test report

Run on 23 October 2026 with Node.js 22.14.0 on Windows.

| Check | Result |
| --- | --- |
| `npm test` | 6 passed, 0 failed |
| `node --test --experimental-test-coverage server/*.test.js` | 6 passed, 0 failed |
| API source line coverage | `app.js` 95.54%; `auth.js` 95.24%; `database.js` 100% |
| Total measured line coverage, including tests | 97.31% |
| `npm run build` | Passed; Vite produced the production SPA bundle |
| Browser smoke test | Registration, sign-in state, purchase stock change, admin add, and admin restock verified locally |

The tests use an isolated in-memory SQLite database. They cover auth, token tampering, input validation, search, role permissions, ownership, purchase stock depletion, restock, and missing vehicles. The browser smoke test used a local disposable account and a temporary vehicle; the temporary vehicle was removed after the check.

To reproduce the report:

```sh
npm ci
npm test
node --test --experimental-test-coverage server/*.test.js
npm run build
```
