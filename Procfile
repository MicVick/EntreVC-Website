# Heroku process definition for the team-preview deployment.
#
# Production is the college VM, which runs `node server.js` from the standalone
# bundle and never sees this file. Heroku compiles its own slug and starts the
# app with `next start`, so the preview sets PREVIEW_PLATFORM=1 to tell
# next.config.ts to skip the standalone output it would otherwise emit.
#
# Next reads PORT from the environment, which Heroku assigns per dyno — do not
# hardcode 3000 here.
web: npm start
