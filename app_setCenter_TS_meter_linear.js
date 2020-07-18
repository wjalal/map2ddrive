var map = {}, acc = {}, vel = {}, steer = {}, places = [], marker = {};
var ind = 0, h = 0, k = 0, theta = -70, alpha = 0, beta = 0; dLng = 0, dLat = 0, steerTime = 0, timeTS = 0, steerTimeTS = 0, latFact = 0, lngFact = 0, Diag = 0;
var resSet = false, steerSet = false, accReset = false, steerReset = false, targetShow = false;
var destCoords = { lat() { return 0; }, lng() { return 0; } };
var keys = { up: false, down: false, left: false, right: false, ctrl: false };
const CONV_SI = 0.1;
const CONV_KPH = CONV_SI * 3.6;
const CONV_MPH = CONV_KPH * 0.621371;






acc = {
    lin: 0,
    // get res() {
    //     if (resSet) {
    //         if (Math.trunc(vel.lin) > 0) {
    //             return (this.lin - 0.4);
    //         } else if (Math.trunc(vel.lin) < 0) {
    //             return (this.lin + 0.07);
    //         } else {
    //             return this.lin;
    //         };
    //     } else return this.lin;
    // },
    start: function() {
        if (this.lin != 33 && this.lin != 110) {
            vel.lin = vel.lin;
            timeTS = (new Date()).getTime();
        };
        resSet = true;
        if (Math.trunc(vel.lin) > 0) this.lin = 33;
        else this.lin = 110;
        if (vel.lin>=1000) vel.lin = 1000;
        // resSet = true;
    },
    stop: function() {
        if (this.lin != -12 && this.lin != 1 && this.lin != 0) {
            vel.lin = vel.lin;
            timeTS = (new Date()).getTime();
        };
        // resSet = true;
        if (Math.trunc(vel.lin) > 0) this.lin = -12;
        else if (Math.trunc(vel.lin) < 0) this.lin = 1;
        else if (Math.trunc(vel.lin) == 0) {
            this.lin = 0;
            vel.lin = 0;
        };
    },
    rev: function() {
        if (this.lin != -150 && this.lin != -2) {
            vel.lin = vel.lin;
            timeTS = (new Date()).getTime();
        };
        resSet = true;
        if (Math.trunc(vel.lin) < 0) this.lin = -2;
        else this.lin = -150;
    },
    EB: function() {
        // if (this.lin != -500 && this.lin != 500) {
            vel.lin = vel.lin;
            timeTS = (new Date()).getTime();
        // };
        resSet = true;
        if (Math.trunc(vel.lin) > 0 ) this.lin = -500;
        else if (Math.trunc(vel.lin) < 0) this.lin = 500;
        else if (Math.trunc(vel.lin) == 0) {
            this.lin = 0;
            vel.lin = 0;
        };
    }
};

vel = {
    lin_: 0,
    temp: 0,
    get lin() {
        if (resSet) {
            if (this.lin_>=1000 && (acc.lin).toFixed(2)>0) return 1000;
            else return (   this.lin_ + acc.lin * ( (new Date()).getTime() - timeTS ) * 0.001   );
        } else {
            return 0;
        };
    },
    set lin(Lin) {
        this.lin_ = Lin;
    },
    get disp() {
        if (resSet) {
            if (this.lin_>=1000 && (acc.lin).toFixed(2)>0) return 30;
            else return (   0.03 * ( this.lin_ + 0.5 * acc.lin * ( 2 * ( (new Date()).getTime() - timeTS ) * 0.001  -  0.03 ) )   );
        } else {
            return 0;
        };
    }
};

