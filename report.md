# DevSecOps Candidate Task — Security Summary (Draft)

## Overview
Built a minimal Node.js/Express microservice with a MongoDB backend. The project demonstrates containerization, basic image hardening, a CI pipeline with static analysis (Semgrep) and image scanning (Trivy), and Kubernetes manifests that include basic security controls (non-root containers, resource limits, NetworkPolicy).

## Quick results (demo)
- Local demo works via Docker Compose (Node + Mongo).
- Dockerfile: multi-stage build + non-root user.
- CI: skeleton GitHub Actions with Semgrep and Trivy steps.

## Identified risks & mitigations
1. **Image vulnerabilities (CVEs)**: Use Trivy in CI to fail on HIGH/CRITICAL. Prefer minimal base images and multi-stage builds.
2. **Running as root**: Dockerfile creates non-root user; k8s manifests set runAsNonRoot true for app container.
3. **Secrets in code**: Use GitHub Secrets for CI and consider Vault/SealedSecrets for cluster secrets in production.
4. **Network exposure**: NetworkPolicy restricts pod-to-pod communication; keep services internal where possible.
5. **Runtime threats**: Recommend adding Falco for runtime detection and Datadog/Prometheus for observability.

## Next recommended steps
- Run Trivy and fix any HIGH/CRITICAL issues.
- Add Semgrep custom rules for sensitive data patterns.
- Integrate tfsec/checkov for Terraform (if using cloud).
- Implement Vault or SealedSecrets for secret lifecycle.
