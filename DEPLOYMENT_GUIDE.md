# Complete Azure Deployment Guide

## 🎉 Resources Created Successfully!

All Azure resources have been created and configured. This guide will help you complete the deployment process.

---

## 📋 What's Been Done

### ✅ Azure Resources Created

1. **Resource Group**: `rg-library-system` (Central US)
2. **PostgreSQL Flexible Server**: `library-db-20251127152951`
   - Database: `library`
   - FQDN: `library-db-20251127152951.postgres.database.azure.com`
3. **App Service Plan**: `asp-library-system` (F1 Free, Linux)
4. **API App Service**: `app-library-api-1764276273`
   - URL: https://app-library-api-1764276273.azurewebsites.net
   - Runtime: Node.js 20 LTS
5. **Static Web App**: `stapp-library-web`
   - URL: https://victorious-ground-0ed21c410.3.azurestaticapps.net

### ✅ Code Changes

1. Updated CORS configuration in `apps/api/src/main.ts`
2. Created deployment files:
   - `apps/api/.deployment`
   - `apps/api/startup.sh`
3. Created GitHub Actions workflows:
   - `.github/workflows/deploy-api.yml`
   - `.github/workflows/deploy-web.yml`

---

## 🚀 Next Steps to Complete Deployment

### Step 1: Configure GitHub Secrets

You need to add the following secrets to your GitHub repository:

#### 1.1 Get Azure App Service Publish Profile

```bash
az webapp deployment list-publishing-profiles \
  --name app-library-api-1764276273 \
  --resource-group rg-library-system \
  --xml > publish-profile.xml
```

Then add this as a GitHub secret named: `AZURE_APP_SERVICE_PUBLISH_PROFILE`

#### 1.2 Add Static Web App Deployment Token

Token (already generated):
```
a309644ab2469b67cdeebcf13d1208a9f6434f96a820558a22c19ea81f709d0503-127ad591-82d3-472a-bc9a-1652fb24c95801028060ed21c410
```

Add this as a GitHub secret named: `AZURE_STATIC_WEB_APPS_API_TOKEN`

#### 1.3 Add Database URL

Add this as a GitHub secret named: `DATABASE_URL`

Value:
```
postgresql://libraryadmin:2P1S7LjGe%2FTMP%2FeynKoehDSpQ%2FHrQhq8@library-db-20251127152951.postgres.database.azure.com:5432/library?ssl=true&sslmode=require
```

### Step 2: Add GitHub Secrets via Web Interface

1. Go to: https://github.com/fsmm19/library-system/settings/secrets/actions
2. Click "New repository secret"
3. Add each secret:
   - Name: `AZURE_APP_SERVICE_PUBLISH_PROFILE`
     Value: [Contents of publish-profile.xml]

   - Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
     Value: `a309644ab2469b67cdeebcf13d1208a9f6434f96a820558a22c19ea81f709d0503-127ad591-82d3-472a-bc9a-1652fb24c95801028060ed21c410`

   - Name: `DATABASE_URL`
     Value: `postgresql://libraryadmin:2P1S7LjGe%2FTMP%2FeynKoehDSpQ%2FHrQhq8@library-db-20251127152951.postgres.database.azure.com:5432/library?ssl=true&sslmode=require`

---

## 📦 Manual Deployment (Alternative)

If you prefer to deploy manually before setting up CI/CD:

### Deploy API Manually

```bash
# 1. Build the API
pnpm --filter api build

# 2. Create deployment package
cd apps/api
zip -r deployment.zip dist/ prisma/ generated/ package.json pnpm-lock.yaml startup.sh

# 3. Deploy to Azure
az webapp deployment source config-zip \
  --resource-group rg-library-system \
  --name app-library-api-1764276273 \
  --src deployment.zip

# 4. Configure startup command
az webapp config set \
  --resource-group rg-library-system \
  --name app-library-api-1764276273 \
  --startup-file "startup.sh"

# 5. Restart the app
az webapp restart \
  --name app-library-api-1764276273 \
  --resource-group rg-library-system
```

### Deploy Web Manually

```bash
# The Static Web App deployment requires the SWA CLI or GitHub Actions
# GitHub Actions is recommended - just push your code after setting up secrets!
```

---

## 🔧 Configure PostgreSQL Firewall (if needed)

If you encounter database connection issues from your local machine:

```bash
# Get your IP
MY_IP=$(curl -s https://api.ipify.org)

# Add firewall rule via Azure Portal:
# 1. Go to: https://portal.azure.com
# 2. Navigate to: rg-library-system > library-db-20251127152951
# 3. Click "Networking" in the left menu
# 4. Under "Firewall rules", click "Add current client IP address"
# 5. Click "Save"
```

