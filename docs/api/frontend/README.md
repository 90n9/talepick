Frontend API contract aligned with backend models under `packages/backend/src/infrastructure/models`. Each endpoint notes the calling page, request payload, and response structure. Field names match the backend schemas (e.g., `profile.displayName`, `media.coverImageUrl`, `stats.averageRating`, `gameStats.credits`). Authenticated routes expect `Authorization: Bearer <token>`.

## Auth & Session

### POST /api/auth/login
- Used by: `pages/Login.tsx` (email/password flow).
- Request:
```json
{ "email": "user@example.com", "password": "hunter2" }
```
- Response 200:
```json
{
  "token": "jwt",
  "refreshToken": "refresh-jwt",
  "user": {
    "_id": "66ff…",
    "email": "traveler@chronos.com",
    "username": "traveler",
    "profile": {
      "displayName": "นักเดินทาง",
      "avatar": { "type": "custom", "value": "https://…" },
      "bio": "",
      "profileImageUrl": "https://…"
    },
    "authentication": { "authMethod": "email", "isGuest": false, "emailVerified": true, "hasPassword": true },
    "gameStats": {
      "credits": 20,
      "maxCredits": 25,
      "lastCreditRefill": "2024-12-30T10:00:00Z",
      "totalStoriesPlayed": 5,
      "totalEndingsUnlocked": 3,
      "totalAvatarsUnlocked": 2,
      "currentAvatarId": "cyber_1",
      "lastLoginAt": "2024-12-30T10:00:00Z"
    }
  }
}
```

### POST /api/auth/login/google
- Used by: `pages/Login.tsx` (Google button).
- Request:
```json
{ "idToken": "google-oauth-id-token" }
```
- Response 200: same shape as `/api/auth/login`.

### POST /api/auth/guest
- Used by: `pages/Login.tsx` (Guest login button).
- Request: `{ "locale": "th-TH" }`
- Response 200:
```json
{
  "token": "guest-session-token",
  "user": {
    "_id": "guest-1700000000000",
    "email": "",
    "username": "guest-1700000000000",
    "profile": {
      "displayName": "ผู้เยี่ยมชม (Guest)",
      "avatar": { "type": "default", "value": "" },
      "bio": "",
      "profileImageUrl": ""
    },
    "authentication": { "authMethod": "guest", "isGuest": true, "emailVerified": false, "hasPassword": false },
    "gameStats": {
      "credits": 10,
      "maxCredits": 10,
      "lastCreditRefill": "2024-12-30T10:00:00Z",
      "totalStoriesPlayed": 0,
      "totalEndingsUnlocked": 0,
      "totalAvatarsUnlocked": 0,
      "currentAvatarId": ""
    }
  }
}
```

### POST /api/auth/signup
- Used by: `pages/Signup.tsx` (step REGISTER).
- Request:
```json
{ "name": "Traveler", "email": "user@example.com", "password": "StrongP@ssw0rd" }
```
- Response 200:
```json
{ "userId": "u-temp", "otpExpiresAt": 1735707660000, "resendCooldownSeconds": 60 }
```

### POST /api/auth/signup/verify-otp
- Used by: `pages/Signup.tsx` (step OTP).
- Request:
```json
{ "email": "user@example.com", "otp": "123456" }
```
- Response 200: same shape as `/api/auth/login`.

### POST /api/auth/signup/resend-otp
- Used by: `pages/Signup.tsx` (Resend OTP button).
- Request:
```json
{ "email": "user@example.com" }
```
- Response 200: `{ "otpExpiresAt": 1735707660000, "resendCooldownSeconds": 60 }`

### POST /api/auth/password/forgot
- Used by: `pages/ForgotPassword.tsx` (step EMAIL).
- Request: `{ "email": "user@example.com" }`
- Response 200: `{ "otpExpiresAt": 1735707660000, "resendCooldownSeconds": 60 }`

### POST /api/auth/password/verify-otp
- Used by: `pages/ForgotPassword.tsx` (step OTP).
- Request: `{ "email": "user@example.com", "otp": "123456" }`
- Response 200: `{ "resetToken": "temporary-reset-token", "expiresAt": 1735707960000 }`

### POST /api/auth/password/reset
- Used by: `pages/ForgotPassword.tsx` (step NEW_PASSWORD).
- Request:
```json
{ "resetToken": "temporary-reset-token", "newPassword": "NewP@ss123" }
```
- Response 200: `{ "message": "password reset", "token": "jwt", "user": { ...same as login... } }`

