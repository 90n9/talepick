# TalePick Frontend API Specification

## Base URL
```
Production: https://api.talepick.com
Development: http://localhost:3001
```

## Authentication
- **Bearer Token**: Include `Authorization: Bearer <token>` in headers for protected routes
- **Guest Sessions**: Temporary sessions with limited functionality

---

## Authentication APIs

### POST /auth/register
Register new user account

**Request:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Please verify your email",
  "tempToken": "string"
}
```

### POST /auth/send-otp
Send OTP verification code

**Request:**
```json
{
  "email": "string",
  "type": "register|reset_password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

### POST /auth/verify-otp
Verify OTP code

**Request:**
```json
{
  "email": "string",
  "otp": "string",
  "type": "register|reset_password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "avatar": "string"
  }
}
```

### POST /auth/login
User login

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "token": "string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "avatar": "string",
    "credits": 20,
    "isGuest": false
  }
}
```

### POST /auth/google
Google OAuth login

**Request:**
```json
{
  "googleToken": "string"
}
```

**Response:**
```json
{
  "success": true,
  "token": "string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "avatar": "string",
    "credits": 20,
    "isGuest": false
  }
}
```

### POST /auth/guest
Create guest session

**Request:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "token": "string",
  "user": {
    "id": "guest-123456",
    "name": "ผู้เยี่ยมชม (Guest)",
    "email": "",
    "credits": 10,
    "isGuest": true
  }
}
```

### POST /auth/reset-password
Reset forgotten password

**Request:**
```json
{
  "email": "string",
  "otp": "string",
  "newPassword": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## User Management APIs

### GET /users/profile
Get current user profile

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "avatar": "string",
    "credits": 20,
    "maxCredits": 25,
    "lastRefillTime": 1699123456789,
    "achievements": ["first_step", "critic"],
    "playedStories": ["1", "3"],
    "endingsUnlocked": 5,
    "favorites": ["1", "2"],
    "isGuest": false,
    "ratedStoriesForBonus": []
  }
}
```

### PUT /users/profile
Update user profile

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "string",
  "avatar": "string"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "avatar": "string"
  }
}
```

### POST /users/logout
User logout

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Story Content APIs

### GET /stories
Get all stories with optional filters

**Query Parameters:**
- `genre` (optional): Filter by genre
- `search` (optional): Search by title
- `featured` (optional): Get featured stories only
- `limit` (optional): Number of results
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "success": true,
  "stories": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "genre": "string",
      "coverImage": "string",
      "trailerUrl": "string",
      "gallery": ["string"],
      "duration": "string",
      "totalEndings": 5,
      "rating": 4.5,
      "totalPlayers": 1234,
      "tags": ["string"],
      "isNew": true,
      "comingSoon": false,
      "launchDate": "2024-01-15"
    }
  ],
  "total": 10
}
```

### GET /stories/{id}
Get story details

**Response:**
```json
{
  "success": true,
  "story": {
    "id": "string",
    "title": "string",
    "description": "string",
    "genre": "string",
    "coverImage": "string",
    "trailerUrl": "string",
    "gallery": ["string"],
    "duration": "string",
    "totalEndings": 5,
    "rating": 4.5,
    "totalPlayers": 1234,
    "tags": ["string"],
    "isNew": true,
    "comingSoon": false,
    "launchDate": "2024-01-15",
    "isFavorite": false
  }
}
```

### GET /stories/related/{id}
Get related stories

**Response:**
```json
{
  "success": true,
  "stories": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "genre": "string",
      "coverImage": "string",
      "rating": 4.2,
      "totalPlayers": 567
    }
  ]
}
```

---

## Story Gameplay APIs

### GET /stories/{id}/play
Get story gameplay data (nodes and choices)

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "nodes": {
    "start": {
      "id": "start",
      "bgMusic": "string",
      "segments": [
        {
          "text": "string",
          "duration": 4000,
          "image": "string"
        }
      ],
      "choices": [
        {
          "id": "c1",
          "text": "string",
          "nextNodeId": "search",
          "requiredAchievement": "string"
        }
      ]
    }
  },
  "startNodeId": "start"
}
```

### POST /stories/{id}/play
Make choice and progress story

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "choiceId": "string",
  "currentNodeId": "string",
  "nextNodeId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "creditsDeducted": true,
  "remainingCredits": 19,
  "nextNode": {
    "id": "string",
    "bgMusic": "string",
    "segments": ["string"],
    "choices": ["string"]
  }
}
```

### POST /stories/{id}/complete
Mark story as completed with ending

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "endingId": "string",
  "endingType": "Good|Bad|Neutral|True|Secret",
  "playthrough": {
    "choices": ["string"],
    "timeSpent": 1800
  }
}
```

**Response:**
```json
{
  "success": true,
  "unlockedAchievements": [
    {
      "id": "first_completion",
      "title": "string",
      "description": "string",
      "icon": "string",
      "creditBonus": 5
    }
  ],
  "unlockedAvatars": [
    {
      "id": "avatar_id",
      "name": "string",
      "src": "string"
    }
  ]
}
```

### GET /stories/{id}/endings
Get available endings for story

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "endings": [
    {
      "id": "e1",
      "title": "string",
      "type": "Good",
      "unlocked": true
    }
  ]
}
```

---

## User Progress APIs

