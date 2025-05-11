// lib/db/schema.ts
import { pgTable, text, timestamp, integer, boolean, jsonb, pgEnum, uuid, varchar, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const planEnum = pgEnum('plan', ['free', 'basic', 'pro']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'cancelled', 'expired', 'past_due']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['pending', 'paid', 'failed', 'refunded']);
export const contactStatusEnum = pgEnum('contact_status', ['new', 'in_progress', 'resolved']);
export const generationTypeEnum = pgEnum('generation_type', ['image', 'video', 'audio', 'code', 'conversation']);

// Users table
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    clerkId: text('clerk_id').notNull().unique(),
    email: text('email').notNull(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    imageUrl: text('image_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    plan: planEnum('plan').notNull().default('free'),
    status: subscriptionStatusEnum('status').notNull().default('active'),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull().default('0'),
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
    startDate: timestamp('start_date').notNull().defaultNow(),
    endDate: timestamp('end_date'),
    paypalSubscriptionId: text('paypal_subscription_id'),
    paypalPayerId: text('paypal_payer_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Invoices table
export const invoices = pgTable('invoices', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    subscriptionId: uuid('subscription_id').references(() => subscriptions.id).notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
    status: invoiceStatusEnum('status').notNull().default('pending'),
    paypalPaymentId: text('paypal_payment_id'),
    paypalInvoiceId: text('paypal_invoice_id'),
    invoiceNumber: text('invoice_number').notNull().unique(),
    invoiceDate: timestamp('invoice_date').notNull(),
    dueDate: timestamp('due_date').notNull(),
    paidAt: timestamp('paid_at'),
    invoiceJson: jsonb('invoice_json').notNull(),
    pdfUrl: text('pdf_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Image generations table
export const imageGenerations = pgTable('image_generations', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    prompt: text('prompt').notNull(),
    model: text('model').notNull(), // 'chatgpt' or 'gemini'
    imageUrl: text('image_url').notNull(),
    resolution: text('resolution').notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Video generations table
export const videoGenerations = pgTable('video_generations', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    prompt: text('prompt').notNull(),
    videoUrl: text('video_url').notNull(),
    duration: integer('duration'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Audio generations table
export const audioGenerations = pgTable('audio_generations', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    prompt: text('prompt').notNull(),
    audioUrl: text('audio_url').notNull(),
    duration: integer('duration'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Code generations table
export const codeGenerations = pgTable('code_generations', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    prompt: text('prompt').notNull(),
    generatedCode: text('generated_code').notNull(),
    language: text('language'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Conversations table
export const conversations = pgTable('conversations', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    messages: jsonb('messages').notNull().$type<Array<{ role: string, content: string, timestamp: Date }>>(),
    model: text('model').notNull(),
    sessionId: text('session_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User settings table
export const userSettings = pgTable('user_settings', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull().unique(),
    general: jsonb('general').notNull().$type<{
        language: string;
        timezone: string;
        animations: boolean;
    }>(),
    appearance: jsonb('appearance').notNull().$type<{
        theme: 'light' | 'dark' | 'system';
        accentColor: string;
        fontSize: 'small' | 'medium' | 'large';
        reducedMotion: boolean;
        highContrast: boolean;
    }>(),
    notifications: jsonb('notifications').notNull().$type<{
        emailGenerationComplete: boolean;
        emailSystemUpdates: boolean;
        browserNotifications: boolean;
    }>(),
    ai: jsonb('ai').notNull().$type<{
        defaultModel: string;
        qualityPreference: 'speed' | 'balanced' | 'quality';
        defaultImageSettings: {
            resolution: string;
            style: string;
        };
    }>(),
    privacy: jsonb('privacy').notNull().$type<{
        dataCollection: boolean;
        saveHistory: boolean;
    }>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Contact messages table
export const contactMessages = pgTable('contact_messages', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text('email').notNull(),
    phone: text('phone').notNull(),
    message: text('message').notNull(),
    status: contactStatusEnum('status').notNull().default('new'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many, one }) => ({
    subscriptions: many(subscriptions),
    invoices: many(invoices),
    imageGenerations: many(imageGenerations),
    videoGenerations: many(videoGenerations),
    audioGenerations: many(audioGenerations),
    codeGenerations: many(codeGenerations),
    conversations: many(conversations),
    settings: one(userSettings),
    contactMessages: many(contactMessages),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
    user: one(users, {
        fields: [subscriptions.userId],
        references: [users.id],
    }),
    invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
    user: one(users, {
        fields: [invoices.userId],
        references: [users.id],
    }),
    subscription: one(subscriptions, {
        fields: [invoices.subscriptionId],
        references: [subscriptions.id],
    }),
}));

export const imageGenerationsRelations = relations(imageGenerations, ({ one }) => ({
    user: one(users, {
        fields: [imageGenerations.userId],
        references: [users.id],
    }),
}));

export const videoGenerationsRelations = relations(videoGenerations, ({ one }) => ({
    user: one(users, {
        fields: [videoGenerations.userId],
        references: [users.id],
    }),
}));

export const audioGenerationsRelations = relations(audioGenerations, ({ one }) => ({
    user: one(users, {
        fields: [audioGenerations.userId],
        references: [users.id],
    }),
}));

export const codeGenerationsRelations = relations(codeGenerations, ({ one }) => ({
    user: one(users, {
        fields: [codeGenerations.userId],
        references: [users.id],
    }),
}));

export const conversationsRelations = relations(conversations, ({ one }) => ({
    user: one(users, {
        fields: [conversations.userId],
        references: [users.id],
    }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
    user: one(users, {
        fields: [userSettings.userId],
        references: [users.id],
    }),
}));

export const contactMessagesRelations = relations(contactMessages, ({ one }) => ({
    user: one(users, {
        fields: [contactMessages.userId],
        references: [users.id],
    }),
}));