## User Profile & Credits

### GET /api/users/me
- Used by: app bootstrap (`App.tsx`), `pages/Profile.tsx`, credit HUD in `pages/Player.tsx`.
- Response 200: user object (same shape as login).

### PATCH /api/users/me
- Used by: `components/EditProfileModal.tsx` (general tab).
- Request:
```json
{ "profile": { "displayName": "ใหม่ชื่อ", "avatar": { "type": "custom", "value": "https://example.com/avatar.jpg" } } }
```
- Response 200: updated user object.

### POST /api/users/me/password
- Used by: `components/EditProfileModal.tsx` (security tab).
- Request:
```json
{ "currentPassword": "old", "newPassword": "new-strong-pass" }
```
- Response 200: `{ "message": "updated" }`

### GET /api/users/me/history?limit=5&page=1
- Used by: `pages/Profile.tsx` (History tab pagination).
- Response 200:
```json
{
  "items": [
    {
      "storyId": "1",
      "storyTitle": "โปรโตคอลนีออน",
      "coverImageUrl": "https://…",
      "genre": "ไซไฟ",
      "estimatedDuration": "45 นาที",
      "endingId": "e1",
      "endingTitle": "การหลบหนีที่สมบูรณ์แบบ",
      "endingType": "good",
      "playedAt": "2024-12-30T10:00:00Z"
    }
  ],
  "page": 1,
  "pageSize": 5,
  "total": 12
}
```

### GET /api/users/me/achievements
- Used by: `pages/Profile.tsx` (Achievements tab), gating choices in `pages/Player.tsx`.
- Response 200:
```json
{
  "achievements": [
    { "achievementId": "first_step", "title": "ก้าวแรกสู่สังเวียน", "description": "เล่นจบ 1 เรื่อง", "icon": "🦶", "rewards": { "creditBonus": 2 }, "unlocked": true, "unlockedAt": "2024-12-30T10:00:00Z" }
  ],
  "unlockedIds": ["first_step", "critic"]
}
```

### POST /api/users/me/favorites
- Used by: `pages/StoryDetail.tsx` (toggle heart), `pages/Library.tsx` (favorites view).
- Request: `{ "storyId": "1", "action": "add" }` (`action: "remove"` to delete).
- Response 200: `{ "favorites": ["66ff…storyId1", "66ff…storyId3"] }`

### GET /api/users/me/credits
- Used by: HUD in `pages/Player.tsx` and refill timer in `App.tsx`.
- Response 200:
```json
{
  "credits": 18,
  "maxCredits": 25,
  "lastCreditRefill": "2024-12-30T10:00:00Z",
  "refillIntervalMs": 300000
}
```

### POST /api/users/me/credits/deduct
- Used by: `pages/Player.tsx` on each choice.
- Request: `{ "storyId": "1", "sessionId": "sess-123", "reason": "choice" }`
- Response 200:
```json
{ "credits": 17, "maxCredits": 25, "lastCreditRefill": "2024-12-30T10:05:00Z", "allowed": true }
```
- Error 402: `{ "allowed": false, "credits": 0, "nextRefillAt": "2024-12-30T10:10:00Z" }`

## Stories & Discovery

### GET /api/stories?search=&genre=&onlyFavorites=false&limit=20&page=1
- Used by: `pages/Home.tsx` (featured slice), `pages/Library.tsx`.
- Response 200:
```json
{
  "items": [
    {
      "_id": "66ff…",
      "title": "โปรโตคอลนีออน (The Neon Protocol)",
      "description": "…",
      "metadata": {
        "genre": "ไซไฟ",
        "tags": ["ไซเบอร์พังค์", "แฮ็กเกอร์", "แอคชั่น"],
        "isComingSoon": false,
        "launchDate": "2024-12-25T00:00:00Z"
      },
      "media": {
        "coverImageUrl": "https://…",
        "headerImageUrl": "https://…",
        "trailerUrl": "https://www.youtube.com/watch?v=DyX-Q5180Cs"
      },
      "gallery": { "imageIds": ["gal1", "gal2"], "totalImages": 2, "featuredImageId": "gal1" },
      "stats": {
        "averageRating": 4.8,
        "totalRatings": 1200,
        "totalPlayers": 12540,
        "estimatedDuration": "45 นาที",
        "totalEndings": 6
      }
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 42
}
```

