import { relations } from "drizzle-orm";
import { boolean, index, integer, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  isActive: boolean("is_active").notNull().default(false),
  phone: varchar("phone",{length:20}).notNull().unique(),
  emailVerified: boolean("is_email_verified").default(false),
    role: varchar("role", { length: 20 }).notNull().default("user"), // user, admin
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

export interface PriceOption {
  quarter?: number;
  half?: number;
  full: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  prices: PriceOption;
  image: string;
  category: string;
  isAvailable: boolean;
}

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: varchar("description", { length: 500 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  nameIdx: index("category_name_idx").on(table.name),
}));

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  prices: jsonb("prices").$type<PriceOption>().notNull(),
  image: varchar("image", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "restrict" }),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  nameIdx: index("product_name_idx").on(table.name),
  categoryIdx: index("product_category_idx").on(table.category),
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

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

