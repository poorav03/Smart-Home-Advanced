# Smart Home Advanced

This project is now packaged as a single Node.js web app:

- `frontend/` contains the static website
- `server.js` serves the frontend and exposes the `/status` and `/toggle` API

## Run locally

```bash
node server.js
```

Then open `http://localhost:3000`.

## Deploy

This project includes `render.yaml` for easy deployment on Render.

### Render steps

1. Create a GitHub repository and upload the contents of this folder.
2. In Render, click `New` -> `Blueprint`.
3. Connect the GitHub repository.
4. Keep the Blueprint path as `render.yaml`.
5. Deploy.

Render will create one Node web service and run:

- build command: `echo No build step`
- start command: `node server.js`

You can also deploy it to Railway or any Node-compatible host by using:

- build command: none
- start command: `node server.js`
