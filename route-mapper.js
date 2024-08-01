const readlineSync = require('readline-sync');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Ask for user inputs
const projectPath = readlineSync.question('Enter the Project Path: ');
const baseURL = readlineSync.question('Enter the Base URL for the project: ');
const outputFileName = readlineSync.question('Enter the output file name: ');

// Function to determine the project type
function determineProjectType(projectPath) {
    const packageJsonPath = path.join(projectPath, 'package.json');

    if (fs.existsSync(path.join(projectPath, 'artisan')) && fs.existsSync(path.join(projectPath, 'composer.json'))) {
        return 'Laravel';
    } else if (fs.existsSync(path.join(projectPath, 'system')) && fs.existsSync(path.join(projectPath, 'application'))) {
        return 'CodeIgniter';
    }
    return 'Unknown';
}

// Function to get Laravel routes
function getLaravelRoutes(projectPath, callback) {
    exec(`php ${path.join(projectPath, 'artisan')} route:list --json`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing artisan: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Error: ${stderr}`);
            return;
        }

        const routes = JSON.parse(stdout);
        const endpoints = routes.map(route => route.uri);
        callback(endpoints);
    });
}

// Function to get CodeIgniter routes
function getCodeIgniterRoutes(projectPath, callback) {
    const routesFilePath = path.join(projectPath, 'application', 'config', 'routes.php');
    
    fs.readFile(routesFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading routes file: ${err.message}`);
            return;
        }

        const routePattern = /\$route\['([^']+)'\]/g;
        const endpoints = [];
        let match;

        while ((match = routePattern.exec(data)) !== null) {
            let endpoint = match[1].replace(/\(\?i\)/g, '').replace(/\(:any\)/g, '');
            endpoints.push(endpoint);
        }

        callback(endpoints);
    });
}

// Function to generate full URLs and write to output file
function generateURLsAndWriteToFile(baseURL, endpoints, outputFileName) {
    const fullURLs = endpoints.map(endpoint => `${baseURL}/${endpoint}`);
    fs.writeFileSync(outputFileName, fullURLs.join('\n'), 'utf-8');
    console.log(`Endpoints written to ${outputFileName}`);
}

// Determine the project type
const projectType = determineProjectType(projectPath);

// Echo the inputs and the determined project type to the console
console.log(`Project Path: ${projectPath}`);
console.log(`Base URL: ${baseURL}`);
console.log(`Output File Name: ${outputFileName}`);
console.log(`Project Type: ${projectType}`);

if (projectType === 'Laravel') {
    getLaravelRoutes(projectPath, (endpoints) => {
        generateURLsAndWriteToFile(baseURL, endpoints, outputFileName);
    });
} else if (projectType === 'CodeIgniter') {
    getCodeIgniterRoutes(projectPath, (endpoints) => {
        generateURLsAndWriteToFile(baseURL, endpoints, outputFileName);
    });
} else {
    console.log('This script currently supports only Laravel and CodeIgniter projects.');
}
