-- CreateTable
CREATE TABLE "menu_items" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "url" VARCHAR(255) NOT NULL,
  "parent_id" UUID REFERENCES menu_items(id),
  "order" INTEGER NOT NULL DEFAULT 0,
  "icon" VARCHAR(255),
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- CreateTable
CREATE TABLE "custom_urls" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "original_path" VARCHAR(255) NOT NULL,
  "custom_path" VARCHAR(255) NOT NULL UNIQUE,
  "entity_type" VARCHAR(50) NOT NULL,
  "entity_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW(),
  "is_active" BOOLEAN DEFAULT true
);

-- CreateIndex
CREATE INDEX "idx_menu_items_parent_id" ON "menu_items"("parent_id");
CREATE INDEX "idx_menu_items_order" ON "menu_items"("order");
CREATE INDEX "idx_custom_urls_path" ON "custom_urls"("custom_path");
CREATE INDEX "idx_custom_urls_entity" ON "custom_urls"("entity_type", "entity_id");
