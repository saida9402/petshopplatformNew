# CLAUDE.md — Petoria Pet Shop Platform

> This file provides full context for Claude Code (and other AI agents) about this project.
> Read this file completely **before** writing any code.

---

## 1. Project Overview

**Petoria** is an online pet shop platform for selling pet products.
The backend is built as a **NestJS Monorepo** using **NestJS + GraphQL + MongoDB (Mongoose)**.

| Property | Value |
|---|---|
| Stack | NestJS 10, GraphQL (Apollo), MongoDB, Mongoose 8, WebSocket (ws) |
| Architecture | NestJS Monorepo (2 apps) |
| API Type | GraphQL (code-first, `autoSchemaFile: true`) |
| Auth | JWT (30 days, Bearer token) + bcryptjs |
| Real-time | WebSocket Gateway (ws adapter — NOT socket.io) |
| File Upload | `graphql-upload` (max 15MB per file, max 10 files) |
| Scheduling | `@nestjs/schedule` (petoria-batch only) |

---

## 2. Monorepo Structure

```
petshopplatform/                    ← root
├── apps/
│   ├── petoria-api/                ← Main GraphQL API server
│   │   └── src/
│   │       ├── app.module.ts
│   │       ├── app.controller.ts
│   │       ├── app.resolver.ts
│   │       ├── app.service.ts
│   │       ├── main.ts
│   │       ├── components/         ← All business logic modules
│   │       │   ├── auth/
│   │       │   ├── member/
│   │       │   ├── product/
│   │       │   ├── cart/
│   │       │   ├── order/
│   │       │   ├── board-article/
│   │       │   ├── comment/
│   │       │   ├── like/
│   │       │   ├── view/
│   │       │   ├── follow/
│   │       │   └── components.module.ts
│   │       ├── database/
│   │       │   └── database.module.ts
│   │       ├── libs/
│   │       │   ├── config.ts       ← Aggregation helpers, sort lists, brands
│   │       │   ├── dto/            ← GraphQL input/output DTOs
│   │       │   │   ├── board-article/
│   │       │   │   ├── cart/
│   │       │   │   ├── comment/
│   │       │   │   ├── follow/
│   │       │   │   ├── like/
│   │       │   │   ├── member/
│   │       │   │   ├── order/
│   │       │   │   └── product/
│   │       │   ├── enums/          ← All enum definitions
│   │       │   ├── interceptor/
│   │       │   └── types/
│   │       │       └── common.ts   ← T, StatisticModifier interfaces
│   │       ├── schemas/            ← Mongoose schema models
│   │       └── socket/
│   │           ├── socket.gateway.ts
│   │           └── socket.module.ts
│   └── petoria-batch/              ← Cron job server (separate port)
│       └── src/
│           ├── batch.module.ts
│           ├── batch.controller.ts
│           ├── batch.service.ts
│           ├── main.ts
│           ├── database/
│           └── lib/
│               └── config.ts
├── nest-cli.json
├── package.json
└── tsconfig.json
```

---

## 3. Two Separate Servers

### petoria-api (main)
- Port: `process.env.PORT_API ?? 3000`
- GraphQL Playground: `http://localhost:3000/graphql`
- Static uploads: `http://localhost:3000/uploads`
- WebSocket: `ws://localhost:3000`
- Start: `npm run start:dev`

### petoria-batch (cron jobs)
- Port: `process.env.PORT_BATCH ?? 3000`
- Start: `npm run start:dev:batch`
- **Directly imports schemas and DTOs from petoria-api:**
  - `apps/petoria-api/src/schemas/...`
  - `apps/petoria-api/src/libs/...`

---

## 4. Environment Variables (.env)

```env
PORT_API=3002
PORT_BATCH=3003

MONGO_DEV=mongodb+srv://<user>:<password>@cluster0.qdmubkf.mongodb.net/Petoria?retryWrites=true&w=majority
MONGO_PROD=mongodb+srv://<user>:<password>@cluster0.qdmubkf.mongodb.net/Petoria?retryWrites=true&w=majority

SECRET_TOKEN=<your_random_secret>
```

