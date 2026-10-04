import {
  bigint,
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

const createdAt = () => timestamp('created_at', { withTimezone: true }).defaultNow().notNull();
const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull();

// ── Better Auth (property names are the field names Better Auth expects) ──

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  isAnonymous: boolean('is_anonymous').default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    token: text('token').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('session_user_id_idx').on(t.userId)],
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    scope: text('scope'),
    password: text('password'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('account_user_id_idx').on(t.userId)],
);

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('verification_identifier_idx').on(t.identifier)],
);

// ── App ──

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    priority: text('priority', { enum: ['LOW', 'MEDIUM', 'HIGH'] }).default('MEDIUM').notNull(),
    status: text('status', { enum: ['TODO', 'DOING', 'DONE'] }).default('TODO').notNull(),
    estimatePomodoros: integer('estimate_pomodoros').default(1).notNull(),
    actualPomodoros: integer('actual_pomodoros').default(0).notNull(),
    timeSpentMs: bigint('time_spent_ms', { mode: 'number' }).default(0).notNull(),
    tags: text('tags').array().default([]).notNull(),
    dueDate: timestamp('due_date', { withTimezone: true }),
    displayOrder: integer('display_order').default(0).notNull(),
    isTemplate: boolean('is_template').default(false).notNull(),
    isDeleted: boolean('is_deleted').default(false).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('tasks_user_order_idx').on(t.userId, t.isDeleted, t.displayOrder)],
);

export const userTags = pgTable('user_tags', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  tags: text('tags').array().default([]).notNull(),
  updatedAt: updatedAt(),
});

/** Named focus_sessions so it never collides with Better Auth's `session`. */
export const focusSessions = pgTable(
  'focus_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'set null' }),
    mode: text('mode', { enum: ['work', 'shortBreak', 'longBreak'] }).notNull(),
    durationSec: integer('duration_sec').notNull(),
    /**
     * Id the client minted for this session (its outbox item id). Retrying the
     * same session after a lost response hits the unique index instead of
     * creating a duplicate. Null for rows written before this column existed.
     */
    clientSessionId: text('client_session_id'),
    /** When the session ended (the client's end time, clamped by the API), not when it was uploaded. */
    createdAt: createdAt(),
  },
  (t) => [
    index('focus_sessions_user_created_idx').on(t.userId, t.createdAt),
    uniqueIndex('focus_sessions_user_client_session_uidx').on(t.userId, t.clientSessionId),
  ],
);

export const feedbacks = pgTable('feedbacks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  type: text('type', { enum: ['feature', 'bug', 'question', 'other'] }).notNull(),
  message: text('message').notNull(),
  rating: integer('rating'),
  name: text('name'),
  email: text('email'),
  createdAt: createdAt(),
});