steer = {
    angle: -70,
    acc: 0,
    start: function() {
        this.vel = this.vel;
        if ( this.acc != 0.25 ) {
            steerTimeTS = (new Date()).getTime();
        };
        steerSet = true;
        this.acc = 0.25;
    },
    stop: function() {
        if ( this.acc != 0 ) {
            steerTimeTS = (new Date()).getTime();
        };
        steerSet = true;
        this.acc = 0;
        this.vel = 1;
        
    },
    vel_: 1,
    get vel() {
        if (steerSet) {
            if ( this.vel_>=3 && (this.acc).toFixed(2)>0 ) return 3;
            else return (this.vel_ + this.acc * ( (new Date()).getTime() - steerTimeTS ) * 0.001);
        } else {
            return 1;
        };
    },
    set vel(Vel) {
        this.vel_ = Vel;
    }

};

function resizeDiv() {
    Diag = Math.trunc( Math.sqrt( window.innerHeight*window.innerHeight + window.innerWidth*window.innerWidth) + 20 );
    map.getDiv().style.width = Diag + 'px';
    map.getDiv().style.height = Diag + 'px';
    map.getDiv().style.left = ((-0.5) * Diag + window.innerWidth * 0.5) + 'px';
    map.getDiv().style.top = ((-0.5) * Diag + window.innerHeight * 0.5) + 'px';

    let transfer_ui = document.querySelectorAll(".transfer-ui");
    for (let i = 0; i < transfer_ui.length; i++) {
        if (window.innerHeight/window.innerWidth > 0.8) transfer_ui[i].style.width = "70%";
        else transfer_ui[i].style.width = "25%";
    }
};

function toPixels() {
    var delLat = Math.abs( map.getBounds().getNorthEast().lat() - map.getBounds().getSouthWest().lat() );
    var delLng = Math.abs( map.getBounds().getNorthEast().lng() - map.getBounds().getSouthWest().lng() );
    var northwest = {   lat: map.getBounds().getNorthEast().lat, lng: map.getBounds().getSouthWest().lng   };
    var latMet = google.maps.geometry.spherical.computeDistanceBetween ( map.getBounds().getNorthEast(), northwest );
    var lngMet = google.maps.geometry.spherical.computeDistanceBetween ( map.getBounds().getSouthWest(), northwest );

    return {
        latFact: delLat/latMet,
        lngFact: delLng/lngMet
    };
};

function traverseBy(speed) {
    theta = steer.angle * Math.PI / 180;
    h = toPixels().latFact * speed * Math.cos(-theta);
    k = toPixels().lngFact * speed * Math.sin(-theta);

    map.setCenter ({ 
        lat: (map.getCenter().lat() + h), 
        lng: (map.getCenter().lng() + k) 
    });
    //map.panBy(k, h);
};

function moveDest() {
    dLat = destCoords.lat() - map.getCenter().lat();
    dLng = destCoords.lng() - map.getCenter().lng();

    alpha = Math.atan2(dLat,dLng) * (180/Math.PI);
    if (alpha < 0) alpha = 360 + alpha;
    beta = (steer.angle - alpha);
    document.getElementById('dest').style.transform = 'rotate(' + beta + 'deg)';
    if ( google.maps.geometry.spherical.computeDistanceBetween(map.getCenter(), destCoords) < 400   &&    targetShow == false ) {
        marker = new google.maps.Marker({
            map: map,
            draggable: false,
            position: (places[ind]).geometry.location,
            icon: {
                url: "./target.png", 
                scaledSize: new google.maps.Size(100, 100), // scaled size
                origin: new google.maps.Point(0,0), // origin
                anchor: new google.maps.Point(0, 0) // anchor
            },
        });
        targetShow = true;
        //document.querySelectorAll("img[src='./target.png']")[0].parentNode.onclick = document.querySelectorAll("img[src='./target.png']")[0].parentNode.remove();
    };

};






