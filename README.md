# LeasePilot

LeasePilot is a portfolio-ready property-management SaaS for landlords, tenants, and rental applicants. It combines searchable listings, leasing decisions, service requests, and role-aware dashboards in a responsive React interface backed by an ownership-enforcing Express API.

## Screenshots

Add project screenshots here after running the seeded application:

- Sign-in and role picker
- Landlord portfolio dashboard
- Split property list and simulated map
- Application review and maintenance workflow
- Light and dark themes

## Highlights

- JWT authentication with bcrypt password hashing, role guards, auth rate limiting, and consistent `401`/`403` responses
- Server-side property search, range filters, sorting, pagination, lean reads, and query-friendly MongoDB indexes
- Synchronized URL filters, debounced text search, shortlist persistence, responsive list/map/split views, and keyboard-accessible pins
- Transactional approval workflow that prevents double occupancy, promotes approved applicants to tenants, and rejects competing pending applications
- Tenant ownership checks, landlord property checks, and validated maintenance status transitions
- System-aware light/dark theme with persistent user preference across public and authenticated screens
- Separate development and production containers with Vite/tsx hot reload and an Nginx production frontend

## Architecture

The repository is split into `frontend` and `backend` applications. The React client uses lazy route modules, Redux Toolkit for durable application state, focused API utilities, CSS Modules for component styles, and global tokens for theming. The API follows route → service → model boundaries: routes handle HTTP concerns, services own business rules, Mongoose models define persistence and indexes, and middleware owns authentication, validation, and errors.

```text
leasepilot/
├── frontend/src/{api,app,components,features,hooks,layouts,pages,routes,styles,types}
├── backend/src/{config,middleware,models,routes,services,utils,validators}
├── backend/tests
├── scripts
├── docker-compose.yml
└── docker-compose.dev.yml
```

## Data model

- **User** stores normalized, uniquely indexed email, protected password hash, role, contact details, and optional active rental.
- **Property** belongs to a landlord, has a unique slug, listing state, rental facts, image URLs, and simulated map coordinates. A text index supports title/address/city/description queries; a compound index supports the common listing filters.
- **RentalApplication** links an applicant, property, and landlord. A partial unique index prevents duplicate pending applications for one applicant/property pair.
- **MaintenanceTicket** links a tenant, landlord, and rented property. Status/priority indexes support landlord operational views.

## Permissions

| Capability                             | Landlord | Tenant | Applicant |
| -------------------------------------- | -------: | -----: | --------: |
| Browse available listings              |      Yes |    Yes |       Yes |
| Manage owned listings                  |      Yes |     No |        No |
| Submit/track applications              |       No |    Yes |       Yes |
| Review applications for owned property |      Yes |     No |        No |
| Create ticket for active rental        |       No |    Yes |        No |
| Edit/delete own open ticket            |       No |    Yes |        No |
| Move owned-property ticket status      |      Yes |     No |        No |

The backend performs every permission and ownership decision; client-side guards only improve navigation.

## API

All application endpoints are under `/api/v1`.

| Method           | Endpoint                   | Purpose                                  |
| ---------------- | -------------------------- | ---------------------------------------- |
| POST             | `/auth/register`           | Create an account                        |
| POST             | `/auth/login`              | Return user and JWT                      |
| GET              | `/auth/me`                 | Return current user                      |
| POST             | `/auth/logout`             | Complete client logout flow              |
| GET/POST         | `/properties`              | Search or create properties              |
| GET/PATCH/DELETE | `/properties/:id`          | Read, edit, or archive a property        |
| POST/GET         | `/applications`            | Submit or list role-visible applications |
| GET              | `/applications/:id`        | Read an owned/own application            |
| PATCH            | `/applications/:id/status` | Approve or reject as owner-landlord      |
| POST/GET         | `/maintenance`             | Create or list role-visible tickets      |
| GET/PATCH/DELETE | `/maintenance/:id`         | Read/edit/delete eligible ticket         |
| PATCH            | `/maintenance/:id/status`  | Landlord ticket transition               |
| GET              | `/dashboard`               | Role-specific dashboard snapshot         |
| GET              | `/health`                  | Container health check                   |

