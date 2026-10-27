-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "email_verified_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "country_code" TEXT NOT NULL DEFAULT 'IN',
    "preferred_currency" TEXT NOT NULL DEFAULT 'INR',
    "preferred_locale" TEXT NOT NULL DEFAULT 'en-IN',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "investment_knowledge" TEXT NOT NULL DEFAULT 'BEGINNER',
    "loss_tolerance" TEXT NOT NULL DEFAULT 'MODERATE',
    "approximate_monthly_income" DECIMAL(14,2),
    "essential_monthly_expenses" DECIMAL(14,2),
    "emergency_fund_months" INTEGER NOT NULL DEFAULT 6,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider_id" TEXT,
    "purpose" TEXT NOT NULL,
    "data_categories" TEXT[],
    "consent_version" TEXT NOT NULL DEFAULT '1.0',
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "provider_reference" TEXT,

    CONSTRAINT "consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "privacy_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "request_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "audit_reference" TEXT,

    CONSTRAINT "privacy_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_goals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "goal_type" TEXT NOT NULL,
    "target_amount" DECIMAL(16,2) NOT NULL,
    "target_currency" TEXT NOT NULL DEFAULT 'INR',
    "target_date" TIMESTAMP(3) NOT NULL,
    "current_amount" DECIMAL(16,2) NOT NULL DEFAULT 0,
    "planned_contribution" DECIMAL(16,2) NOT NULL DEFAULT 0,
    "contribution_frequency" TEXT NOT NULL DEFAULT 'MONTHLY',
    "inflation_assumption" DECIMAL(5,2) NOT NULL DEFAULT 6.0,
    "expected_return_rate" DECIMAL(5,2) NOT NULL DEFAULT 10.0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planning_scenarios" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "goal_id" TEXT NOT NULL,
    "scenario_name" TEXT NOT NULL,
    "input_snapshot" JSONB NOT NULL,
    "assumption_snapshot" JSONB NOT NULL,
    "formula_version" TEXT NOT NULL DEFAULT '1.0.0',
    "output_snapshot" JSONB NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "planning_scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_assessments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "assessment_version" TEXT NOT NULL DEFAULT '1.0',
    "responses" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "completion_status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "providers" (
    "id" TEXT NOT NULL,
    "provider_type" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "country_code" TEXT NOT NULL DEFAULT 'IN',
    "official_docs_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'not_reviewed',
    "capabilities" JSONB NOT NULL,
    "licensing_metadata" JSONB NOT NULL,
    "configuration_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instruments" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "provider_instrument_id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "instrument_type" TEXT NOT NULL,
    "exchange" TEXT NOT NULL DEFAULT 'NSE',
    "country_code" TEXT NOT NULL DEFAULT 'IN',
    "trading_currency" TEXT NOT NULL DEFAULT 'INR',
    "quantity_precision" INTEGER NOT NULL DEFAULT 0,
    "price_precision" INTEGER NOT NULL DEFAULT 2,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instruments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_observations" (
    "id" TEXT NOT NULL,
    "instrument_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "observation_type" TEXT NOT NULL,
    "price_or_value" DECIMAL(16,4) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "source_timestamp" TIMESTAMP(3) NOT NULL,
    "ingested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_delayed" BOOLEAN NOT NULL DEFAULT false,
    "is_simulated" BOOLEAN NOT NULL DEFAULT false,
    "validity_status" TEXT NOT NULL DEFAULT 'VALID',
    "metadata" JSONB,

    CONSTRAINT "market_observations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "external_account_reference" TEXT NOT NULL,
    "account_type" TEXT NOT NULL,
    "base_currency" TEXT NOT NULL DEFAULT 'INR',
    "connection_status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "source_type" TEXT NOT NULL,
    "last_synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_connections" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "authorized_scopes" JSONB NOT NULL,
    "consent_id" TEXT,
    "token_reference" TEXT,
    "last_success_at" TIMESTAMP(3),
    "last_error_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "account_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holdings_snapshots" (
    "id" TEXT NOT NULL,
    "financial_account_id" TEXT NOT NULL,
    "instrument_id" TEXT NOT NULL,
    "provider_timestamp" TIMESTAMP(3) NOT NULL,
    "ingested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantity" DECIMAL(16,4) NOT NULL,
    "average_buy_price" DECIMAL(16,4) NOT NULL,
    "market_value" DECIMAL(16,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "source_type" TEXT NOT NULL,
    "quality_status" TEXT NOT NULL DEFAULT 'CONFIRMED',

    CONSTRAINT "holdings_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_transactions" (
    "id" TEXT NOT NULL,
    "financial_account_id" TEXT NOT NULL,
    "external_transaction_id" TEXT,
    "idempotency_key" TEXT,
    "instrument_id" TEXT NOT NULL,
    "transaction_type" TEXT NOT NULL,
    "quantity" DECIMAL(16,4) NOT NULL,
    "unit_price" DECIMAL(16,4) NOT NULL,
    "fees" DECIMAL(16,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "trade_date" TIMESTAMP(3) NOT NULL,
    "settlement_date" TIMESTAMP(3),
    "source_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ingested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source_type" TEXT NOT NULL,
    "reconciliation_status" TEXT NOT NULL DEFAULT 'RECONCILED',

    CONSTRAINT "investment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broker_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "external_account_reference" TEXT NOT NULL,
    "authorization_status" TEXT NOT NULL DEFAULT 'PENDING',
    "capability_status" TEXT NOT NULL DEFAULT 'SANDBOX_ONLY',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "broker_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_intents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "broker_account_id" TEXT NOT NULL,
    "instrument_id" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "quantity" DECIMAL(16,4) NOT NULL,
    "order_type" TEXT NOT NULL,
    "limit_price" DECIMAL(16,4),
    "validity" TEXT NOT NULL DEFAULT 'DAY',
    "preview_snapshot" JSONB NOT NULL,
    "confirmation_timestamp" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_intents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broker_orders" (
    "id" TEXT NOT NULL,
    "order_intent_id" TEXT NOT NULL,
    "provider_order_id" TEXT,
    "idempotency_key" TEXT NOT NULL,
    "submission_status" TEXT NOT NULL,
    "order_status" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_provider_update_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "error_code" TEXT,

    CONSTRAINT "broker_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_events" (
    "id" TEXT NOT NULL,
    "broker_order_id" TEXT NOT NULL,
    "provider_event_id" TEXT,
    "event_type" TEXT NOT NULL,
    "event_timestamp" TIMESTAMP(3) NOT NULL,
    "ingested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload_reference" JSONB,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "order_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "execution_fills" (
    "id" TEXT NOT NULL,
    "broker_order_id" TEXT NOT NULL,
    "provider_fill_id" TEXT,
    "quantity" DECIMAL(16,4) NOT NULL,
    "price" DECIMAL(16,4) NOT NULL,
    "fees" DECIMAL(16,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "executed_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "execution_fills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_sources" (
    "id" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "canonical_url" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "published_at" TIMESTAMP(3),
    "retrieved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "license_status" TEXT NOT NULL DEFAULT 'OFFICIAL_PUBLIC',
    "review_status" TEXT NOT NULL DEFAULT 'VERIFIED',
    "content_version" TEXT NOT NULL DEFAULT '1.0',

    CONSTRAINT "knowledge_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_chunks" (
    "id" TEXT NOT NULL,
    "knowledge_source_id" TEXT NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "topic" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "knowledge_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assistant_conversations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'educational',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assistant_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assistant_messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "model_id" TEXT NOT NULL DEFAULT 'clearvest-financial-v1',
    "safety_status" TEXT NOT NULL DEFAULT 'PASSED',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assistant_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assistant_citations" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "knowledge_source_id" TEXT NOT NULL,
    "quoted_or_referenced_section" TEXT NOT NULL,
    "source_version" TEXT NOT NULL DEFAULT '1.0',
    "citation_metadata" JSONB,

    CONSTRAINT "assistant_citations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regulatory_approvals" (
    "id" TEXT NOT NULL,
    "feature_key" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL DEFAULT 'IN',
    "applicable_regulation" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'disabled',
    "official_source" TEXT NOT NULL,
    "reviewed_by" TEXT,
    "review_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regulatory_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT,
    "ip_address" TEXT,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_records" (
    "id" TEXT NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "response_payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "idempotency_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE INDEX "consents_user_id_status_idx" ON "consents"("user_id", "status");

-- CreateIndex
CREATE INDEX "financial_goals_user_id_status_idx" ON "financial_goals"("user_id", "status");

-- CreateIndex
CREATE INDEX "planning_scenarios_user_id_goal_id_idx" ON "planning_scenarios"("user_id", "goal_id");

-- CreateIndex
CREATE INDEX "risk_assessments_user_id_idx" ON "risk_assessments"("user_id");

-- CreateIndex
CREATE INDEX "instruments_symbol_exchange_idx" ON "instruments"("symbol", "exchange");

-- CreateIndex
CREATE INDEX "instruments_instrument_type_idx" ON "instruments"("instrument_type");

-- CreateIndex
CREATE UNIQUE INDEX "instruments_provider_id_provider_instrument_id_key" ON "instruments"("provider_id", "provider_instrument_id");

-- CreateIndex
CREATE INDEX "market_observations_instrument_id_source_timestamp_idx" ON "market_observations"("instrument_id", "source_timestamp" DESC);

-- CreateIndex
CREATE INDEX "financial_accounts_user_id_idx" ON "financial_accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "financial_accounts_user_id_provider_id_external_account_ref_key" ON "financial_accounts"("user_id", "provider_id", "external_account_reference");

-- CreateIndex
CREATE INDEX "account_connections_user_id_provider_id_idx" ON "account_connections"("user_id", "provider_id");

-- CreateIndex
CREATE INDEX "holdings_snapshots_financial_account_id_idx" ON "holdings_snapshots"("financial_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "investment_transactions_idempotency_key_key" ON "investment_transactions"("idempotency_key");

-- CreateIndex
CREATE INDEX "investment_transactions_financial_account_id_trade_date_idx" ON "investment_transactions"("financial_account_id", "trade_date");

-- CreateIndex
CREATE INDEX "order_intents_user_id_status_idx" ON "order_intents"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "broker_orders_order_intent_id_key" ON "broker_orders"("order_intent_id");

-- CreateIndex
CREATE UNIQUE INDEX "broker_orders_provider_order_id_key" ON "broker_orders"("provider_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "broker_orders_idempotency_key_key" ON "broker_orders"("idempotency_key");

-- CreateIndex
CREATE INDEX "knowledge_chunks_knowledge_source_id_topic_idx" ON "knowledge_chunks"("knowledge_source_id", "topic");

-- CreateIndex
CREATE INDEX "assistant_conversations_user_id_idx" ON "assistant_conversations"("user_id");

-- CreateIndex
CREATE INDEX "assistant_messages_conversation_id_idx" ON "assistant_messages"("conversation_id");

-- CreateIndex
CREATE INDEX "assistant_citations_message_id_idx" ON "assistant_citations"("message_id");

-- CreateIndex
CREATE UNIQUE INDEX "regulatory_approvals_feature_key_key" ON "regulatory_approvals"("feature_key");

-- CreateIndex
CREATE INDEX "audit_events_user_id_action_idx" ON "audit_events"("user_id", "action");

-- CreateIndex
CREATE INDEX "audit_events_created_at_idx" ON "audit_events"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_records_idempotency_key_key" ON "idempotency_records"("idempotency_key");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consents" ADD CONSTRAINT "consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "privacy_requests" ADD CONSTRAINT "privacy_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_goals" ADD CONSTRAINT "financial_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planning_scenarios" ADD CONSTRAINT "planning_scenarios_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planning_scenarios" ADD CONSTRAINT "planning_scenarios_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "financial_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_assessments" ADD CONSTRAINT "risk_assessments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instruments" ADD CONSTRAINT "instruments_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_observations" ADD CONSTRAINT "market_observations_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "instruments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_observations" ADD CONSTRAINT "market_observations_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_accounts" ADD CONSTRAINT "financial_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_accounts" ADD CONSTRAINT "financial_accounts_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_connections" ADD CONSTRAINT "account_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_connections" ADD CONSTRAINT "account_connections_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_connections" ADD CONSTRAINT "account_connections_consent_id_fkey" FOREIGN KEY ("consent_id") REFERENCES "consents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holdings_snapshots" ADD CONSTRAINT "holdings_snapshots_financial_account_id_fkey" FOREIGN KEY ("financial_account_id") REFERENCES "financial_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holdings_snapshots" ADD CONSTRAINT "holdings_snapshots_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "instruments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_transactions" ADD CONSTRAINT "investment_transactions_financial_account_id_fkey" FOREIGN KEY ("financial_account_id") REFERENCES "financial_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_transactions" ADD CONSTRAINT "investment_transactions_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "instruments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broker_accounts" ADD CONSTRAINT "broker_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broker_accounts" ADD CONSTRAINT "broker_accounts_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_intents" ADD CONSTRAINT "order_intents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_intents" ADD CONSTRAINT "order_intents_broker_account_id_fkey" FOREIGN KEY ("broker_account_id") REFERENCES "broker_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_intents" ADD CONSTRAINT "order_intents_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "instruments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broker_orders" ADD CONSTRAINT "broker_orders_order_intent_id_fkey" FOREIGN KEY ("order_intent_id") REFERENCES "order_intents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_broker_order_id_fkey" FOREIGN KEY ("broker_order_id") REFERENCES "broker_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execution_fills" ADD CONSTRAINT "execution_fills_broker_order_id_fkey" FOREIGN KEY ("broker_order_id") REFERENCES "broker_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_knowledge_source_id_fkey" FOREIGN KEY ("knowledge_source_id") REFERENCES "knowledge_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assistant_conversations" ADD CONSTRAINT "assistant_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assistant_messages" ADD CONSTRAINT "assistant_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "assistant_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assistant_citations" ADD CONSTRAINT "assistant_citations_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "assistant_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assistant_citations" ADD CONSTRAINT "assistant_citations_knowledge_source_id_fkey" FOREIGN KEY ("knowledge_source_id") REFERENCES "knowledge_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
