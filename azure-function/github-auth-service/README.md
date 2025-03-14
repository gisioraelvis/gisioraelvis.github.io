# GitHub Auth Service

This is an Azure Functions app that provides a backend service for GitHub authentication.

## Setup

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update `local.settings.json` with your GitHub client ID and secret.
4. Start the Azure Functions app:
   ```bash
   npm start
   ```

## Usage

Send a POST request to the function endpoint with the GitHub authorization code to receive an access token.

## Deployment

This project uses GitHub Actions for CI/CD to deploy automatically to Azure Functions.

### Setup CI/CD with Azure CLI

1. Install the Azure CLI and log in:

   ```bash
   # Install the Azure CLI
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash  # For Debian/Ubuntu
   # Or visit https://docs.microsoft.com/en-us/cli/azure/install-azure-cli for other platforms

   # Login to Azure
   az login
   ```

2. Create a function app in Azure:

   ```bash
   # Create a resource group (skip if you already have one)
   az group create --name myResourceGroup --location eastus

   # Create a storage account
   az storage account create --name mystorageaccount --location eastus --resource-group myResourceGroup --sku Standard_LRS

   # Create the function app
   az functionapp create --resource-group myResourceGroup --consumption-plan-location eastus --runtime node --runtime-version 14 --functions-version 4 --name github-auth-service --storage-account mystorageaccount
   ```

3. Get the publish profile using Azure CLI and save it as a GitHub secret:

   ```bash
   # Get the publish profile and save it to a file
   az functionapp deployment list-publishing-profiles --name github-auth-service --resource-group myResourceGroup --xml > publish-profile.xml
   ```

4. Add the publish profile as a GitHub secret:
   - In your GitHub repository, go to Settings > Secrets
   - Create a new secret named `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`
   - Paste the contents of the downloaded publish-profile.xml file

The workflow will automatically deploy your function app when code is pushed to the main branch.

### Configure Application Settings in Azure

Set your GitHub client ID and secret in Azure:

```bash
az functionapp config appsettings set --name github-auth-service --resource-group myResourceGroup --settings "GITHUB_CLIENT_ID=your-github-client-id" "GITHUB_CLIENT_SECRET=your-github-client-secret"
```