### GET /users/favorites
Get user's favorite stories

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "favorites": ["story_id_1", "story_id_2"]
}
```

### POST /users/favorites/{storyId}
Add story to favorites

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Added to favorites"
}
```

### DELETE /users/favorites/{storyId}
Remove story from favorites

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Removed from favorites"
}
```

### GET /users/history
Get user play history

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (optional): Number of results
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "storyId": "string",
      "storyTitle": "string",
      "storyCover": "string",
      "endingId": "string",
      "endingTitle": "string",
      "endingType": "Good",
      "completedAt": "2024-01-15T10:30:00Z",
      "timeSpent": 1800
    }
  ],
  "total": 5
}
```

---

## Reviews & Ratings APIs

### GET /stories/{id}/reviews
Get story reviews

**Query Parameters:**
- `limit` (optional): Number of results
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "success": true,
  "reviews": [
    {
      "id": "string",
      "user": "string",
      "rating": 5,
      "comment": "string",
      "date": "2024-01-15",
      "adminReply": {
        "text": "string",
        "date": "2024-01-16"
      }
    }
  ],
  "total": 15
}
```

### POST /stories/{id}/reviews
Submit review/rating

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "rating": 5,
  "comment": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "creditBonusGiven": true,
  "bonusCredits": 5
}
```

### POST /reviews/{id}/report
Report review

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "reason": "string",
  "description": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review reported successfully"
}
```

### POST /stories/{id}/report
Report story

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "reason": "string",
  "description": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Story reported successfully"
}
```

---

## Credits System APIs

### GET /users/credits
Get current credits status

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "credits": 15,
  "maxCredits": 20,
  "lastRefillTime": 1699123456789,
  "nextRefillTime": 1699124056789,
  "refillInterval": 300000
}
```

### POST /users/credits/deduct
Deduct credit for choice

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "storyId": "string",
  "choiceId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "creditsDeducted": true,
  "remainingCredits": 14
}
```

### POST /stories/{id}/rating-bonus
Get rating bonus credits

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "bonusGiven": true,
  "credits": 20,
  "message": "Rating bonus awarded"
}
```

---

## AI Oracle APIs

### POST /api/oracle/recommend
Get AI story recommendation

**Headers:** `Authorization: Bearer <token>` (optional)

**Request:**
```json
{
  "mood": "string",
  "stories": [
    {
      "id": "string",
      "title": "string",
      "genre": "string",
      "description": "string"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "recommendation": "string",
  "storyId": "string"
}
```

---

## Static Data APIs

### GET /achievements
Get all achievements

**Response:**
```json
{
  "success": true,
  "achievements": [
    {
      "id": "first_step",
      "title": "string",
      "description": "string",
      "icon": "string",
      "creditBonus": 5
    }
  ]
}
```

### GET /avatars
Get all avatars

**Response:**
```json
{
  "success": true,
  "avatars": [
    {
      "id": "string",
      "name": "string",
      "src": "string",
      "type": "free|unlock",
      "requiredStoryId": "string",
      "hint": "string"
    }
  ]
}
```

### GET /genres
Get available genres

**Response:**
```json
{
  "success": true,
  "genres": [
    "ไซไฟ",
    "แฟนตาซี",
    "สยองขวัญ",
    "ระทึกขวัญ",
    "คอมเมดี้"
  ]
}
```

---

## Admin APIs (Protected)

### GET /admin/reports
Get reported content

**Headers:** `Authorization: Bearer <admin_token>`

**Response:**
```json
{
  "success": true,
  "reports": [
    {
      "id": "string",
      "type": "story|review",
      "targetId": "string",
      "reason": "string",
      "description": "string",
      "reportedBy": "string",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### POST /reviews/{id}/admin-reply
Admin reply to review

**Headers:** `Authorization: Bearer <admin_token>`

**Request:**
```json
{
  "reply": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reply posted successfully"
}
```

---

## Error Responses

All APIs return consistent error format:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable error message"
}
```

### Common Error Codes:
- `UNAUTHORIZED`: Invalid or missing token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `INSUFFICIENT_CREDITS`: Not enough credits for action
- `RATE_LIMITED`: Too many requests
- `SERVER_ERROR`: Internal server error

---

## Rate Limiting

- **Guest users**: 100 requests per hour
- **Authenticated users**: 1000 requests per hour
- **Oracle API**: 10 requests per hour per user
- **Credit operations**: 5 requests per minute

---

## WebSocket Events (Optional for future)

For real-time features like live choice statistics or multiplayer modes.

**Connection:** `wss://api.talepick.com/ws`

**Events:**
- `story:play` - User starts playing story
- `story:complete` - User completes story
- `choice:selected` - User makes choice (for statistics)
- `achievement:unlocked` - User unlocks achievement

---

## Frontend Implementation Notes

### Authentication Flow
1. Check for existing token in localStorage
2. Validate token on app start
3. Redirect to login if invalid
4. Store user context globally

### Error Handling
- Show user-friendly messages
- Implement retry logic for network errors
- Handle token expiration gracefully
- Provide fallback content when APIs fail

### Caching Strategy
- Cache story data for 30 minutes
- Cache user profile for 5 minutes
- Cache static data indefinitely
- Invalidate cache on user actions

### Offline Support
- Store recently played stories locally
- Cache critical story nodes
- Allow browsing cached stories
- Sync when reconnected