### GET /api/stories/:id
- Used by: `pages/StoryDetail.tsx`, `pages/Player.tsx` (cover metadata), `pages/Profile.tsx` history cards.
- Response 200:
```json
{
  "_id": "66ff…",
  "title": "โปรโตคอลนีออน (The Neon Protocol)",
  "description": "…",
  "metadata": {
    "genre": "ไซไฟ",
    "tags": ["ไซเบอร์พังค์", "แฮ็กเกอร์", "แอคชั่น"],
    "isComingSoon": false,
    "launchDate": null
  },
  "media": {
    "coverImageUrl": "https://…",
    "headerImageUrl": "https://…",
    "trailerUrl": "https://www.youtube.com/watch?v=DyX-Q5180Cs"
  },
  "gallery": { "imageIds": ["gal1"], "totalImages": 1, "featuredImageId": "gal1" },
  "stats": {
    "averageRating": 4.8,
    "totalRatings": 1200,
    "totalPlayers": 12540,
    "estimatedDuration": "45 นาที",
    "totalEndings": 6
  },
  "content": { "startingNodeId": "start" },
  "moderation": { "status": "approved", "reportCount": 0 },
  "isFavorite": true,
  "userProgress": {
    "endingsUnlocked": ["e1", "e2"],
    "lastPlayedAt": "2024-12-30T10:00:00Z"
  }
}
```

### GET /api/stories/:id/endings
- Used by: `pages/StoryDetail.tsx` (Endings panel).
- Response 200:
```json
{
  "endings": [
    { "nodeId": "e1", "title": "การหลบหนีที่สมบูรณ์แบบ", "type": "good", "unlocked": true },
    { "nodeId": "e2", "title": "ถูกจับกุม", "type": "bad", "unlocked": true },
    { "nodeId": "e3", "title": "พันธมิตรใหม่", "type": "neutral", "unlocked": false }
  ],
  "unlockedCount": 2,
  "total": 5
}
```

### GET /api/stories/:id/graph
- Used by: `pages/Player.tsx` (initial load of StoryNode graph).
- Response 200:
```json
{
  "startNodeId": "start",
  "nodes": {
    "start": {
      "nodeId": "start",
      "segments": [
        { "type": "text", "text": "คุณตื่นขึ้นมา…", "duration": 4000 },
        { "type": "image", "url": "https://…/scene1.jpg" }
      ],
      "media": { "bgMusicUrl": "https://…/industrial_hum.ogg", "backgroundImageUrl": "https://…/scene1.jpg" },
      "choices": [
        { "id": "c1", "text": "ค้นหาในห้อง", "nextNodeId": "search", "requirements": { "achievementId": null }, "costs": { "credits": 1 } },
        { "id": "c2", "text": "ลองเปิดประตู", "nextNodeId": "door" }
      ],
      "isEnding": false
    }
  }
}
```

### POST /api/stories/:id/session
- Used by: `pages/Player.tsx` when pressing "เริ่มเล่น" in `pages/StoryDetail.tsx`.
- Request:
```json
{ "storyId": "1" }
```
- Response 200:
```json
{
  "sessionId": "sess-123",
  "credits": { "credits": 20, "maxCredits": 25, "lastCreditRefill": "2024-12-30T10:00:00Z" },
  "startNodeId": "start"
}
```
- Error 403 when story is `comingSoon`.

### POST /api/stories/:id/session/:sessionId/choice
- Used by: `pages/Player.tsx` per choice selection.
- Request:
```json
{ "choiceId": "c1", "currentNodeId": "start" }
```
- Response 200:
```json
{
  "nextNodeId": "search",
  "credits": { "credits": 19, "maxCredits": 25, "lastCreditRefill": "2024-12-30T10:05:00Z" },
  "history": [
    { "type": "narrative", "nodeId": "start", "text": "คุณตื่นขึ้นมา…" },
    { "type": "choice", "text": "ค้นหาในห้อง" }
  ],
  "unlockedAchievements": [],
  "unlockedAvatars": []
}
```
- Error 402 if credits insufficient (same shape as `/credits/deduct` error).

