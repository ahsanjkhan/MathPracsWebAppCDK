### What Is This

This is the Infrastructure-as-Code of the MathPracs web app, a portal where parents and students log in to see upcoming sessions, session history, and balances for students enrolled in tutoring with MathPracs.

You can learn more about MathPracs at https://mathpracs.com

### How Does It Work

This uses the power of AWS Cloud Development Kit (CDK) to create the following infrastructure:

1. AWS CodePipeline to manage automatic deployments (Beta then Prod) whenever a commit is pushed to GitHub.
2. Frontend (React + Cloudscape) - https://github.com/ahsanjkhan/MathPracsWebApp
3. AWS S3 Bucket holding the frontend build
4. AWS CloudFront Distribution serving the frontend

### What Are The Components

AWS CodePipeline, AWS S3, AWS CloudFront.

### Multi-Account Pipeline

The pipeline deploys to **Beta** (655383751455) first, then **Prod** (786802935034). Both accounts are in `us-east-1`.

### How To Deploy

Raising a Pull Request for commits on a feature branch, getting it approved, and squashing and merging into `main` on either this repo or [MathPracsWebApp](https://github.com/ahsanjkhan/MathPracsWebApp) automatically triggers the CodePipeline, which builds the frontend, runs CDK synth, and deploys to Beta then Prod.

#### First-Time Setup (New AWS Account)

1. **Install Node.js** (version 20), **AWS CLI**, and **Finch** (`brew install finch && finch vm init && finch vm start`)

2. **Bootstrap CDK in the new account** (with new account creds exported):
   ```bash
   npx cdk bootstrap aws://<NEW_ACCOUNT_ID>/us-east-1 \
     --trust <PIPELINE_ACCOUNT_ID> \
     --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
   ```

3. **Deploy the pipeline stack** (with pipeline/prod account creds exported). This repo and [MathPracsWebApp](https://github.com/ahsanjkhan/MathPracsWebApp) must be cloned side by side:
   ```bash
   (cd ../MathPracsWebApp/frontend && npm install && npm run build)
   npm install
   CDK_DOCKER=finch npx cdk deploy MathPracsWebAppPipelineStack
   ```

After this, all future changes are deployed automatically via the pipeline.

#### Manual Deployments (Avoid if possible)
1. Make changes on feature branch.
2. Commit those changes and raise Pull Request as usual.
3. Deploy the changes directly:
   ```bash
   CDK_DOCKER=finch npx cdk deploy MathPracsWebAppStack
   ```

### Useful Commands

- `CDK_DOCKER=finch npx cdk diff` - Compare deployed stack with current state
- `CDK_DOCKER=finch npx cdk synth` - Emit the synthesized CloudFormation template
- `CDK_DOCKER=finch npx cdk deploy` - Deploy with Finch Docker support
- `CDK_DOCKER=finch npx cdk destroy` - Destroy the stack # DANGEROUS!!
- `finch vm status` - See Finch VM Status
- `finch vm stop` - Stop Finch VM
