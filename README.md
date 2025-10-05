# DevSecOps Candidate Assignment – Report

## 📌 Introduction
This repository implements the DevSecOps task provided in the pdf.  
The goal is to demonstrate secure containerization, Kubernetes security, CI/CD with security gates, Infrastructure-as-Code, monitoring, compliance, and audit logging for a sample application.

## 📌 Approach
I followed a step-by-step DevSecOps pipeline:

1. **Application & Containerization**
   - Built a minimal Node.js + MongoDB service.
   - Dockerized it using a multi-stage build, minimal base image (Alpine), and non-root runtime.
   - Hardened the Docker image by using `.dockerignore`, non-root user, and smallest possible footprint.

2. **Image Hardening & Scanning**
   - Used **Trivy** to scan container images.
   - Configured CI/CD to **fail on HIGH/CRITICAL vulnerabilities**.
   - Locked dependencies via `package-lock.json` (when available) for reproducibility.

3. **Kubernetes Deployment**
   - Created manifests with **securityContext** (non-root, no privilege escalation, read-only filesystem, dropped capabilities).
   - Added **resource requests/limits** for CPU/memory.
   - Defined **NetworkPolicy** to restrict communication (API ↔ Mongo only).
   - Namespaced deployments (`secure-app`).

4. **CI/CD Security Gates**
   - Implemented GitHub Actions pipeline:
     - **Semgrep** for static code analysis.
     - **Trivy** for container scanning.
     - Fail pipeline if vulnerabilities are detected.
   - Publish images to GitHub Container Registry (GHCR) on success.

5. **Infrastructure-as-Code (Terraform)**
   - Wrote Terraform for **EKS cluster provisioning** (VPC + private subnets + managed node groups).
   - Assumed AWS account with IAM roles exists.
   - Plan for **tfsec/checkov** integration for IaC scanning.

6. **Monitoring & Logging**
   - Added **Datadog agent** for Kubernetes monitoring (metrics, logs, APM).
   - Alternative: Prometheus + Grafana stack.
   - Log collection centralized (stdout/stderr to Datadog or ELK).
   - Health endpoint `/health` for liveness probes.

7. **Compliance & Security Baselines**
   - Followed **CIS Benchmarks for Docker & Kubernetes**:
     - Non-root containers
     - Resource requests/limits
     - NetworkPolicy
     - RBAC & Service Accounts
   - Pipeline gates ensure CVEs are blocked before production.
   - Future: OPA/Gatekeeper to enforce security policies at admission level.

8. **Audit Logging**
   - Blue/Green or Canary Deployment:
   - Use Kubernetes Deployment strategies:
   strategy:
   type: RollingUpdate
   rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1

   - Or implement with Argo Rollouts for advanced canary.
   - Deploy Falco DaemonSet to detect suspicious syscalls (e.g., pod spawning a shell).
   - Spot nodes for non-critical workloads.
   - Right-size pods with requests/limits.
   - Use VPA/HPA for autoscaling.

## 📌 Assumptions
- Environment for testing is **local developer laptop** with Docker Desktop + WSL2.
- Kubernetes testing is done with **minikube** or **kind**.
- MongoDB runs as a demo pod; in production, we recommend **managed DB** (Mongo Atlas / DocumentDB / RDS).
- GitHub Actions pipeline is available for CI/CD; evaluator can review pipeline logs instead of fully deploying cloud infra.
- AWS account may not be available for actual EKS creation — Terraform is provided as **skeleton code**.
- Monitoring/Datadog integration is described and partially configured; full setup requires a Datadog API key.

---

## 📌 Environment Required to Test
- **Docker Desktop** with Kubernetes enabled (or minikube/kind/k3d).
- **kubectl** CLI.
- **Node.js/npm** (only needed if modifying application).
- **Trivy** (optional locally, but pipeline runs it automatically).
- **GitHub Actions** for CI/CD validation.

---

## 📌 Steps to Test Locally

### 1. Clone the repo & Run App Locally with Docker Compose
docker compose up --build
Visit: http://localhost:3000
Expected response:
<img width="924" height="284" alt="image" src="https://github.com/user-attachments/assets/c8afc86b-1f5c-4552-8d09-76e2790f5982" />

### 2. Build Image & Scan
docker build -t secure-node:local .
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --severity CRITICAL --exit-code 1 secure-node:local

### 3. Deploy on Kubernetes
kubectl apply -f k8s/namespace.yaml
kubectl create secret generic mongo-secret -n secure-app \
  --from-literal=uri="mongodb://mongo:27017/devdb"
kubectl apply -f k8s/
kubectl get pods -n secure-app

Access API (if using minikube):
minikube service api-svc -n secure-app
<img width="1912" height="456" alt="image" src="https://github.com/user-attachments/assets/a7c7947a-7388-4ead-bdeb-10b6dc2c8aca" />
<img width="1278" height="89" alt="image" src="https://github.com/user-attachments/assets/34c5b4f6-39ca-4725-a0c0-a691d9a875c4" />

GitHub Actions Pipeline is also successsful:
<img width="1659" height="508" alt="image" src="https://github.com/user-attachments/assets/5954e92a-f771-43ca-8dfd-785132f9a3f0" />