Errors use `{ "error": { "code": "...", "message": "...", "details": [] } }`.

## Search and indexing

`GET /properties` accepts `q`, `city`, `minRent`, `maxRent`, `minBedrooms`, `minBathrooms`, `minArea`, `maxArea`, comma-separated `amenities`, `status`, `sort`, `page`, and `pageSize`. Zod validates and caps page size at 50. Mongoose performs filtering and pagination; the client preserves the resulting query string when opening a listing and returning.

## Workflows

Applications begin as `pending`. Approval runs in a MongoDB transaction: LeasePilot verifies landlord ownership and availability, marks the property rented, assigns the tenant, upgrades the applicant role, and rejects competing pending applications. Rejection records review metadata without changing the property.

Tickets can only be created by the current tenant for their active rented property. Tenants may change or delete only open tickets. Landlords may move `open → in progress`, `in progress → open`, or `in progress → resolved`; resolved tickets are terminal.

## Docker quick start

1. Copy `.env.example` to `.env` and replace `JWT_SECRET`.
2. Run `docker compose up --build -d`.
3. Wait for the API health check; demo data is seeded automatically and idempotently.
4. Open [http://localhost:8080](http://localhost:8080).

Production Compose persists MongoDB data and gates API/frontend startup through health checks.

## Hot-reload development

Run `docker compose -f docker-compose.dev.yml up --build`, `make dev`, `./scripts/dev.sh`, or `./scripts/dev.ps1`. Open [http://localhost:5173](http://localhost:5173). Backend `tsx watch` and polling-enabled Vite HMR reflect normal source edits without image rebuilds. Rebuild after dependency, Dockerfile, or environment changes.

## Local setup without Docker

Run MongoDB locally, copy `.env.example` to `.env`, change `MONGODB_URI` to `mongodb://localhost:27017/leasepilot`, then:

```sh
npm install
npm install --prefix backend
npm install --prefix frontend
npm run build --prefix backend
npm run seed:dev --prefix backend
npm run dev --prefix backend
npm run dev --prefix frontend
```

## AWS deployment with commands only (EC2 + Docker Compose)

Run these commands in PowerShell from the LeasePilot repository root. They use the default VPC, an Ubuntu 24.04 EC2 instance, a 30 GB persistent EBS root disk, and the existing production Docker Compose stack.

### 1. Configure AWS and create the EC2 instance

```powershell
aws configure

$AWS_REGION = "ap-south-1"
$KEY_NAME = "leasepilot-key"
$KEY_FILE = Join-Path (Get-Location) "leasepilot-key.pem"
$SECURITY_GROUP_NAME = "leasepilot-web-sg"
$MY_IP = (Invoke-RestMethod "https://checkip.amazonaws.com").Trim()

$VPC_ID = aws ec2 describe-vpcs `
  --region $AWS_REGION `
  --filters "Name=is-default,Values=true" `
  --query "Vpcs[0].VpcId" `
  --output text

$SUBNET_ID = aws ec2 describe-subnets `
  --region $AWS_REGION `
  --filters "Name=vpc-id,Values=$VPC_ID" `
  --query "Subnets[0].SubnetId" `
  --output text

aws ec2 create-key-pair `
  --region $AWS_REGION `
  --key-name $KEY_NAME `
  --key-type rsa `
  --key-format pem `
  --query "KeyMaterial" `
  --output text | Set-Content -Encoding ascii $KEY_FILE

icacls $KEY_FILE /inheritance:r
icacls $KEY_FILE /grant:r "${env:USERNAME}:(R)"

$SECURITY_GROUP_ID = aws ec2 create-security-group `
  --region $AWS_REGION `
  --group-name $SECURITY_GROUP_NAME `
  --description "LeasePilot web and SSH access" `
  --vpc-id $VPC_ID `
  --query "GroupId" `
  --output text

aws ec2 authorize-security-group-ingress `
  --region $AWS_REGION `
  --group-id $SECURITY_GROUP_ID `
  --protocol tcp `
  --port 22 `
  --cidr "${MY_IP}/32"

aws ec2 authorize-security-group-ingress `
  --region $AWS_REGION `
  --group-id $SECURITY_GROUP_ID `
  --protocol tcp `
  --port 80 `
  --cidr "0.0.0.0/0"

$AMI_ID = aws ssm get-parameter `
  --region $AWS_REGION `
  --name "/aws/service/canonical/ubuntu/server/24.04/stable/current/amd64/hvm/ebs-gp3/ami-id" `
  --query "Parameter.Value" `
  --output text

$INSTANCE_ID = aws ec2 run-instances `
  --region $AWS_REGION `
  --image-id $AMI_ID `
  --instance-type t3.small `
  --key-name $KEY_NAME `
  --security-group-ids $SECURITY_GROUP_ID `
  --subnet-id $SUBNET_ID `
  --associate-public-ip-address `
  --block-device-mappings "DeviceName=/dev/sda1,Ebs={VolumeSize=30,VolumeType=gp3,DeleteOnTermination=true}" `
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=LeasePilot}]" `
  --query "Instances[0].InstanceId" `
  --output text

aws ec2 wait instance-status-ok `
  --region $AWS_REGION `
  --instance-ids $INSTANCE_ID

$PUBLIC_IP = aws ec2 describe-instances `
  --region $AWS_REGION `
  --instance-ids $INSTANCE_ID `
  --query "Reservations[0].Instances[0].PublicIpAddress" `
  --output text

$PUBLIC_IP
```

