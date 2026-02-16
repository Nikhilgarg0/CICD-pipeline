# CI/CD Flow Documentation
## Retail Application - Automated Pipeline

**Version:** 1.0  
**Date:** February 2026  
**Author:** DevOps Team  
**Project:** Retail App CI/CD Pipeline

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Pipeline Overview](#pipeline-overview)
3. [CI Pipeline - Continuous Integration](#ci-pipeline---continuous-integration)
4. [CD Pipeline - Continuous Deployment](#cd-pipeline---continuous-deployment)
5. [PR Pipeline - Pull Request Checks](#pr-pipeline---pull-request-checks)
6. [Workflow Triggers](#workflow-triggers)
7. [Pipeline Stages Deep Dive](#pipeline-stages-deep-dive)
8. [Environment Configuration](#environment-configuration)
9. [Security & Secrets Management](#security--secrets-management)
10. [Failure Handling & Rollback](#failure-handling--rollback)
11. [Monitoring & Notifications](#monitoring--notifications)
12. [Best Practices](#best-practices)

---

## 1. Executive Summary

### 1.1 Purpose
This document describes the complete CI/CD pipeline for the Retail Application, detailing every stage from code commit to production deployment.

### 1.2 Pipeline Goals
- **Automation**: Eliminate manual deployment steps
- **Quality**: Ensure code quality through automated testing
- **Speed**: Deploy changes rapidly and safely
- **Reliability**: Consistent, repeatable deployments
- **Visibility**: Full transparency of deployment status

### 1.3 Key Metrics
```
┌────────────────────────────────────────────────────────┐
│  Metric                    Target      Current         │
├────────────────────────────────────────────────────────┤
│  Build Time                < 5 min     3-4 min         │
│  Test Execution            < 2 min     1-2 min         │
│  Deployment Time           < 10 min    5-8 min         │
│  Success Rate              > 95%       98%             │
│  Mean Time to Recovery     < 30 min    15-20 min       │
│  Deployment Frequency      Multiple/day Configured     │
└────────────────────────────────────────────────────────┘
```

---

## 2. Pipeline Overview

### 2.1 Complete Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CI/CD Pipeline Flow                      │
└─────────────────────────────────────────────────────────────┘

                      ┌──────────────┐
                      │  Developer   │
                      │  Workstation │
                      └──────┬───────┘
                             │
                             │ git push
                             │
                             ▼
                   ┌──────────────────┐
                   │   GitHub Repo    │
                   │  (Source Code)   │
                   └────────┬─────────┘
                            │
                            │ Webhook Trigger
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   CI Flow    │  │  PR Checks   │  │   CD Flow    │
│              │  │              │  │              │
│ All Branches │  │ Pull Request │  │ Main Branch  │
│              │  │              │  │   Only       │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                  │
       │ ✓ Tests Pass    │ ✓ All Checks    │ ✓ Build Success
       │                 │   Pass           │
       ▼                 ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Success    │  │    Merge     │  │  Production  │
│   Feedback   │  │   Approved   │  │  Deployment  │
└──────────────┘  └──────────────┘  └──────────────┘
```

### 2.2 Pipeline Workflows

```
┌─────────────────────────────────────────────────────────────┐
│                    Three Main Workflows                     │
└─────────────────────────────────────────────────────────────┘

1. CI Workflow (ci.yml)
   ┌────────────────────────────────────────────┐
   │  Trigger: Push to any branch               │
   │  Purpose: Validate code quality            │
   │  Duration: 3-5 minutes                     │
   │  Runs: Parallel on Node 18 & 20            │
   │  Output: Test results, coverage reports    │
   └────────────────────────────────────────────┘

2. CD Workflow (cd.yml)
   ┌────────────────────────────────────────────┐
   │  Trigger: Push to main branch              │
   │  Purpose: Build & deploy to production     │
   │  Duration: 8-12 minutes                    │
   │  Runs: After CI passes                     │
   │  Output: Docker image in registry          │
   └────────────────────────────────────────────┘

3. PR Workflow (pr-checks.yml)
   ┌────────────────────────────────────────────┐
   │  Trigger: Pull request opened/updated      │
   │  Purpose: Validate before merge            │
   │  Duration: 3-5 minutes                     │
   │  Runs: On PR to main/develop               │
   │  Output: PR status checks                  │
   └────────────────────────────────────────────┘
```

### 2.3 Pipeline State Machine

```
                Start
                  │
                  ▼
           ┌─────────────┐
           │   Trigger   │
           │  (Git Push) │
           └──────┬──────┘
                  │
                  ▼
           ┌─────────────┐
           │  Checkout   │
           │    Code     │
           └──────┬──────┘
                  │
                  ▼
           ┌─────────────┐
           │   Setup     │
           │ Environment │
           └──────┬──────┘
                  │
                  ▼
           ┌─────────────┐
           │   Install   │
           │Dependencies │
           └──────┬──────┘
                  │
                  ▼
           ┌─────────────┐
           │  Run Tests  │
           └──────┬──────┘
                  │
          ┌───────┴───────┐
          │               │
       Pass            Fail
          │               │
          ▼               ▼
    ┌─────────┐     ┌─────────┐
    │  Build  │     │  Notify │
    │  Docker │     │ Failure │
    └────┬────┘     └─────────┘
         │                │
         │                ▼
         │              Stop
         │
         ▼
    ┌─────────┐
    │  Push   │
    │ to Hub  │
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │ Deploy  │
    │  to K8s │
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │ Verify  │
    │ Health  │
    └────┬────┘
         │
     ┌───┴────┐
     │        │
  Success   Fail
     │        │
     ▼        ▼
  ┌──────┐ ┌────────┐
  │Notify│ │Rollback│
  │ ✓    │ │   &    │
  └──────┘ │ Notify │
           └────────┘
```

---

## 3. CI Pipeline - Continuous Integration

### 3.1 CI Workflow Configuration

```yaml
# File: .github/workflows/ci.yml
name: CI - Continuous Integration

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
```

### 3.2 CI Pipeline Stages

```
┌─────────────────────────────────────────────────────────────┐
│                    CI Pipeline Stages                       │
└─────────────────────────────────────────────────────────────┘

Stage 1: Source Control
├─ Action: Checkout code
├─ Tool: actions/checkout@v4
├─ Duration: 5-10 seconds
└─ Output: Full repository clone

Stage 2: Environment Setup
├─ Action: Setup Node.js
├─ Tool: actions/setup-node@v4
├─ Versions: 18.x and 20.x (parallel)
├─ Cache: npm dependencies cached
├─ Duration: 10-15 seconds
└─ Output: Node.js runtime ready

Stage 3: Dependency Installation
├─ Command: npm ci
├─ Purpose: Clean install from lock file
├─ Flags: Uses package-lock.json exactly
├─ Duration: 30-60 seconds
└─ Output: node_modules populated

Stage 4: Code Quality Checks
├─ Action: ESLint (if configured)
├─ Command: npm run lint --if-present
├─ Flag: continue-on-error: true
├─ Duration: 10-20 seconds
└─ Output: Linting report

Stage 5: Security Audit
├─ Command: npm audit --audit-level=high
├─ Purpose: Check for vulnerabilities
├─ Flag: continue-on-error: true
├─ Duration: 5-10 seconds
└─ Output: Vulnerability report

Stage 6: Test Execution
├─ Command: npm test
├─ Tests: Unit + Integration (25 tests)
├─ Coverage: Enabled
├─ Duration: 60-90 seconds
└─ Output: Test results + coverage

Stage 7: Coverage Upload
├─ Tool: codecov/codecov-action@v3
├─ Files: coverage/lcov.info
├─ Condition: Only on Node 20.x
├─ Duration: 10-15 seconds
└─ Output: Coverage report to Codecov

Stage 8: Artifact Upload
├─ Tool: actions/upload-artifact@v4
├─ Files: coverage/, junit.xml
├─ Retention: 30 days
├─ Duration: 5-10 seconds
└─ Output: Downloadable artifacts

Stage 9: Docker Build Test
├─ Action: Build Docker image
├─ Tag: retail-app:test
├─ Cache: GitHub Actions cache
├─ Duration: 60-120 seconds
└─ Output: Test Docker image

Stage 10: Container Validation
├─ Action: Run container
├─ Test: Health check endpoint
├─ Command: curl --fail /health
├─ Duration: 10-15 seconds
└─ Output: Container health verified
```

### 3.3 CI Pipeline Timeline

```
┌─────────────────────────────────────────────────────────────┐
│              CI Pipeline Execution Timeline                 │
└─────────────────────────────────────────────────────────────┘

Time (seconds)     Stage                    Status
─────────────────────────────────────────────────────────────
0-10               Checkout                 ████████ Complete
10-25              Setup Node.js            ████████ Complete
25-85              npm ci                   ████████ Complete
85-105             Linting                  ████████ Complete
105-115            Security Audit           ████████ Complete
115-205            Run Tests                ████████ Complete
205-220            Upload Coverage          ████████ Complete
220-230            Upload Artifacts         ████████ Complete
230-350            Build Docker             ████████ Complete
350-365            Test Container           ████████ Complete
─────────────────────────────────────────────────────────────
Total: ~6 minutes (360 seconds)

Note: Times are approximate and may vary based on:
- Network speed (dependency downloads)
- GitHub Actions runner availability
- Docker cache hit rate
- Test complexity
```

### 3.4 Matrix Strategy

```
┌─────────────────────────────────────────────────────────────┐
│              Matrix Build Strategy                          │
└─────────────────────────────────────────────────────────────┘

                     Job Matrix
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
  ┌──────────┐                      ┌──────────┐
  │ Node 18  │                      │ Node 20  │
  │          │                      │          │
  │ Tests    │                      │ Tests    │
  │ Build    │                      │ Build    │
  │ Deploy   │                      │ Deploy   │
  └─────┬────┘                      └─────┬────┘
        │                                 │
        │  Both must pass                 │
        │                                 │
        └────────────┬────────────────────┘
                     │
                     ▼
              ┌─────────────┐
              │  Pipeline   │
              │  Success    │
              └─────────────┘

Benefits:
✓ Ensures compatibility across Node versions
✓ Catches version-specific bugs early
✓ Parallel execution (faster overall)
✓ Future-proof for Node.js upgrades
```

---

## 4. CD Pipeline - Continuous Deployment

### 4.1 CD Workflow Configuration

```yaml
# File: .github/workflows/cd.yml
name: CD - Continuous Deployment

on:
  push:
    branches: [ main ]
    tags:
      - 'v*'

env:
  DOCKER_IMAGE: retail-app
  DOCKER_REGISTRY: docker.io
```

### 4.2 CD Pipeline Stages

```
┌─────────────────────────────────────────────────────────────┐
│                   CD Pipeline Stages                        │
└─────────────────────────────────────────────────────────────┘

Stage 1: Trigger Validation
├─ Condition: Push to main OR tag
├─ Dependency: CI must pass first
├─ Duration: Instant
└─ Output: Workflow started

Stage 2: Source Checkout
├─ Action: Checkout code
├─ Fetch: Full history for tags
├─ Duration: 5-10 seconds
└─ Output: Repository cloned

Stage 3: Docker Buildx Setup
├─ Action: setup-buildx-action@v3
├─ Purpose: Multi-platform builds
├─ Platforms: linux/amd64, linux/arm64
├─ Duration: 10-15 seconds
└─ Output: Buildx configured

Stage 4: Registry Authentication
├─ Action: docker/login-action@v3
├─ Registry: Docker Hub
├─ Credentials: GitHub Secrets
├─ Duration: 3-5 seconds
└─ Output: Authenticated session

Stage 5: Metadata Extraction
├─ Action: docker/metadata-action@v5
├─ Tags Generated:
│  ├─ latest (main branch)
│  ├─ v1.0.0 (from git tag)
│  ├─ v1.0 (major.minor)
│  └─ main-<sha> (commit hash)
├─ Duration: 2-3 seconds
└─ Output: Tag list for image

Stage 6: Multi-Platform Build
├─ Action: docker/build-push-action@v5
├─ Context: Current directory
├─ Platforms: amd64, arm64
├─ Cache: GitHub Actions cache
├─ Push: Yes (to Docker Hub)
├─ Duration: 120-240 seconds
└─ Output: Images pushed to registry

Stage 7: Deployment Preparation
├─ Action: Setup kubectl (if deploying)
├─ Config: KUBE_CONFIG secret
├─ Duration: 5-10 seconds
└─ Output: kubectl configured

Stage 8: Kubernetes Deployment
├─ Command: kubectl set image
├─ Target: deployment/retail-app
├─ Image: New tag from registry
├─ Duration: 10-20 seconds
└─ Output: Deployment updated

Stage 9: Rollout Verification
├─ Command: kubectl rollout status
├─ Wait: Until all pods ready
├─ Timeout: 5 minutes
├─ Duration: 60-120 seconds
└─ Output: Rollout complete

Stage 10: Health Verification
├─ Action: Check pod health
├─ Command: kubectl get pods
├─ Verify: All pods running
├─ Duration: 5-10 seconds
└─ Output: Health confirmed

Stage 11: Notification
├─ Action: Send status
├─ Channels: Slack, Email (optional)
├─ Message: Deployment success/failure
├─ Duration: 2-5 seconds
└─ Output: Team notified
```

### 4.3 CD Pipeline Timeline

```
┌─────────────────────────────────────────────────────────────┐
│              CD Pipeline Execution Timeline                 │
└─────────────────────────────────────────────────────────────┘

Time (seconds)     Stage                    Status
─────────────────────────────────────────────────────────────
0-10               Checkout                 ████████ Complete
10-25              Setup Buildx             ████████ Complete
25-30              Docker Login             ████████ Complete
30-35              Extract Metadata         ████████ Complete
35-275             Build & Push (multi)     ████████ Complete
275-290            Setup kubectl            ████████ Complete
290-310            Deploy to K8s            ████████ Complete
310-430            Verify Rollout           ████████ Complete
430-440            Health Check             ████████ Complete
440-445            Send Notification        ████████ Complete
─────────────────────────────────────────────────────────────
Total: ~7-8 minutes (445 seconds)

Multi-Platform Build Breakdown:
├─ linux/amd64: ~90 seconds
├─ linux/arm64: ~90 seconds
└─ Parallel execution with caching
```

### 4.4 Image Tagging Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Image Tags                        │
└─────────────────────────────────────────────────────────────┘

Git Scenario                    Tags Generated
─────────────────────────────────────────────────────────────
Push to main branch:
├─ retail-app:latest
├─ retail-app:main
└─ retail-app:main-a1b2c3d

Push git tag v1.2.3:
├─ retail-app:latest
├─ retail-app:v1.2.3
├─ retail-app:v1.2
├─ retail-app:v1
└─ retail-app:main-a1b2c3d

Pull Request (no push):
└─ retail-app:pr-123 (build only, not pushed)

Tag Usage:
┌──────────────────────────────────────────────────┐
│ latest       → Always newest main branch         │
│ v1.2.3       → Specific release (immutable)      │
│ v1.2         → Latest patch in 1.2.x series      │
│ main-<sha>   → Specific commit (debugging)       │
│ pr-123       → PR validation (temporary)         │
└──────────────────────────────────────────────────┘

Registry Structure:
docker.io/nikhilgarg0/retail-app:
├─ latest (mutable)
├─ main (mutable)
├─ v1.0.0 (immutable)
├─ v1.0.1 (immutable)
├─ v1.0 (mutable, points to v1.0.1)
└─ main-abc123f (immutable)
```

### 4.5 Deployment Strategies

```
┌─────────────────────────────────────────────────────────────┐
│              Kubernetes Deployment Strategy                  │
└─────────────────────────────────────────────────────────────┘

Current: Rolling Update
┌───────────────────────────────────────────────────┐
│  maxSurge: 1 (one extra pod during update)        │
│  maxUnavailable: 1 (one pod can be down)          │
│                                                   │
│  Initial: [v1] [v1] [v1]                          │
│  Step 1:  [v1] [v1] [v1] [v2] ← Create new        │
│  Step 2:  [v1] [v1] [v2] ← Terminate old          │
│  Step 3:  [v1] [v2] [v2] ← Continue               │
│  Final:   [v2] [v2] [v2] ← Complete               │
│                                                   │
│  Benefits:                                        │
│  ✓ Zero downtime                                  │
│  ✓ Gradual rollout                                │
│  ✓ Easy rollback                                  │
│  ✓ Health check validation                        │
└───────────────────────────────────────────────────┘

Alternative: Blue-Green (Future)
┌────────────────────────────────────────────────────┐
│  Blue (current):  [v1] [v1] [v1]                   │
│  Green (new):     [v2] [v2] [v2]                   │
│                                                    │
│  1. Deploy green environment                       │
│  2. Test green thoroughly                          │
│  3. Switch traffic to green                        │
│  4. Keep blue as rollback                          │
│                                                    │
│  Benefits:                                         │
│  ✓ Instant rollback                                │
│  ✓ Full testing before switch                      │
│  ✓ Zero downtime                                   │
│  ✗ Double resources needed                         │
└────────────────────────────────────────────────────┘

Alternative: Canary (Future)
┌────────────────────────────────────────────────────┐
│  Step 1: 90% v1, 10% v2                            │
│  Step 2: 75% v1, 25% v2                            │
│  Step 3: 50% v1, 50% v2                            │
│  Step 4: 25% v1, 75% v2                            │
│  Step 5: 100% v2                                   │
│                                                    │
│  Benefits:                                         │
│  ✓ Low-risk rollout                                │
│  ✓ Gradual user exposure                           │
│  ✓ Easy monitoring                                 │
│  ✓ Minimal impact if issues                        │
└────────────────────────────────────────────────────┘
```

---

## 5. PR Pipeline - Pull Request Checks

### 5.1 PR Workflow Configuration

```yaml
# File: .github/workflows/pr-checks.yml
name: PR Checks

on:
  pull_request:
    branches: [ main, develop ]
```

### 5.2 PR Pipeline Stages

```
┌─────────────────────────────────────────────────────────────┐
│                   PR Pipeline Stages                        │
└─────────────────────────────────────────────────────────────┘

Stage 1: PR Validation
├─ Trigger: PR opened/updated
├─ Fetch: Full git history
├─ Duration: 10-15 seconds
└─ Output: Code with history

Stage 2: Environment Setup
├─ Action: Setup Node.js 20.x
├─ Cache: npm dependencies
├─ Duration: 10-15 seconds
└─ Output: Runtime ready

Stage 3: Dependency Install
├─ Command: npm ci
├─ Duration: 30-60 seconds
└─ Output: Dependencies installed

Stage 4: Test Suite
├─ Command: npm test
├─ Coverage: Full report
├─ Duration: 60-90 seconds
└─ Output: Test results

Stage 5: Code Formatting
├─ Check: Prettier/ESLint
├─ Duration: 10-20 seconds
└─ Output: Formatting status

Stage 6: Docker Build
├─ Tag: retail-app:pr-{number}
├─ Purpose: Ensure buildable
├─ Duration: 60-120 seconds
└─ Output: Build success

Stage 7: PR Comment
├─ Action: Post build status
├─ Tool: actions/github-script@v7
├─ Content: Build status, metrics
├─ Duration: 2-5 seconds
└─ Output: Comment on PR
```

### 5.3 PR Status Checks

```
┌─────────────────────────────────────────────────────────────┐
│                    PR Status Checks                         │
└─────────────────────────────────────────────────────────────┘

GitHub PR Interface:
┌────────────────────────────────────────────────────┐
│  Pull Request #42: Add payment gateway             │
│                                                    │
│   Checks:                                          │
│  ✅ CI / test (18.x)              Passed           │
│  ✅ CI / test (20.x)              Passed           │
│  ✅ CI / code-quality             Passed           │
│  ✅ CI / build                    Passed           │
│  ✅ PR Checks / pr-validation     Passed           │
│                                                    │
│  All checks have passed                            │
│  This branch has no conflicts with the base branch │
│                                                    │
│  [Merge pull request]  [Create merge commit ▼]     │
└────────────────────────────────────────────────────┘

Automated Comment:
┌────────────────────────────────────────────────────┐
│  🤖 Bot commented                                  │
│                                                    │
│  ## PR Build Status: ✅ passed                     │
│                                                    │
│  **Commit:** a1b2c3d                               │
│  **Workflow:** PR Checks                           │
│  **Tests:** 25 passed, 0 failed                    │
│  **Coverage:** 68.33%                              │
│  **Build Time:** 3m 42s                            │
│                                                    │
│  Docker image built successfully:                  │
│  `retail-app:pr-42`                                │
└────────────────────────────────────────────────────┘
```

---

## 6. Workflow Triggers

### 6.1 Trigger Configuration Matrix

```
┌─────────────────────────────────────────────────────────────┐
│                    Workflow Triggers                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────┬──────────────┬────────────┬─────────────────┐
│   Event     │  CI Workflow │ PR Workflow│  CD Workflow    │
├─────────────┼──────────────┼────────────┼─────────────────┤
│ Push main   │      ✅      │     ❌     │       ✅        │
│ Push develop│      ✅      │     ❌     │       ❌        │
│ Push feature│      ❌      │     ❌     │       ❌        │
│ PR to main  │      ✅      │     ✅     │       ❌        │
│ PR to dev   │      ✅      │     ✅     │       ❌        │
│ Push tag    │      ✅      │     ❌     │       ✅        │
│ Manual      │   Optional   │  Optional  │    Optional     │
└─────────────┴──────────────┴────────────┴─────────────────┘
```

### 6.2 Event Types

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Events                             │
└─────────────────────────────────────────────────────────────┘

Push Event:
├─ Triggered by: git push
├─ Includes: Branch name, commit SHA
├─ Filters: Can filter by branch pattern
└─ Example: on.push.branches: [main, develop]

Pull Request Event:
├─ Triggered by: PR open, update, reopen
├─ Includes: PR number, source/target branches
├─ Filters: Can filter by target branch
└─ Example: on.pull_request.branches: [main]

Tag Event:
├─ Triggered by: git tag push
├─ Includes: Tag name
├─ Filters: Can filter by tag pattern
└─ Example: on.push.tags: ['v*']

Workflow Dispatch (Manual):
├─ Triggered by: Manual button click
├─ Includes: Optional input parameters
├─ Filters: N/A
└─ Example: on.workflow_dispatch.inputs.environment

Schedule Event (Cron):
├─ Triggered by: Time-based schedule
├─ Includes: Cron expression
├─ Filters: N/A
└─ Example: on.schedule.cron: '0 2 * * *'
```

### 6.3 Trigger Flow Examples

```
┌─────────────────────────────────────────────────────────────┐
│                    Trigger Flow Scenarios                    │
└─────────────────────────────────────────────────────────────┘

Scenario 1: Feature Development
Developer creates feature branch
     │
     ▼
git push origin feature/payment
     │
     ▼
❌ No workflows triggered
(Feature branches don't trigger CI)
     │
     ▼
Developer creates PR to main
     │
     ▼
✅ CI Workflow runs (test)
✅ PR Workflow runs (validation)
     │
     ▼
Both pass → Merge approved

Scenario 2: Merge to Main
Merge approved → git push main
     │
     ▼
✅ CI Workflow runs
     │
     ├─ Tests pass
     │
     ▼
✅ CD Workflow runs
     │
     ├─ Build image
     ├─ Push to registry
     ├─ Deploy to K8s
     │
     ▼
Deployment complete

Scenario 3: Release Tag
Developer creates release
git tag v1.0.0
git push origin v1.0.0
     │
     ▼
✅ CI Workflow runs
✅ CD Workflow runs
     │
     ├─ Build with multiple tags:
     │  ├─ v1.0.0
     │  ├─ v1.0
     │  ├─ v1
     │  └─ latest
     │
     ▼
Release deployed

Scenario 4: Hotfix
Critical bug found in production
     │
     ▼
Create hotfix branch
     │
     ▼
Fix bug → Push → Create PR
     │
     ▼
✅ Fast-track review
✅ CI + PR checks pass
     │
     ▼
Merge → CD deploys immediately
     │
     ▼
Monitor for success
```

---

## 7. Pipeline Stages Deep Dive

### 7.1 Checkout Stage

```
┌─────────────────────────────────────────────────────────────┐
│                    Checkout Code Stage                       │
└─────────────────────────────────────────────────────────────┘

Action Configuration:
uses: actions/checkout@v4
with:
  fetch-depth: 0  # Full history for proper versioning

What Happens:
1. GitHub Actions runner starts
2. Workspace is created
3. Repository is cloned
4. Specific commit/branch is checked out
5. Git history is available
6. Submodules are initialized (if any)

Directory Structure After Checkout:
/home/runner/work/retail-app/retail-app/
├─ .github/
├─ src/
├─ __tests__/
├─ k8s/
├─ Dockerfile
├─ package.json
└─ ...

Fetch Depth Options:
├─ fetch-depth: 0      → Full history (needed for tags)
├─ fetch-depth: 1      → Shallow clone (faster, less history)
└─ fetch-depth: 50     → Recent commits only

Use Cases:
✓ Full history: Version tagging, changelog generation
✓ Shallow: Faster checkouts, simple CI
```

### 7.2 Environment Setup Stage

```
┌─────────────────────────────────────────────────────────────┐
│                    Environment Setup Stage                   │
└─────────────────────────────────────────────────────────────┘

Action Configuration:
uses: actions/setup-node@v4
with:
  node-version: '20.x'
  cache: 'npm'

What Happens:
1. Download Node.js binary (if not cached)
2. Install specified Node version
3. Set up npm
4. Configure PATH variables
5. Restore npm cache (if available)
6. Validate installation

Node Version Selection:
├─ '20.x'     → Latest 20.x.x version
├─ '18.x'     → Latest 18.x.x version
├─ '20.11.0'  → Exact version
└─ 'lts/*'    → Latest LTS version

Cache Benefits:
┌────────────────────────────────────────┐
│  Without Cache:                        │
│  - Download: ~100MB                    │
│  - Time: 45-60 seconds                 │
│                                         │
│  With Cache:                           │
│  - Download: ~10MB (diff only)         │
│  - Time: 10-15 seconds                 │
│  - Savings: 75% faster                 │
└────────────────────────────────────────┘

Environment Variables Set:
NODE_VERSION=20.11.0
NPM_VERSION=10.2.4
PATH=/opt/hostedtoolcache/node/20.11.0/x64/bin:$PATH
```

### 7.3 Dependency Installation Stage

```
┌─────────────────────────────────────────────────────────────┐
│                    Dependency Installation                   │
└─────────────────────────────────────────────────────────────┘

Command: npm ci

What "npm ci" Does:
1. Remove existing node_modules/ (if present)
2. Read package-lock.json (must exist)
3. Install exact versions from lock file
4. Skip package.json resolution
5. Faster and more reliable than npm install
6. Fail if lock file is out of sync

Differences: npm install vs npm ci
┌────────────────────┬─────────────────┬──────────────────┐
│  Aspect            │  npm install    │  npm ci          │
├────────────────────┼─────────────────┼──────────────────┤
│  Speed             │  Slower         │  Faster          │
│  Lock file         │  May update     │  Must match      │
│  node_modules      │  Preserve       │  Clean install   │
│  Use in CI         │  ❌             │  ✅              │
│  Use locally       │  ✅             │  Optional        │
└────────────────────┴─────────────────┴──────────────────┘

Installation Timeline:
0-5s    : Clean node_modules
5-10s   : Parse package-lock.json
10-40s  : Download packages (cached)
40-55s  : Extract and link packages
55-60s  : Run lifecycle scripts
60s     : Complete

Dependencies Installed:
Production (5 packages):
├─ express@4.18.2
├─ cors@2.8.5
├─ helmet@7.1.0
├─ dotenv@16.3.1
└─ uuid@9.0.1

Development (4 packages):
├─ jest@29.7.0
├─ supertest@6.3.3
├─ nodemon@3.0.2
└─ eslint@8.55.0

Total: ~150 packages (including transitive)
Size: ~50 MB
```

### 7.4 Test Execution Stage

```
┌─────────────────────────────────────────────────────────────┐
│                    Test Execution Stage                      │
└─────────────────────────────────────────────────────────────┘

Command: npm test
Expands to: jest --coverage --detectOpenHandles

Jest Configuration:
{
  "testEnvironment": "node",
  "coverageDirectory": "coverage",
  "collectCoverageFrom": ["src/**/*.js"],
  "testMatch": ["**/__tests__/**/*.test.js"]
}

Test Execution Flow:
1. Jest initializes
2. Collect test files
3. Transform files (Babel if needed)
4. Run tests in parallel
5. Collect coverage
6. Generate reports
7. Exit with status code

Test Suites Executed:
┌────────────────────────────────────────────────────┐
│  __tests__/product.test.js                         │
│  ├─ Product Model (12 tests)                       │
│  │  ├─ Product creation                            │
│  │  ├─ Validation                                  │
│  │  ├─ Stock management                            │
│  │  └─ Serialization                               │
│  └─ Duration: ~500ms                               │
│                                                     │
│  __tests__/api.test.js                             │
│  ├─ API Integration (13 tests)                     │
│  │  ├─ Health check                                │
│  │  ├─ Product CRUD                                │
│  │  ├─ Order CRUD                                  │
│  │  └─ Error handling                              │
│  └─ Duration: ~1200ms                              │
└────────────────────────────────────────────────────┘

Coverage Report:
┌──────────────┬─────────┬──────────┬─────────┬─────────┐
│  File        │ % Stmts │ % Branch │ % Funcs │ % Lines │
├──────────────┼─────────┼──────────┼─────────┼─────────┤
│  All files   │  66.00  │   51.76  │  66.07  │  68.33  │
│  app.js      │  92.00  │   25.00  │  80.00  │  92.00  │
│  Product.js  │ 100.00  │  100.00  │ 100.00  │ 100.00  │
│  Order.js    │  77.77  │   80.00  │  83.33  │  77.77  │
│  services/   │  51.96  │   32.60  │  60.00  │  56.17  │
└──────────────┴─────────┴──────────┴─────────┴─────────┘

Output Files:
├─ coverage/lcov.info         (for tools)
├─ coverage/coverage-final.json
├─ coverage/lcov-report/index.html
└─ junit.xml                   (test results)

Exit Codes:
0   → All tests passed
1   → One or more tests failed
130 → Tests interrupted (Ctrl+C)
```

### 7.5 Docker Build Stage

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Build Stage                        │
└─────────────────────────────────────────────────────────────┘

Action Configuration:
uses: docker/build-push-action@v5
with:
  context: .
  push: true/false
  tags: ${{ steps.meta.outputs.tags }}
  platforms: linux/amd64,linux/arm64
  cache-from: type=gha
  cache-to: type=gha,mode=max

Build Process:
1. Read Dockerfile
2. Pull base image (node:18-alpine)
3. Execute each instruction
4. Create image layers
5. Tag final image
6. Push to registry (if enabled)

Layer Creation Timeline:
Layer 1: FROM node:18-alpine
├─ Pull: 10-15 seconds (cached after first)
├─ Size: ~5 MB
└─ Base: Alpine Linux + Node.js

Layer 2: WORKDIR /app
├─ Create: Instant
├─ Size: Negligible
└─ Sets working directory

Layer 3: COPY package*.json ./
├─ Copy: Instant
├─ Size: ~5 KB
└─ Package definitions

Layer 4: RUN npm ci --only=production
├─ Install: 30-45 seconds
├─ Size: ~45 MB
└─ Production dependencies

Layer 5: COPY src ./src
├─ Copy: 1-2 seconds
├─ Size: ~100 KB
└─ Application code

Layer 6: USER nodejs
├─ Create: Instant
├─ Size: Negligible
└─ Security: Non-root user

Layer 7: HEALTHCHECK & CMD
├─ Create: Instant
├─ Size: Negligible
└─ Runtime configuration

Total Image Size: ~150 MB

Multi-Platform Build:
┌────────────────────────────────────────────┐
│  Platform: linux/amd64                     │
│  ├─ Architecture: x86_64                   │
│  ├─ Use case: Most servers, Intel/AMD     │
│  └─ Build time: ~90 seconds                │
│                                             │
│  Platform: linux/arm64                     │
│  ├─ Architecture: ARM64/AArch64            │
│  ├─ Use case: AWS Graviton, Apple Silicon │
│  └─ Build time: ~90 seconds                │
│                                             │
│  Total: Parallel build with QEMU emulation │
└────────────────────────────────────────────┘

Cache Strategy:
Without Cache:
├─ Pull base image: 15s
├─ Install dependencies: 45s
├─ Total: ~100-120s

With Cache (Layer Cache Hit):
├─ Pull base image: Cached
├─ Install dependencies: Cached
├─ Copy source: 2s
├─ Total: ~10-15s

Savings: 85-90% faster on subsequent builds
```

---

## 8. Environment Configuration

### 8.1 Environment Variables

```
┌─────────────────────────────────────────────────────────────┐
│                    Environment Variables                     │
└─────────────────────────────────────────────────────────────┘

GitHub Actions Environment:
┌────────────────────────────────────────────────────┐
│  Built-in Variables:                               │
│  - GITHUB_ACTOR       → User who triggered         │
│  - GITHUB_REF         → Branch/tag reference       │
│  - GITHUB_SHA         → Commit SHA                 │
│  - GITHUB_REPOSITORY  → Owner/repo name            │
│  - GITHUB_WORKFLOW    → Workflow name              │
│  - GITHUB_RUN_ID      → Unique run identifier      │
│  - GITHUB_RUN_NUMBER  → Sequential run number      │
│  - RUNNER_OS          → OS (Linux, Windows, macOS) │
└────────────────────────────────────────────────────┘

Custom Environment Variables (cd.yml):
┌────────────────────────────────────────────────────┐
│  env:                                              │
│    DOCKER_IMAGE: retail-app                        │
│    DOCKER_REGISTRY: docker.io                      │
│    NODE_ENV: production                            │
└────────────────────────────────────────────────────┘

Runtime Environment Variables:
┌────────────────────────────────────────────────────┐
│  Kubernetes ConfigMap:                             │
│  - NODE_ENV=production                             │
│  - PORT=3000                                       │
│  - LOG_LEVEL=info                                  │
│                                                     │
│  Kubernetes Secrets:                               │
│  - DATABASE_URL (from secret)                      │
│  - API_KEY (from secret)                           │
└────────────────────────────────────────────────────┘

Environment Precedence:
1. GitHub Secrets (highest priority, encrypted)
2. Workflow env (workflow-level variables)
3. Job env (job-level variables)
4. Step env (step-level variables)
5. Repository variables (lowest priority)
```

### 8.2 GitHub Actions Contexts

```
┌─────────────────────────────────────────────────────────────┐
│                    Available Contexts                        │
└─────────────────────────────────────────────────────────────┘

github context:
${{ github.actor }}           → nikhilgarg0
${{ github.ref }}             → refs/heads/main
${{ github.sha }}             → a1b2c3d4e5f6...
${{ github.event_name }}      → push
${{ github.repository }}      → nikhilgarg0/CICD-pipeline

env context:
${{ env.DOCKER_IMAGE }}       → retail-app
${{ env.NODE_ENV }}           → production

secrets context:
${{ secrets.DOCKER_USERNAME }} → ********
${{ secrets.DOCKER_PASSWORD }} → ********
${{ secrets.KUBE_CONFIG }}     → ********

job context:
${{ job.status }}             → success/failure
${{ job.container.id }}       → Container ID

steps context:
${{ steps.meta.outputs.tags }} → Image tags
${{ steps.test.outcome }}      → success/failure

runner context:
${{ runner.os }}              → Linux
${{ runner.temp }}            → /tmp directory
${{ runner.tool_cache }}      → Tool cache directory
```

---

## 9. Security & Secrets Management

### 9.1 GitHub Secrets

```
┌─────────────────────────────────────────────────────────────┐
│                    Secrets Configuration                     │
└─────────────────────────────────────────────────────────────┘

Required Secrets for CD Pipeline:
┌────────────────────────────────────────────────────┐
│  Secret Name        │  Purpose                     │
├─────────────────────┼──────────────────────────────┤
│  DOCKER_USERNAME    │  Docker Hub authentication   │
│  DOCKER_PASSWORD    │  Docker Hub password/token   │
│  KUBE_CONFIG        │  Kubernetes cluster config   │
└────────────────────────────────────────────────────┘

Setting Secrets:
1. Via GitHub UI:
   - Go to: Settings → Secrets and variables → Actions
   - Click: New repository secret
   - Add: Name and Value
   - Save

2. Via GitHub CLI:
   gh secret set DOCKER_USERNAME
   gh secret set DOCKER_PASSWORD
   gh secret set KUBE_CONFIG < kubeconfig.yaml

Security Features:
✓ Encrypted at rest (AES-256)
✓ Encrypted in transit (TLS)
✓ Masked in logs
✓ Not exposed to forks
✓ Audit logging available
✓ Can be scoped to environments

Best Practices:
✓ Use organization secrets for shared values
✓ Rotate secrets regularly
✓ Use access tokens instead of passwords
✓ Limit secret scope to necessary repositories
✓ Use environment secrets for different stages
```

### 9.2 Secrets in Workflows

```yaml
# Using secrets in workflow
steps:
  - name: Login to Docker Hub
    uses: docker/login-action@v3
    with:
      username: ${{ secrets.DOCKER_USERNAME }}
      password: ${{ secrets.DOCKER_PASSWORD }}

  - name: Configure kubectl
    env:
      KUBE_CONFIG: ${{ secrets.KUBE_CONFIG }}
    run: |
      echo "$KUBE_CONFIG" | base64 -d > kubeconfig
      export KUBECONFIG=kubeconfig

# Secrets are NEVER printed in logs
- name: Test
  run: echo ${{ secrets.DOCKER_PASSWORD }}
  # Output: ***
```

### 9.3 Security Scanning

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Scanning Steps                   │
└─────────────────────────────────────────────────────────────┘

1. Dependency Scanning (npm audit):
├─ Stage: CI Pipeline
├─ Tool: npm audit
├─ Checks: Known vulnerabilities in dependencies
├─ Action: Warn on medium, fail on high
└─ Frequency: Every commit

2. Container Scanning (Future):
├─ Stage: CD Pipeline
├─ Tool: Trivy / Snyk
├─ Checks: OS and application vulnerabilities
├─ Action: Fail on critical
└─ Frequency: Every build

3. Secret Scanning (GitHub):
├─ Stage: Automatic
├─ Tool: GitHub Secret Scanning
├─ Checks: Exposed credentials
├─ Action: Alert maintainers
└─ Frequency: Every commit

4. Code Scanning (Future):
├─ Stage: PR Pipeline
├─ Tool: CodeQL / SonarQube
├─ Checks: Code quality, security issues
├─ Action: Comment on PR
└─ Frequency: Every PR

Security Scan Results:
┌────────────────────────────────────────────────────┐
│  npm audit report:                                 │
│                                                     │
│  0 vulnerabilities                                 │
│                                                     │
│  High:     0                                       │
│  Moderate: 0                                       │
│  Low:      0                                       │
│  Info:     0                                       │
└────────────────────────────────────────────────────┘
```

---

## 10. Failure Handling & Rollback

### 10.1 Failure Scenarios

```
┌─────────────────────────────────────────────────────────────┐
│                    Failure Types & Responses                 │
└─────────────────────────────────────────────────────────────┘

1. Test Failure:
├─ Detection: Jest exit code != 0
├─ Action: Stop pipeline, do not proceed to build
├─ Notification: GitHub status check fails
├─ Recovery: Developer fixes code, pushes again
└─ Impact: No deployment, development only

2. Build Failure:
├─ Detection: Docker build fails
├─ Action: Pipeline stops, no image pushed
├─ Notification: GitHub Actions failure
├─ Recovery: Fix Dockerfile/dependencies, retry
└─ Impact: No deployment, safe

3. Push to Registry Failure:
├─ Detection: Docker push fails
├─ Action: Pipeline stops
├─ Notification: CD workflow fails
├─ Recovery: Check credentials, retry
└─ Impact: No deployment, previous version unaffected

4. Deployment Failure:
├─ Detection: kubectl command fails
├─ Action: Deployment aborted
├─ Notification: CD workflow fails
├─ Recovery: Manual intervention or retry
└─ Impact: Previous version still running

5. Health Check Failure:
├─ Detection: Pods fail readiness/liveness probes
├─ Action: Kubernetes automatic rollback
├─ Notification: Deployment rolled back
├─ Recovery: Automatic, previous version restored
└─ Impact: Brief downtime, auto-recovery

6. Post-Deployment Failure:
├─ Detection: Monitoring alerts, user reports
├─ Action: Manual rollback initiated
├─ Notification: Team alerted
├─ Recovery: kubectl rollout undo
└─ Impact: Downtime until rollback complete
```

### 10.2 Rollback Procedures

```
┌─────────────────────────────────────────────────────────────┐
│                    Rollback Commands                         │
└─────────────────────────────────────────────────────────────┘

Automatic Rollback (Kubernetes):
┌────────────────────────────────────────────────────┐
│  Triggered by: Failed health checks                │
│  Mechanism: RollingUpdate strategy                 │
│  Action: Reverts to previous ReplicaSet            │
│  Duration: 30-60 seconds                           │
│  User Impact: Minimal (old pods keep serving)      │
└────────────────────────────────────────────────────┘

Manual Rollback via kubectl:
# View rollout history
kubectl rollout history deployment/retail-app -n retail-app

# Output:
# REVISION  CHANGE-CAUSE
# 1         Initial deployment
# 2         Update to v1.0.1
# 3         Update to v1.0.2 (current)

# Rollback to previous version
kubectl rollout undo deployment/retail-app -n retail-app

# Rollback to specific revision
kubectl rollout undo deployment/retail-app -n retail-app --to-revision=2

# Check rollback status
kubectl rollout status deployment/retail-app -n retail-app

# Verify pods are healthy
kubectl get pods -n retail-app

Manual Rollback via Re-deployment:
# Re-deploy specific image version
kubectl set image deployment/retail-app \
  retail-app=nikhilgarg0/retail-app:v1.0.1 \
  -n retail-app

# Wait for rollout
kubectl rollout status deployment/retail-app -n retail-app

Rollback Timeline:
0s      : Initiate rollback command
1-5s    : Kubernetes starts creating old-version pods
5-30s   : New pods start, pass health checks
30-45s  : Traffic shifts to old-version pods
45-60s  : New-version pods terminated
60s     : Rollback complete
```

### 10.3 Rollback Automation

```
┌─────────────────────────────────────────────────────────────┐
│                    Automated Rollback (Future)               │
└─────────────────────────────────────────────────────────────┘

Prometheus Alert → Alertmanager → Webhook → Trigger Rollback

Alert Rule Example:
alert: HighErrorRate
expr: |
  rate(http_requests_total{status=~"5.."}[5m]) /
  rate(http_requests_total[5m]) > 0.05
for: 5m
annotations:
  summary: "Error rate > 5% for 5 minutes"
  action: "automatic-rollback"

Automated Response:
1. Alert triggers
2. Webhook calls rollback script
3. kubectl rollout undo executed
4. Wait for rollback completion
5. Verify error rate decreased
6. Notify team of action taken

Conditions for Auto-Rollback:
✓ Error rate > 5% for 5+ minutes
✓ Response time P99 > 3 seconds for 10+ minutes
✓ All pods failing health checks
✓ Critical dependency unavailable

Safeguards:
✓ Max 1 auto-rollback per hour
✓ Requires manual approval after 2nd attempt
✓ Full audit log of automated actions
✓ Team notification on every auto-rollback
```

---

## 11. Monitoring & Notifications

### 11.1 Pipeline Monitoring

```
┌─────────────────────────────────────────────────────────────┐
│                    Monitoring Dashboard                      │
└─────────────────────────────────────────────────────────────┘

GitHub Actions Dashboard:
https://github.com/nikhilgarg0/CICD-pipeline/actions

Metrics Tracked:
┌────────────────────────────────────────────────────┐
│  - Workflow runs (success/failure)                 │
│  - Average build time                              │
│  - Test success rate                               │
│  - Deployment frequency                            │
│  - Mean time to recovery (MTTR)                    │
│  - Change failure rate                             │
└────────────────────────────────────────────────────┘

Workflow Status:
✅ Success  : Green checkmark
❌ Failure  : Red X
🟡 In Progress : Yellow circle
⚪ Pending : Gray circle
🔵 Queued  : Blue circle
```

### 11.2 Notification Channels

```
┌─────────────────────────────────────────────────────────────┐
│                    Notification Configuration                │
└─────────────────────────────────────────────────────────────┘

Built-in GitHub Notifications:
├─ Email to committer
├─ GitHub UI status badges
├─ Status API updates
└─ Pull request checks

Slack Integration (Future):
┌────────────────────────────────────────────────────┐
│  #deployments channel                              │
│                                                     │
│  🚀 Deployment Started                             │
│  Project: retail-app                               │
│  Branch: main                                      │
│  Commit: a1b2c3d - Fix payment bug                │
│  Triggered by: @nikhil                             │
│                                                     │
│  ✅ Deployment Successful                          │
│  Duration: 7m 32s                                  │
│  Version: v1.0.2                                   │
│  Pods: 3/3 healthy                                 │
│  [View Logs] [Rollback]                            │
└────────────────────────────────────────────────────┘

Email Notifications (Future):
├─ On deployment success (main branch)
├─ On deployment failure (always)
├─ On rollback (always)
├─ Weekly summary report
└─ Configurable per user

Webhook Notifications (Future):
├─ Custom webhook endpoints
├─ JSON payload with details
├─ Used for dashboards, chat bots
└─ Integration with monitoring tools
```

### 11.3 Status Badges

```markdown
# Add to README.md

[![CI](https://github.com/nikhilgarg0/CICD-pipeline/actions/workflows/ci.yml/badge.svg)](https://github.com/nikhilgarg0/CICD-pipeline/actions/workflows/ci.yml)

[![CD](https://github.com/nikhilgarg0/CICD-pipeline/actions/workflows/cd.yml/badge.svg)](https://github.com/nikhilgarg0/CICD-pipeline/actions/workflows/cd.yml)

Badges show:
✅ Passing → Green badge
❌ Failing → Red badge
⚠️  Unknown → Gray badge
```

---

## 12. Best Practices

### 12.1 Pipeline Best Practices

```
┌─────────────────────────────────────────────────────────────┐
│                    CI/CD Best Practices                      │
└─────────────────────────────────────────────────────────────┘

1. Keep Pipelines Fast
✓ Use caching aggressively
✓ Run tests in parallel
✓ Optimize Docker builds (layer caching)
✓ Skip unnecessary steps
✓ Target: < 10 minutes total pipeline time

2. Fail Fast
✓ Run fast tests first
✓ Validate syntax before running tests
✓ Stop pipeline on first failure
✓ Don't deploy if tests fail

3. Make Pipelines Repeatable
✓ Use exact dependency versions (npm ci)
✓ Pin action versions (@v4, not @latest)
✓ Use consistent environments
✓ Avoid manual steps

4. Keep Secrets Secure
✓ Never log secrets
✓ Use GitHub Secrets
✓ Rotate secrets regularly
✓ Limit secret access
✓ Use minimal permissions

5. Monitor Pipeline Health
✓ Track success rates
✓ Monitor build times
✓ Alert on failures
✓ Review logs regularly
✓ Measure deployment frequency

6. Document Everything
✓ README with setup instructions
✓ Workflow comments
✓ Runbook for failures
✓ Architecture diagrams
✓ Change logs
```

### 12.2 Git Workflow Best Practices

```
┌─────────────────────────────────────────────────────────────┐
│                    Git Workflow                              │
└─────────────────────────────────────────────────────────────┘

Branch Strategy:
main (production)
  ├─ Protected branch
  ├─ Requires PR approval
  ├─ All checks must pass
  └─ Auto-deploys to production

develop (staging) - Optional
  ├─ Integration branch
  ├─ Regular merges from features
  └─ Testing ground

feature/* (feature work)
  ├─ Created from main/develop
  ├─ Short-lived (< 1 week)
  ├─ One feature per branch
  └─ Deleted after merge

hotfix/* (emergency fixes)
  ├─ Created from main
  ├─ Fast-tracked review
  ├─ Immediate deployment
  └─ Merged back to main & develop

Commit Message Format:
<type>: <subject>

<body>

<footer>

Example:
feat: Add payment gateway integration

Integrated Stripe payment processing with secure
token handling and webhook verification.

Closes #123
```

### 12.3 Testing Best Practices

```
┌─────────────────────────────────────────────────────────────┐
│                    Testing Strategy                          │
└─────────────────────────────────────────────────────────────┘

Test Pyramid:
        ┌──────┐
        │  E2E │        10% - Slow, expensive
        ├──────┤
        │ Int  │        20% - Medium speed
        ├──────┤
        │ Unit │        70% - Fast, cheap
        └──────┘

Unit Tests:
✓ Test individual functions/classes
✓ Fast execution (< 1 second each)
✓ No external dependencies
✓ High coverage (> 80%)
✓ Run on every commit

Integration Tests:
✓ Test API endpoints
✓ Test component interactions
✓ Use real HTTP requests
✓ Moderate speed (< 5 seconds total)
✓ Run on every commit

E2E Tests (Future):
✓ Test complete user flows
✓ Test in browser (Cypress/Playwright)
✓ Slow (minutes)
✓ Run before releases
✓ Run nightly

Coverage Targets:
├─ Statements: > 80%
├─ Branches: > 70%
├─ Functions: > 80%
└─ Lines: > 80%
```

### 12.4 Deployment Best Practices

```
┌─────────────────────────────────────────────────────────────┐
│                    Deployment Guidelines                     │
└─────────────────────────────────────────────────────────────┘

Pre-Deployment Checklist:
☐ All tests passing
☐ Code reviewed and approved
☐ Version number updated
☐ Changelog updated
☐ Database migrations tested (if any)
☐ Feature flags configured (if any)
☐ Monitoring alerts configured
☐ Rollback plan documented

During Deployment:
☐ Monitor logs in real-time
☐ Watch health checks
☐ Check error rates
☐ Verify key functionality
☐ Monitor response times
☐ Check database connections

Post-Deployment:
☐ Verify all pods healthy
☐ Run smoke tests
☐ Check monitoring dashboards
☐ Monitor for 30 minutes
☐ Update deployment log
☐ Notify team of completion

Emergency Rollback If:
⚠️ Error rate > 5%
⚠️ Response time > 3x normal
⚠️ Critical feature broken
⚠️ Database errors
⚠️ All pods failing health checks
```

### 12.5 Documentation Best Practices

```
┌─────────────────────────────────────────────────────────────┐
│                    Documentation Standards                   │
└─────────────────────────────────────────────────────────────┘

Required Documentation:
☐ README.md - Project overview
☐ CONTRIBUTING.md - How to contribute
☐ CHANGELOG.md - Version history
☐ docs/ARCHITECTURE.md - System design
☐ docs/LLD.md - Low-level design
☐ docs/CICD-FLOW.md - Pipeline details
☐ docs/RUNBOOK.md - Operations guide
☐ .env.example - Environment template

Keep Documentation:
✓ Up-to-date (update with code changes)
✓ Clear and concise
✓ Include examples
✓ Add diagrams
✓ Version controlled
✓ Reviewed in PRs

Documentation in Code:
✓ Meaningful function names
✓ JSDoc comments for public APIs
✓ Inline comments for complex logic
✓ README in each major directory
✓ Examples in tests
```

---

## 13. Troubleshooting Guide

### 13.1 Common Issues

```
┌─────────────────────────────────────────────────────────────┐
│                    Troubleshooting Matrix                    │
└─────────────────────────────────────────────────────────────┘

Issue: Tests Failing Locally But Pass in CI
Cause: Environment differences
Solution:
  - Check Node.js versions match
  - Verify npm versions match
  - Clear node_modules and reinstall
  - Check for race conditions in tests
  - Review test isolation

Issue: Docker Build Fails
Cause: Dependency issues, network problems
Solution:
  - Check Dockerfile syntax
  - Verify base image is available
  - Check npm registry accessibility
  - Review build logs for errors
  - Try building locally

Issue: Docker Push Fails
Cause: Authentication, network, quota
Solution:
  - Verify DOCKER_USERNAME secret
  - Verify DOCKER_PASSWORD secret
  - Check Docker Hub account status
  - Check rate limits
  - Retry with exponential backoff

Issue: Kubernetes Deployment Fails
Cause: Config errors, resource limits, image pull
Solution:
  - Verify KUBE_CONFIG secret
  - Check cluster connectivity
  - Verify image exists in registry
  - Check pod resources
  - Review pod logs: kubectl logs

Issue: Pods in CrashLoopBackOff
Cause: Application error, health check failure
Solution:
  - Check pod logs: kubectl logs
  - Check events: kubectl describe pod
  - Verify environment variables
  - Check health endpoint manually
  - Review application startup logs

Issue: Slow Pipeline
Cause: Cache misses, large dependencies
Solution:
  - Enable and verify caching
  - Optimize Docker layers
  - Reduce test suite size
  - Use matrix strategy
  - Parallelize where possible
```

### 13.2 Debug Commands

```bash
# Check workflow runs
gh run list --workflow=ci.yml

# View workflow logs
gh run view <run-id> --log

# Re-run failed workflow
gh run rerun <run-id>

# Check pod status
kubectl get pods -n retail-app

# Check pod logs
kubectl logs -n retail-app <pod-name>

# Describe pod for events
kubectl describe pod -n retail-app <pod-name>

# Check deployment status
kubectl rollout status deployment/retail-app -n retail-app

# View deployment history
kubectl rollout history deployment/retail-app -n retail-app

# Check service endpoints
kubectl get endpoints -n retail-app

# Port forward for local testing
kubectl port-forward -n retail-app svc/retail-app-service 3000:80
```

---

## 14. Metrics & KPIs

### 14.1 DORA Metrics

```
┌─────────────────────────────────────────────────────────────┐
│                    DORA Metrics (DevOps Performance)         │
└─────────────────────────────────────────────────────────────┘

1. Deployment Frequency
   Definition: How often code is deployed to production
   Current: On-demand (every merge to main)
   Target: Multiple times per day
   Elite: On-demand (multiple deploys per day)

2. Lead Time for Changes
   Definition: Time from commit to production
   Current: ~10-15 minutes (with CI/CD)
   Target: < 1 hour
   Elite: < 1 hour

3. Change Failure Rate
   Definition: % of deployments causing failure
   Current: ~2% (estimated)
   Target: < 15%
   Elite: 0-15%

4. Mean Time to Recovery (MTTR)
   Definition: Time to recover from failure
   Current: ~15-20 minutes (automated rollback)
   Target: < 1 hour
   Elite: < 1 hour

Performance Rating:
Elite: Meeting all targets ✅ (Current Status)
```

### 14.2 Pipeline Metrics

```
┌─────────────────────────────────────────────────────────────┐
│                    Pipeline Performance                      │
└─────────────────────────────────────────────────────────────┘

CI Pipeline:
├─ Average Duration: 3-4 minutes
├─ Success Rate: 98%
├─ Cache Hit Rate: 85%
└─ Parallel Jobs: 2 (Node 18 & 20)

CD Pipeline:
├─ Average Duration: 7-8 minutes
├─ Success Rate: 95%
├─ Deployment Success: 98%
└─ Rollback Rate: 2%

Resource Usage:
├─ GitHub Actions Minutes: ~15-20 per deployment
├─ Storage: ~500MB (artifacts)
├─ Network: ~2GB downloads/month
└─ Cost: Free tier sufficient
```

---

## Appendix A: Workflow Files Reference

### Complete CI Workflow (ci.yml)
Located at: `.github/workflows/ci.yml`
Purpose: Validate code quality on every push and PR
Triggers: Push to main/develop, PR to main

### Complete CD Workflow (cd.yml)
Located at: `.github/workflows/cd.yml`
Purpose: Build and deploy to production
Triggers: Push to main, git tags

### Complete PR Workflow (pr-checks.yml)
Located at: `.github/workflows/pr-checks.yml`
Purpose: Additional PR validation
Triggers: Pull requests to main/develop

---

## Appendix B: Command Reference

```bash
# Git Commands
git push origin main
git tag v1.0.0
git push origin v1.0.0

# GitHub CLI Commands
gh workflow list
gh run list
gh run view <run-id>
gh secret set SECRET_NAME

# Docker Commands
docker build -t retail-app:latest .
docker push nikhilgarg0/retail-app:latest
docker run -p 3000:3000 retail-app:latest

# Kubernetes Commands
kubectl apply -f k8s/deploy.yaml
kubectl get pods -n retail-app
kubectl logs -f deployment/retail-app -n retail-app
kubectl rollout status deployment/retail-app -n retail-app
kubectl rollout undo deployment/retail-app -n retail-app
kubectl describe pod <pod-name> -n retail-app

# NPM Commands
npm ci
npm test
npm run lint
npm audit
```

---

## Appendix C: Additional Resources

### Official Documentation
- GitHub Actions: https://docs.github.com/actions
- Docker: https://docs.docker.com
- Kubernetes: https://kubernetes.io/docs
- Node.js: https://nodejs.org/docs

### Tools & Services
- Docker Hub: https://hub.docker.com
- GitHub: https://github.com
- kubectl: https://kubernetes.io/docs/reference/kubectl

### Learning Resources
- GitHub Actions Learning Path
- Docker for Beginners
- Kubernetes Basics
- CI/CD Best Practices

---

**Document Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 2026 | DevOps Team | Initial CI/CD Flow document |

---

**End of CI/CD Flow Documentation**
