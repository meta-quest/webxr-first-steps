# Spatial Web Template

Welcome to Spatial Web Template! This production-ready template app utilizes the new [Reality Accelerator Toolkit](https://github.com/meta-quest/reality-accelerator-toolkit) to demonstrate various Mixed Reality features and is built with [Three.js](https://threejs.org/). It is designed to help you kickstart your own WebXR mixed reality projects with ease. The template app comes with the [Becsy ECS](https://lastolivegames.github.io/becsy/) and several other useful libraries integrated, so you can focus on building your app with the best tools available.

> A live demo can be viewed [here](https://meta-quest.github.io/spatial-web-template).

## Features

- 🚀 Reality Accelerator Toolkit integration
- 🌐 Built with Three.js
- 🧩 Becsy Entity Component System (ECS)
- 📚 Pre-configured with useful libraries
- 🏗️ Production-ready template
- 🛠️ Easy customization for your own mixed reality apps

## Getting Started

Follow these instructions to set up the template app and start building your own mixed reality project.

### Prerequisites

Make sure you have the following installed on your system:

- Node.js (v16.x or later recommended)
- npm (v9.x or later recommended)

### Installation

1. Clone the repository and navigate to the project directory:

```sh
$ git clone git@github.com:meta-quest/spatial-web-template.git
$ cd spatial-web-template
```

2. Install the dependencies:

```sh
$ npm install
```

3. Run the development server:

```sh
$ npm run serve
```

The app will be available at http://localhost:8081/ in your browser. The development server will watch for changes in your source files and automatically reload the app.

### Building for Production

> This project contains GitHub workflow [configuration](https://github.com/meta-quest/spatial-web-template/blob/main/.github/workflows/deploy.yml) that automatically builds and deploys the WebXR app to GitHub page.

To manually build the app for production, run the following command:

```sh
$ npm run build
```

This will generate a dist folder with the optimized files for deployment.

## Making Changes

To start building your own mixed reality app, you can modify the template app's source code. The following files and folders are the main areas you'll be working with:

- src/: The source code for your app
- src/index.html: The HTML entry point for your app
- src/index.js: The JavaScript entry point for your app
- src/assets/: Any assets (models, textures, etc.) used in your app

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to contribute to the project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](./LICENSE.md) file for details.
