\# Kubernetes Deployment Guide



This directory contains Kubernetes manifests for deploying the Retail App.



\## Prerequisites



\- Kubernetes cluster (local or cloud)

\- kubectl installed and configured

\- Docker image pushed to Docker Hub



\## Quick Deploy (All-in-One)

```bash

\# Deploy everything at once

kubectl apply -f k8s/deploy.yaml



\# Check deployment

kubectl get all -n retail-app



\# Get service URL

kubectl get svc -n retail-app

```



\## Step-by-Step Deploy

```bash

\# 1. Create namespace

kubectl apply -f k8s/namespace.yaml



\# 2. Create configmap

kubectl apply -f k8s/configmap.yaml



\# 3. Create secrets (if needed)

kubectl apply -f k8s/secret.yaml



\# 4. Create deployment

kubectl apply -f k8s/deployment.yaml



\# 5. Create service

kubectl apply -f k8s/service.yaml



\# 6. Create HPA (optional)

kubectl apply -f k8s/hpa.yaml



\# 7. Create ingress (optional)

kubectl apply -f k8s/ingress.yaml



\# 8. Create network policy (optional)

kubectl apply -f k8s/networkpolicy.yaml

```



\## Update Deployment

```bash

\# Update image

kubectl set image deployment/retail-app retail-app=YOUR\_USERNAME/retail-app:v2 -n retail-app



\# Check rollout status

kubectl rollout status deployment/retail-app -n retail-app



\# Rollback if needed

kubectl rollout undo deployment/retail-app -n retail-app

```



\## Monitoring

```bash

\# Check pods

kubectl get pods -n retail-app



\# View logs

kubectl logs -f deployment/retail-app -n retail-app



\# Describe pod

kubectl describe pod <pod-name> -n retail-app



\# Get events

kubectl get events -n retail-app --sort-by='.lastTimestamp'

```



\## Scaling

```bash

\# Manual scaling

kubectl scale deployment/retail-app --replicas=5 -n retail-app



\# Auto-scaling (if HPA is configured)

kubectl get hpa -n retail-app

kubectl describe hpa retail-app-hpa -n retail-app

```



\## Access Application

```bash

\# Port forward (for local testing)

kubectl port-forward -n retail-app svc/retail-app-service 3000:80



\# Then access: http://localhost:3000

```



\## Cleanup

```bash

\# Delete everything

kubectl delete namespace retail-app



\# Or delete specific resources

kubectl delete -f k8s/deploy.yaml

```



\## Troubleshooting

```bash

\# Pod not starting

kubectl describe pod <pod-name> -n retail-app

kubectl logs <pod-name> -n retail-app



\# Service not accessible

kubectl get svc -n retail-app

kubectl describe svc retail-app-service -n retail-app



\# Check events

kubectl get events -n retail-app

```



\## Configuration



Before deploying, update:

1\. `deployment.yaml` - Replace `YOUR\_DOCKERHUB\_USERNAME` with your Docker Hub username

2\. `ingress.yaml` - Replace `retail-app.example.com` with your domain

3\. `secret.yaml` - Add base64 encoded secrets if needed



\## Notes



\- Default replicas: 3

\- Resource limits configured

\- Health checks enabled (liveness, readiness, startup)

\- Auto-scaling configured (2-10 replicas)

\- Network policies for security

