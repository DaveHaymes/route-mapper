# Route Mapper

A simple Node.js script to determine the type of project (Laravel or CodeIgniter), parse the routes, and generate a list of valid website endpoints. These endpoints are then appended to a provided base URL and written to an output file.

## Features

- Detects project type: Laravel or CodeIgniter.
- Extracts routes from the project.
- Generates full URLs based on the base URL provided.
- Outputs the URLs to a specified file.

## Requirements

- Node.js
- `readline-sync` package for Node.js

## Installation

1. Clone the repository or download the script.
2. Navigate to the project directory.

```bash
cd path/to/your/project
```

3. Install the required Node.js package:

```bash
npm install readline-sync
```

## Usage

1. Run the script:

```bash
node route-mapper.js
```

2. Follow the prompts to enter:
   - Project Path
   - Base URL
   - Output file name

## Example

```bash
$ node route-mapper.js
Enter the Project Path: /path/to/your/project
Enter the Base URL for the project: https://example.com
Enter the output file name: endpoints.txt
Project Path: /path/to/your/project
Base URL: https://example.com
Output File Name: endpoints.txt
Project Type: Laravel
Endpoints written to endpoints.txt
```

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License.

## Acknowledgements

- [readline-sync](https://github.com/anseki/readline-sync)
