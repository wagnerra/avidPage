# SW Devel Challenge - Central Web Server

Web Server (HTML + Javascript + Canvas)

### Installation

```
cd /usr/local/
tar -xvz avidPage.tar.gz
cd avidPage
sudo npm install http-server -g
http-server -p 9000
```

### Testing

Please take a look on these 3 video recorded tests:
- http://wcramos.com/files/challenges/map1_video.mp4
- http://wcramos.com/files/challenges/map2_video.mp4
- http://wcramos.com/files/challenges/map3_video.mp4

To test yourself:

- Start the 3 servers.
- Open http://localhost:9000 on Web Browser

First you need to select one Robot:

On the input field:
```
SELECT ROBOT001
```
and ENTER

If everything running ok you will see the floor map of that Robot cleaning job.

If Robot in READY state you can command a new clean job entering
```
START ROBOT001
```
and ENTER

OBS: You need to have the 3 servers running to have expected results

