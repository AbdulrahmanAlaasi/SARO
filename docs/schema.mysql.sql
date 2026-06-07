-- ============================================================================
--  SARO — Smart Delivery Management Platform
--  MySQL 8.0 schema (utf8mb4 for Arabic). Mirrors the Django models.
--  Note: production runs on PostgreSQL (Supabase); this is the MySQL equivalent.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS saro
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE saro;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------------
-- USERS  (single table with a role field: customer | driver | admin | branch)
-- ---------------------------------------------------------------------------
CREATE TABLE users (
    id                  BIGINT       NOT NULL AUTO_INCREMENT,
    username            VARCHAR(150) NOT NULL,
    email               VARCHAR(254) NOT NULL DEFAULT '',
    password            VARCHAR(128) NOT NULL,                 -- hashed
    first_name          VARCHAR(150) NOT NULL DEFAULT '',
    last_name           VARCHAR(150) NOT NULL DEFAULT '',
    role                ENUM('customer','driver','admin','branch_supervisor')
                                     NOT NULL DEFAULT 'customer',
    phone               VARCHAR(20)  NOT NULL DEFAULT '',      -- never exposed (PDPL)
    preferred_language  ENUM('en','ar') NOT NULL DEFAULT 'ar',
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    is_staff            BOOLEAN      NOT NULL DEFAULT FALSE,
    is_superuser        BOOLEAN      NOT NULL DEFAULT FALSE,
    last_login          DATETIME     NULL,
    date_joined         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_username (username),
    KEY idx_users_role (role)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- BRANCHES
-- ---------------------------------------------------------------------------
CREATE TABLE branches (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    name           VARCHAR(120) NOT NULL,
    name_ar        VARCHAR(120) NOT NULL DEFAULT '',
    city           VARCHAR(80)  NOT NULL,
    district       VARCHAR(120) NOT NULL DEFAULT '',
    supervisor_id  BIGINT       NULL,                          -- User (branch_supervisor)
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_branch_supervisor FOREIGN KEY (supervisor_id)
        REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- ADDRESSES
-- ---------------------------------------------------------------------------
CREATE TABLE addresses (
    id                BIGINT       NOT NULL AUTO_INCREMENT,
    customer_id       BIGINT       NOT NULL,                   -- User
    label             VARCHAR(60)  NOT NULL,
    city              VARCHAR(80)  NOT NULL,
    district          VARCHAR(120) NOT NULL DEFAULT '',
    street            VARCHAR(200) NOT NULL DEFAULT '',
    national_address  VARCHAR(20)  NOT NULL DEFAULT '',        -- SPL code (stored only)
    notes             VARCHAR(255) NOT NULL DEFAULT '',
    is_default        BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_address_customer FOREIGN KEY (customer_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- LOCKERS
-- ---------------------------------------------------------------------------
CREATE TABLE lockers (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    name             VARCHAR(80)  NOT NULL,
    branch_id        BIGINT       NULL,
    city             VARCHAR(80)  NOT NULL,
    district         VARCHAR(120) NOT NULL DEFAULT '',
    location         VARCHAR(200) NOT NULL DEFAULT '',
    total_slots      INT UNSIGNED NOT NULL DEFAULT 10,
    available_slots  INT UNSIGNED NOT NULL DEFAULT 10,
    status           ENUM('active','full','maintenance') NOT NULL DEFAULT 'active',
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_locker_branch FOREIGN KEY (branch_id)
        REFERENCES branches (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- PLANS
-- ---------------------------------------------------------------------------
CREATE TABLE plans (
    id         BIGINT        NOT NULL AUTO_INCREMENT,
    name       VARCHAR(80)   NOT NULL,
    name_ar    VARCHAR(80)   NOT NULL DEFAULT '',
    price      DECIMAL(8,2)  NOT NULL DEFAULT 0.00,
    period     ENUM('monthly','yearly') NOT NULL DEFAULT 'monthly',
    features   TEXT          NULL,                             -- one feature per line
    is_active  BOOLEAN       NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- ORDERS  (central entity)
-- ---------------------------------------------------------------------------
CREATE TABLE orders (
    id                     BIGINT       NOT NULL AUTO_INCREMENT,
    customer_id            BIGINT       NOT NULL,              -- User (places)
    driver_id              BIGINT       NULL,                 -- User (delivers)
    branch_id              BIGINT       NULL,
    address_id             BIGINT       NULL,
    locker_id              BIGINT       NULL,
    delivery_method        ENUM('home','locker','home_box','over_the_wall')
                                        NOT NULL DEFAULT 'home',
    status                 ENUM('created','assigned','picked_up',
                                'in_transit','delivered','failed')
                                        NOT NULL DEFAULT 'created',
    priority               ENUM('low','normal','high') NOT NULL DEFAULT 'normal',
    package_description     VARCHAR(255) NOT NULL DEFAULT '',
    delivery_instructions  TEXT         NULL,                 -- over-the-wall, etc.
    pickup_code            VARCHAR(6)   NOT NULL DEFAULT '',   -- locker only
    is_delayed             BOOLEAN      NOT NULL DEFAULT FALSE,
    scheduled_time         DATETIME     NULL,
    created_at             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_orders_status (status),
    CONSTRAINT fk_order_customer FOREIGN KEY (customer_id)
        REFERENCES users (id)     ON DELETE CASCADE,
    CONSTRAINT fk_order_driver   FOREIGN KEY (driver_id)
        REFERENCES users (id)     ON DELETE SET NULL,
    CONSTRAINT fk_order_branch   FOREIGN KEY (branch_id)
        REFERENCES branches (id)  ON DELETE SET NULL,
    CONSTRAINT fk_order_address  FOREIGN KEY (address_id)
        REFERENCES addresses (id) ON DELETE SET NULL,
    CONSTRAINT fk_order_locker   FOREIGN KEY (locker_id)
        REFERENCES lockers (id)   ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- ORDER STATUS LOG  (one row per status change)
-- ---------------------------------------------------------------------------
CREATE TABLE order_status_logs (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    order_id    BIGINT       NOT NULL,
    status      ENUM('created','assigned','picked_up',
                     'in_transit','delivered','failed') NOT NULL,
    note        VARCHAR(255) NOT NULL DEFAULT '',
    by_id       BIGINT       NULL,                            -- User who made the change
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_log_order FOREIGN KEY (order_id)
        REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_log_by    FOREIGN KEY (by_id)
        REFERENCES users (id)  ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- RATINGS  (one per order)
-- ---------------------------------------------------------------------------
CREATE TABLE ratings (
    id          BIGINT        NOT NULL AUTO_INCREMENT,
    order_id    BIGINT        NOT NULL,
    stars       TINYINT UNSIGNED NOT NULL DEFAULT 5,
    comment     VARCHAR(500)  NOT NULL DEFAULT '',
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_rating_order (order_id),                    -- OneToOne
    CONSTRAINT fk_rating_order FOREIGN KEY (order_id)
        REFERENCES orders (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- SUBSCRIPTIONS
-- ---------------------------------------------------------------------------
CREATE TABLE subscriptions (
    id           BIGINT NOT NULL AUTO_INCREMENT,
    customer_id  BIGINT NOT NULL,                             -- User
    plan_id      BIGINT NOT NULL,
    status       ENUM('active','expired','cancelled') NOT NULL DEFAULT 'active',
    start_date   DATE   NOT NULL DEFAULT (CURRENT_DATE),
    end_date     DATE   NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_sub_customer FOREIGN KEY (customer_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_sub_plan     FOREIGN KEY (plan_id)
        REFERENCES plans (id) ON DELETE RESTRICT             -- PROTECT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- PAYMENTS  (simulated — no real gateway)
-- ---------------------------------------------------------------------------
CREATE TABLE payments (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    customer_id      BIGINT        NOT NULL,                  -- User
    order_id         BIGINT        NULL,
    subscription_id  BIGINT        NULL,
    amount           DECIMAL(8,2)  NOT NULL DEFAULT 0.00,
    method           VARCHAR(30)   NOT NULL DEFAULT 'card',
    status           ENUM('pending','paid','failed') NOT NULL DEFAULT 'paid',
    created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_pay_customer FOREIGN KEY (customer_id)
        REFERENCES users (id)         ON DELETE CASCADE,
    CONSTRAINT fk_pay_order    FOREIGN KEY (order_id)
        REFERENCES orders (id)        ON DELETE SET NULL,
    CONSTRAINT fk_pay_sub      FOREIGN KEY (subscription_id)
        REFERENCES subscriptions (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- CONVERSATIONS  (privacy-first: links a customer + driver via an order)
-- ---------------------------------------------------------------------------
CREATE TABLE conversations (
    id           BIGINT   NOT NULL AUTO_INCREMENT,
    order_id     BIGINT   NOT NULL,
    customer_id  BIGINT   NOT NULL,                           -- User
    driver_id    BIGINT   NOT NULL,                           -- User
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_conv_order    FOREIGN KEY (order_id)
        REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_conv_customer FOREIGN KEY (customer_id)
        REFERENCES users (id)  ON DELETE CASCADE,
    CONSTRAINT fk_conv_driver   FOREIGN KEY (driver_id)
        REFERENCES users (id)  ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- MESSAGES  (no phone numbers — in-platform only)
-- ---------------------------------------------------------------------------
CREATE TABLE messages (
    id               BIGINT   NOT NULL AUTO_INCREMENT,
    conversation_id  BIGINT   NOT NULL,
    sender_id        BIGINT   NOT NULL,                       -- User
    body             TEXT     NOT NULL,
    is_read          BOOLEAN  NOT NULL DEFAULT FALSE,
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_msg_conversation FOREIGN KEY (conversation_id)
        REFERENCES conversations (id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_sender       FOREIGN KEY (sender_id)
        REFERENCES users (id)         ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------------
CREATE TABLE notifications (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    user_id     BIGINT       NOT NULL,
    type        VARCHAR(40)  NOT NULL DEFAULT 'info',         -- assignment|status|delay|message|info
    title       VARCHAR(160) NOT NULL,
    body        VARCHAR(500) NOT NULL DEFAULT '',
    is_read     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- AI RECOMMENDATIONS  (rule-based smart-dispatch log)
-- ---------------------------------------------------------------------------
CREATE TABLE ai_recommendations (
    id                     BIGINT       NOT NULL AUTO_INCREMENT,
    order_id               BIGINT       NOT NULL,
    recommended_driver_id  BIGINT       NULL,                 -- User (driver)
    score                  DOUBLE       NOT NULL DEFAULT 0,
    reason                 VARCHAR(255) NOT NULL DEFAULT '',
    accepted               BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_rec_order  FOREIGN KEY (order_id)
        REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_rec_driver FOREIGN KEY (recommended_driver_id)
        REFERENCES users (id)  ON DELETE SET NULL
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
--  Optional: a little sample data (password is a placeholder hash here)
-- ============================================================================
-- INSERT INTO users (username, role, email, password)
-- VALUES ('admin1', 'admin', 'admin1@saro.test', 'PLACEHOLDER_HASH');
-- INSERT INTO plans (name, name_ar, price, period)
-- VALUES ('Basic','أساسي',0,'monthly'), ('Plus','بلس',29,'monthly'), ('Pro','برو',79,'monthly');
