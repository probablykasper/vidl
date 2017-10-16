# vidl
Download YouTube videos

# ToDo
- Error reporting in Chrome Extension
- Feedback when download starts

# Deployment
### Chrome extension
- **hostURL** variable in extension/event-page.js:1
    - Dev: **localhost**
    - Production: **vidl.kasp.io**

### docker
- **VIDL_ENV** environment variable in docker-compose.yml
    - Dev: **dev**
    - Production: **production**
