# Lunik-Torrent
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)
![build](https://travis-ci.org/Lunik/Lunik-Torrent.svg?style=flat-square)
[![Dependency Status](https://gemnasium.com/badges/github.com/Lunik/Lunik-Torrent.svg)](https://gemnasium.com/github.com/Lunik/Lunik-Torrent)
## ===== View =====
![directory-view](https://puu.sh/qr53g/de79e3ea37.png)
![torrent-view](https://puu.sh/qr511/826c4c4019.png)

## ===== Installation =====
## Git

```
$ git clone https://github.com/Lunik/Lunik-Torrent.git
$ cd Lunik-Torrent
$ npm install
```

Configuration into: `configs/config.json`


### Run

```
$ npm start
or with forever
$ npm run forever-start
```

## Heroku
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Lunik/Lunik-Torrent)

## ===== Infos =====
### Register

You need an inscription code provided by the server admin.

##### Create an invitation code
```
$ curl --data "invitationKey=mykey" http://localhost:5000/auth?todo=invite
{
  "err":false,
  "invitationCode":"your_invitation_code"
}
```
To register go to `http://localhost:5000/login.html#your_invitation_code`