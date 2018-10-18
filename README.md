# SW Devel Challenge - Central Web Server

Web Server 

### Installation

cd /usr/local/
tar -xvz avidPage.tar.gz
cd avidPage
sudo npm install http-server -g
http-server -p 9000

### Testing

Open http://localhost:9000 on Web Browser

First you need to select one Robot:

On the input field enter 
```
SELECT ROBOT001
```
and <ENTER>

If everything running ok you will see the floor map of that Robot cleaning job.

If Robot in READY state you can command a new clean job entering
```
START ROBOT001
```
and <ENTER>