### 2. Install Docker on EC2

```powershell
ssh -i $KEY_FILE "ubuntu@$PUBLIC_IP" "sudo apt-get update && sudo apt-get install -y ca-certificates curl"

ssh -i $KEY_FILE "ubuntu@$PUBLIC_IP" "sudo install -m 0755 -d /etc/apt/keyrings && sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc && sudo chmod a+r /etc/apt/keyrings/docker.asc"

ssh -i $KEY_FILE "ubuntu@$PUBLIC_IP" "echo 'deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu noble stable' | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null && sudo apt-get update && sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin && sudo usermod -aG docker ubuntu"
```

### 3. Upload and start LeasePilot

```powershell
ssh -i $KEY_FILE "ubuntu@$PUBLIC_IP" "mkdir -p /home/ubuntu/leasepilot"

tar.exe --exclude=node_modules --exclude=backend/node_modules --exclude=frontend/node_modules --exclude=dist --exclude=backend/dist --exclude=frontend/dist --exclude=.git --exclude=.npm-cache -czf leasepilot-deploy.tar.gz .

scp -i $KEY_FILE leasepilot-deploy.tar.gz "ubuntu@${PUBLIC_IP}:/tmp/leasepilot-deploy.tar.gz"

ssh -i $KEY_FILE "ubuntu@$PUBLIC_IP" "tar -xzf /tmp/leasepilot-deploy.tar.gz -C /home/ubuntu/leasepilot && rm /tmp/leasepilot-deploy.tar.gz"

Remove-Item -LiteralPath leasepilot-deploy.tar.gz

ssh -i $KEY_FILE "ubuntu@$PUBLIC_IP" "cd /home/ubuntu/leasepilot && printf 'JWT_SECRET=%s\nCORS_ORIGIN=http://$PUBLIC_IP\nWEB_PORT=80\n' `$(openssl rand -hex 32) > .env && sudo docker compose up --build -d"

ssh -i $KEY_FILE "ubuntu@$PUBLIC_IP" "cd /home/ubuntu/leasepilot && sudo docker compose ps && sudo docker compose exec api node -e \"fetch('http://localhost:4000/api/v1/health').then(async response => { console.log(await response.text()); if (!response.ok) process.exit(1); })\""

