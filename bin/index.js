#!/usr/bin/env node

import prompts from 'prompts'
import chalk from 'chalk'
import figlet from 'figlet'
import { execa } from 'execa'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Show ASCII logo
console.log(
    chalk.hex('#FFA500')(
        figlet.textSync('CIDROY', {
            font: 'Standard',
            horizontalLayout: 'default',
            verticalLayout: 'default',
        })
    )
)

console.log(chalk.blueBright('🚀 AdonisJS6 PostgreSQL Starter + Logger Service'))
console.log(chalk.gray('----------------------------------\n'))

// Ask for project name
const { name } = await prompts({
    type: 'text',
    name: 'name',
    message: 'Project name:',
    initial: 'my-adonis-app',
})

if (!name) {
    console.error(chalk.red('❌ Project name is required.'))
    process.exit(1)
}

const targetDir = path.join(process.cwd(), name)
const repoUrl = 'https://github.com/CIDROY-Tech/adonisjs-postgres-logging-starter.git' // <--- Your template repo

if (fs.existsSync(targetDir)) {
    console.error(chalk.red(`❌ Directory "${name}" already exists.`))
    process.exit(1)
}

try {
    console.log(chalk.cyan('\n📦 Cloning starter project...'))
    await execa('git', ['clone', repoUrl, name], { stdio: 'inherit' })

    // Remove .git folder
    fs.rmSync(path.join(targetDir, '.git'), { recursive: true, force: true })

    // Create .env from env.example
    const envExample = path.join(targetDir, '.env.example')
    const envPath = path.join(targetDir, '.env')
    if (fs.existsSync(envExample)) {
        const dbName = name.toLowerCase().replace(/[^a-z0-9_]/g, '_')
        let content = fs.readFileSync(envExample, 'utf-8')
        content = content.replace(/your_project_name/g, dbName)
        fs.writeFileSync(envPath, content)
        console.log(chalk.green('✅ .env created and DB name replaced'))
    }

    // Update package.json name
    const packageJsonPath = path.join(targetDir, 'package.json')
    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
        packageJson.name = name
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
        console.log(chalk.green('✅ package.json name updated'))
    }

    // Install dependencies
    console.log(chalk.cyan('\n📥 Installing dependencies...'))
    await execa('npm', ['install'], { cwd: targetDir, stdio: 'inherit' })

    // Generate APP_KEY
    console.log(chalk.cyan('\n🔑 Generating app key...'))
    await execa('node', ['ace', 'generate:key'], { cwd: targetDir, stdio: 'inherit' })

    console.log(chalk.greenBright('\n🎉 Project setup complete!\n'))
    console.log(`Next steps:
  ${chalk.yellow(`cd ${name}`)}
  ${chalk.yellow('npm run dev')}

Happy coding! ✨`)

} catch (err) {
    console.error(chalk.red('❌ Setup failed:'), err.message || err)
    process.exit(1)
}
