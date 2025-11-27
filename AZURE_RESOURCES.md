# Azure Resources - Library System

## Deployment Information

**Date Created**: 2025-11-27
**Subscription**: Azure for Students (d45bdeeb-3bd8-486b-8d97-77ec40e59d45)
**Region**: Central US

---

## Resource Group

- **Name**: `rg-library-system`
- **Location**: Central US
- **ID**: `/subscriptions/d45bdeeb-3bd8-486b-8d97-77ec40e59d45/resourceGroups/rg-library-system`
- **Tags**:
  - project: library-system
  - environment: production
  - managedBy: claude-code

---

## PostgreSQL Flexible Server

- **Server Name**: `library-db-20251127152951`
- **FQDN**: `library-db-20251127152951.postgres.database.azure.com`
- **Database Name**: `library`
- **Version**: PostgreSQL 16
- **SKU**: Standard_B1ms (Burstable)
- **Storage**: 32 GB
- **Location**: Central US
- **State**: Ready

### Connection Information

- **Admin Username**: `libraryadmin`
- **Admin Password**: `2P1S7LjGe/TMP/eynKoehDSpQ/HrQhq8`
  ⚠️ **IMPORTANT**: Store this password securely. Never commit to source control.

### Connection String

```
postgresql://libraryadmin:2P1S7LjGe%2FTMP%2FeynKoehDSpQ%2FHrQhq8@library-db-20251127152951.postgres.database.azure.com:5432/library?ssl=true&sslmode=require
```

---

## App Service Plan

- **Name**: `asp-library-system`
- **SKU**: F1 (Linux Free)
- **Location**: Central US
- **State**: Ready
- **Max Workers**: 1

### Free Tier Limitations
- 60 minutes/day CPU time
- 1 GB RAM
- 1 GB storage
- No custom domains on Free tier
- No always-on capability

---

## API App Service (NestJS)

- **Name**: `app-library-api-1764276273`
- **URL**: https://app-library-api-1764276273.azurewebsites.net
- **Runtime**: NODE:20-lts
- **State**: Running
- **HTTPS Only**: true

### Environment Variables Configured

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | production | Runtime environment |
| `PORT` | 8080 | Application port (Azure default) |
| `DATABASE_URL` | `postgresql://...` | PostgreSQL connection string |
| `JWT_SECRET` | `[GENERATED]` | JWT authentication secret |
| `JWT_EXPIRES_IN` | 7d | JWT token expiration |

### Default Endpoints
- Health: https://app-library-api-1764276273.azurewebsites.net
- API Docs (if enabled): https://app-library-api-1764276273.azurewebsites.net/api

---

## Static Web App (Next.js)

- **Name**: `stapp-library-web`
- **URL**: https://victorious-ground-0ed21c410.3.azurestaticapps.net
- **SKU**: Free
- **Location**: Central US
- **Provider**: None (Manual deployment)

### Deployment Token

```
a309644ab2469b67cdeebcf13d1208a9f6434f96a820558a22c19ea81f709d0503-127ad591-82d3-472a-bc9a-1652fb24c95801028060ed21c410
```

⚠️ **IMPORTANT**: This token is used for GitHub Actions deployment. Store as GitHub secret.

### Environment Variables Needed

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | https://app-library-api-1764276273.azurewebsites.net |

---

## GitHub Repository

- **URL**: https://github.com/fsmm19/library-system
- **Branch**: main
- **Owner**: fsmm19

---

## CORS Configuration

The API needs to allow requests from the Static Web App domain. Update `/apps/api/src/main.ts`:

```typescript
app.enableCors({
  origin: [
    'http://localhost:3001',
    'http://localhost:3000',
    'https://victorious-ground-0ed21c410.3.azurestaticapps.net'
  ],
  credentials: true,
});
```

---

## Cost Estimation

| Resource | SKU | Monthly Cost |
|----------|-----|--------------|
| PostgreSQL Flexible Server | Standard_B1ms | ~$12 |
| App Service Plan | F1 Free | $0 |
| Static Web App | Free | $0 |
| **Total** | | **~$12/month** |

With Azure for Students credit: $100/month
**Remaining**: ~$88/month

### Cost Optimization Tips

- Monitor CPU usage on Free App Service (60 min/day limit)
- Consider stopping PostgreSQL server during non-use periods
- Upgrade to B1 App Service ($13/month) if Free tier limits are reached

---

## Next Steps

1. ✅ All Azure resources created
2. ⏳ Update API CORS configuration
3. ⏳ Deploy API to App Service
4. ⏳ Deploy Web to Static Web App
5. ⏳ Run Prisma migrations on Azure database
6. ⏳ Create GitHub Actions workflows
7. ⏳ Configure monitoring and alerts
8. ⏳ Test deployed applications

---

## Important Security Notes

1. **Never commit credentials** to source control
2. Store all secrets in:
   - GitHub Secrets (for CI/CD)
   - Azure Key Vault (recommended for production)
   - Environment variables only
3. **PostgreSQL firewall**: Currently allows all Azure services. Restrict to specific IPs in production.
4. **API authentication**: JWT secret is generated. Rotate regularly.
5. **HTTPS**: Enforced on all services.

---

## Management Commands

### View App Service Logs
```bash
az webapp log tail --name app-library-api-1764276273 --resource-group rg-library-system
```

### Restart API
```bash
az webapp restart --name app-library-api-1764276273 --resource-group rg-library-system
```

### Connect to PostgreSQL
```bash
psql "postgresql://libraryadmin@library-db-20251127152951:2P1S7LjGe/TMP/eynKoehDSpQ/HrQhq8@library-db-20251127152951.postgres.database.azure.com:5432/library?sslmode=require"
```

### Update Static Web App Config
```bash
az staticwebapp appsettings set --name stapp-library-web --resource-group rg-library-system --setting-names NEXT_PUBLIC_API_URL=https://app-library-api-1764276273.azurewebsites.net
```

---

## Rollback Plan

If deployment fails:

1. Local Docker setup is still available
2. Run locally: `pnpm docker:up && pnpm dev`
3. Database migrations are reversible with Prisma
4. Azure resources can be deleted: `az group delete --name rg-library-system --yes`

---

## Support & Documentation

- [Azure App Service Docs](https://learn.microsoft.com/en-us/azure/app-service/)
- [Azure Static Web Apps Docs](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Azure Database for PostgreSQL Docs](https://learn.microsoft.com/en-us/azure/postgresql/)
- [Prisma Azure Deployment](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-azure)
