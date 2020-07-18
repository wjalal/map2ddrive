var map = {}, tCount = {}, stCount = {}, acc = {}, vel = {}, steer = {};
var ind = 0, h = 0, k = 0, theta = -70, alpha = 0, beta = 0; dLng = 0, dLat = 0, time = 0, steerTime = 0, aR = 1, newWidth = 0, newHeight = 0;
var resSet = false, steerSet = false, keepTime = false, keepSteerTime = false, accReset = false, steerReset = false;
var destCoords = { lat() { return 0; }, lng() { return 0; } };
const CONV_SI = 1/305.146;
const CONV_KPH = CONV_SI * 3.6;
const CONV_MPH = CONV_KPH * 0.621371;
 




document.getElementById("startFS").addEventListener("touchend", function() {
    document.body.requestFullscreen();
    document.getElementById("start").style.visibility = "hidden";
    window.screen.orientation.lock("landscape-primary");
});





var keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    ctrl: false
};

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
    keys.left = false; 
    steerTime = 0;  });
document.getElementById('right').addEventListener ("touchend", function(){
    document.getElementById('right').style.opacity = 0.7;
    keys.right = false; 
    steerTime = 0;  });
document.getElementById('acc').addEventListener ("touchend", function(){
    document.getElementById('acc').style.opacity = 0.7;
    keys.up = false; 
    time = 0;   });
document.getElementById('brake').addEventListener ("touchend", function(){
    document.getElementById('brake').style.opacity = 0.7;
    keys.down = false; 
    time = 0;   });


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
        steerTime = 0;
    } else if ( (e.key == "d") || (e.key == "ArrowRight") ) {
        keys.right = false;
        steerTime = 0;
    } else if ( (e.key == "w") || (e.key == "ArrowUp") ) {
        keys.up = false;
        time = 0;
    } else if ( (e.key == "s") || (e.key == "ArrowDown") ) {
        keys.down = false;
        time = 0;
    } else if ( e.key == "Control" ) {
        keys.ctrl =  false;
        time = 0;
    };
});






acc = {
    lin: 0,
    get res() {
        if (Math.trunc(vel.lin_) > 0) {
            return (this.lin - 0.4);
        } else if (Math.trunc(vel.lin_) < 0) {
            return (this.lin + 0.07);
        } else {
            return this.lin;
        };
    },
    start: function() {
        if (this.lin != 1.5) {
            time = 0;
            keepTime = true;
        };
        resSet = true;
        if (Math.trunc(vel.lin) < 0 ) this.lin = 7;
        this.lin = 1.5;
    },
    stop: function() {
        this.lin = 0;
    },
    rev: function() {
        if (this.lin != -15 && this.lin != -0.2) {
            time = 0;
            keepTime = true;
        };
        resSet = true;
        if (Math.trunc(vel.lin) > 0 ) this.lin = -15;
        else this.lin = -0.2;
    },
    EB: function() {
        if (this.lin != -115 && this.lin != 65) {
            time = 0;
            keepTime = true;
        };
        resSet = true;
        if (Math.trunc(vel.lin) > 0 ) this.lin = -115;
        else this.lin = 65;
    }
};

vel = {
    lin_: 0,
    get lin() {
        if (resSet) {
            return ( (this.lin_>=20000 && (acc.res).toFixed(2)>0)? 20000 : (this.lin_ + acc.res * time) );
        } else {
            return 0;
        };
    },
    set lin(Lin) {
        this.lin_ = Lin;
    }
};

steer = {
    angle: -70,
    acc: 0,
    start: function() {
        this.vel = this.vel;
        if ( this.acc != 0.15 ) {
            steerTime = 0;
            keepSteerTime = true;
        };
        steerSet = true;
        this.acc = 0.15;
    },
    stop: function() {
        this.acc = 0;
        this.vel = 1;
        
    },
    vel_: 1,
    get vel() {
        if (steerSet) {
            return ( ( this.vel_>=3 && (this.acc).toFixed(2)>0 )? 3 : (this.vel_ + this.acc * steerTime) );
        } else {
            return 1;
        };
    },
    set vel(Vel) {
        this.vel_ = Vel;
    }

};

function traverseBy(speed) {
    theta = steer.angle * Math.PI / 180;
    h = speed * Math.cos(theta);
    k = speed * Math.sin(theta);
    map.panBy(k, h);
};

