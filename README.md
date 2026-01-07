# Marketing Buddy

A comprehensive email marketing platform with campaign management, audience segmentation, revenue predictions, and integrated Beefree SDK email builder.

## Features

- **Dashboard**: Real-time analytics and performance metrics for all campaigns
- **Campaign Builder**: Create and manage email campaigns with audience targeting
- **Email Editor**: Professional email design using Beefree SDK's no-code builder
- **Audience Segmentation**: Create and manage subscriber segments
- **Revenue Predictions**: Track and predict campaign revenue with confidence scores
- **Authentication**: Secure email/password authentication with Supabase

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Email Builder**: Beefree SDK
- **Routing**: React Router v6
- **Icons**: Lucide React

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- Beefree SDK account ([Sign up here](https://developers.beefree.io/signup))
- Supabase project (already configured)

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Beefree SDK

1. Log in to your [Beefree Developer Console](https://developers.beefree.io/login)
2. Create a new application or use an existing one
3. Copy your `Client ID` and `Client Secret`
4. Update the `.env` file with your Beefree credentials:

```env
BEE_CLIENT_ID=your-beefree-client-id
BEE_CLIENT_SECRET=your-beefree-client-secret
```

**Important**: Never commit your `.env` file to version control.

### 4. Database Setup

The database schema has been automatically created with the following tables:
- `email_templates` - Stores Beefree email templates
- `audiences` - Subscriber segments
- `campaigns` - Email campaigns
- `campaign_analytics` - Performance metrics
- `revenue_predictions` - Revenue forecasting data

All tables have Row Level Security (RLS) enabled for data protection.

## Running the Application

### Development Mode

You need to run **two separate terminals**:

**Terminal 1 - Proxy Server** (for Beefree authentication):
```bash
npm run proxy
```

**Terminal 2 - React Application**:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## Application Structure

```
src/
├── components/
│   ├── BeefreeEditor.tsx      # Beefree SDK integration
│   ├── Layout.tsx              # Main app layout with navigation
│   └── ProtectedRoute.tsx      # Auth protection wrapper
├── contexts/
│   └── AuthContext.tsx         # Authentication state management
├── lib/
│   └── supabase.ts             # Supabase client setup
├── pages/
│   ├── Login.tsx               # Login page
│   ├── SignUp.tsx              # Registration page
│   ├── Dashboard.tsx           # Analytics dashboard
│   ├── Campaigns.tsx           # Campaign listing
│   ├── CampaignBuilder.tsx     # Campaign creation/editing
│   ├── EmailEditor.tsx         # Dedicated email editor page
│   ├── Audiences.tsx           # Audience management
│   └── Revenue.tsx             # Revenue predictions
└── App.tsx                     # Main app with routing
```

## Key Features Explained

### Campaign Builder & Email Editor

1. Create campaigns with subject lines, sender info, and audience targeting
2. Launch the dedicated email editor to design beautiful emails using Beefree SDK
3. Access the full-screen email editor from:
   - Campaign builder "Save & Launch Editor" button
   - Campaign builder "Launch Email Editor" button (for existing campaigns)
   - Campaigns page "Design Email" button (palette icon)
4. Save and reuse email templates automatically
5. Track campaign status (draft, scheduled, sent)

### Dashboard Analytics

- Total campaigns and audiences overview
- Revenue tracking and trends
- Average open and click rates
- Recent campaign performance
- Visual progress indicators

### Audience Segmentation

- Create custom audience segments
- Track subscriber counts
- Filter and organize your audience
- Target specific segments in campaigns

### Revenue Predictions

- Predict campaign revenue with confidence scores
- Compare predictions vs actual results
- Track prediction accuracy
- Analyze campaign ROI

## Authentication

The app uses Supabase email/password authentication:

1. **Sign Up**: Create a new account with email and password
2. **Sign In**: Access your account
3. **Protected Routes**: All main features require authentication
4. **Sign Out**: Securely end your session

## Beefree SDK Integration

The email editor uses Beefree SDK's `/loginV2` authentication flow:

- Secure proxy server handles authentication
- User-specific templates saved to database
- Full drag-and-drop email design capabilities
- JSON and HTML output for campaign delivery

## Security

- Row Level Security (RLS) enabled on all database tables
- Users can only access their own data
- Client secrets secured in proxy server
- Authentication required for all protected routes
- Secure session management with Supabase Auth

## Troubleshooting

### Beefree Editor Not Loading

1. Verify `BEE_CLIENT_ID` and `BEE_CLIENT_SECRET` are set correctly in `.env`
2. Ensure the proxy server is running (`npm run proxy`)
3. Check browser console for authentication errors
4. Verify your Beefree SDK application is active

### Database Errors

1. Check Supabase environment variables in `.env`
2. Verify RLS policies are correctly configured
3. Ensure user is authenticated before accessing protected data

### Build Errors

Run type checking to identify issues:
```bash
npm run typecheck
```

## Development

- **Linting**: `npm run lint`
- **Type Checking**: `npm run typecheck`
- **Build**: `npm run build`

## Design Philosophy

Marketing Buddy features a friendly, approachable design with:
- Warm color palette (orange, pink, teal gradients)
- Cute heart mascot theme
- Smooth animations and transitions
- Responsive layout for all screen sizes
- Clean, modern interface

## Future Enhancements

- Email scheduling functionality
- A/B testing capabilities
- Advanced analytics and reporting
- Email template marketplace
- Automation workflows
- Integration with email service providers

## Support

For issues or questions:
- Beefree SDK: [Documentation](https://docs.beefree.io/beefree-sdk)
- Supabase: [Documentation](https://supabase.com/docs)

---

Built with care by Marketing Buddy
