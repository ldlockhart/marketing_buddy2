/*
  # Marketing Buddy Platform Schema

  ## Overview
  Creates the complete database schema for Marketing Buddy, an email marketing platform
  with campaign management, audience segmentation, analytics, and revenue prediction.

  ## New Tables

  ### 1. email_templates
  Stores Beefree email templates with JSON and HTML output
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `name` (text) - Template name
  - `description` (text, nullable) - Template description
  - `template_json` (jsonb) - Beefree JSON structure
  - `template_html` (text) - Rendered HTML output
  - `thumbnail_url` (text, nullable) - Preview image URL
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. audiences
  Stores audience segments for campaign targeting
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `name` (text) - Audience segment name
  - `description` (text, nullable) - Segment description
  - `filters` (jsonb) - Segmentation criteria
  - `subscriber_count` (integer) - Number of subscribers
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. campaigns
  Stores email marketing campaigns
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `name` (text) - Campaign name
  - `subject` (text) - Email subject line
  - `from_email` (text) - Sender email
  - `from_name` (text) - Sender name
  - `template_id` (uuid, references email_templates)
  - `audience_id` (uuid, references audiences)
  - `status` (text) - Campaign status (draft, scheduled, sent, paused)
  - `scheduled_at` (timestamptz, nullable) - When to send
  - `sent_at` (timestamptz, nullable) - When sent
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. campaign_analytics
  Stores campaign performance metrics
  - `id` (uuid, primary key)
  - `campaign_id` (uuid, references campaigns)
  - `sent_count` (integer) - Total emails sent
  - `delivered_count` (integer) - Successfully delivered
  - `opened_count` (integer) - Emails opened
  - `clicked_count` (integer) - Links clicked
  - `bounced_count` (integer) - Bounced emails
  - `unsubscribed_count` (integer) - Unsubscribes
  - `revenue_generated` (decimal) - Revenue from campaign
  - `last_updated` (timestamptz)

  ### 5. revenue_predictions
  Stores AI-powered revenue predictions for campaigns
  - `id` (uuid, primary key)
  - `campaign_id` (uuid, references campaigns)
  - `predicted_revenue` (decimal) - Predicted revenue amount
  - `confidence_score` (decimal) - Prediction confidence (0-1)
  - `prediction_date` (timestamptz) - When prediction was made
  - `actual_revenue` (decimal, nullable) - Actual revenue (updated post-campaign)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - All policies check auth.uid() for ownership
  - Separate policies for SELECT, INSERT, UPDATE, DELETE operations
*/

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  template_json jsonb NOT NULL,
  template_html text NOT NULL,
  thumbnail_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create audiences table
CREATE TABLE IF NOT EXISTS audiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  filters jsonb DEFAULT '{}'::jsonb NOT NULL,
  subscriber_count integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  from_email text NOT NULL,
  from_name text NOT NULL,
  template_id uuid REFERENCES email_templates(id) ON DELETE SET NULL,
  audience_id uuid REFERENCES audiences(id) ON DELETE SET NULL,
  status text DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'scheduled', 'sent', 'paused')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create campaign_analytics table
CREATE TABLE IF NOT EXISTS campaign_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL UNIQUE,
  sent_count integer DEFAULT 0 NOT NULL,
  delivered_count integer DEFAULT 0 NOT NULL,
  opened_count integer DEFAULT 0 NOT NULL,
  clicked_count integer DEFAULT 0 NOT NULL,
  bounced_count integer DEFAULT 0 NOT NULL,
  unsubscribed_count integer DEFAULT 0 NOT NULL,
  revenue_generated decimal(10,2) DEFAULT 0 NOT NULL,
  last_updated timestamptz DEFAULT now() NOT NULL
);

-- Create revenue_predictions table
CREATE TABLE IF NOT EXISTS revenue_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  predicted_revenue decimal(10,2) NOT NULL,
  confidence_score decimal(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  prediction_date timestamptz DEFAULT now() NOT NULL,
  actual_revenue decimal(10,2),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_email_templates_user_id ON email_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_audiences_user_id ON audiences(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign_id ON campaign_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_revenue_predictions_campaign_id ON revenue_predictions(campaign_id);

-- Enable Row Level Security
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_templates
CREATE POLICY "Users can view own templates"
  ON email_templates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own templates"
  ON email_templates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON email_templates FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON email_templates FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for audiences
CREATE POLICY "Users can view own audiences"
  ON audiences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own audiences"
  ON audiences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own audiences"
  ON audiences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own audiences"
  ON audiences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for campaigns
CREATE POLICY "Users can view own campaigns"
  ON campaigns FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own campaigns"
  ON campaigns FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns"
  ON campaigns FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns"
  ON campaigns FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for campaign_analytics
CREATE POLICY "Users can view own campaign analytics"
  ON campaign_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_analytics.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own campaign analytics"
  ON campaign_analytics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_analytics.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own campaign analytics"
  ON campaign_analytics FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_analytics.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_analytics.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own campaign analytics"
  ON campaign_analytics FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_analytics.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- RLS Policies for revenue_predictions
CREATE POLICY "Users can view own revenue predictions"
  ON revenue_predictions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = revenue_predictions.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own revenue predictions"
  ON revenue_predictions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = revenue_predictions.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own revenue predictions"
  ON revenue_predictions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = revenue_predictions.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = revenue_predictions.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own revenue predictions"
  ON revenue_predictions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = revenue_predictions.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );