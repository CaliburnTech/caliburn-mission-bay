# Mission Bay — Backend Setup Guide

One-time steps to wire up the real backend. Do these before running Phase 2 frontend work.

---

## 1. AWS — Create Mission Bay sub-account

1. Sign in to your AWS root account → **Organizations** → **Add an AWS account**
2. Name it `caliburn-mission-bay`, use a billing email like `aws-missionbay@caliburn.us`
3. Once created, switch to that account for all steps below

---

## 2. AWS — Aurora Serverless v2 (Postgres)

1. **RDS console** → **Create database**
2. Engine: **Aurora (PostgreSQL-Compatible)**
3. Template: **Serverless v2**
4. DB cluster identifier: `mission-bay-db`
5. Credentials: set a master username + generate a strong password → save it
6. Connectivity: **Don't connect to an EC2** — choose default VPC, create a new security group
7. Security group inbound rule: allow **port 5432** from **0.0.0.0/0** (Vercel's IPs are dynamic — lock this down to Vercel's IP ranges later if needed)
8. Additional config → Initial database name: `missionbay`
9. Create — takes ~5 minutes

**After creation**, grab the **Writer endpoint** from the cluster page. Your `DATABASE_URL` will be:
```
postgresql://MASTER_USER:PASSWORD@WRITER_ENDPOINT:5432/missionbay?sslmode=require
```

---

## 3. AWS — S3 Bucket

1. **S3 console** → **Create bucket**
2. Name: `mission-bay-assets` (must be globally unique — add a suffix if taken)
3. Region: same as your RDS cluster (e.g. `us-east-1`)
4. Uncheck **Block all public access** — logos need to be publicly readable
5. Create bucket
6. **Permissions** tab → **Bucket policy** → paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadLogos",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mission-bay-assets/logos/*"
    }
  ]
}
```

---

## 4. AWS — IAM User for Vercel

1. **IAM console** → **Users** → **Create user**
2. Name: `mission-bay-vercel`
3. **Attach policies directly** → **Create inline policy**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::mission-bay-assets/*"
    },
    {
      "Effect": "Allow",
      "Action": ["ses:SendEmail", "ses:SendRawEmail"],
      "Resource": "*"
    }
  ]
}
```

4. Create user → **Security credentials** tab → **Create access key** → select **Application running outside AWS**
5. Save the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` — you won't see them again

---

## 5. AWS — SES Domain Verification

1. **SES console** → **Verified identities** → **Create identity**
2. Identity type: **Domain** → enter `caliburn.us`
3. Follow the DNS instructions (adds DKIM CNAME records to your DNS)
4. Wait for status to become **Verified** (usually a few minutes)
5. If your SES account is still in **sandbox mode**: go to **Account dashboard** → **Request production access** — fill out the form (takes 24h, explain you're sending transactional notifications for a defense marketplace)

---

## 6. Clerk — Create Application

1. Go to [clerk.com](https://clerk.com) → **Create application**
2. Name: `Mission Bay`
3. Sign-in options: enable **Google** and **Microsoft** (for SSO), optionally **Email**
4. After creation:
   - Copy **Publishable key** → `VITE_CLERK_PUBLISHABLE_KEY`
   - Copy **Secret key** → `CLERK_SECRET_KEY`

### Configure SSO providers

**Google Workspace:**
- Clerk dashboard → **SSO Connections** → **Add connection** → Google
- Follow Clerk's guide to create a Google OAuth app in Google Cloud Console
- Restrict to work emails (hd parameter) if desired

**Microsoft Entra:**
- Clerk dashboard → **SSO Connections** → **Add connection** → Microsoft
- Register an app in Azure AD, grant `openid profile email` scopes
- Paste the client ID and secret into Clerk

### Configure Webhook

1. Clerk dashboard → **Webhooks** → **Add endpoint**
2. URL: `https://your-vercel-domain.vercel.app/api/auth/webhook`
3. Events to subscribe: `user.created`, `user.updated`
4. Copy the **Signing secret** → `CLERK_WEBHOOK_SECRET`

---

## 7. Vercel — Add Environment Variables

In your Vercel project dashboard → **Settings** → **Environment Variables**, add all variables from `.env.example` with their real values. Set them for **Production** and **Preview** environments.

---

## 8. Run the First Migration

Once `DATABASE_URL` is set in your local `.env.local`:

```bash
npx prisma migrate dev --name init
```

This creates all tables. For production deployments, add this to your Vercel build command:

```bash
npx prisma migrate deploy && vite build
```

Update `package.json`:
```json
"build": "prisma generate && prisma migrate deploy && vite build"
```

---

## 9. Verify Everything

```bash
# Check the API is reachable
curl https://your-domain.vercel.app/api/health

# Check DB connection (run locally with .env.local set)
npx prisma studio
```

Once Prisma Studio opens and shows your empty tables, the backend is live.