---

## 🧪 Testing Your Deployment

### Test API

```bash
# Check if API is running
curl https://app-library-api-1764276273.azurewebsites.net

# Check health endpoint (if you have one)
curl https://app-library-api-1764276273.azurewebsites.net/health
```

### Test Web App

1. Open: https://victorious-ground-0ed21c410.3.azurestaticapps.net
2. The site should load (may show "This site hasn't been deployed yet" until you deploy)

### View Logs

```bash
# API logs
az webapp log tail \
  --name app-library-api-1764276273 \
  --resource-group rg-library-system

# Stream logs
az webapp log tail \
  --name app-library-api-1764276273 \
  --resource-group rg-library-system \
  --provider application
```

---

## 🔄 Deploying with GitHub Actions

Once you've added the GitHub secrets:

1. **Commit and push** your code:
   ```bash
   git add .
   git commit -m "chore: add Azure deployment configuration"
   git push origin main
   ```

2. **Monitor the deployment**:
   - Go to: https://github.com/fsmm19/library-system/actions
   - Watch the "Deploy API" and "Deploy Web" workflows

3. **Check deployment status**:
   - API: https://app-library-api-1764276273.azurewebsites.net
   - Web: https://victorious-ground-0ed21c410.3.azurestaticapps.net

---

## 🐛 Troubleshooting

### API Won't Start

1. Check logs:
   ```bash
   az webapp log tail --name app-library-api-1764276273 --resource-group rg-library-system
   ```

2. Verify environment variables:
   ```bash
   az webapp config appsettings list \
     --name app-library-api-1764276273 \
     --resource-group rg-library-system
   ```

3. Check if DATABASE_URL is set correctly

### Database Connection Fails

1. Verify firewall rules in Azure Portal
2. Check if PostgreSQL server is running:
   ```bash
   az postgres flexible-server list --resource-group rg-library-system --output table
   ```

3. Test connection with psql:
   ```bash
   psql "postgresql://libraryadmin:[PASSWORD]@library-db-20251127152951.postgres.database.azure.com:5432/library?sslmode=require"
   ```

### Prisma Migrations Fail

1. Run migrations manually:
   ```bash
   cd apps/api
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   ```

2. Or trigger via Azure CLI:
   ```bash
   az webapp ssh --name app-library-api-1764276273 --resource-group rg-library-system
   # Then inside the SSH session:
   cd /home/site/wwwroot
   npx prisma migrate deploy
   ```

### Static Web App Shows "Not Deployed"

1. Make sure GitHub secrets are added
2. Push a change to trigger the workflow
3. Check GitHub Actions for errors

---

## 💰 Cost Monitoring

Monitor your costs to stay within Azure for Students credits:

```bash
# Check resource costs
az consumption usage list \
  --start-date 2025-11-01 \
  --end-date 2025-11-30 \
  --output table
```

Or visit: https://portal.azure.com/#view/Microsoft_Azure_CostManagement/Menu/~/overview

---

## 📚 Additional Resources

- **Azure Resources Info**: See `AZURE_RESOURCES.md`
- **App Service Docs**: https://learn.microsoft.com/en-us/azure/app-service/
- **Static Web Apps Docs**: https://learn.microsoft.com/en-us/azure/static-web-apps/
- **PostgreSQL Docs**: https://learn.microsoft.com/en-us/azure/postgresql/

---

## 🎯 Quick Reference

### Resource Names

| Resource | Name | URL/Connection |
|----------|------|----------------|
| Resource Group | `rg-library-system` | - |
| PostgreSQL Server | `library-db-20251127152951` | `library-db-20251127152951.postgres.database.azure.com` |
| App Service Plan | `asp-library-system` | - |
| API App Service | `app-library-api-1764276273` | https://app-library-api-1764276273.azurewebsites.net |
| Static Web App | `stapp-library-web` | https://victorious-ground-0ed21c410.3.azurestaticapps.net |

### Useful Commands

```bash
# Restart API
az webapp restart --name app-library-api-1764276273 --resource-group rg-library-system

# View API logs
az webapp log tail --name app-library-api-1764276273 --resource-group rg-library-system

# SSH into API
az webapp ssh --name app-library-api-1764276273 --resource-group rg-library-system

# Update environment variable
az webapp config appsettings set \
  --name app-library-api-1764276273 \
  --resource-group rg-library-system \
  --settings KEY=VALUE

# Delete all resources (if needed)
az group delete --name rg-library-system --yes --no-wait
```

---

**Ready to deploy!** 🚀

Follow the steps above to complete your Azure deployment. If you encounter any issues, refer to the troubleshooting section or check the Azure Portal for detailed error messages.
