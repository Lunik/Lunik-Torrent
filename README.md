# Lunik-Torrent
[![Rocket.Chat](http://chat.lunik.xyz/images/join-chat.svg)](http://chat.lunik.xyz/channel/lunik-torrent)
[![npm](https://img.shields.io/npm/v/lunik-torrent.svg)](https://www.npmjs.com/package/lunik-torrent)
[![Travis branch](https://img.shields.io/travis/Lunik/Lunik-Torrent/master.svg)](https://travis-ci.org/Lunik/Lunik-Torrent)
[![Codecov branch](https://img.shields.io/codecov/c/github/Lunik/Lunik-Torrent/master.svg)](https://codecov.io/gh/Lunik/Lunik-Torrent)
[![Dependency Status](https://gemnasium.com/badges/github.com/Lunik/Lunik-Torrent.svg)](https://gemnasium.com/github.com/Lunik/Lunik-Torrent)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

<!-- TOC depthFrom:1 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Lunik-Torrent](#lunik-torrent)
	- [===== View =====](#-view-)
	- [===== Installation =====](#-installation-)
	- [With Git](#with-git)
			- [Run](#run)
	- [With Heroku](#with-heroku)
	- [With Docker](#with-docker)
	- [===== Infos =====](#-infos-)
		- [Register](#register)
				- [Create an invitation code](#create-an-invitation-code)

<!-- /TOC -->

## ===== View =====
![directory-view](https://puu.sh/qr53g/de79e3ea37.png)
![torrent-view](https://puu.sh/qr511/826c4c4019.png)

## ===== Installation =====

## With Git

```
$ git clone https://github.com/Lunik/Lunik-Torrent.git
$ cd Lunik-Torrent
$ npm install
```

Configuration into: `configs/config.json`

#### Run

```
$ npm start
or with forever
$ npm run deamon
```

## With Heroku
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Lunik/Lunik-Torrent)
/!\ Heroku don't store any data. Once your app shutdown, you will loose all your login and your files.
To prevent that you can use [kaffeine](http://kaffeine.herokuapp.com/) to keep your app UP 24/24.

## With Docker
[![Docker Stars](https://img.shields.io/docker/stars/lunik/lunik-torrent.svg)](https://hub.docker.com/r/lunik/lunik-torrent/)
[![Docker Pulls](https://img.shields.io/docker/pulls/lunik/lunik-torrent.svg)](https://hub.docker.com/r/lunik/lunik-torrent/)
[![](https://images.microbadger.com/badges/image/lunik/lunik-torrent.svg)](https://microbadger.com/images/lunik/lunik-torrent "Get your own image badge on microbadger.com")

Create `config.json` following this pattern [config.default](https://raw.githubusercontent.com/Lunik/Lunik-Torrent/master/configs/config.default). Then put it int `/your_config_folder`.

Then run:
```
$ docker pull lunik/lunik-torrent
$ docker run -d \
	-p 8080:8080 \
	-v /your_config_folder:/usr/src/app/configs \
	-v /your_download_folder:/usr/src/app/files \
	lunik/lunik-torrent
```

## ===== Infos =====
### Register

You need an inscription code provided by the server admin.

##### Create an invitation code
Goto to `http://myapp.com/auth/invitation?invitationkey=MY_INVITATION_KEY`

For more advanced user
```
$ curl --data "invitationkey=MY_INVITATION_KEY" http://localhost:5000/auth/invite
{
  "err":false,
  "invitationCode":"your_invitation_code"
}
```
To register go to `http://localhost:5000/login.html#your_invitation_code`