> Both apps share a **single `.env` file** at the project root.
> Currently `MONGO_DEV` and `MONGO_PROD` point to the same Atlas cluster — separate them if you need distinct dev/prod databases later.
> Always add `.env` to `.gitignore` and never commit real credentials.

---

## 5. Core Architecture Rules

### 5.1 GraphQL — Code-First Approach
- All `@ObjectType()` and `@InputType()` classes live inside `libs/dto/`
- Schema is auto-generated: `autoSchemaFile: true`
- **Never create schema files manually**

### 5.2 Auth System
```
JWT (30 days) → Bearer token → AuthGuard / WithoutGuard / RolesGuard
```
- `AuthGuard` — authenticated users only
- `WithoutGuard` — works without login too (memberId can be null)
- `RolesGuard` + `@Roles(MemberType.ADMIN)` — admin only
- `@AuthMember('_id')` decorator — extract memberId from token

### 5.3 Member Roles
| Role | Permissions |
|---|---|
| `USER` | Browse products, place orders, like/comment, follow |
| `SELLER` | USER permissions + create/update own products |
| `ADMIN` | Everything + admin panel CRUD operations |

### 5.4 Mongoose — Two Schema Patterns
The project uses **two different schema styles**:

**Legacy style** (plain Schema) — `BoardArticle`, `Comment`, `Follow`, `Like`, `Member`, `Notice`, `Notification`, `Product`, `View`:
```typescript
import { Schema } from 'mongoose';
const ProductSchema = new Schema({ ... }, { timestamps: true });
export default ProductSchema;
```

**Modern style** (class-based, SchemaFactory) — `Cart`, `Order`:
```typescript
@Schema({ timestamps: true, collection: 'carts' })
export class Cart extends Document { ... }
export const CartSchema = SchemaFactory.createForClass(Cart);
```

> Use the **modern style** (SchemaFactory) for any new modules.

### 5.5 StatisticModifier Pattern
Common pattern for incrementing/decrementing likes, views, and comment counts:
```typescript
// libs/types/common.ts
interface StatisticModifier {
  _id: ObjectId;
  targetKey: string;
  modifier: number; // +1 or -1
}

// Usage in any service:
await this.memberService.memberStatsEditor({
  _id: memberId,
  targetKey: 'memberArticles',
  modifier: 1,
});
```

### 5.6 Aggregation Pipeline Helpers (`libs/config.ts`)
```typescript
lookupMember               // memberId → memberData
lookupAuthMemberLiked()    // builds meLiked array
lookupAuthMemberFollowed() // builds meFollowed array
lookupFollowerData         // followerId → followerData
lookupFollowingData        // followingId → followingData
lookupFavorite             // like → product.memberData
lookupVisit                // view → product.memberData
```

---

## 6. Domain Models and MongoDB Collections

| Model | Collection | Schema File |
|---|---|---|
| Member | `members` | `schemas/Member.model.ts` |
| Product | `products` | `schemas/Product.model.ts` |
| Cart | `carts` | `schemas/Cart.model.ts` |
| Order | `orders` | `schemas/Order.model.ts` |
| BoardArticle | `boardArticles` | `schemas/BoardArticle.model.ts` |
| Comment | `comments` | `schemas/Comment.model.ts` |
| Like | `likes` | `schemas/Like.model.ts` |
| View | `views` | `schemas/View.model.ts` |
| Follow | `follows` | `schemas/Follow.model.ts` |
| Notice | `notices` | `schemas/Notice.model.ts` |
| Notification | `notifications` | `schemas/Notification.model.ts` |

---

## 7. Enums — Complete Reference

### Member
```typescript
MemberType:     USER | SELLER | ADMIN
MemberStatus:   ACTIVE | BLOCK | DELETE
MemberAuthType: PHONE | EMAIL | TELEGRAM
```