function initMap() {

    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 23.7626100, lng: 90.3700699 },
        zoom: 21,
        draggable: false,
        mapTypeId: google.maps.MapTypeId.HYBRID,
        keyboardShortcuts: false,
        disableDefaultUI : true,
        scrollwheel: false,
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [
                    {visibility: 'off'}
                ]
            },
            {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [
                    {visibility: 'off'}
                ]
            },
        ]
    });

    var input = document.getElementById("pac-input");
    var searchBox = new google.maps.places.SearchBox(input);

    map.addListener("bounds_changed", function() {
        searchBox.setBounds(map.getBounds());
    });

    function transfer() {
        document.getElementById('placeSwitch').innerHTML = (ind+1);
        document.getElementById('address').innerHTML = ( places[ind] ).formatted_address;
        if (document.querySelectorAll("img[src='./target.png']").length!=0) document.querySelectorAll("img[src='./target.png']")[0].parentNode.remove();
        marker = {}; targetShow = false;
    
        if ( document.forms['transfer-type-select']['transfer-type'].value == 'Teleport' ) {
            vel.lin = 0; acc.lin = 0;
            //latFact = toPixels().latFact; lngFact = toPixels().lngFact;
            map.setCenter( (places[ind]).geometry.location ); 
            if (ind == 0) {
                setTimeout( function() {
                    map.setZoom(20);
                    map.setTilt(0);
                }, 3000 );
                setTimeout( function() { 
                    if (map.getZoom() != 20) {
                        map.setZoom(20);
                        map.setTilt(0);
                    }
                }, 10000 );
            } else {
                map.setZoom(20); 
                map.setTilt(0);
            };
        } else  {
            destCoords = (places[ind]).geometry.location;
            document.getElementById('dest').style.visibility = "visible";
        };
    };    

    searchBox.addListener("places_changed", function() {
        document.getElementById('places').style.visibility = "visible";
        document.getElementById('place-address').style.visibility = "visible";
        places = [];    
        if (( searchBox.getPlaces() ).length == 0) return;
        ( searchBox.getPlaces() ).forEach ( function(place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            };
            places[ind] = place; ind ++;
        });
        //document.getElementById('speedo').innerHTML = JSON.stringify(places[0]);
        ind = 0;
        document.getElementById('placeNum').innerHTML = places.length;
        transfer();        
    });

    document.getElementById('prev').addEventListener( "click", function() {
        if (ind==0) ind = places.length -1; else ind--;
        transfer();        
    });

    document.getElementById('next').addEventListener( "click", function() {
        if (ind==places.length-1) ind = 0; else ind++;
        transfer();        
    });

};






