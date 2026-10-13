# Infrastructure

## Target layout (AWS)

- Cloudflare: DNS, CDN, WAF, bot protection
- ECS Fargate (or EKS later) services: api, web, admin, workers
- RDS PostgreSQL (multi-AZ, read replica), automated backups, PITR
- ElastiCache Redis
- S3: documents (encrypted), exports; CloudFront optional
- Secrets Manager, KMS
- VPC with private subnets for data tier
- Terraform modules in `infra/terraform`, one state per environment

## Sizing (start small)

1 region, 2 api tasks, 1 worker, small DB with replica; scale on CPU, memory and queue depth.

## Targets

99.9% availability; RPO <= 5 min; RTO <= 1 h.

## Cost control

Budgets and alerts, right-sizing reviews monthly.