function moveDest() {
    dLat = destCoords.lat() - map.getCenter().lat();
    dLng = destCoords.lng() - map.getCenter().lng();

    alpha = Math.atan2(dLat,dLng) * (180/Math.PI);
    if (alpha < 0) alpha = 360 + alpha;
    beta = (steer.angle - alpha);
    document.getElementById('dest').style.transform = 'rotate(' + beta + 'deg)';
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
        ]
    });

    var input = document.getElementById("pac-input");
    var searchBox = new google.maps.places.SearchBox(input);
    var places = [];

    map.addListener("bounds_changed", function() {
        searchBox.setBounds(map.getBounds());
    });

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
            places[ind] = place;
            ind ++;
        });
        //document.getElementById('speedo').innerHTML = JSON.stringify(places[0]);
        ind = 0;
        vel.lin = 0; acc.lin = 0; acc.res = 0;

        document.getElementById('placeNum').innerHTML = places.length;
        document.getElementById('placeSwitch').innerHTML = 1;
        document.getElementById('address').innerHTML = ( places[0] ).formatted_address;

        if ( document.forms['transfer-type-select']['transfer-type'].value == 'Teleport' ) {
            map.setCenter( (places[0]).geometry.location ); 
            setTimeout( function() {map.setZoom(20);}, 3000 );
            setTimeout( function() { if (map.getZoom() != 20) map.setZoom(20);}, 10000 );
        } else  {
            destCoords = (places[0]).geometry.location;
            document.getElementById('dest').style.visibility = "visible";
        };
    });

    document.getElementById('prev').addEventListener( "click", function() {
        vel.lin = 0; acc.lin = 0; acc.res = 0;
        if (ind==0) ind = places.length -1; else ind--;
        document.getElementById('placeSwitch').innerHTML = (ind+1);
        document.getElementById('address').innerHTML = ( places[ind] ).formatted_address;

        if ( document.forms['transfer-type-select']['transfer-type'].value == 'Teleport' ) {
            map.setCenter( (places[ind]).geometry.location ); 
            map.setZoom(20);
        } else  {
            destCoords = (places[0]).geometry.location;
            document.getElementById('dest').style.visibility = "visible";
        };
    });

    document.getElementById('next').addEventListener( "click", function() {
        vel.lin = 0; acc.lin = 0; acc.res = 0;
        if (ind==places.length-1) ind = 0; else ind++;
        document.getElementById('placeSwitch').innerHTML = (ind+1);
        document.getElementById('address').innerHTML = ( places[ind] ).formatted_address;
        
        if ( document.forms['transfer-type-select']['transfer-type'].value == 'Teleport' ) {
            map.setCenter( (places[ind]).geometry.location ); 
            map.setZoom(20);
        } else  {
            destCoords = (places[0]).geometry.location;
            document.getElementById('dest').style.visibility = "visible";
        };
    });

};






window.onload = function () {

    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        document.getElementById('start').style.visibility = "visible";
        document.getElementById('left').style.visibility = "visible";
        document.getElementById('right').style.visibility = "visible";
        document.getElementById('acc').style.visibility = "visible";
        document.getElementById('brake').style.visibility = "visible";
    };
  
    var mapDiv = document.getElementById("map");
    Diag = Math.sqrt( window.innerHeight*window.innerHeight + window.innerWidth*window.innerWidth) + 20;
    mapDiv.style.width = Math.trunc(Diag) + 'px';
    mapDiv.style.height = Math.trunc(Diag) + 'px';
    mapDiv.style.left = ((-0.5) * Diag + window.innerWidth * 0.5) + 'px';
    mapDiv.style.top = ((-0.5) * Diag + window.innerHeight * 0.5) + 'px';

    window.addEventListener("resize", function() {

        Diag = Math.sqrt( window.innerHeight*window.innerHeight + window.innerWidth*window.innerWidth) + 20;
    
        mapDiv.style.width = Math.trunc(Diag) + 'px';
        mapDiv.style.height = Math.trunc(Diag) + 'px';
    
        mapDiv.style.left = ((-0.5) * Diag + window.innerWidth * 0.5) + 'px';
        mapDiv.style.top = ((-0.5) * Diag + window.innerHeight * 0.5) + 'px';
    
    });

    setInterval( function dropTime() {

        if (keepTime) time += 0.03;
        if (keepSteerTime) steerTime += 0.03;
        if (acc.res != 0) vel.lin = vel.lin;

        if ( keys.up ) {
            acc.start();
        } else if ( keys.down ) {
            acc.rev();
        } else if ( keys.ctrl ) {
            acc.EB();
        } else {
            acc.stop();
        };

        if ( keys.right || keys.left ) steer.start();
        else steer.stop();

        // document.getElementById("speedo").innerHTML =  `<strong><em>Diagnostic:</em></strong><small>
        //                                                 Velocity: ${Math.trunc(vel.lin)};
        //                                                 Acceleration: ${(acc.res).toFixed(2)};
        //                                                 Time: ${time.toFixed(3)} s;
        //                                                 Steer Velocity: ${(steer.vel).toFixed(3)};
        //                                                 Steer Time: ${steerTime.toFixed(2)}</small>`;

        document.getElementById("speed").innerHTML = Math.trunc(CONV_KPH * vel.lin) + "km/h  |  " +
                                                     Math.trunc(CONV_MPH * vel.lin) + "mph  |  " +
                                                     Math.trunc(CONV_SI * vel.lin)  + "m/s";

        steer.angle += (   steer.vel * (Math.cbrt(Math.trunc(vel.lin)/10000)) * (keys.left - keys.right)    );
        mapDiv.style.transform = 'rotate(' + steer.angle + 'deg)';
        document.getElementById('compass').style.transform = 'rotate(' + steer.angle + 'deg)';
        traverseBy((-1)* vel.lin * 0.001); moveDest();

    }, 30);

};