window.onload = function () {

    steerTimeTS = timeTS = (new Date()).getTime(); 

    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {

        document.getElementById('start').style.visibility = "visible";
        document.getElementById('left').style.visibility = "visible";
        document.getElementById('right').style.visibility = "visible";
        document.getElementById('acc').style.visibility = "visible";
        document.getElementById('brake').style.visibility = "visible";

        document.getElementById("startFS").addEventListener("touchend", function() {
            document.body.requestFullscreen();
            document.getElementById("start").style.visibility = "hidden";
            window.screen.orientation.lock("landscape-primary");
        });
        
        document.getElementById('pac-input').addEventListener ('focusin', function() {window.screen.orientation.lock("portrait-primary");});
        document.getElementById('pac-input').addEventListener ('focusout', function() {window.screen.orientation.lock("landscape-primary");});

        document.addEventListener("fullscreenchange", function() {
            if (document.fullscreenElement == null) {
                vel.lin = 0; acc.lin = 0;
                document.getElementById('start').style.visibility = "visible";
                document.getElementById('startFS').innerHTML = "Resume";
            };
        });

        document.getElementById('left').addEventListener ("touchstart", function() {
            keys.left = true;
            document.getElementById('left').style.opacity = 1;      });
        document.getElementById('right').addEventListener ("touchstart", function() {
            keys.right = true;
            document.getElementById('right').style.opacity = 1;     });
        document.getElementById('acc').addEventListener ("touchstart", function() {
            keys.up = true;
            document.getElementById('acc').style.opacity = 1;       });
        document.getElementById('brake').addEventListener ("touchstart", function() {
            keys.down = true;
            document.getElementById('brake').style.opacity = 1;     });
        
        
        document.getElementById('left').addEventListener ("touchend", function(){
            document.getElementById('left').style.opacity = 0.7;
            keys.left = false;   });
        document.getElementById('right').addEventListener ("touchend", function(){
            document.getElementById('right').style.opacity = 0.7;
            keys.right = false;   });
        document.getElementById('acc').addEventListener ("touchend", function(){
            document.getElementById('acc').style.opacity = 0.7;
            keys.up = false;   });
        document.getElementById('brake').addEventListener ("touchend", function(){
            document.getElementById('brake').style.opacity = 0.7;
            keys.down = false;   });

            
    } else {
        document.addEventListener ("keydown", function (e) {
            e = e || window.event;
            
            if ( (e.key == "a") || (e.key == "ArrowLeft") ) {
                keys.left = true;
            } else if ( (e.key == "d") || (e.key == "ArrowRight") ) {
                keys.right = true;
            } else if ( (e.key == "w") || (e.key == "ArrowUp") ) {
                keys.up = true;
            } else if ( (e.key == "s") || (e.key == "ArrowDown") ) {
                keys.down = true;
            } else if ( e.key == "Control" ) {
                keys.ctrl = true;
            };
        });
        
        document.addEventListener ("keyup", function(e) {
            e = e || window.event;
            if ( (e.key == "a") || (e.key == "ArrowLeft") ) {
                keys.left = false;
            } else if ( (e.key == "d") || (e.key == "ArrowRight") ) {
                keys.right = false;
            } else if ( (e.key == "w") || (e.key == "ArrowUp") ) {
                keys.up = false;
            } else if ( (e.key == "s") || (e.key == "ArrowDown") ) {
                keys.down = false;
            } else if ( e.key == "Control" ) {
                keys.ctrl =  false;
            } else if ( e.key == "p"    &&    document.getElementById('pac-input') != document.activeElement) {
                vel.lin = 0; acc.lin = 0;
                document.getElementById('start').style.visibility = "visible";
                document.getElementById('startFS').innerHTML = "Resume";
                document.getElementById('startFS').onclick = function() {document.getElementById("start").style.visibility = "hidden";};
            };
        });
    };
  
    resizeDiv();
    window.addEventListener("resize", resizeDiv);

    setInterval( function dropTime() {

        // time = ( (new Date()).getTime() - timeTS ) * 0.001;
        steerTime = ( (new Date()).getTime() - steerTimeTS ) * 0.001;
        //vel.lin = vel.lin;

        if ( keys.up ) {
            if ( keys.right || keys.left ) {
                acc.start(); steer.start();
            } else {
                steer.stop(); acc.start();
            };
        } else if ( keys.down ) {
            if ( keys.right || keys.left ) {
                acc.rev(); steer.start();
            } else {
                steer.stop(); acc.rev();
            };
        } else if ( keys.ctrl ) {
            if ( keys.right || keys.left ) {
                acc.EB(); steer.start();
            } else {
                steer.stop(); acc.EB();
            };
        } else {
            if ( keys.right || keys.left ) {
                acc.stop(); steer.start();
            } else {
                steer.stop(); acc.stop();
            };
        };

        //document.getElementById("speedo").innerHTML =  `<strong><em>Diagnostic:</em></strong><small> Velocity: ${vel.lin.toFixed(4)}; Acceleration: ${(acc.lin).toFixed(2)}; Time: ${(( (new Date()).getTime() - timeTS ) * 0.001).toFixed(3)} s; Steer Velocity: ${(steer.vel).toFixed(3)}; Steer Time: ${steerTime.toFixed(2)}</small>`;

        document.getElementById("speed").innerHTML = Math.trunc(CONV_KPH * vel.lin) + "km/h  •  " +
                                                     Math.trunc(CONV_MPH * vel.lin) + "mph  •  " +
                                                     Math.trunc(CONV_SI * vel.lin)  + "m/s";

        steer.angle += (   steer.vel * (Math.cbrt(Math.trunc(vel.lin)/500)) * (keys.left - keys.right)    );
        map.getDiv().style.transform = 'rotate(' + steer.angle + 'deg)';
        document.getElementById('compass').style.transform = 'rotate(' + steer.angle + 'deg)';
        traverseBy(vel.disp * 0.1449); moveDest();

    }, 30);

};