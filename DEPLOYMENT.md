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
NODE_ENV=production
```

Replace the placeholders with your actual database credentials.

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
  -d '{"name": "John Doe", "email": "john@example.com", "phone": "+1234567890"}'
```

#### Updating a lead's questionnaire

```bash
curl -X PUT https://your-vercel-app-url.vercel.app/api/leads/1 \
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

## Testing the Deployment

After deploying, you can test your application by:

1. Accessing the dashboard at your Vercel URL
2. Using the webhook test script to send test data:
   - Update the webhook URL in `server/webhook-test.ts` to your Vercel URL
   - Run `npx tsx server/webhook-test.ts`

## Troubleshooting

If you encounter issues with the deployment:

1. Check the Vercel deployment logs for errors
2. Verify that all environment variables are correctly set
3. Ensure your database is accessible from Vercel
4. Check that your webhook API key is correctly configured

For database connection issues, make sure your Neon database allows connections from external sources and that your connection string is correct.