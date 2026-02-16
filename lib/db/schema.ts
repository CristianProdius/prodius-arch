import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  name: text("name"),
  sourceImage: text("source_image").notNull(),
  renderedImage: text("rendered_image"),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  ownerId: text("owner_id").notNull(),
  isPublic: boolean("is_public").default(false),
  sharedBy: text("shared_by"),
  sharedAt: timestamp("shared_at", { withTimezone: true }),
  tags: jsonb("tags").$type<string[]>().default([]),
  renderHistory: jsonb("render_history")
    .$type<{ id: string; renderedImage: string; timestamp: number; style?: string }[]>()
    .default([]),
});

export const userSettings = pgTable("user_settings", {
  userId: text("user_id").primaryKey(),
  theme: text("theme").default("light"),
  defaultStyle: text("default_style").default("modern"),
  defaultQuality: text("default_quality").default("standard"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
