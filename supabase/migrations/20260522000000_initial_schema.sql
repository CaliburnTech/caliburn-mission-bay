-- =============================================================================
-- Mission Bay — Initial Schema
-- Translated from prisma/schema.prisma (Stream A).
-- All IDs are UUID; timestamps are TIMESTAMPTZ.
-- auth.users is managed by Supabase Auth; this schema links against it.
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";         -- fuzzy text search
CREATE EXTENSION IF NOT EXISTS "unaccent";         -- accent-insensitive search

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE company_status         AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'BANNED');
CREATE TYPE ban_type               AS ENUM ('SOFT', 'HARD');
-- SUPER_ADMIN is NOT stored — derived at runtime from @caliburn.us email domain.
CREATE TYPE user_role              AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
CREATE TYPE user_status            AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE product_status         AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'ARCHIVED');
CREATE TYPE mission_status         AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'ARCHIVED');
CREATE TYPE sbom_format            AS ENUM ('CYCLONEDX_1_5');
CREATE TYPE audit_actor_type       AS ENUM ('USER', 'SUPERADMIN');
CREATE TYPE component_category     AS ENUM (
  'OS', 'RUNTIME', 'MESSAGING', 'DRIVER', 'SDK',
  'LIBRARY', 'FIRMWARE', 'APPLICATION', 'OTHER'
);
CREATE TYPE application_status     AS ENUM ('PENDING', 'APPROVED', 'DENIED');
CREATE TYPE product_type           AS ENUM ('PLATFORM', 'CAPABILITY');
CREATE TYPE garage_status          AS ENUM (
  'SAVED', 'PURCHASE_REQUESTED', 'IN_PROCUREMENT', 'CONTRACTED', 'DELIVERED'
);
CREATE TYPE purchase_request_status AS ENUM (
  'PENDING', 'ACKNOWLEDGED', 'IN_PROGRESS', 'COMPLETE'
);
CREATE TYPE event_type             AS ENUM ('VIEW', 'CONFIGURE', 'PURCHASE_REQUEST');

-- =============================================================================
-- HELPER: updated_at trigger
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =============================================================================
-- HELPER: super-admin check
-- A user is super-admin iff their JWT email ends with @caliburn.us.
-- Used in RLS policies; SECURITY DEFINER so it can read auth.jwt().
-- =============================================================================

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT coalesce(
    (auth.jwt() ->> 'email') ILIKE '%@caliburn.us',
    false
  );
$$;

-- =============================================================================
-- IDENTITY
-- =============================================================================

