# Lead Management Dashboard - Deployment Guide

This document outlines how to deploy the Lead Management Dashboard to Vercel and configure the necessary environment variables.

## Prerequisites

1. A Vercel account (https://vercel.com/)
2. Your Neon PostgreSQL database credentials
3. Git repository with the project code

## Database Configuration

The application uses a PostgreSQL database from Neon. You need to have the following information ready:

- Database URL (in the format: `postgres://username:password@host:port/database?sslmode=require`)
- PostgreSQL Host
- PostgreSQL Username
- PostgreSQL Password
- PostgreSQL Database name
- PostgreSQL Port

## Deployment Steps

### 1. Prepare Your Repository

Make sure your code is in a Git repository (GitHub, GitLab, or Bitbucket) that Vercel can access.

### 2. Create a New Vercel Project

1. Log in to your Vercel account
2. Click "Add New" -> "Project"
3. Import your Git repository
4. Configure the project settings:
   - Framework Preset: Choose "Other"
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 3. Configure Environment Variables

In the Vercel project settings, add the following environment variables:

```
DATABASE_URL=postgres://username:password@host:port/database?sslmode=require
POSTGRES_URL=postgres://username:password@host:port/database?sslmode=require
POSTGRES_HOST=your-postgres-host
POSTGRES_USER=your-postgres-username
POSTGRES_PASSWORD=your-postgres-password
POSTGRES_DATABASE=your-postgres-database
POSTGRES_PORT=your-postgres-port
WEBHOOK_API_KEY=your-chosen-webhook-api-key
OPENAI_API_KEY=your-openai-api-key
NODE_ENV=production
```

Replace the placeholders with your actual credentials.

> **Important**: The `OPENAI_API_KEY` is required for the questionnaire analysis feature that evaluates leads' likelihood and perceived benefits of cosmetic surgery. The system uses the GPT-4o model to provide this analysis.

### 4. Deploy the Application

Click "Deploy" in the Vercel dashboard. Vercel will build and deploy your application.

## API Endpoints Reference

The dashboard offers the following API endpoints:

### Lead Management Endpoints

| Method | Endpoint | Description | Required Parameters | Optional Parameters |
|--------|----------|-------------|---------------------|---------------------|
| GET | `/api/leads` | Get all leads | None | None |
| GET | `/api/leads/:id` | Get a specific lead by ID | `id` (in URL) | None |
| POST | `/api/leads` | Create a new lead | `name` (in body) | `phone`, `email`, and other lead fields |
| PUT | `/api/leads/:id` | Update a lead (complete) | `id` (in URL) | All lead fields |
| PATCH | `/api/leads/:id` | Update a lead (partial) | `id` (in URL) | Any lead fields to update |
| PATCH | `/api/leads/:id/column` | Move a lead to a different column | `id` (in URL), `columnId` (in body) | None |
| DELETE | `/api/leads/:id` | Delete a lead | `id` (in URL) | None |

### Column Management Endpoints

| Method | Endpoint | Description | Required Parameters | Optional Parameters |
|--------|----------|-------------|---------------------|---------------------|
| GET | `/api/columns` | Get all columns | None | None |
| GET | `/api/columns/:columnId/leads` | Get leads in a specific column | `columnId` (in URL) | None |
| POST | `/api/columns` | Create a new column | `id`, `title`, `order` | None |
| PATCH | `/api/columns/:id` | Update a column | `id` (in URL) | `title`, `order` |
| DELETE | `/api/columns/:id` | Delete a column | `id` (in URL) | None |

### Statistics Endpoint

| Method | Endpoint | Description | Required Parameters | Optional Parameters |
|--------|----------|-------------|---------------------|---------------------|
| GET | `/api/stats` | Get dashboard statistics | None | None |

## Webhook Integration

For external systems to send lead data to your dashboard, they need to make POST requests to your webhook endpoint:

`https://your-vercel-app-url.vercel.app/api/webhook/leads`

Include the API key in the header:

```
X-API-Key: your-chosen-webhook-api-key
```

The webhook payload should be in JSON format and include the required lead fields. Example:

```json
{
  "name": "Lead Name",
  "username": "@leadusername",
  "time": "2023-03-30T00:00:00.000Z",
  "tags": ["Botox", "Consultation"],
  "assessment": "Pending",
  "columnId": "newLeads",
  "contactInfo": {
    "email": "lead@example.com",
    "phone": "+1234567890"
  }
}
```

### API Examples

#### Creating a new lead (minimal)

```bash
curl -X POST https://your-vercel-app-url.vercel.app/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "contactInfo": {"email": "john@example.com", "phone": "+1234567890"}}'
```

#### Creating a new lead (complete)

```bash
curl -X POST https://your-vercel-app-url.vercel.app/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "username": "@janesmith",
    "time": "10m ago",
    "source": "Instagram Ad",
    "tags": ["Face", "Botox", "Consultation"],
    "avatar": "https://example.com/avatar.jpg",
    "assessment": "Pending",
    "columnId": "newLeads",
    "smsStatus": "Pending",
    "sendTime": "9:30 AM",
    "verifiedTime": "",
    "priority": "Medium Intent",
    "consultDate": "Apr 15, 2023",
    "financing": "Self-Pay",
    "reason": "",
    "notes": "Interested in facial treatments and fillers",
    "contactInfo": {
      "email": "jane@example.com",
      "phone": "+1987654321"
    }
  }'
```

#### Updating a lead (partial)

```bash
curl -X PATCH https://your-vercel-app-url.vercel.app/api/leads/1 \
  -H "Content-Type: application/json" \
  -d '{
    "priority": "High Intent",
    "consultDate": "Apr 20, 2023",
    "notes": "Updated after phone call, very interested in proceeding"
  }'
```

#### Updating a lead's questionnaire

```bash
curl -X PATCH https://your-vercel-app-url.vercel.app/api/leads/1 \
  -H "Content-Type: application/json" \
  -d '{
    "questionnaire": {
      "q1": "5",
      "q2": "3",
      "q3": "7",
      "q4": "2",
      "q5": "6",
      "q6": "4",
      "q7": "6",
      "q8": "7",
      "q9": "5",
      "q10": "2",
      "q11": "3",
      "q12": "5",
      "q13": "6",
      "q14": "7",
      "q15": "4"
    }
  }'
```

#### Updating SMS status

```bash
curl -X PATCH https://your-vercel-app-url.vercel.app/api/leads/1 \
  -H "Content-Type: application/json" \
  -d '{
    "smsStatus": "Delivered",
    "sendTime": "10:45 AM"
  }'
```

#### Moving a lead to a different column

```bash
curl -X PATCH https://your-vercel-app-url.vercel.app/api/leads/1/column \
  -H "Content-Type: application/json" \
  -d '{"columnId": "phoneVerified"}'
```

#### Deleting a lead

```bash
curl -X DELETE https://your-vercel-app-url.vercel.app/api/leads/1
```

#### Getting leads from a specific column

```bash
curl -X GET https://your-vercel-app-url.vercel.app/api/columns/phoneVerified/leads
```

#### Creating a new column

```bash
curl -X POST https://your-vercel-app-url.vercel.app/api/columns \
  -H "Content-Type: application/json" \
  -d '{
    "id": "customColumn",
    "title": "My Custom Column",
    "order": 8
  }'
```

## Testing the Deployment

After deploying, you can test your application by:

1. Accessing the dashboard at your Vercel URL
2. Using the webhook test script to send test data:
   - Update the webhook URL in `server/webhook-test.ts` to your Vercel URL
   - Run `npx tsx server/webhook-test.ts`

## OpenAI Integration for Questionnaire Analysis

This application uses OpenAI's GPT-4o model to analyze questionnaire responses and provide personalized assessments for leads. This feature helps your team identify high-potential clients based on their responses to 15 key questions.

### How It Works

1. When a lead completes a questionnaire (15 questions rated 1-7), the responses are sent to the OpenAI API
2. The AI analyzes the responses and calculates two key scores:
   - **Likelihood Score**: The probability of the lead proceeding with cosmetic surgery
   - **Benefits Score**: The perceived value and benefits of cosmetic surgery for this lead
3. The AI also provides an overall assessment classification: "High Intent", "Medium Intent", or "Low Intent"
4. These scores and classification help your team prioritize leads and tailor their approach

### Example of Analysis Data

```json
{
  "likelihood": 6.8,
  "benefits": 7.2,
  "overall": "High Intent"
}
```

### Customizing the Analysis

To customize the analysis logic, you can modify the `analyzeQuestionnaire()` function in `server/openai-service.ts`. This allows you to adapt the AI's assessment criteria based on your specific business needs and client demographics.

## Troubleshooting

If you encounter issues with the deployment:

1. Check the Vercel deployment logs for errors
2. Verify that all environment variables are correctly set
3. Ensure your database is accessible from Vercel
4. Check that your webhook API key is correctly configured

For database connection issues, make sure your Neon database allows connections from external sources and that your connection string is correct.

### OpenAI API Issues

If you encounter problems with the questionnaire analysis:

1. Verify your OpenAI API key is correctly set in environment variables
2. Check the OpenAI API usage limits and billing status
3. For error details, inspect server logs in the Vercel dashboard
4. Test your OpenAI API key independently using the `test-openai.js` script