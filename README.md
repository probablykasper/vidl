# vidl-web
Download YouTube videos

# ToDo
- Embed uploader and title as song metadata
- Detect artist/title by using " - " as separator. Let users choose.

# Deployment
- **VIDL_ENV** environment variable in docker-compose.yml
    - Dev: **dev**
    - Production: **production**
- **VIDL_ENV** variable in web/src/static/global.js
    - Dev: **dev**
    - Production: **production**