### POST /api/stories/:id/session/:sessionId/complete
- Used by: `pages/Player.tsx` when reaching an ending.
- Request:
```json
{ "endingId": "e1", "history": [{ "nodeId": "start", "choiceId": "c1" }] }
```
- Response 200:
```json
{
  "endingId": "e1",
  "rewards": {
    "creditsAwarded": 0,
    "achievementsUnlocked": ["completionist"],
    "avatarsUnlocked": ["cyber_1"]
  },
  "userProgress": { "endingsUnlocked": ["e1", "e2"], "endingsCount": 2, "totalEndings": 6 },
  "nextSuggestedStories": ["2", "3"]
}
```

## Reviews, Ratings, Reporting

### GET /api/stories/:id/reviews?limit=10&offset=0
- Used by: `pages/StoryDetail.tsx` (reviews list).
- Response 200:
```json
{
  "items": [
    {
      "_id": "r1",
      "userId": "66ff…",
      "rating": 5,
      "reviewText": "งานภาพใน Neon Protocol สวยตะลึงมาก!",
      "isSpoiler": false,
      "upVotes": 10,
      "downVotes": 0,
      "adminReply": { "text": "ขอบคุณมากครับ", "adminId": "66aa…", "repliedAt": "2023-10-16T00:00:00Z" },
      "createdAt": "2023-10-15T00:00:00Z"
    }
  ],
  "summary": { "average": 4.8, "total": 1200, "distribution": { "5": 900, "4": 200, "3": 80, "2": 15, "1": 5 } }
}
```

### POST /api/stories/:id/reviews
- Used by: `pages/StoryDetail.tsx` and `pages/Player.tsx` (RatingModal submission).
- Request:
```json
{ "rating": 5, "reviewText": "ชอบมาก", "isSpoiler": false }
```
- Response 200:
```json
{
  "reviewId": "r-new",
  "bonus": { "creditsAwarded": 5, "achievementUnlocked": "critic" },
  "summary": { "average": 4.81, "total": 1201 },
  "user": { "gameStats": { "credits": 25, "maxCredits": 25 }, "ratedStoriesForBonus": ["1"] }
}
```

### POST /api/stories/:id/report
- Used by: `pages/StoryDetail.tsx` (Report story button).
- Request:
```json
{ "reason": "content_issue", "description": "ฉากบางส่วนมีภาพรุนแรง" }
```
- Response 200: `{ "status": "received", "ticketId": "rep-123" }`

### POST /api/reviews/:reviewId/report
- Used by: `pages/StoryDetail.tsx` (Report review button).
- Request:
```json
{ "reason": "abuse", "description": "ภาษาหยาบคาย" }
```
- Response 200: `{ "status": "received", "ticketId": "rev-456" }`

## Oracle (AI Recommendation)

### POST /api/oracle/recommendation
- Used by: `pages/Oracle.tsx` (calls `services/geminiService.ts`).
- Request:
```json
{ "mood": "อยากได้แนวไซไฟเข้มข้น", "storyIds": ["1", "2", "3", "4", "5", "6"] }
```
- Response 200:
```json
{
  "message": "เทพพยากรณ์แนะนำ 'โปรโตคอลนีออน' ให้คุณ",
  "suggestedStoryId": "1"
}
```
- Error fallback when API key missing: `{ "message": "เทพพยากรณ์เงียบงันในขณะนี้ (ไม่พบ API Key)" }`

## Support & Misc

### GET /api/reviews/highlight?limit=12
- Used by: `pages/Home.tsx` (review slider).
- Response 200 (lightweight cards):
```json
[
  {
    "_id": "r1",
    "userId": "66ff…",
    "userDisplayName": "เอกชัย เกมเมอร์",
    "userAvatar": { "type": "custom", "value": "https://…/avatar.jpg" },
    "rating": 5,
    "reviewText": "งานภาพใน Neon Protocol สวยตะลึงมาก!",
    "createdAt": "2023-10-15T00:00:00Z",
    "adminReply": {
      "text": "ขอบคุณมากครับ",
      "adminId": "66aa…",
      "adminDisplayName": "Chronos Team",
      "adminAvatar": { "type": "custom", "value": "https://…/admin-avatar.png" },
      "repliedAt": "2023-10-16T00:00:00Z"
    }
  }
]
```

### GET /api/config/app
- Used by: `App.tsx` (show app name/version, credit refill interval).
- Response 200:
```json
{ "appName": "CHRONOS", "appVersion": "v1.2.0", "refillIntervalMs": 300000 }
```
