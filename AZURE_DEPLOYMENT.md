# Azure 배포 가이드

## 개요
이 프로젝트는 Azure App Service 또는 Azure Container Instances에 배포할 수 있도록 구성되어 있습니다.

## 사전 요구사항

### 1. Azure 계정 및 리소스
- Azure 구독
- Azure Container Registry (ACR)
- Azure App Service 또는 Container Instances 리소스 그룹

### 2. GitHub Secrets 설정
GitHub 저장소의 Settings > Secrets and variables > Actions에서 다음 secrets를 설정해야 합니다:

```
REGISTRY_LOGIN_SERVER: your-registry.azurecr.io
REGISTRY_USERNAME: your-acr-username
REGISTRY_PASSWORD: your-acr-password
AZURE_WEBAPP_PUBLISH_PROFILE: your-app-service-publish-profile
AZURE_CREDENTIALS: your-azure-service-principal-credentials
RESOURCE_GROUP: your-resource-group-name
```

## 배포 방법

### 방법 1: Azure App Service (권장)

1. **Azure App Service 생성**
   ```bash
   az group create --name myResourceGroup --location eastus
   az appservice plan create --name myAppServicePlan --resource-group myResourceGroup --sku B1 --is-linux
   az webapp create --resource-group myResourceGroup --plan myAppServicePlan --name your-app-name --deployment-container-image-name your-registry.azurecr.io/your-app-name:latest
   ```

2. **컨테이너 설정 구성**
   ```bash
   az webapp config container set --name your-app-name --resource-group myResourceGroup --docker-custom-image-name your-registry.azurecr.io/your-app-name:latest
   ```

3. **환경 변수 설정**
   ```bash
   az webapp config appsettings set --name your-app-name --resource-group myResourceGroup --settings NODE_ENV=production PORT=3000
   ```

### 방법 2: Azure Container Instances

```bash
az container create \
  --resource-group myResourceGroup \
  --name your-app-name \
  --image your-registry.azurecr.io/your-app-name:latest \
  --dns-name-label your-app-name \
  --ports 3000 \
  --environment-variables NODE_ENV=production PORT=3000
```

## 로컬 테스트

### 프로덕션 빌드 테스트
```bash
# 프로덕션용 docker-compose 실행
docker-compose -f docker-compose.prod.yml up --build

# 또는 직접 Docker 실행
docker build -t your-app-name .
docker run -p 3000:3000 -e NODE_ENV=production your-app-name
```

### 헬스체크 테스트
```bash
curl http://localhost:3000/api/health
```

## 모니터링 및 로그

### Azure App Service
- Azure Portal > App Service > Monitoring
- Application Insights 연동 권장

### Azure Container Instances
```bash
# 로그 확인
az container logs --resource-group myResourceGroup --name your-app-name

# 상태 확인
az container show --resource-group myResourceGroup --name your-app-name
```

## 문제 해결

### 일반적인 문제들

1. **포트 바인딩 오류**
   - Azure App Service에서 WEBSITES_PORT 환경변수 설정
   - Container Instances에서 올바른 포트 매핑 확인

2. **메모리 부족**
   - App Service Plan의 SKU 업그레이드
   - Container Instances의 메모리 제한 조정

3. **환경 변수 문제**
   - Azure Portal에서 App Settings 확인
   - GitHub Secrets 설정 재확인

### 로그 확인
```bash
# Docker 컨테이너 로그
docker logs <container-id>

# Azure CLI를 통한 로그
az webapp log tail --name your-app-name --resource-group myResourceGroup
```

## 보안 고려사항

1. **비밀번호 및 API 키**
   - 환경 변수로 관리
   - Azure Key Vault 사용 권장

2. **네트워크 보안**
   - Azure Application Gateway 사용
   - WAF (Web Application Firewall) 활성화

3. **컨테이너 보안**
   - 정기적인 베이스 이미지 업데이트
   - 취약점 스캔 도구 사용

## 비용 최적화

1. **App Service Plan**
   - 개발/테스트 환경: B1 (Basic)
   - 프로덕션 환경: S1 (Standard) 이상

2. **Container Instances**
   - 사용량 기반 과금
   - 예약 인스턴스 고려

## 추가 리소스

- [Azure App Service 문서](https://docs.microsoft.com/azure/app-service/)
- [Azure Container Instances 문서](https://docs.microsoft.com/azure/container-instances/)
- [Azure Container Registry 문서](https://docs.microsoft.com/azure/container-registry/)
- [GitHub Actions for Azure](https://github.com/marketplace?type=actions&query=azure)