### Product
```typescript
ProductType:     DOG | CAT | BIRD | FISH
ProductStatus:   ACTIVE | SOLD | DELETE
ProductCategory: FOOD | MEDICINE | ACCESSORY | TOY
```

### Cart
```typescript
CartStatus: ACTIVE | CHECKED_OUT | ABANDONED
```

### Order
```typescript
OrderStatus:        PENDING | PROCESS | CONFIRM | DELIVERED | CANCEL
OrderItemStatus:    PENDING | PROCESS | CONFIRM | DELIVERED | CANCEL
OrderPaymentMethod: CREDIT_CARD | DEBIT_CARD | CASH | PAYPAL | STRIPE
                    | APPLE_PAY | GOOGLE_PAY | BANK_TRANSFER
```

### BoardArticle
```typescript
BoardArticleCategory: FREE | RECOMMEND | NEWS | HUMOR
BoardArticleStatus:   ACTIVE | DELETE
```

### Comment
```typescript
CommentStatus: ACTIVE | DELETE
CommentGroup:  MEMBER | ARTICLE | PRODUCT
```

### Like / View
```typescript
LikeGroup: MEMBER | PRODUCT | ARTICLE
ViewGroup: MEMBER | ARTICLE | PRODUCT
```

### Notification
```typescript
NotificationType:   LIKE | COMMENT
NotificationStatus: WAIT | READ
NotificationGroup:  MEMBER | ARTICLE | PRODUCT
```

### Notice
```typescript
NoticeCategory: FAQ | TERMS | INQUIRY
NoticeStatus:   HOLD | ACTIVE | DELETE
```

### Common
```typescript
Direction: ASC = 1 | DESC = -1
```

---

## 8. Business Rules

### 8.1 Comment Restrictions
- For `CommentGroup.PRODUCT`: only members who have a **DELIVERED** order containing that product can post a review:
```typescript
// comment.service.ts — createComment()
const hasPurchased = await this.orderModel.exists({
  memberId,
  'orderItems.productId': input.commentRefId,
  orderStatus: OrderStatus.DELIVERED,
});
if (!hasPurchased) throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);
```

### 8.2 Order Status — Strict Forward-Only Transitions
```
PENDING → PROCESS → CONFIRM → DELIVERED
```
- Steps cannot be skipped
- Transitions cannot go backward
- Cancellation uses a separate `cancelOrder` mutation
- Only `PENDING` and `PROCESS` orders can be cancelled

### 8.3 Cart → Order Flow
1. `addToCart` — product is added to the cart
2. `createOrder` — new order is created (orderTotal is **always recalculated server-side**)
3. `checkoutCart` — cart status is set to `CHECKED_OUT`

### 8.4 Follow Restrictions
- Self-follow is denied: throws `SELF_SUBSCRIPTION_DENIED`
- Unique compound index: `{ followingId, followerId }`

### 8.5 Like — Toggle Pattern
```typescript
// like.service.ts — toggleLike()
// If like exists → delete it (modifier: -1)
// If like does not exist → create it (modifier: +1)
```

### 8.6 View — Recorded Once Per Member
```typescript
// Unique compound index: { memberId, viewRefId }
// A second visit to the same ref by the same member does NOT increment viewCount
```

### 8.7 Image Upload Rules
- Allowed MIME types: `image/jpg`, `image/jpeg`, `image/png`
- Max file size: 15MB
- Max files per request: 10
- Saved to: `uploads/{target}/{uuid}.ext`

---

## 9. Batch Server — Cron Schedule

| Cron Name | Schedule | Task |
|---|---|---|
| `BATCH_ROLLBACK` | Every minute at second `00` | Reset `productRank` and `memberRank` to `0` for all active products and sellers |
| `BATCH_TOP_PROPERTIES` | Every minute at second `20` | Calculate product ranks: `likes × 2 + views × 1` |
| `BATCH_TOP_AGENTS` | Every minute at second `40` | Calculate seller ranks: `products × 5 + articles × 3 + likes × 2 + views × 1` |

