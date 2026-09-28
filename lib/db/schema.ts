import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  date,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum('role', ['admin', 'member']);
export const userStatusEnum = pgEnum('user_status', ['aktif', 'nonaktif']);
export const loanStatusEnum = pgEnum('loan_status', ['dipinjam', 'dikembalikan', 'terlambat']);
export const reservationStatusEnum = pgEnum('reservation_status', [
  'menunggu',
  'tersedia',
  'diambil',
  'kadaluarsa',
  'dibatalkan',
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: roleEnum('role').notNull().default('member'),
  phone: varchar('phone', { length: 20 }),
  memberId: varchar('member_id', { length: 50 }).unique(), // nomor anggota
  status: userStatusEnum('status').notNull().default('aktif'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
});

export const books = pgTable('books', {
  id: uuid('id').defaultRandom().primaryKey(),
  isbn: varchar('isbn', { length: 20 }).unique(),
  title: varchar('title', { length: 500 }).notNull(),
  author: varchar('author', { length: 255 }).notNull(),
  publisher: varchar('publisher', { length: 255 }),
  year: integer('year'),
  categoryId: uuid('category_id').references(() => categories.id),
  totalCopies: integer('total_copies').notNull().default(1),
  availableCopies: integer('available_copies').notNull().default(1),
  coverUrl: text('cover_url'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const loans = pgTable('loans', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookId: uuid('book_id')
    .references(() => books.id)
    .notNull(),
  memberId: uuid('member_id')
    .references(() => users.id)
    .notNull(),
  loanDate: date('loan_date').notNull(),
  dueDate: date('due_date').notNull(),
  returnDate: date('return_date'),
  status: loanStatusEnum('status').notNull().default('dipinjam'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const fines = pgTable('fines', {
  id: uuid('id').defaultRandom().primaryKey(),
  loanId: uuid('loan_id')
    .references(() => loans.id)
    .notNull()
    .unique(),
  amount: integer('amount').notNull(), // dalam rupiah
  paid: boolean('paid').notNull().default(false),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reservations = pgTable('reservations', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookId: uuid('book_id')
    .references(() => books.id)
    .notNull(),
  memberId: uuid('member_id')
    .references(() => users.id)
    .notNull(),
  status: reservationStatusEnum('status').notNull().default('menunggu'),
  reservedAt: timestamp('reserved_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'), // diisi saat status jadi 'tersedia'
});

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  loans: many(loans),
  reservations: many(reservations),
  notifications: many(notifications),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  books: many(books),
}));

export const booksRelations = relations(books, ({ one, many }) => ({
  category: one(categories, {
    fields: [books.categoryId],
    references: [categories.id],
  }),
  loans: many(loans),
  reservations: many(reservations),
}));

export const loansRelations = relations(loans, ({ one }) => ({
  book: one(books, {
    fields: [loans.bookId],
    references: [books.id],
  }),
  member: one(users, {
    fields: [loans.memberId],
    references: [users.id],
  }),
  fine: one(fines, {
    fields: [loans.id],
    references: [fines.loanId],
  }),
}));

export const finesRelations = relations(fines, ({ one }) => ({
  loan: one(loans, {
    fields: [fines.loanId],
    references: [loans.id],
  }),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  book: one(books, {
    fields: [reservations.bookId],
    references: [books.id],
  }),
  member: one(users, {
    fields: [reservations.memberId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Loan = typeof loans.$inferSelect;
export type NewLoan = typeof loans.$inferInsert;
export type Fine = typeof fines.$inferSelect;
export type NewFine = typeof fines.$inferInsert;
export type Reservation = typeof reservations.$inferSelect;
export type NewReservation = typeof reservations.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
