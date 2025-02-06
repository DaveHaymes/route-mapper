#!/usr/bin/env node

// Improved script to extract routes from Laravel and CodeIgniter projects

const readlineSync = require("readline-sync");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);

// Synchronously check if a path exists
function pathExists(p) {
  return fs.existsSync(p);
}

// Determine the project type based on file/directory structure
function determineProjectType(projectPath) {
  if (
    pathExists(path.join(projectPath, "artisan")) &&
    pathExists(path.join(projectPath, "composer.json"))
  ) {
    return "Laravel";
  } else if (
    pathExists(path.join(projectPath, "system")) &&
    pathExists(path.join(projectPath, "application"))
  ) {
    return "CodeIgniter";
  }
  return "Unknown";
}

// Retrieve Laravel routes using the Artisan command
async function getLaravelRoutes(projectPath) {
  const artisanPath = path.join(projectPath, "artisan");
  try {
    // Wrap artisanPath in quotes to handle spaces in the path
    const { stdout, stderr } = await execAsync(
      `php "${artisanPath}" route:list --json`
    );
    if (stderr) {
      console.error(`Artisan error: ${stderr}`);
      return [];
    }
    let routes = [];
    try {
      routes = JSON.parse(stdout);
    } catch (jsonErr) {
      console.error(`Error parsing JSON output: ${jsonErr.message}`);
      return [];
    }
    // Extract URI endpoints from each route
    const endpoints = routes.map((route) => route.uri);
    return endpoints;
  } catch (error) {
    console.error(`Error executing Artisan command: ${error.message}`);
    return [];
  }
}

// Retrieve CodeIgniter routes by reading the routes configuration file
async function getCodeIgniterRoutes(projectPath) {
  const routesFilePath = path.join(
    projectPath,
    "application",
    "config",
    "routes.php"
  );
  try {
    const data = await fsPromises.readFile(routesFilePath, "utf8");
    // Regex to capture route definitions in the format: $route['endpoint']
    const routePattern = /\$route\['([^']+)'\]/g;
    const endpoints = [];
    let match;
    while ((match = routePattern.exec(data)) !== null) {
      // Clean the route string by removing unwanted patterns
      let endpoint = match[1].replace(/\(\?i\)/g, "").replace(/\(:any\)/g, "");
      endpoints.push(endpoint);
    }
    return endpoints;
  } catch (err) {
    console.error(`Error reading CodeIgniter routes file: ${err.message}`);
    return [];
  }
}

// Generate full URLs by combining the base URL and endpoints
function generateURLs(baseURL, endpoints) {
  // Remove trailing slash from baseURL and leading slash from endpoints
  baseURL = baseURL.replace(/\/+$/, "");
  return endpoints.map((endpoint) => {
    endpoint = endpoint.replace(/^\/+/, "");
    return `${baseURL}/${endpoint}`;
  });
}

// Main async function to coordinate the process
async function main() {
  // Collect user inputs
  const projectPath = readlineSync.question("Enter the Project Path: ");
  if (!pathExists(projectPath)) {
    console.error("Error: The provided project path does not exist.");
    return;
  }
  const baseURL = readlineSync.question("Enter the Base URL for the project: ");
  const outputFileName = readlineSync.question("Enter the output file name: ");

  console.log(`Project Path: ${projectPath}`);
  console.log(`Base URL: ${baseURL}`);
  console.log(`Output File Name: ${outputFileName}`);

  // Determine the project type
  const projectType = determineProjectType(projectPath);
  console.log(`Project Type: ${projectType}`);

  let endpoints = [];
  if (projectType === "Laravel") {
    endpoints = await getLaravelRoutes(projectPath);
  } else if (projectType === "CodeIgniter") {
    endpoints = await getCodeIgniterRoutes(projectPath);
  } else {
    console.log(
      "This script currently supports only Laravel and CodeIgniter projects."
    );
    return;
  }

  if (endpoints.length === 0) {
    console.log("No endpoints were found in the project.");
    return;
  }

  // Generate full URLs and write them to the output file
  const urls = generateURLs(baseURL, endpoints);
  try {
    await fsPromises.writeFile(outputFileName, urls.join("\n"), "utf8");
    console.log(`Endpoints written to ${outputFileName}`);
  } catch (err) {
    console.error(`Error writing to file: ${err.message}`);
  }
}

// Execute the main function
main();