---

## 10. WebSocket Gateway

- Adapter: **`WsAdapter`** (NOT socket.io)
- Connection URL: `ws://localhost:3000?token=<jwt>`
- Auth: JWT passed as URL query param `?token=<jwt>`
- Message history: last **5 messages** kept in memory only

| Event | Direction | Description |
|---|---|---|
| `message` | Client → Server | Send a chat message |
| `getMessages` | Server → Client | Last 5 messages on connect |
| `info` | Server → All | Join/leave notification (`totalClients`, `action`, `memberData`) |

---

## 11. Sort Fields & Brands (config.ts)

```typescript
availableSellerSorts       = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews', 'memberRank']
availableMemberSorts       = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews']
availableProductSorts      = ['createdAt', 'updatedAt', 'productLikes', 'productViews', 'productRank', 'productPrice']
availableBoardArticleSorts = ['createdAt', 'updatedAt', 'articleLikes', 'articleViews']
availableCommentSorts      = ['createdAt', 'updatedAt']
availableOrderSorts        = ['createdAt', 'updatedAt', 'orderTotal']

availableBrands = [
  'Royal Canin', 'Purina', 'Hills', 'Whiskas',
  'Elanco', 'Furminator', 'Kong', 'PetStyle'
]
```

---

## 12. Known Bugs & Issues To Fix

### 12.1 batch.controller.ts — Wrong Method Name
```typescript
// batch.controller.ts calls:
await this.batchService.batchTopProperties(); // ← does NOT exist

// batch.service.ts defines:
public async batchTopProducts() { ... }       // ← correct name
```
**Fix:** Rename the call in `batch.controller.ts` to `batchTopProducts()`.

### 12.2 member.ts DTO — Field Name Mismatch
```typescript
// member.ts (DTO):
memberProducts: number;     // ← "memberProducts"

// Member.model.ts (schema):
memberProperties: { ... }   // ← "memberProperties"
```
**Fix:** Align the field name in schema or DTO. `memberProducts` is semantically correct for this pet shop domain.

### 12.3 follow.service.ts — Typo in Field Name
```typescript
// Current (wrong — 3 x 'l'):
lookupAuthMemberLiked(memberId, '$folllowingId')
lookupAuthMemberLiked(memberId, '$folllowerId')

// Fix:
lookupAuthMemberLiked(memberId, '$followingId')
lookupAuthMemberLiked(memberId, '$followerId')
```

### 12.4 cart.resolver.ts — No Auth Guard (Security Risk)
```typescript
// All CartResolver methods are completely unprotected!
// Anyone can pass any memberId and manipulate another user's cart.
```
**Fix:** Add `@UseGuards(AuthGuard)` to all mutations and get `memberId` from `@AuthMember('_id')` instead of a GraphQL argument.

### 12.5 order.resolver.ts — No Auth Guard (Security Risk)
```typescript
// createOrder and getMyOrders accept memberId as a plain GraphQL arg.
// Any authenticated user can create orders on behalf of another member.
```
**Fix:** Add `@UseGuards(AuthGuard)`, remove `memberId` from GraphQL args, and extract it from the JWT via `@AuthMember('_id')`.

### 12.6 Notification Module — Schema Only, No Module
- `schemas/Notification.model.ts` exists
- `components/notification/` module does **not** exist
- Push notifications on like/comment are not yet implemented

### 12.7 Notice Module — Schema Only, No Module
- `schemas/Notice.model.ts` exists
- `components/notice/` module does **not** exist
- Admin FAQ/Terms/Inquiry CRUD is not yet implemented

### 12.8 comment.module.ts — OrderSchema Registered Twice
```typescript
// CommentModule registers OrderSchema directly via forFeature.
// OrderModule also registers it. This does not cause a crash but
// injecting OrderService directly would be a cleaner solution.
```

