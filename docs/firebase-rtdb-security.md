# Firebase Realtime Database Security

## Access model

| Path | Access | Used by |
|---|---|---|
| `users/{uid}/...` | Read/write only by `auth.uid == uid` | Notes, events, baby tracker, profile, settings, ultrasounds, period tracker |
| `mealCheckIns/{checkInId}` | Read/write only by the owning authenticated user | Meal check-in records |
| `mealCheckInConfigs/{uid}` | Read/write only by `auth.uid == uid` | Meal check-in cycle config |
| `publicShares/periodTrackers/{token}` | Public read, owner write/delete | Period tracker share links |
| `publicShares/mealCheckIns/{token}` | Public read, owner write/delete | Meal check-in share links |
| `periodShareTokens/{token}` | No client read, owner write/delete | Private reverse lookup/metadata |
| `mealCheckInShareTokens/{token}` | No client read, owner write/delete | Private reverse lookup/metadata |
| `liveShare/admin/{uid}` | Read/write only by `auth.uid == uid` | Personal Live Share room |
| `liveShare/public/{roomId}` | Public read, append-only messages/files | Guest Live Share rooms |

## Sharing behavior

Share pages now read token-keyed public snapshots instead of resolving a token to a
user ID and then reading raw user data. This keeps share links working without
opening `users/{uid}` or root collections to anonymous clients.

The app refreshes public snapshots when owners:

- create, update, or delete period logs
- save period cycle settings
- create, update, delete, or bulk-load meal check-ins
- save meal check-in cycle config
- generate or revoke share links

## Unsupported browser admin access

The Admin AI database assistant is marked unsupported because client-side root
database access cannot be secured with local role checks. Re-enable it through a
server-side admin API that verifies a Firebase ID token and an admin custom claim,
then performs database operations with the Firebase Admin SDK.
