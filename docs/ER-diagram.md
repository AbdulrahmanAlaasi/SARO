# SARO — Entity Relationship Diagram

This ERD reflects the actual implemented schema (Django models under `backend/apps/`).
SQL DDL: [`schema.mysql.sql`](schema.mysql.sql) (MySQL 8) — the production DB is PostgreSQL via Supabase.

## Clean schema diagram (crow's-foot — recommended)

Each entity is one box listing its columns (**PK** bold+underlined, *FK* italic);
connectors use crow's-foot ends (the "many" side) and `tee` (the "one" side).

![SARO ER diagram — crow's foot](saro-erd-tables.png)

> Generated with Graphviz from [`gen_erd_tables.py`](gen_erd_tables.py) —
> run `python docs/gen_erd_tables.py` to regenerate after schema changes.

## Chen-notation diagram (matches the classic example style)

Teal boxes = entities · cream ovals = attributes (underlined = primary key) ·
amber diamonds = relationships · edge labels = cardinality (1 / N).

![SARO ER diagram — Chen notation](saro-erd.png)

> Generated from [`gen_erd.py`](gen_erd.py) — run `python docs/gen_erd.py` to regenerate.

## Crow's-foot version (Mermaid)

GitHub renders the Mermaid diagram below automatically. To edit/export, paste it into
<https://mermaid.live>.

> **Design note:** SARO uses **one `User` table with a `role` field**
> (`customer` · `driver` · `admin` · `branch_supervisor`) instead of separate
> Student/Admin tables. Role-specific links (customer, driver, branch supervisor)
> are therefore all relationships originating from `User`.

```mermaid
erDiagram
    USER ||--o{ ADDRESS : "has"
    USER ||--o{ ORDER : "places (customer)"
    USER |o--o{ ORDER : "delivers (driver)"
    USER |o--o{ BRANCH : "supervises"
    USER ||--o{ SUBSCRIPTION : "subscribes"
    USER ||--o{ PAYMENT : "pays"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ MESSAGE : "sends"
    USER ||--o{ ORDERSTATUSLOG : "records"
    USER |o--o{ AIRECOMMENDATION : "recommended as driver"

    BRANCH ||--o{ LOCKER : "hosts"
    BRANCH ||--o{ ORDER : "handles"

    ADDRESS ||--o{ ORDER : "delivered to"
    LOCKER  |o--o{ ORDER : "used by"

    ORDER ||--o{ ORDERSTATUSLOG : "has"
    ORDER ||--o| RATING : "rated by"
    ORDER ||--o{ CONVERSATION : "discussed in"
    ORDER ||--o{ AIRECOMMENDATION : "has"
    ORDER |o--o{ PAYMENT : "billed in"

    PLAN ||--o{ SUBSCRIPTION : "defines"
    SUBSCRIPTION |o--o{ PAYMENT : "billed in"

    CONVERSATION ||--o{ MESSAGE : "contains"

    USER {
        int id PK
        string username UK
        string email
        string password
        string first_name
        string last_name
        string role "customer|driver|admin|branch_supervisor"
        string phone "never exposed in messaging (PDPL)"
        string preferred_language "ar|en"
        bool is_active
        datetime date_joined
    }

    BRANCH {
        int id PK
        string name
        string name_ar
        string city
        string district
        int supervisor_id FK "User (branch_supervisor)"
        bool is_active
        datetime created_at
    }

    ADDRESS {
        int id PK
        int customer_id FK "User"
        string label
        string city
        string district
        string street
        string national_address "SPL code (stored only)"
        string notes
        bool is_default
        datetime created_at
    }

    LOCKER {
        int id PK
        string name
        int branch_id FK
        string city
        string district
        string location
        int total_slots
        int available_slots
        string status "active|full|maintenance"
        datetime created_at
    }

    ORDER {
        int id PK
        int customer_id FK "User"
        int driver_id FK "User (nullable)"
        int branch_id FK "nullable"
        int address_id FK "nullable"
        int locker_id FK "nullable"
        string delivery_method "home|locker|home_box|over_the_wall"
        string status "created|assigned|picked_up|in_transit|delivered|failed"
        string priority "low|normal|high"
        string package_description
        text delivery_instructions
        string pickup_code "locker only"
        bool is_delayed
        datetime scheduled_time
        datetime created_at
        datetime updated_at
    }

    ORDERSTATUSLOG {
        int id PK
        int order_id FK
        string status
        string note
        int by_id FK "User (nullable)"
        datetime created_at
    }

    RATING {
        int id PK
        int order_id FK "OneToOne"
        int stars
        string comment
        datetime created_at
    }

    PLAN {
        int id PK
        string name
        string name_ar
        decimal price
        string period "monthly|yearly"
        text features
        bool is_active
    }

    SUBSCRIPTION {
        int id PK
        int customer_id FK "User"
        int plan_id FK
        string status "active|expired|cancelled"
        date start_date
        date end_date
    }

    PAYMENT {
        int id PK
        int customer_id FK "User"
        int order_id FK "nullable"
        int subscription_id FK "nullable"
        decimal amount
        string method
        string status "pending|paid|failed"
        datetime created_at
    }

    CONVERSATION {
        int id PK
        int order_id FK
        int customer_id FK "User"
        int driver_id FK "User"
        datetime created_at
    }

    MESSAGE {
        int id PK
        int conversation_id FK
        int sender_id FK "User"
        text body
        bool is_read
        datetime created_at
    }

    NOTIFICATION {
        int id PK
        int user_id FK "User"
        string type "assignment|status|delay|message|info"
        string title
        string body
        bool is_read
        datetime created_at
    }

    AIRECOMMENDATION {
        int id PK
        int order_id FK
        int recommended_driver_id FK "User (driver)"
        float score
        string reason
        bool accepted
        datetime created_at
    }
```

## Relationship summary

| From | To | Cardinality | Meaning |
|------|----|-------------|---------|
| User (customer) | Address | 1 : N | A customer saves many addresses |
| User (customer) | Order | 1 : N | A customer places many orders |
| User (driver) | Order | 0..1 : N | A driver delivers many orders (order may be unassigned) |
| User (branch_supervisor) | Branch | 0..1 : N | A supervisor oversees branches |
| Branch | Locker | 1 : N | A branch hosts many lockers |
| Branch | Order | 1 : N | A branch handles many orders |
| Address | Order | 1 : N | An address can be the target of many orders |
| Locker | Order | 0..1 : N | A locker can be used by many (locker) orders |
| Order | OrderStatusLog | 1 : N | Each status change is logged |
| Order | Rating | 1 : 0..1 | A delivered order can be rated once |
| Order | Conversation | 1 : N | Privacy-first chat tied to an order |
| Conversation | Message | 1 : N | Messages within a conversation |
| User | Message | 1 : N | A user sends many messages (no phone numbers exposed) |
| Plan | Subscription | 1 : N | A plan has many subscriptions |
| User (customer) | Subscription | 1 : N | A customer subscribes over time |
| User / Order / Subscription | Payment | 1 : N | Simulated payments link to a customer (+order or subscription) |
| Order | AIRecommendation | 1 : N | Smart-dispatch suggestions logged per order |
| User (driver) | AIRecommendation | 0..1 : N | A driver can be the recommended one |
| User | Notification | 1 : N | A user receives many notifications |

Crow's-foot legend: `||` = exactly one · `|o` = zero or one · `o{` = zero or many · `|{` = one or many.