---

## 13. Frontend Integration Checklist

Test these queries in GraphQL Playground (`http://localhost:3000/graphql`):

**Sign up:**
```graphql
mutation {
  signup(input: {
    memberNick: "testuser"
    memberPassword: "pass123"
    memberPhone: "+821012345678"
  }) {
    _id memberNick accessToken
  }
}
```

**Browse products (no auth required):**
```graphql
query {
  getProducts(input: { page: 1, limit: 10, search: {} }) {
    list { _id productName productPrice productType productCategory }
    metaCounter { total }
  }
}
```

**Add to cart (send token in HTTP header `Authorization: Bearer <token>`):**
```graphql
mutation {
  addToCart(
    memberId: "..."
    input: {
      productId: "..."
      productName: "Royal Canin Adult"
      itemPrice: 35000
      itemQuantity: 1
    }
  ) { _id cartTotal cartItems { productName itemQuantity } }
}
```

**CORS configuration:**
```typescript
// main.ts
app.enableCors({ origin: true, credentials: true });
// Change origin to specific frontend URL in production:
// app.enableCors({ origin: 'http://localhost:3001', credentials: true });
```

---

## 14. Adding a New Module — Standard Pattern

```
components/
  new-feature/
    new-feature.module.ts    ← MongooseModule.forFeature + imports + exports
    new-feature.resolver.ts  ← @Resolver, @Query, @Mutation, Guards, Decorators
    new-feature.service.ts   ← All business logic
libs/
  dto/
    new-feature/
      new-feature.ts         ← @ObjectType (response)
      new-feature.input.ts   ← @InputType (create/query)
      new-feature.update.ts  ← @InputType (update)
  enums/
    new-feature.enum.ts      ← registerEnumType(...)
schemas/
  NewFeature.model.ts        ← Mongoose Schema (use SchemaFactory style)
```

After creating the module, add it to the `imports` array in `components.module.ts`.

---

## 15. Build & Deploy Commands

```bash
# Development
npm run start:dev           # petoria-api (watch mode)
npm run start:dev:batch     # petoria-batch (watch mode)

# Production build
npm run build               # builds both apps
# Equivalent to: nest build petoria-api && nest build petoria-batch

# Production run
npm run start:prod          # NODE_ENV=production petoria-api
npm run start:prod:batch    # NODE_ENV=production petoria-batch

# Code quality
npm run lint                # ESLint with auto-fix
npm run format              # Prettier
npm run test                # Jest unit tests
npm run test:e2e            # E2E tests
```

---

## 16. TypeScript Configuration Notes

```json
{
  "strictNullChecks": false,    // No null checking — guard against null manually
  "noImplicitAny": false,       // any type is allowed
  "target": "ES2021",
  "emitDecoratorMetadata": true,
  "experimentalDecorators": true
}
```

> Because `strictNullChecks` is disabled, null/undefined errors will surface at runtime. Always validate null values explicitly in service methods.

---

## 17. Quick Reference

```typescript
// Convert string → Mongoose ObjectId
shapeIntoMongoObjectId(input: string)   // libs/config.ts

// Generate unique filename for uploads
getSerialForImage(filename: string)     // returns uuid + original extension

// Common error messages (libs/enums/common.enum.ts)
Message.NO_DATA_FOUND
Message.CREATE_FAILED
Message.UPDATE_FAILED
Message.REMOVE_FAILED
Message.NOT_AUTHENTICATED
Message.NOT_ALLOWED_REQUEST
Message.SELF_SUBSCRIPTION_DENIED
Message.USED_MEMBER_NICK_OR_PHONE
Message.WRONG_PASSWORD
Message.BLOCKED_USER
Message.PROVIDE_ALLOWED_FORMAT
Message.UPLOAD_FAILED
Message.SOMETHING_WENT_WRONG
Message.BAD_REQUEST
```
