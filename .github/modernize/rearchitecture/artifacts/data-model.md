# SpendSync existing data model

The persistence layer uses Spring Data MongoDB. The following records the model as implemented; it does not propose schema changes.

## Collections and fields

### `users` — `com.spendsync.api.model.User`

| Field | Java type | Mapping / notes |
|---|---|---|
| `id` | `String` | Mongo `@Id` |
| `name` | `String` | No explicit field alias |
| `email` | `String` | Unique `@Indexed` |
| `password` | `String` | No explicit field alias |
| `avatarColor` | `String` | No explicit field alias |
| `roles` | `Set<String>` | Defaults to an empty `HashSet` when using the builder |
| `currency` | `String` | Comment gives examples USD, EUR, INR |
| `timezone` | `String` | No explicit field alias |
| `createdAt` | `LocalDateTime` | Spring Data `@CreatedDate` |
| `updatedAt` | `LocalDateTime` | Spring Data `@LastModifiedDate` |

Collection mapping: `@Document(collection = "users")`, in [User.java](../../../../server/src/main/java/com/spendsync/api/model/User.java).

### `transactions` — `com.spendsync.api.model.Transaction`

| Field | Java type | Mapping / notes |
|---|---|---|
| `id` | `String` | Mongo `@Id` |
| `userId` | `String` | `@Indexed`; stores the owning user's ID |
| `type` | `TransactionType` | Enum values `INCOME`, `EXPENSE` |
| `category` | `String` | No explicit field alias |
| `amount` | `BigDecimal` | No explicit field alias |
| `description` | `String` | No explicit field alias |
| `notes` | `String` | No explicit field alias |
| `date` | `LocalDate` | Transaction date |
| `isRecurring` | `boolean` | Request/response DTO calls the corresponding property `recurring` |
| `recurringFrequency` | `String` | Comment lists DAILY, WEEKLY, MONTHLY, YEARLY |
| `createdAt` | `LocalDateTime` | Spring Data `@CreatedDate` |
| `updatedAt` | `LocalDateTime` | Spring Data `@LastModifiedDate` |

Collection mapping: `@Document(collection = "transactions")`, in [Transaction.java](../../../../server/src/main/java/com/spendsync/api/model/Transaction.java).

## Relationships and schema hints

- Each transaction stores `userId` as a string and that field is indexed.
- No MongoDB `@DBRef`, embedded user object, or explicit relationship mapping appears in these model classes. Ownership is checked by matching a transaction's `userId` with the authenticated user's ID in the service layer.
- User email has a unique index; transaction `userId` has a non-unique index.
- No explicit `@Field` aliases or schema migration files were identified in the inspected source.
- Request validation requires transaction type, category, amount (minimum `0.01`) and date. Registration validates name (2–50 characters), email and password (minimum six characters).

## Transaction boundaries

No `@Transactional` boundary is declared in the inspected services. Repository writes are performed through individual Spring Data MongoDB calls. No multi-document atomic transaction is visible in the source.

## Key entities

1. **User** — account identity, credentials, roles, display currency and audit timestamps.
2. **Transaction** — user-owned income or expense ledger entry, including amount, category, date and recurring metadata.

## Evidence locations

- Entity and collection mappings: [User.java](../../../../server/src/main/java/com/spendsync/api/model/User.java), [Transaction.java](../../../../server/src/main/java/com/spendsync/api/model/Transaction.java).
- Request validation: `server/src/main/java/com/spendsync/api/dto/request/`.
- Database connection configuration: `server/src/main/resources/application.yml`.

