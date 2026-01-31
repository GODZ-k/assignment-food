import { relations } from "drizzle-orm";
import { boolean, index, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  isActive: boolean("is_active").notNull().default(false),
  phone: varchar("phone",{length:20}).notNull().unique(),
  emailVerified: boolean("is_email_verified").default(false),
  phoneVerified:boolean('is_phone_verified').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  activeIdx: index("user_active_idx").on(table.isActive),
  emailIdx: index('user_email_idx').on(table.email)
}));

export const userCredentials = pgTable('user_credential', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  passwordHash: text('password_hash').notNull(),
  passwordAlgo: varchar("password_algo", { length: 32 }).notNull().default("argon2id"),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdx: index("cred_user_idx").on(table.userId),
}))


export const userTempCredentials = pgTable("user_temp_credentials", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash"),
  otpHash: text("otp_hash"),
  attempts: integer("attempts").notNull().default(0),
  isVerified: boolean("is_verified").notNull().default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("tempcred_user_idx").on(table.userId),
  expiresIdx: index("tempcred_expires_idx").on(table.expiresAt),
}));

export const usersRelations = relations(users, ({ many, one }) => ({
  credentials: one(userCredentials),
  tempCredentials:one(userTempCredentials)
}));


export const userCredentialsRelations = relations(userCredentials, ({ one }) => ({
  user: one(users, {
    fields: [userCredentials.userId],
    references: [users.id],
  }),
}));

export const userTempCredentialsRelations = relations(userTempCredentials, ({ one }) => ({
  user: one(users, {
    fields: [userTempCredentials.userId],
    references: [users.id],
  }),
}));