# 🗺️ CertMate Roadmap

Based on community feedback from [Hacker News discussion](https://news.ycombinator.com/item?id=44427452) and user requests.

## ✅ Recently Completed (v1.4.0 - v1.5.0)

### Multi-Account Support
- ✅ Multiple accounts per DNS provider
- ✅ Environment separation (prod/staging/dev)
- ✅ Multi-region deployments
- **Status:** Released in v1.4.0

### Enterprise Storage Backends
- ✅ Azure Key Vault integration
- ✅ AWS Secrets Manager support
- ✅ HashiCorp Vault support
- ✅ Infisical integration
- **Status:** Released in v1.4.0

### Private CA Support
- ✅ Private Certificate Authority management
- ✅ DigiCert ACME integration
- ✅ Custom CA trust bundles
- **Status:** Released in v1.4.0 (Requested by @jamespo on HN)

### Custom DNS Server Support
- ✅ RFC2136 protocol support for custom DNS servers
- ✅ BIND and compatible servers
- **Status:** Already supported (Confirmed to @schwingy on HN)

### Deployment Verification
- ✅ Automatic deployment status checking
- ✅ Verify certificates are properly deployed
- **Status:** Available via `/api/certificates/{domain}/deployment-status`

### Docker Hub CI/CD
- ✅ Automated multi-platform builds
- ✅ Semantic versioning
- ✅ ARM64, AMD64, ARMv7 support
- **Status:** Live on Docker Hub

## 🚀 v1.6.0 - Certificate Discovery & Monitoring (Q1 2026)

**Priority:** 🔴 HIGH  
**Requested by:** @haddonist, @weddpros on HN

### Goals
Address enterprise needs for monitoring existing SSL certificate fleets across infrastructure.

### Features
- [ ] **Certificate Discovery Scanner**
  - Scan IP ranges for HTTPS services
  - Discover certificates across infrastructure
  - Support for ports 443, 8443, and custom ports
  
- [ ] **Certificate Inventory Dashboard**
  - Centralized view of all discovered certificates
  - Filter by domain, issuer, expiration date
  - Export inventory reports (CSV, JSON)

- [ ] **Expiration Monitoring & Alerts**
  - Configurable alert thresholds (30, 14, 7 days)
  - Email notifications
  - Webhook integrations (Slack, Teams, PagerDuty)
  - Integration with Prometheus/Grafana

- [ ] **Certificate Health Checks**
  - Protocol version validation (TLS 1.2+)
  - Cipher suite recommendations
  - Certificate chain validation
  - Revocation status (OCSP, CRL)

### Technical Details
```python
# API Endpoints
GET  /api/discovery/scan                # Trigger certificate scan
GET  /api/discovery/certificates        # List all discovered certificates
GET  /api/discovery/certificates/{id}   # Certificate details
POST /api/discovery/alerts              # Configure alerts
GET  /api/discovery/health-report       # Generate health report
```

### Use Cases
- Monitor certificates NOT managed by CertMate
- Discover shadow IT certificates
- Compliance reporting (SOC 2, ISO 27001)
- Migration planning from manual to automated management

## 🛠️ v1.7.0 - Auto-Deploy & Service Integration (Q2 2026)

**Priority:** 🟡 MEDIUM  
**Requested by:** @nodesocket on HN

### Goals
Automate certificate deployment to web servers and services after issuance/renewal.

### Features
- [ ] **Service Integration Plugins**
  - Nginx configuration and reload
  - Apache configuration and reload
  - HAProxy configuration and reload
  - Traefik dynamic configuration
  - Envoy/Istio integration

- [ ] **Remote Deployment**
  - SSH-based deployment to remote servers
  - SCP/SFTP certificate transfer
  - Ansible playbook generation
  - Kubernetes secret auto-update

- [ ] **Deployment Templates**
  - Pre-configured templates for common setups
  - Custom deployment scripts support
  - Rollback on deployment failure

- [ ] **Deployment Verification**
  - Post-deployment health checks
  - Automatic rollback on failure
  - Deployment audit logs

### Technical Details
```yaml
# Deployment Configuration Example
deployment:
  nginx:
    enabled: true
    config_path: /etc/nginx/sites-available/
    reload_command: systemctl reload nginx
    remote_hosts:
      - host: web1.example.com
        user: deploy
        key: /path/to/key
```

### Integration with Competitors
Document when to use CertMate vs:
- **Caddy**: Zero-config for simple setups
- **Traefik**: Container-native environments
- **CertMate**: Multi-provider, enterprise, legacy systems

## 📚 v1.7.5 - Enhanced IaC Integration (Q2 2026)

**Priority:** 🟡 MEDIUM  
**Requested by:** @haddonist on HN

### Goals
Better integration with configuration management and Infrastructure as Code tools.

### Features
- [ ] **Official Terraform Provider**
  - Resource: `certmate_certificate`
  - Resource: `certmate_dns_account`
  - Data source: `certmate_certificate_download`
  - Published to Terraform Registry

- [ ] **Ansible Collection**
  - Module: `certmate_certificate`
  - Module: `certmate_settings`
  - Module: `certmate_backup`
  - Published to Ansible Galaxy

- [ ] **Puppet Module**
  - Manage certificates via Puppet manifests
  - Integration with Hiera for secrets

- [ ] **Enhanced Git Integration**
  - GitOps workflow support
  - Certificate configuration in Git
  - Automatic sync from Git repositories
  - Pull request approval workflow

### Technical Details
```hcl
# Terraform Provider Example
resource "certmate_certificate" "api" {
  domain       = "api.company.com"
  dns_provider = "cloudflare"
  account_id   = "production"
  
  lifecycle {
    create_before_destroy = true
  }
}
```

## 🔍 v1.8.0 - Advanced Monitoring & Analytics (Q3 2026)

**Priority:** 🟢 LOW

### Features
- [ ] **Analytics Dashboard**
  - Certificate issuance trends
  - Renewal success rates
  - Provider performance metrics
  - Cost analysis (API calls, storage)

- [ ] **Compliance Reporting**
  - PCI DSS compliance checks
  - SOC 2 audit reports
  - Custom compliance policies

- [ ] **Integration Ecosystem**
  - Splunk integration
  - Datadog integration
  - New Relic integration
  - Custom webhook system

## 🎯 Continuous Improvements

### Documentation
- [ ] Video tutorials and walkthroughs
- [ ] Architecture deep-dives
- [ ] Migration guides (from Certbot, acme.sh)
- [ ] Troubleshooting decision trees

### Performance
- [ ] Certificate issuance optimization
- [ ] Database query optimization
- [ ] Caching layer for frequently accessed certs
- [ ] Horizontal scaling improvements

### Security
- [ ] mTLS support for API
- [ ] RBAC (Role-Based Access Control)
- [ ] Audit log encryption
- [ ] Security scanning integration (Snyk, Trivy)

## 💡 Community Requests

Want to suggest a feature? Open an issue on [GitHub](https://github.com/fabriziosalmi/certmate/issues) with:
- Use case description
- Expected behavior
- Priority (nice-to-have vs critical)

Join the discussion on:
- [Hacker News](https://news.ycombinator.com/item?id=44427452)
- [Reddit r/homelab](https://www.reddit.com/r/homelab/comments/1lv1s69/)
- [GitHub Discussions](https://github.com/fabriziosalmi/certmate/discussions)

---

**Note:** Priorities and timelines may change based on community feedback and contributions. All features are subject to feasibility analysis and may be adjusted during development.

*Last updated: January 11, 2026*
