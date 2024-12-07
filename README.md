# OwnLogs

OwnLogs is a powerful platform designed to help you log, analyze, and visualize your data with ease. It offers enterprise-grade features and is completely free and open source. OwnLogs is Docker-powered, making it easy to deploy and manage.

## Features

- **Self-hosted**: Host OwnLogs on your own infrastructure.
- **Real-time logs**: View logs in real-time as they are generated.
- **SQL Editor**: Query your logs using a built-in SQL editor.
- **Server Monitoring**: Monitor server status and receive alerts.
- **User Management**: Manage user accounts and permissions.
- **Dark/Light Mode**: Toggle between dark and light themes.
- **Export Logs**: Export logs to JSON or CSV formats.
- **Dashboard**: Create and manage custom dashboards.

## Getting Started

To get started, you can go to [the docs](/docs).


# Contributing

## Docker

For us to deploy a new version of the OwnLogs project, you first need to test it. To do so, run `./docker/test/test.sh`. This script create staging images of both the front and back ends. You can now go to [localhost:4173](http://localhost:4173)
You can now test all of the functionalities. When done and confirmed everything works as it's supposed to, you can push the image to the registry by running `./docker/push.sh`. This tags the staging images to latest and pushes them to the docker.io registry.