Start-Process "http://$PUBLIC_IP"
```

### 4. Deploy later updates

```powershell
tar.exe --exclude=node_modules --exclude=backend/node_modules --exclude=frontend/node_modules --exclude=dist --exclude=backend/dist --exclude=frontend/dist --exclude=.git --exclude=.npm-cache -czf leasepilot-deploy.tar.gz .

scp -i $KEY_FILE leasepilot-deploy.tar.gz "ubuntu@${PUBLIC_IP}:/tmp/leasepilot-deploy.tar.gz"

ssh -i $KEY_FILE "ubuntu@$PUBLIC_IP" "tar -xzf /tmp/leasepilot-deploy.tar.gz -C /home/ubuntu/leasepilot && rm /tmp/leasepilot-deploy.tar.gz"

Remove-Item -LiteralPath leasepilot-deploy.tar.gz

ssh -i $KEY_FILE "ubuntu@$PUBLIC_IP" "cd /home/ubuntu/leasepilot && sudo docker compose up --build -d && sudo docker image prune -f"
```

### 5. View logs or stop the application

```powershell
ssh -i $KEY_FILE "ubuntu@$PUBLIC_IP" "cd /home/ubuntu/leasepilot && sudo docker compose logs -f"

ssh -i $KEY_FILE "ubuntu@$PUBLIC_IP" "cd /home/ubuntu/leasepilot && sudo docker compose down"
```

### 6. Delete the AWS resources

```powershell
aws ec2 terminate-instances `
  --region $AWS_REGION `
  --instance-ids $INSTANCE_ID

aws ec2 wait instance-terminated `
  --region $AWS_REGION `
  --instance-ids $INSTANCE_ID

aws ec2 delete-security-group `
  --region $AWS_REGION `
  --group-id $SECURITY_GROUP_ID

aws ec2 delete-key-pair `
  --region $AWS_REGION `
  --key-name $KEY_NAME

Remove-Item -LiteralPath $KEY_FILE
```

## Environment variables

| Name             | Meaning                                | Default/example                    |
| ---------------- | -------------------------------------- | ---------------------------------- |
| `NODE_ENV`       | Runtime behavior                       | `development`                      |
| `PORT`           | API port                               | `4000`                             |
| `MONGODB_URI`    | MongoDB connection                     | `mongodb://mongo:27017/leasepilot` |
| `JWT_SECRET`     | Signing key, minimum 32 characters     | required in production             |
| `JWT_EXPIRES_IN` | Access-token lifetime                  | `1d`                               |
| `CORS_ORIGIN`    | Allowed web origin(s), comma separated | `http://localhost:5173`            |
| `VITE_API_URL`   | Browser API base URL                   | `http://localhost:4000/api/v1`     |

## Demo accounts

All use password `Demo123!`:

- `landlord@leasepilot.demo`
- `tenant@leasepilot.demo`
- `applicant@leasepilot.demo`

The idempotent seed creates 12 homes, three application outcomes, three ticket states, and the three accounts. It updates fixed demo records and clears/rebuilds only their workflow fixtures.

## Quality commands

```sh
npm run build
npm test
npm run lint
npm run format
npm run format:check
docker compose config
docker compose -f docker-compose.dev.yml config
```

## Security and production scaling

Passwords are never selected by default or emitted in JSON. Helmet, CORS, JSON size limits, auth throttling, JWT validation, Zod schemas, ObjectId checks, role checks, and document ownership filters reduce common attack paths. Production deployments should terminate TLS at a managed edge, use a secrets manager, rotate signing keys, shorten access-token lifetime with refresh-token rotation, add structured redacted logs and audit events, scan uploads, and apply a stricter distributed rate limiter.

For scale, run stateless API replicas behind a load balancer, use MongoDB Atlas with backups and index monitoring, move image storage to object storage/CDN, queue notifications and background work, cache high-traffic listing queries, add cursor pagination for large portfolios, and instrument latency/error metrics with distributed traces.
