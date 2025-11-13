# Script to add LLM configuration to .env.local
$envFile = ".env.local"

# Check if file exists
if (Test-Path $envFile) {
    $content = Get-Content $envFile -Raw
    
    # Check if LLM config already exists
    if ($content -notmatch "LLM Configuration") {
        Add-Content -Path $envFile -Value @"

# LLM Configuration
# OpenAI API Key (optional - uncomment and add your key)
# OPENAI_API_KEY=sk-your-api-key-here
# OPENAI_MODEL=gpt-4
# OPENAI_MAX_TOKENS=4000
# OPENAI_TEMPERATURE=0.7

# Anthropic API Key (optional - uncomment and add your key)
# ANTHROPIC_API_KEY=sk-ant-your-api-key-here
# ANTHROPIC_MODEL=claude-3-sonnet-20240229
# ANTHROPIC_MAX_TOKENS=4000
# ANTHROPIC_TEMPERATURE=0.7
"@
        Write-Host "LLM configuration added to .env.local"
    } else {
        Write-Host "LLM configuration already exists in .env.local"
    }
} else {
    Write-Host "Creating .env.local with LLM configuration"
    @"
NEXT_PUBLIC_FORCE_DEMO_MODE=true

# LLM Configuration
# OpenAI API Key (optional - uncomment and add your key)
# OPENAI_API_KEY=sk-your-api-key-here
# OPENAI_MODEL=gpt-4
# OPENAI_MAX_TOKENS=4000
# OPENAI_TEMPERATURE=0.7

# Anthropic API Key (optional - uncomment and add your key)
# ANTHROPIC_API_KEY=sk-ant-your-api-key-here
# ANTHROPIC_MODEL=claude-3-sonnet-20240229
# ANTHROPIC_MAX_TOKENS=4000
# ANTHROPIC_TEMPERATURE=0.7
"@ | Out-File -FilePath $envFile -Encoding utf8
    Write-Host ".env.local created with LLM configuration"
}

Write-Host "`nTo enable LLM:"
Write-Host "1. Edit .env.local"
Write-Host "2. Uncomment either OPENAI_API_KEY or ANTHROPIC_API_KEY"
Write-Host "3. Add your actual API key"
Write-Host "4. Restart the development server"

