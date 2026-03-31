import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const folder = process.argv[2]
const extension = process.argv[3]

if (!folder || !extension) {
    console.log(chalk.red('Location and extension types need to be provided.'))
    console.log(chalk.yellow('e.g.: npm run run:files ./dist/tests/ .test.js'))
    process.exit(1)
}

function getFilesRecursively(dir, ext) {
    let results = []
    const list = fs.readdirSync(dir, { withFileTypes: true })
    for (const item of list) {
        const itemPath = path.join(dir, item.name)
        if (item.isDirectory()) {
            results = results.concat(getFilesRecursively(itemPath, ext))
        } else if (item.isFile() && item.name.endsWith(ext)) {
            results.push(itemPath)
        }
    }
    return results
}

async function runFilesSequentially() {
    const files = getFilesRecursively(folder, extension)
    if (files.length === 0) {
        console.log(chalk.yellow('No test files found.'))
        return
    }

    for (const file of files) {
        console.log(chalk.blue(`Running ${file}...`))
        try {
            // add the register flag here so EVERY sub-test knows how to find @src
            const { stdout, stderr } = await execAsync(`node -r tsconfig-paths/register "${file}"`)
            if (stdout) console.log(chalk.green(stdout))
            if (stderr) console.error(chalk.red(stderr))
        } catch (err) {
            console.error(chalk.red(`Error running ${file}: ${err.message}`))

            if (err.stdout) console.log(chalk.yellow(`STDOUT log:\n${err.stdout}`))
            if (err.stderr) console.error(chalk.red(`STDERR trace:\n${err.stderr}`))
            process.exit(1) // Stop on first failure
        }
    }
}

runFilesSequentially()