CREATE TABLE companies (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT        NOT NULL,
  description       TEXT,
  logo_url          TEXT,
  website           TEXT,
  email             TEXT,
  phone             TEXT,
  status            company_status NOT NULL DEFAULT 'PENDING_APPROVAL',
  last_ban_type     ban_type,
  banned_at         TIMESTAMPTZ,
  approved_at       TIMESTAMPTZ,
  approved_by_email TEXT,
  -- Per-company Anthropic key stored in Supabase Vault (not ARN)
  anthropic_key_id  UUID,
  is_seller         BOOLEAN     NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE users (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Links to Supabase auth.users; set by post-confirm trigger
  auth_id              UUID        UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id           UUID        REFERENCES companies(id) ON DELETE SET NULL,
  email                TEXT        NOT NULL UNIQUE,
  name                 TEXT,
  role                 user_role   NOT NULL DEFAULT 'MEMBER',
  status               user_status NOT NULL DEFAULT 'ACTIVE',
  suspended_at         TIMESTAMPTZ,
  suspended_by_email   TEXT,
  onboarding_complete  BOOLEAN     NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX users_company_id_idx ON users(company_id);
CREATE INDEX users_auth_id_idx    ON users(auth_id);

-- =============================================================================
-- VENDOR ONBOARDING
-- =============================================================================

CREATE TABLE vendor_applications (
  id            UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name  TEXT               NOT NULL,
  contact_name  TEXT               NOT NULL,
  email         TEXT               NOT NULL,
  website       TEXT,
  message       TEXT,
  status        application_status NOT NULL DEFAULT 'PENDING',
  reviewed_by   TEXT,
  reviewed_at   TIMESTAMPTZ,
  company_id    UUID               REFERENCES companies(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ        NOT NULL DEFAULT now()
);

-- =============================================================================
-- LICENSES (referenced by products and components)
-- =============================================================================

CREATE TABLE licenses (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  spdx_id             TEXT,
  display_name        TEXT        NOT NULL,
  government_marking  TEXT,
  is_proprietary      BOOLEAN     NOT NULL DEFAULT false,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER licenses_updated_at
  BEFORE UPDATE ON licenses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- PRODUCTS
-- =============================================================================

CREATE TABLE products (
  id                  UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID           NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type                product_type   NOT NULL,
  name                TEXT           NOT NULL,
  description         TEXT,
  category            TEXT,
  trl_level           INTEGER        CHECK (trl_level BETWEEN 1 AND 9),
  status              product_status NOT NULL DEFAULT 'DRAFT',
  current_version_id  UUID,          -- FK set after product_versions created
  created_at          TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX products_company_id_idx ON products(company_id);
CREATE INDEX products_status_idx     ON products(status);
CREATE INDEX products_type_idx       ON products(type);

CREATE TABLE product_versions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  version_number INTEGER     NOT NULL,
  data           JSONB       NOT NULL DEFAULT '{}',
  changelog      TEXT,
  published_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_by   UUID        REFERENCES users(id) ON DELETE SET NULL,
  license_id     UUID        REFERENCES licenses(id) ON DELETE SET NULL,
  swap_json      JSONB,
  platform_tags  TEXT[]      NOT NULL DEFAULT '{}',
  mission_tags   TEXT[]      NOT NULL DEFAULT '{}',

  UNIQUE (product_id, version_number)
);

CREATE INDEX product_versions_product_id_idx ON product_versions(product_id);

-- Back-fill the FK now that product_versions exists
ALTER TABLE products
  ADD CONSTRAINT products_current_version_id_fkey
  FOREIGN KEY (current_version_id)
  REFERENCES product_versions(id) ON DELETE SET NULL;

-- =============================================================================
-- COMPONENTS & SBOM DATA
-- =============================================================================

CREATE TABLE components (
  id         UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT               NOT NULL,
  version    TEXT               NOT NULL,
  supplier   TEXT,
  category   component_category NOT NULL DEFAULT 'OTHER',
  license_id UUID               REFERENCES licenses(id) ON DELETE SET NULL,
  bom_ref    TEXT,
  purl       TEXT,
  created_at TIMESTAMPTZ        NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ        NOT NULL DEFAULT now(),

  UNIQUE (name, version, supplier)
);

CREATE TRIGGER components_updated_at
  BEFORE UPDATE ON components
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE product_components (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_version_id  UUID        NOT NULL REFERENCES product_versions(id) ON DELETE CASCADE,
  component_id        UUID        NOT NULL REFERENCES components(id) ON DELETE CASCADE,
  is_direct           BOOLEAN     NOT NULL DEFAULT true,
  sort_order          INTEGER     NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (product_version_id, component_id)
);

CREATE INDEX product_components_version_idx ON product_components(product_version_id);

-- =============================================================================
-- BUYER CONFIGURATIONS
-- =============================================================================

CREATE TABLE saved_configurations (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id        UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name              TEXT,
  config_data       JSONB       NOT NULL DEFAULT '{}',
  spec_version      INTEGER     NOT NULL DEFAULT 1,
  has_vendor_update BOOLEAN     NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER saved_configurations_updated_at
  BEFORE UPDATE ON saved_configurations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX saved_configurations_company_id_idx ON saved_configurations(company_id);
CREATE INDEX saved_configurations_user_id_idx    ON saved_configurations(user_id);

CREATE TABLE configuration_products (
  config_id          UUID NOT NULL REFERENCES saved_configurations(id) ON DELETE CASCADE,
  product_id         UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_version_id UUID NOT NULL REFERENCES product_versions(id) ON DELETE CASCADE,

  PRIMARY KEY (config_id, product_id)
);

-- =============================================================================
-- MY GARAGE
-- =============================================================================

CREATE TABLE garage_items (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  config_id  UUID         NOT NULL UNIQUE REFERENCES saved_configurations(id) ON DELETE CASCADE,
  status     garage_status NOT NULL DEFAULT 'SAVED',
  notes      TEXT,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TRIGGER garage_items_updated_at
  BEFORE UPDATE ON garage_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE purchase_requests (
  id             UUID                    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID                    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  config_id      UUID                    NOT NULL REFERENCES saved_configurations(id) ON DELETE CASCADE,
  garage_item_id UUID                    REFERENCES garage_items(id) ON DELETE SET NULL,
  message        TEXT,
  status         purchase_request_status NOT NULL DEFAULT 'PENDING',
  created_at     TIMESTAMPTZ             NOT NULL DEFAULT now()
);

CREATE INDEX purchase_requests_user_id_idx   ON purchase_requests(user_id);
CREATE INDEX purchase_requests_config_id_idx ON purchase_requests(config_id);

-- =============================================================================
-- ANALYTICS
-- =============================================================================

CREATE TABLE events (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id    UUID        REFERENCES users(id) ON DELETE SET NULL,
  type       event_type  NOT NULL,
  metadata   JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX events_product_id_idx ON events(product_id);
CREATE INDEX events_type_idx       ON events(type);

CREATE TABLE leads (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id       UUID        REFERENCES users(id) ON DELETE SET NULL,
  buyer_name    TEXT        NOT NULL,
  buyer_company TEXT,
  email         TEXT        NOT NULL,
  phone         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX leads_product_id_idx ON leads(product_id);

-- =============================================================================
-- SBOM RECORDS
-- SBOM JSON files live in Supabase Storage (sboms bucket).
-- storage_path = bucket-relative path, e.g. "sboms/{config_id}/{uuid}.json"
-- =============================================================================

CREATE TABLE sboms (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_configuration_id  UUID        NOT NULL REFERENCES saved_configurations(id) ON DELETE CASCADE,
  format                  sbom_format NOT NULL DEFAULT 'CYCLONEDX_1_5',
  storage_path            TEXT        NOT NULL,  -- replaces s3_key / s3_bucket
  component_count         INTEGER     NOT NULL DEFAULT 0,
  top_level_count         INTEGER     NOT NULL DEFAULT 0,
  dependency_count        INTEGER     NOT NULL DEFAULT 0,
  license_count           INTEGER     NOT NULL DEFAULT 0,
  schema_version          TEXT        NOT NULL DEFAULT '1.5',
  generated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  generated_by_user_id    UUID        REFERENCES users(id) ON DELETE SET NULL,
  destination_status      TEXT,
  destination_error       TEXT
);

CREATE INDEX sboms_config_id_idx ON sboms(saved_configuration_id);

-- =============================================================================
-- MISSIONS
-- =============================================================================

CREATE TABLE mission_types (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT        NOT NULL UNIQUE,
  display_name    TEXT        NOT NULL,
  domain          TEXT        NOT NULL,
  decision_graph  JSONB,
  description     TEXT,
  is_active       BOOLEAN     NOT NULL DEFAULT true,
  sort_order      INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER mission_types_updated_at
  BEFORE UPDATE ON mission_types
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE missions (
  id                UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT           NOT NULL,
  typed_id          TEXT,
  status            mission_status NOT NULL DEFAULT 'DRAFT',
  company_id        UUID           NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  mission_type_id   UUID           NOT NULL REFERENCES mission_types(id),
  description       TEXT,
  zone_geo_json     JSONB,
  vessel_loadout    JSONB,
  notes             TEXT,
  review_notes      TEXT,
  submitted_at      TIMESTAMPTZ,
  approved_at       TIMESTAMPTZ,
  approved_by_email TEXT,
  archived_at       TIMESTAMPTZ,
  created_by_user_id UUID          REFERENCES users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE TRIGGER missions_updated_at
  BEFORE UPDATE ON missions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX missions_company_id_idx      ON missions(company_id);
CREATE INDEX missions_status_idx          ON missions(status);
CREATE INDEX missions_mission_type_id_idx ON missions(mission_type_id);

-- =============================================================================
-- ADMIN & AUDIT
-- =============================================================================

-- Immutable record of every super-admin action. Written on insert; never updated/deleted.
CREATE TABLE audit_logs (
  id                       UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type               audit_actor_type NOT NULL,
  actor_user_id            UUID             REFERENCES users(id) ON DELETE SET NULL,
  actor_email              TEXT,
  target_company_id        UUID             REFERENCES companies(id) ON DELETE SET NULL,
  target_user_id           UUID             REFERENCES users(id) ON DELETE SET NULL,
  impersonation_session_id UUID,            -- FK added after impersonation_sessions created
  action                   TEXT             NOT NULL,
  target_type              TEXT,
  target_id                TEXT,
  metadata                 JSONB,
  created_at               TIMESTAMPTZ      NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_target_company_id_idx ON audit_logs(target_company_id);
CREATE INDEX audit_logs_actor_user_id_idx     ON audit_logs(actor_user_id);
CREATE INDEX audit_logs_action_idx            ON audit_logs(action);
CREATE INDEX audit_logs_created_at_idx        ON audit_logs(created_at DESC);

-- DB-backed session for super-admin impersonation. TTL default 1 hour.
CREATE TABLE impersonation_sessions (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  super_admin_user_id UUID        REFERENCES users(id) ON DELETE SET NULL,
  super_admin_email   TEXT        NOT NULL,
  target_company_id   UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  started_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at          TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '1 hour'),
  ended_at            TIMESTAMPTZ,
  is_active           BOOLEAN     NOT NULL DEFAULT true,
  ip_address          INET,
  user_agent          TEXT
);

CREATE INDEX impersonation_sessions_super_admin_user_id_idx ON impersonation_sessions(super_admin_user_id);
CREATE INDEX impersonation_sessions_target_company_id_idx   ON impersonation_sessions(target_company_id);
CREATE INDEX impersonation_sessions_is_active_idx           ON impersonation_sessions(is_active);

-- Back-fill impersonation FK on audit_logs
ALTER TABLE audit_logs
  ADD CONSTRAINT audit_logs_impersonation_session_id_fkey
  FOREIGN KEY (impersonation_session_id)
  REFERENCES impersonation_sessions(id) ON DELETE SET NULL;

-- JWT revocation list. Authorizer checks this on every sensitive request.
CREATE TABLE session_deny_list (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  jwt_jti    TEXT        NOT NULL UNIQUE,
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason     TEXT        NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX session_deny_list_user_id_idx    ON session_deny_list(user_id);
CREATE INDEX session_deny_list_expires_at_idx ON session_deny_list(expires_at);

-- =============================================================================
-- STORAGE — company-logos bucket
-- Supabase Storage buckets can be bootstrapped via SQL.
-- (Alternatively managed in supabase/config.toml [storage.buckets.*])
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'company-logos',
    'company-logos',
    true,         -- public: logos are CDN-served without auth
    5242880,      -- 5 MiB per file
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
  ),
  (
    'sboms',
    'sboms',
    false,        -- private: SBOMs are confidential
    10485760,     -- 10 MiB per file
    ARRAY['application/json']
  ),
  (
    'assets',
    'assets',
    false,        -- private: spec sheets, images
    52428800,     -- 50 MiB per file
    NULL          -- allow any MIME type
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- POST-CONFIRM TRIGGER
-- Runs AFTER a new row is inserted into auth.users (Supabase Auth).
-- Creates a pending Company + OWNER User record for the new signup.
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_company_id UUID;
  v_email      TEXT := NEW.email;
  v_name       TEXT := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(v_email, '@', 1));
BEGIN
  -- Caliburn staff skip the pending-company flow; they're super-admins by email domain.
  -- We still create a User record so they have an identity in the system.
  IF v_email ILIKE '%@caliburn.us' THEN
    INSERT INTO users (auth_id, email, name, role, onboarding_complete)
    VALUES (NEW.id, v_email, v_name, 'OWNER', true);
    RETURN NEW;
  END IF;

  -- New external signup: create a PENDING_APPROVAL company + OWNER user.
  INSERT INTO companies (name, email, status)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'company_name', v_name || '''s Company'),
    v_email,
    'PENDING_APPROVAL'
  )
  RETURNING id INTO v_company_id;

  INSERT INTO users (auth_id, company_id, email, name, role)
  VALUES (NEW.id, v_company_id, v_email, v_name, 'OWNER');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE companies               ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_applications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses                ENABLE ROW LEVEL SECURITY;
ALTER TABLE products                ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_versions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE components              ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_components      ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_configurations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration_products  ENABLE ROW LEVEL SECURITY;
ALTER TABLE garage_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_requests       ENABLE ROW LEVEL SECURITY;
ALTER TABLE events                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE sboms                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_types           ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions                ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE impersonation_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_deny_list       ENABLE ROW LEVEL SECURITY;

-- Helper: get the users.id for the currently authenticated auth user
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT id FROM users WHERE auth_id = auth.uid()
$$;

-- Helper: get the company_id for the currently authenticated user
CREATE OR REPLACE FUNCTION current_company_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT company_id FROM users WHERE auth_id = auth.uid()
$$;

-- ── companies ─────────────────────────────────────────────────────────────────

CREATE POLICY "super_admin_all_companies" ON companies
  FOR ALL USING (is_super_admin());

CREATE POLICY "users_read_own_company" ON companies
  FOR SELECT USING (id = current_company_id());

CREATE POLICY "users_read_approved_companies" ON companies
  FOR SELECT USING (status = 'APPROVED');

-- ── users ─────────────────────────────────────────────────────────────────────

CREATE POLICY "super_admin_all_users" ON users
  FOR ALL USING (is_super_admin());

CREATE POLICY "users_read_own_company_users" ON users
  FOR SELECT USING (company_id = current_company_id());

CREATE POLICY "users_read_write_self" ON users
  FOR ALL USING (auth_id = auth.uid());

-- ── vendor_applications ───────────────────────────────────────────────────────

CREATE POLICY "super_admin_all_vendor_apps" ON vendor_applications
  FOR ALL USING (is_super_admin());

CREATE POLICY "users_insert_vendor_app" ON vendor_applications
  FOR INSERT WITH CHECK (true);

-- ── licenses (read-only for all authenticated users) ──────────────────────────

CREATE POLICY "authenticated_read_licenses" ON licenses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "super_admin_write_licenses" ON licenses
  FOR ALL USING (is_super_admin());

-- ── products ──────────────────────────────────────────────────────────────────

CREATE POLICY "super_admin_all_products" ON products
  FOR ALL USING (is_super_admin());

-- APPROVED companies can see all APPROVED products
CREATE POLICY "approved_users_read_approved_products" ON products
  FOR SELECT USING (
    status = 'APPROVED'
    AND EXISTS (
      SELECT 1 FROM companies
      WHERE id = current_company_id() AND status = 'APPROVED'
    )
  );

-- Any authenticated user can read their own company's products (any status)
CREATE POLICY "users_read_own_company_products" ON products
  FOR SELECT USING (company_id = current_company_id());

-- Users can write products for their own APPROVED company
CREATE POLICY "users_write_own_company_products" ON products
  FOR INSERT WITH CHECK (
    company_id = current_company_id()
    AND EXISTS (
      SELECT 1 FROM companies
      WHERE id = current_company_id() AND status = 'APPROVED'
    )
  );

CREATE POLICY "users_update_own_company_products" ON products
  FOR UPDATE USING (company_id = current_company_id());

-- ── product_versions ──────────────────────────────────────────────────────────

CREATE POLICY "super_admin_all_product_versions" ON product_versions
  FOR ALL USING (is_super_admin());

CREATE POLICY "read_versions_of_visible_products" ON product_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_id
        AND (
          p.company_id = current_company_id()
          OR (
            p.status = 'APPROVED'
            AND EXISTS (
              SELECT 1 FROM companies WHERE id = current_company_id() AND status = 'APPROVED'
            )
          )
        )
    )
  );

CREATE POLICY "users_write_own_product_versions" ON product_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM products WHERE id = product_id AND company_id = current_company_id()
    )
  );

-- ── components / product_components (public catalog data) ─────────────────────

CREATE POLICY "authenticated_read_components" ON components
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "super_admin_write_components" ON components
  FOR ALL USING (is_super_admin());

CREATE POLICY "authenticated_read_product_components" ON product_components
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "super_admin_write_product_components" ON product_components
  FOR ALL USING (is_super_admin());

-- ── saved_configurations ──────────────────────────────────────────────────────

CREATE POLICY "super_admin_all_configs" ON saved_configurations
  FOR ALL USING (is_super_admin());

CREATE POLICY "users_manage_own_company_configs" ON saved_configurations
  FOR ALL USING (company_id = current_company_id());

-- ── configuration_products ────────────────────────────────────────────────────

CREATE POLICY "super_admin_all_config_products" ON configuration_products
  FOR ALL USING (is_super_admin());

CREATE POLICY "users_manage_own_config_products" ON configuration_products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM saved_configurations
      WHERE id = config_id AND company_id = current_company_id()
    )
  );

-- ── garage_items ──────────────────────────────────────────────────────────────

CREATE POLICY "super_admin_all_garage" ON garage_items
  FOR ALL USING (is_super_admin());

CREATE POLICY "users_manage_own_garage" ON garage_items
  FOR ALL USING (user_id = current_user_id());

-- ── purchase_requests ─────────────────────────────────────────────────────────

CREATE POLICY "super_admin_all_purchase_requests" ON purchase_requests
  FOR ALL USING (is_super_admin());

CREATE POLICY "users_manage_own_purchase_requests" ON purchase_requests
  FOR ALL USING (user_id = current_user_id());

-- Sellers can see purchase requests for their products
CREATE POLICY "sellers_read_product_purchase_requests" ON purchase_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM saved_configurations sc
      JOIN configuration_products cp ON cp.config_id = sc.id
      JOIN products p ON p.id = cp.product_id
      WHERE sc.id = config_id AND p.company_id = current_company_id()
    )
  );

-- ── events / leads ────────────────────────────────────────────────────────────

CREATE POLICY "super_admin_all_events" ON events
  FOR ALL USING (is_super_admin());

CREATE POLICY "anyone_insert_events" ON events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "sellers_read_product_events" ON events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products WHERE id = product_id AND company_id = current_company_id()
    )
  );

CREATE POLICY "super_admin_all_leads" ON leads
  FOR ALL USING (is_super_admin());

CREATE POLICY "anyone_insert_leads" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "sellers_read_product_leads" ON leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products WHERE id = product_id AND company_id = current_company_id()
    )
  );

-- ── sboms ─────────────────────────────────────────────────────────────────────

CREATE POLICY "super_admin_all_sboms" ON sboms
  FOR ALL USING (is_super_admin());

CREATE POLICY "users_manage_own_sboms" ON sboms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM saved_configurations
      WHERE id = saved_configuration_id AND company_id = current_company_id()
    )
  );

-- ── mission_types (read-only public catalog) ──────────────────────────────────

CREATE POLICY "authenticated_read_mission_types" ON mission_types
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "super_admin_write_mission_types" ON mission_types
  FOR ALL USING (is_super_admin());

-- ── missions ──────────────────────────────────────────────────────────────────

CREATE POLICY "super_admin_all_missions" ON missions
  FOR ALL USING (is_super_admin());

-- APPROVED companies see all APPROVED missions
CREATE POLICY "approved_users_read_approved_missions" ON missions
  FOR SELECT USING (
    status = 'APPROVED'
    AND EXISTS (
      SELECT 1 FROM companies
      WHERE id = current_company_id() AND status = 'APPROVED'
    )
  );

CREATE POLICY "users_manage_own_company_missions" ON missions
  FOR ALL USING (company_id = current_company_id());

-- ── audit_logs ────────────────────────────────────────────────────────────────

CREATE POLICY "super_admin_read_audit_logs" ON audit_logs
  FOR SELECT USING (is_super_admin());

CREATE POLICY "super_admin_insert_audit_logs" ON audit_logs
  FOR INSERT WITH CHECK (is_super_admin());

-- ── impersonation_sessions ────────────────────────────────────────────────────

CREATE POLICY "super_admin_all_impersonation_sessions" ON impersonation_sessions
  FOR ALL USING (is_super_admin());

-- ── session_deny_list ─────────────────────────────────────────────────────────

CREATE POLICY "super_admin_manage_deny_list" ON session_deny_list
  FOR ALL USING (is_super_admin());

CREATE POLICY "service_role_manage_deny_list" ON session_deny_list
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- STORAGE RLS — company-logos bucket
-- =============================================================================

-- Anyone can read logos (bucket is public, but belt-and-suspenders)
CREATE POLICY "public_read_company_logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'company-logos');

-- Authenticated users can upload their own company's logo
-- Path convention: company-logos/{company_id}/{filename}
CREATE POLICY "authenticated_upload_own_logo"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'company-logos'
    AND (storage.foldername(name))[1] = current_company_id()::text
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "authenticated_update_own_logo"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'company-logos'
    AND (storage.foldername(name))[1] = current_company_id()::text
  );

CREATE POLICY "authenticated_delete_own_logo"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'company-logos'
    AND (storage.foldername(name))[1] = current_company_id()::text
  );

-- sboms: only company members can read; service role writes (SBOM generator)
CREATE POLICY "users_read_own_sbom_files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'sboms'
    AND (storage.foldername(name))[1] = current_company_id()::text
  );

CREATE POLICY "service_role_write_sboms"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'sboms' AND auth.role() = 'service_role');

-- assets: company-scoped read + write
CREATE POLICY "users_read_own_assets"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'assets'
    AND (storage.foldername(name))[1] = current_company_id()::text
  );

CREATE POLICY "users_upload_own_assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'assets'
    AND (storage.foldername(name))[1] = current_company_id()::text
    AND auth.role() = 'authenticated'
  );

-- =============================================================================
-- SEED: mission type taxonomy (matches existing static demo data)
-- =============================================================================

INSERT INTO mission_types (slug, display_name, domain, sort_order) VALUES
  ('port-security',          'Port Security',              'maritime',  1),
  ('isr-patrol',             'ISR Patrol',                 'maritime',  2),
  ('anti-submarine-warfare', 'Anti-Submarine Warfare',     'maritime',  3),
  ('mine-countermeasures',   'Mine Countermeasures',       'maritime',  4),
  ('surface-intercept',      'Surface Intercept',          'maritime',  5),
  ('aerial-isr',             'Aerial ISR',                 'aerial',    6),
  ('strike-coordination',    'Strike Coordination',        'aerial',    7),
  ('combined-arms',          'Combined Arms',              'combined',  8)
ON CONFLICT (slug) DO NOTHING;
