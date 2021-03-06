function DistOverlay(a, b, c) {
    this.pos_ = a, this.text_ = b, this.map_ = c, this.div_ = null, this.setMap(c)
}
var RotateIcon = function(a) {
    this.options = a || {}, this.rImg = a.img || new Image, this.rImg.src = this.rImg.src || this.options.url || "", this.options.width = this.options.width || this.rImg.width || 52, this.options.height = this.options.height || this.rImg.height || 60, canvas = document.createElement("canvas"), canvas.width = this.options.width, canvas.height = this.options.height, this.context = canvas.getContext("2d"), this.canvas = canvas
};
RotateIcon.makeIcon = function(a) {
    return new RotateIcon({
        img: a
    })
}, RotateIcon.prototype.setRotation = function(a) {
    var b = this.context,
        c = a * Math.PI / 180,
        d = this.options.width / 2,
        e = this.options.height / 2;
    return b.clearRect(0, 0, this.options.width, this.options.height), b.save(), b.translate(d, e), b.rotate(c), b.translate(-d, -e), b.drawImage(this.rImg, 0, 0), b.restore(), this
}, RotateIcon.prototype.getUrl = function() {
    return this.canvas.toDataURL("image/png")
}, "undefined" == typeof Uint8Array.from && (Uint8Array.from = function(a) {
    for (var b = new Uint8Array(a.length), c = 0; c < a.length; ++c) b[c] = a[c];
    return b
});
var getUrlParameter = function(a) {
        var b, c, d = decodeURIComponent(window.location.search.substring(1)),
            e = d.split("&");
        for (c = 0; c < e.length; c++)
            if (b = e[c].split("="), b[0] === a) return void 0 === b[1] ? !0 : b[1]
    },
    g_ctrlkeydown = !1,
    g_shiftkeydown = !1;
window.onkeydown = function(a) {
    a && (g_ctrlkeydown = "Control" == a.key || 1 == a.ctrlKey || 1 == a.metaKey, g_shiftkeydown = "Shift" == a.key || 1 == a.shiftKey)
}, window.onkeyup = function(a) {
    g_ctrlkeydown = !1, g_shiftkeydown = !1
};
var g_user, g_tabState, GSWaypoint = function(a) {
    this.altitude = 30, this.aglAltitude = this.altitude, this.altitudeMode = 0, this.turnMode = 0, this.heading = 0, this.speed = 0, this.stayTime = 3, this.maxReachTime = 0, this.latitude = 0, this.longitude = 0, this.dampingDistance = .2, this.gimbalCtrl = a.defaultGimbalPitchMode, this.gimbalPitchAngle = 0, this.numActions = 0, this.repeatActions = 1, this.actions = [], this.actionParams = [], this.targetPoi = null, this.manualHeadingOverride = !1
};
GSWaypoint.prototype = Object.create(GSWaypoint.prototype);
var GSMission = function() {
    this.headingMode = 3, this.finishAction = 0, this.pathMode = 1, this.horizontalSpeed = 8, this.rcSpeed = 8, this.repeatNum = 0, this.autoGimbal = 0, this.parseMission = null
};
GSMission.prototype = Object.create(GSMission.prototype);
var GSPOI = function() {
    this.latitude = 0, this.longitude = 0, this.altitude = 1, this.aglAltitude = this.altitude, this.altitudeMode = 0
};
GSPOI.prototype = Object.create(GSPOI.prototype);
var MarkerSettings = Object.freeze({
        Altitude: 1,
        Speed: 2,
        CurveSize: 3,
        Heading: 4,
        Poi: 5,
        GimbalPitch: 6,
        Actions: 7
    }),
    AltitudeMode = Object.freeze({
        AboveTakeOff: 0,
        AboveGround: 1
    }),
    GStool = {
        VERSION: 2,
        MISSION_CURR_VERSION: 9,
        ACTIONS: {
            0: "Stay For",
            1: "Take Photo",
            2: "Start Recording",
            3: "Stop Recording",
            4: "Rotate Aircraft",
            5: "Tilt Camera"
        },
        myLoc: null,
        map: null,
        cluster: [],
        discoverData: [],
        filters: {
            hv: !0
        },
        overlay: null,
        ParseMission: null,
        myMissions: null,
        isClone: null,
        markerToWaypoints: null,
        movingEnabled: !1,
        rotateEnabled: !1,
        scalingEnabled: !1,
        poiMarkers: null,
        currMission: null,
        defaultCurveSize: 75,
        defaultGimbalPitchMode: 0,
        maxDamping: 1e3,
        missionLine: null,
        unit: 0,
        currIdx: null,
        isBatchEditing: !1,
        batchWp: new GSWaypoint(this),
        batchEditCurvePercent: 75,
        batchAltitudeAboveCurrent: !1,
        batchSettingsModifiedState: {},
        selectedIdxs: [],
        lastWP: null,
        currentHash: null,
        curves: null,
        elevationCache: {},
        groundLocationReference: new google.maps.LatLng(0, 0),
        formatDistance: function(a, b, c, d) {
            return 1 == this.unit ? b && 3.2808399 * a > 1e3 ? parseFloat((621371e-9 * a).toFixed(1)) + (d ? "" : "m.") : Math.floor(3.2808399 * a) + (d ? "" : "ft") : b && a > 1e3 ? parseFloat((a / 1e3).toFixed(1)) + (d ? "" : "km") : c && c > 0 ? parseFloat(a.toFixed(c)) + (d ? "" : "m") : Math.floor(a) + (d ? "" : "m")
        },
        formatSpeed: function(a) {
            return 1 == this.unit ? (2.2369 * a).toFixed(1) + "mph" : (3.6 * a).toFixed(1) + "km/h"
        },
        updateLatLongET: function(a, b) {
            $("#et-lat").val(a.toFixed(6)), $("#et-long").val(b.toFixed(6))
        },
        updateCurvSlider: function(a) {
            this.sliderCurv.slider("setValue", a), $("#et-curv").val(a + "%")
        },
        updateCruisingSpeedSlider: function(a) {
            this.sliderCruisingSpeed.slider("setValue", a), $("#et-cruisingspd").val(this.formatSpeed(a / 10))
        },
        updateMaxSpeedSlider: function(a) {
            this.sliderMaxSpeed.slider("setValue", a), $("#et-maxspd").val(this.formatSpeed(a / 10))
        },
        updateHESlider: function(a) {
            this.sliderHe.slider("setValue", a), $("#et-he").val(a + "Â°")
        },
        getDisplayedHeading: function(a) {
            return 0 > a ? a + 360 : a
        },
        getRealHeading: function(a) {
            return a > 180 ? a - 360 : a
        },
        updateCSSlider: function(a) {
            this.sliderCs.slider("setValue", a), $("#et-cs").val(this.selectedIdxs.length > 1 ? a + "%" : this.formatDistance.call(this, a))
        },
        updateAltSlider: function(a) {
            this.sliderAlt.slider("setValue", a), $("#et-alt").val(this.formatDistance.call(this, a, !1, 1))
        },
        updateSpeedSlider: function(a) {
            this.sliderSpeed.slider("setValue", a), $("#et-wpspeed").val(0 == a && 1 == this.acType ? "Cruising" : this.formatSpeed.call(this, a))
        },
        updateStaytimeSlider: function(a) {
            this.sliderStay.slider("setValue", a), $("#slider-stay-label").text("Stay Time: " + a + "s")
        },
        checkLatitude: function(a) {
            var b = Math.abs(a);
            return b > 1e-6 && 90 >= b
        },
        checkLongitude: function(a) {
            var b = Math.abs(a);
            return b > 1e-6 && 180 >= b
        },
        initialize: function() {
            g_user = Parse.User.current(), this.ParseMission = Parse.Object.extend("Mission");
            for (var a in MarkerSettings) this.batchSettingsModifiedState[a] = !1;
            this.isClone = !1;
            var b = {
                center: {
                    lat: 38,
                    lng: -56
                },
                zoom: 4,
                keyboardShortcuts: !1,
                scaleControl: !0,
                fullscreenControl: !1,
                tilt: 0,
                rotateControl: !0
            };
            this.map = new google.maps.Map(document.getElementById("map-canvas"), b), this.map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
            var c = this,
                d = {
                    gridSize: 50,
                    maxZoom: 15,
                    imagePath: "assets/img/cluster/m"
                };
            this.cluster = new MarkerClusterer(this.map, [], d), google.maps.event.addListener(this.map, "clusterclick", function(a, b) {
                c.clusterClicked = !0
            }), this.overlay = new google.maps.OverlayView, this.overlay.draw = function() {}, this.overlay.setMap(this.map), this.markerToWaypoints = [], this.poiMarkers = [], this.curves = [], this.myMissions = {}, this.currMission = new GSMission, google.maps.event.addListener(this.map, "heading_changed", function(a) {
                c.refreshGSHeadings(!1)
            }), google.maps.event.addListener(this.map, "click", function(a) {
                setTimeout(function() {
                    if (c.clusterClicked) c.clusterClicked = !1;
                    else {
                        if (c.ignoreNextClick) return void(c.ignoreNextClick = !1);
                        if (c.rotateEnabled) return c.rotateMarker && c.rotateMarker.setMap(null), void(c.rotateMarker = new google.maps.Marker({
                            position: a.latLng,
                            map: c.map,
                            draggable: !0,
                            icon: {
                                url: "../assets/img/delete30.png",
                                anchor: new google.maps.Point(16, 16)
                            }
                        }));
                        if (c.movingEnabled) return c.moveMissionToLocation(a.latLng, 0, -1), c.refreshMissionLine.call(c), void c.setGroundLocationReference(c.markerToWaypoints[0].marker.getPosition(), !0, !1, function() {
                            null != c.currIdx && c.refreshDisplayedElevation(c.currIdx < 0 ? c.poiMarkers[Math.abs(c.currIdx) - 1].marker.getPosition() : c.markerToWaypoints[c.currIdx].marker.getPosition())
                        });
                        if (!c.canAddWP()) return;
                        var b = a.latLng.lat(),
                            d = a.latLng.lng();
                        if (g_shiftkeydown && c.markerToWaypoints.length >= 1) {
                            var e = c.snapToLine(a.latLng, c.markerToWaypoints.length);
                            b = e.lat(), d = e.lng()
                        }
                        c.addWaypoint.call(c, !1, b, d, 30, 0 == c.acType ? 2 : 0, 3, 0, 0, 1 == c.acType ? 0 : 360), c.refreshMissionLine(), c.refreshGSHeadings(!1);
                        var f = c.markerToWaypoints.length - 1,
                            g = c.markerToWaypoints[f];
                        c.updateCurrentSelection(f, !1, !1, !0), 1 == c.markerToWaypoints.length ? c.setGroundLocationReference(g.marker.getPosition(), !0, !1, function() {
                            c.refreshTotalTimeAndDistance(), c.refreshDisplayedElevation(g.marker.getPosition())
                        }) : null != c.lastWP && c.lastWP.altitudeMode == AltitudeMode.AboveGround ? c.getElevationsWithCache([c.groundLocationReference, g.marker.getPosition()], function(a, b) {
                            0 == a && c.setAltitudeFinal(f, b[1] - b[0] + g.wp.aglAltitude), c.refreshTotalTimeAndDistance(), c.refreshDisplayedElevation(g.marker.getPosition())
                        }) : (c.refreshTotalTimeAndDistance(), c.refreshDisplayedElevation(g.marker.getPosition()))
                    }
                }, 0)
            }), google.maps.event.addListener(this.map, "rightclick", function(a) {
                c.addPOI.call(c, a.latLng, 1, !0), c.updateCurrentSelection(-c.poiMarkers.length, !1)
            });
            var e = localStorage ? localStorage.getItem("gsUnit") : 0;
            this.unit = null == e || 1 != e && 0 != e ? 0 : e;
            var f = localStorage ? parseInt(localStorage.getItem("acType")) : 1;
            this.acType = null != f && 0 == f ? f : 1, this.refreshAircraftControls(), this.showDiscover = localStorage && !isNaN(parseInt(localStorage.getItem("showdiscover"))) ? parseInt(localStorage.getItem("showdiscover")) : !0, this.enableElevation = localStorage && !isNaN(parseInt(localStorage.getItem("enableelevation"))) ? parseInt(localStorage.getItem("enableelevation")) : !1, this.enableElevation ? $("#aboveground-setting").css("display", "inline-block") : $("#aboveground-setting").css("display", "none"), this.defaultCurveSize = localStorage && !isNaN(parseFloat(localStorage.getItem("defcurvesize"))) ? parseFloat(localStorage.getItem("defcurvesize")) : 75, this.defaultGimbalPitchMode = localStorage && !isNaN(parseInt(localStorage.getItem("defgpitchmode"))) ? parseInt(localStorage.getItem("defgpitchmode")) : 0, this.currMission.horizontalSpeed = localStorage && !isNaN(parseFloat(localStorage.getItem("hspeed"))) ? parseFloat(localStorage.getItem("hspeed")) : 8, this.currMission.rcSpeed = localStorage && !isNaN(parseFloat(localStorage.getItem("rspeed"))) ? parseFloat(localStorage.getItem("rspeed")) : 8;
            var g = document.createElement("input");
            g.placeholder = "Search...", g.type = "text", g.id = "pac-input";
            var h = new google.maps.places.SearchBox(g);
            this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(g), h.addListener("places_changed", function() {
                var a = h.getPlaces();
                if (0 != a.length) {
                    var b = new google.maps.LatLngBounds;
                    a.forEach(function(a) {
                        a.geometry && a.geometry.viewport ? b.union(a.geometry.viewport) : b.extend(a.geometry.location)
                    }), c.map.fitBounds(b)
                }
            });
            var i = document.createElement("div");
            i.id = "wpsettings", i.style.display = "none";
            var j = $("#wpsettings-content").clone();
            $("#wpsettings-content").remove(), i.appendChild(j.get(0)), i.index = 1, this.map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(i);
            var k = document.createElement("div"),
                l = $('<a class="btn btn-default" style="font-weight:bold;" href="javascript:;" role="button" data-toggle="tooltip" data-placement="right" title="Clear"><i class="fa fa-eraser"></i></a>').get(0);
            l.style.marginBottom = "100px", l.style.marginLeft = "20px", k.appendChild(l), k.index = 2, google.maps.event.addDomListener(k, "click", function() {
                $("#clearall").modal("show")
            }), this.map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(k);
            var m = document.createElement("div"),
                n = $('<a class="btn btn-default togglebtn" style="font-weight:bold;" id="movebtn" href="javascript:;" role="button" data-toggle="tooltip" data-placement="right" title="Move"><i class="fa fa-arrows"></i></a>').get(0);
            n.style.marginBottom = "20px", n.style.marginLeft = "20px", m.appendChild(n), m.index = 3, google.maps.event.addDomListener(m, "click", function() {
                var a = !c.movingEnabled;
                c.toggleAllOff(), c.toggleMove(a)
            }), this.map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(m), m = document.createElement("div"), n = $('<a class="btn btn-default togglebtn" style="font-weight:bold;" id="scalebtn" href="javascript:;" role="button" data-toggle="tooltip" data-placement="right" title="Scale"><i class="fa fa-expand"></i></a>').get(0), n.style.marginBottom = "20px", n.style.marginLeft = "20px", m.appendChild(n), m.index = 4, google.maps.event.addDomListener(m, "click", function() {
                var a = !c.scalingEnabled;
                c.toggleAllOff(), c.toggleScale(a)
            }), this.map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(m), m = document.createElement("div"), n = $('<a class="btn btn-default togglebtn" style="font-weight:bold;" id="rotatebtn" href="javascript:;" role="button" data-toggle="tooltip" data-placement="right" title="Rotate"><i class="fa fa-repeat"></i></a>').get(0), n.style.marginBottom = "20px", n.style.marginLeft = "20px", m.appendChild(n), m.index = 5, google.maps.event.addDomListener(m, "click", function() {
                var a = !c.rotateEnabled;
                c.toggleAllOff(), c.toggleRotate(a)
            }), this.map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(m), m = document.createElement("div"), n = $('<a class="btn btn-default" style="font-weight:bold;" id="mylocbtn" href="javascript:;" role="button" data-toggle="tooltip" data-placement="right" title="Home"><i class="fa fa-lg fa-home"></i></a>').get(0), n.style.marginTop = "10px", n.style.marginLeft = "20px", m.appendChild(n), m.index = 1, google.maps.event.addDomListener(m, "click", function() {
                c.homeAction.call(c)
            }), this.map.controls[google.maps.ControlPosition.LEFT_TOP].push(m), m = document.createElement("div"), n = $('<a class="btn btn-default" style="font-weight:bold;" id="globebtn" href="javascript:;" role="button" data-toggle="tooltip" data-placement="right" title="Discover"><i class="fa fa-lg fa-globe"></i></a>').get(0), n.style.marginTop = "10px", n.style.marginLeft = "20px", m.appendChild(n), m.index = 2, google.maps.event.addDomListener(m, "click", function() {
                c.globeAction.call(c)
            }), this.map.controls[google.maps.ControlPosition.LEFT_TOP].push(m);
            var o = document.createElement("div"),
                p = $('<div class="btn-group dropup"> <button class="btn btn-primary dropdown-toggle mission-dropdown-toggle" type="button" aria-haspopup="true" aria-expanded="false">MISSIONS</button> <ul id="dd-miss-ul" class="dropdown-menu dd-missions"> <li><a id="mn-new" href="javascript:;">New</a></li> <li><a id="mn-open" href="javascript:;">Open...</a></li> <li><a id="mn-save" href="javascript:;">Save...</a></li> <li><a id="mn-import" href="javascript:;">Import...</a></li> <li><a id="mn-export" href="javascript:;">Export as CSV</a></li> <li><a id="mn-exportkml" href="javascript:;">Export as KML 3D Path</a></li> </ul></div>').get(0);
            p.style.marginBottom = "40px", p.style.marginRight = "20px", o.appendChild(p), o.index = 1, $(document).on("mouseover", ".mission-dropdown-toggle", function(a) {
                $(".mission-dropdown-toggle").next().css("display", "block")
            }), $(document).on("mouseleave", ".mission-dropdown-toggle", function(a) {
                var b = a.relatedTarget,
                    c = !1;
                b && "" != b.id && (c = "dd-miss-ul" == a.relatedTarget.id || $("#dd-miss-ul").find("#" + a.relatedTarget.id).length > 0), c || $(".mission-dropdown-toggle").next().css("display", "none")
            }), $(document).on("mouseleave", "#dd-miss-ul", function(a) {
                $(".mission-dropdown-toggle").next().css("display", "none")
            }), $(document).on("click", "#mn-open", function() {
                $(".mission-dropdown-toggle").next().css("display", "none"), c.showOpen.call(c)
            }), $(document).on("click", "#mn-new", function() {
                $(".mission-dropdown-toggle").next().css("display", "none"), c.newFile.call(c)
            }), $(document).on("click", "#mn-save", function() {
                $(".mission-dropdown-toggle").next().css("display", "none"), c.showSave.call(c)
            }), $(document).on("click", "#mn-import", function() {
                $(".mission-dropdown-toggle").next().css("display", "none"), c.showImport.call(c)
            }), $(document).on("click", "#mn-export", function() {
                $(".mission-dropdown-toggle").next().css("display", "none"), c.exportCSV.call(c)
            }), $(document).on("click", "#mn-exportkml", function() {
                $(".mission-dropdown-toggle").next().css("display", "none"), c.exportKML.call(c)
            }), this.map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(o);
            var q = document.createElement("div");
            q.id = "msettingsctrldiv";
            var r = $('<a class="btn btn-default" style="font-weight:bold;" href="javascript:;" role="button">SETTINGS</a>').get(0);
            r.style.marginBottom = "40px", r.style.marginRight = "20px", q.appendChild(r), q.index = 2, google.maps.event.addDomListener(q, "click", function() {
                c.showSettings.call(c)
            }), this.map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(q);
            var s = document.createElement("div"),
                n = $('<a class="btn btn-default" style="font-weight:bold;" href="javascript:;" role="button">HELP</a>').get(0);
            n.style.marginBottom = "40px", n.style.marginRight = "20px", s.appendChild(n), s.index = 3, google.maps.event.addDomListener(s, "click", function() {
                $("#shortcuts").modal("show")
            }), this.map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(s), $("#sclosebtn").on("click", function() {
                $("#shortcuts").modal("hide")
            }), s = document.createElement("div"), n = $('<a class="btn btn-danger" style="font-weight:bold;" href="javascript:;" role="button"><i style="color:yellow" class="fa fa-star"></i>&nbsp;ENTER GIVEAWAY&nbsp;<i style="color:yellow" class="fa fa-star"></i></a>').get(0), n.style.display = "none", n.style.marginBottom = "40px", n.style.marginRight = "20px", s.appendChild(n), s.index = 5, google.maps.event.addDomListener(s, "click", function() {
                $("#contestspinner").hide(), $("#contest").find("div.alert").html("").hide(), $("#enterconfirm").html(c.currMission && c.currMission.parseMission && c.currMission.parseMission.get("name") ? "Make sure you want to enter the giveaway with the current mission: <b>" + (c.currMission && c.currMission.parseMission ? "[" + c.currMission.parseMission.get("name") + "]" : "[unknown]") + "</b>, then click Enter below." : '<div class="alert alert-danger">Please open the mission you want to enter the giveaway with first:<br><code>Missions->Open->My Missions->Open a mission</code><br><br>If this is a new mission, save it to your account first (you must be logged in):<br><code>Missions->Save</code></div>'), $("#contest").modal("show")
            }), this.map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(s), $("#cclosebtn").on("click", function() {
                $("#contest").modal("hide")
            }), $("#realenter").on("click", function() {
                if (g_user) $("#contestspinner").show(), Parse.Cloud.run("enterContest", {
                    mId: c.currMission && c.currMission.parseMission ? c.currMission.parseMission.id : null
                }, function(a, b) {
                    var c = $("#contest").find("div.finalalert");
                    c.show(), null == b ? (c.removeClass("alert-danger"), c.addClass("alert-success"), c.html(a)) : (c.removeClass("alert-success"), c.addClass("alert-danger"), c.html(b.message)), $("#contestspinner").hide()
                }, function(a) {
                    console.log("err", a), $("#contestspinner").hide()
                });
                else {
                    var a = $("#contest").find("div.finalalert");
                    a.show(), a.removeClass("alert-success"), a.addClass("alert-danger"), a.html('You must first login to your account:&nbsp;&nbsp;<a href="javascript:;" class="btn btn-primary need-login-btn">Log in</a>')
                }
            });
            var t = document.createElement("div");
            var u = $('<a class="btn btn-default btn-lg litchilogo" style="font-weight:bold;" target="_blank" href="https://flylitchi.com" role="button">&nbsp;</a>').get(0);
            u.style.marginTop = "10px";
            u.style.marginRight = "20px";
          //  t.appendChild(u);
            t.index = 1;
            this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(t);
            g_user ? g_user.fetch(function() {
                c.addLoginButton()
            }) : c.addLoginButton();
            var v = document.createElement("div"),
                w = $('<span id="label-distance" class="label"></span>').get(0);
            w.style.marginTop = "10px", w.style.fontSize = "22px", v.appendChild(w), v.index = 1, this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(v);
            var x = function() {
                var a = function(a) {
                    if (c.updateAltSlider(a), c.selectedIdxs.length > 1) c.setBatchSettingModified("Altitude", !0), c.batchWp.altitude = Math.max(-200, Math.min(a, 500));
                    else {
                        var b = c.currIdx < 0 ? Math.abs(c.currIdx) - 1 : c.currIdx,
                            d = c.currIdx < 0 ? c.poiMarkers[b] : c.markerToWaypoints[b],
                            e = c.currIdx < 0 ? d.poi : d.wp;
                        e.altitudeMode == AltitudeMode.AboveGround ? (e.aglAltitude = Math.max(-200, Math.min(a, 500)), c.getElevationsWithCache([c.groundLocationReference, d.marker.getPosition()], function(a, b) {
                            0 == a && c.setAltitudeFinal(c.currIdx, b[1] - b[0] + e.aglAltitude), c.refreshDisplayedElevation(d.marker.getPosition())
                        })) : c.setAltitudeFinal(c.currIdx, a)
                    }
                };
                c.sliderAlt = $("#slider-alt").slider({
                    formatter: function(a) {
                        return c.formatDistance(a, !1, 1)
                    }
                }), $("#slider-alt").on("change", function(b) {
                    a(b.value.newValue)
                }), $("#et-alt").on("change", function(b) {
                    var d = parseFloat(b.target.value);
                    d = isNaN(d) ? 0 : d, 1 == c.unit && (d /= 3.2808), a(d)
                }), $("#wp-altitude-agl").on("change", function() {
                    var b = $("#wp-altitude-agl").is(":checked");
                    if (!g_user) return $("#wp-altitude-agl").get(0).checked = !b, void c.showAccountNeeded();
                    var d = c.markerToWaypoints.length > 0;
                    c.selectedIdxs.length > 1 ? c.selectedIdxs[0] < 0 && !d ? $("#wp-altitude-agl").get(0).checked = !1 : (c.setBatchSettingModified("Altitude", !0), c.batchWp.altitudeMode = b ? AltitudeMode.AboveGround : AltitudeMode.AboveTakeOff) : c.currIdx < 0 ? d ? (c.poiMarkers[Math.abs(c.currIdx) - 1].poi.altitudeMode = b ? AltitudeMode.AboveGround : AltitudeMode.AboveTakeOff, a(b ? c.poiMarkers[Math.abs(c.currIdx) - 1].poi.altitude : c.poiMarkers[Math.abs(c.currIdx) - 1].poi.aglAltitude)) : $("#wp-altitude-agl").get(0).checked = !1 : (c.markerToWaypoints[c.currIdx].wp.altitudeMode = b ? AltitudeMode.AboveGround : AltitudeMode.AboveTakeOff, c.lastWP = c.markerToWaypoints[c.currIdx].wp, a(b ? c.markerToWaypoints[c.currIdx].wp.altitude : c.markerToWaypoints[c.currIdx].wp.aglAltitude)), $("#wp-altitude-agl").get(0).checked && ($("#wp-altitude-current").get(0).checked = !1)
                }), $("#wp-altitude-current").on("change", function() {
                    var a = $("#wp-altitude-current").is(":checked");
                    c.setBatchSettingModified("Altitude", !0), c.batchAltitudeAboveCurrent = a, a && ($("#wp-altitude-agl").get(0).checked = !1)
                }), c.sliderSpeed = $("#slider-speed").slider({
                    formatter: function(a) {
                        return 0 == a && 1 == c.acType ? "Use Cruising Speed" : c.formatSpeed(a)
                    }
                }), $("#slider-speed").on("change", function(a) {
                    var b = a.value.newValue;
                    $("#et-wpspeed").val(0 == b && 1 == c.acType ? "Cruising" : c.formatSpeed.call(c, b)), c.selectedIdxs.length > 1 ? (c.setBatchSettingModified("Speed", !0), c.batchWp.speed = b) : (c.markerToWaypoints[c.currIdx].wp.speed = b, c.lastWP = c.markerToWaypoints[c.currIdx].wp, c.refreshTotalTimeAndDistance())
                }), $("#et-wpspeed").on("change", function(a) {
                    var b = parseFloat(a.target.value);
                    isNaN(b) && (b = 0), b /= 1 == c.unit ? 2.2369 : 3.6, b = Math.min(15, Math.max(0, b)), c.updateSpeedSlider(b), c.selectedIdxs.length > 1 ? (c.setBatchSettingModified("Speed", !0), c.batchWp.speed = b) : (c.markerToWaypoints[c.currIdx].wp.speed = b, c.lastWP = c.markerToWaypoints[c.currIdx].wp)
                }), c.sliderCs = $("#slider-cs").slider({
                    formatter: function(a) {
                        return c.selectedIdxs.length > 1 ? a + "%" : c.formatDistance(a)
                    }
                }), $("#et-cs").val(c.formatDistance.call(c, .2)), $("#slider-cs").on("change", function(a) {
                    var b = a.value.newValue;
                    if (c.selectedIdxs.length > 1) c.setBatchSettingModified("CurveSize", !0), c.batchEditCurvePercent = b, $("#et-cs").val(b + "%");
                    else {
                        var d = Math.min(c.maxDamping, Math.max(.2, b));
                        $("#et-cs").val(c.formatDistance.call(c, d)), c.markerToWaypoints[c.currIdx].wp.dampingDistance = d, c.isCurveUseful() && c.refreshOneCurve(c.currIdx, !0)
                    }
                }), $("#et-cs").on("change", function(a) {
                    var b = parseInt(a.target.value);
                    c.selectedIdxs.length > 1 ? (c.setBatchSettingModified("CurveSize", !0), b = Math.min(0, Math.max(b, 100)), c.batchEditCurvePercent = b, $("#et-cs").val(b + "%")) : (1 == c.unit && (b /= 3.2808), b = Math.min(c.maxDamping, Math.max(.2, b)), b && b >= .2 && b < c.maxDamping ? (c.updateCSSlider(b), c.markerToWaypoints[c.currIdx].wp.dampingDistance = b, c.isCurveUseful() && c.refreshOneCurve(c.currIdx, !0)) : $("#et-cs").val(c.formatDistance.call(c, c.markerToWaypoints[c.currIdx].wp.dampingDistance)))
                }), c.sliderHe = $("#slider-he").slider({
                    formatter: function(a) {
                        return a + "Â°"
                    }
                }), $("#et-he").val("0Â°"), $("#slider-he").on("change", function(a) {
                    var b = a.value.newValue;
                    if ($("#et-he").val(b + "Â°"), c.selectedIdxs.length > 1) c.setBatchSettingModified("Heading", !0), c.batchWp.heading = c.getRealHeading(b), c.batchWp.manualHeadingOverride = !0;
                    else {
                        var d = c.markerToWaypoints[c.currIdx];
                        d.wp.heading != c.getRealHeading(Math.round(b)) && (d.wp.targetPoi = null), d.wp.manualHeadingOverride = !0, d.wp.heading = c.getRealHeading(b), c.updateOneGSHeadingRotation(c.currIdx), c.lastWP = d.wp
                    }
                }), $("#et-he").on("change", function(a) {
                    var b = parseInt(a.target.value);
                    if (b && b >= 0 && 360 >= b)
                        if (c.updateHESlider(b), c.selectedIdxs.length > 1) c.setBatchSettingModified("Heading", !0), c.batchWp.heading = c.getRealHeading(Math.round(b)), c.batchWp.manualHeadingOverride = !0;
                        else {
                            var d = c.markerToWaypoints[c.currIdx];
                            d.wp.heading != c.getRealHeading(Math.round(b)) && (d.wp.targetPoi = null), d.wp.manualHeadingOverride = !0, d.wp.heading = c.getRealHeading(b), c.updateOneGSHeadingRotation(c.currIdx), c.lastWP = d.wp
                        } else $("#et-he").val(c.getDisplayedHeading(c.markerToWaypoints[c.currIdx].wp.heading) + "Â°")
                }), $("#et-lat").on("change", function(a) {
                    var b = parseFloat(a.target.value),
                        d = c.currIdx < 0 ? c.poiMarkers[Math.abs(c.currIdx) - 1] : c.markerToWaypoints[c.currIdx],
                        e = c.currIdx < 0 ? d.poi : d.wp;
                    b && c.checkLatitude(b) ? (e.latitude = b, c.updateLatLongET(e.latitude, e.longitude), c.repositionMarker(c.currIdx)) : $("#et-lat").val(e.latitude.toFixed(6))
                }), $("#et-long").on("change", function(a) {
                    var b = parseFloat(a.target.value),
                        d = c.currIdx < 0 ? c.poiMarkers[Math.abs(c.currIdx) - 1] : c.markerToWaypoints[c.currIdx],
                        e = c.currIdx < 0 ? d.poi : d.wp;
                    b && c.checkLongitude(b) ? (e.longitude = b, c.updateLatLongET(e.latitude, e.longitude), c.repositionMarker(c.currIdx)) : $("#et-long").val(e.longitude.toFixed(6))
                }), $("#show-discover").get(0).checked = c.showDiscover, $("#show-discover").on("change", function() {
                    c.showDiscover = $(this).is(":checked") ? 1 : 0, localStorage && localStorage.setItem("showdiscover", c.showDiscover), c.refreshDiscoverMarkers(0)
                }), $("#enable-elevation").get(0).checked = c.enableElevation, $("#enable-elevation").on("change", function() {
                    c.enableElevation = $(this).is(":checked") ? 1 : 0, localStorage && localStorage.setItem("enableelevation", c.enableElevation), c.enableElevation ? $("#aboveground-setting").css("display", "inline-block") : ($("#aboveground-setting").css("display", "none"), null != c.lastWP && (c.lastWP.altitudeMode = AltitudeMode.AboveTakeOff)), null != c.currIdx && c.refreshDisplayedElevation(c.currIdx < 0 ? c.poiMarkers[Math.abs(c.currIdx) - 1].marker.getPosition() : c.markerToWaypoints[c.currIdx].marker.getPosition())
                }), $("input[name=unitradio][id=option" + c.unit + "]").click(), $("input[name=unitradio]").on("change", function(a) {
                    c.switchUnit()
                }), $("input[name=headingmoderadio][id=option" + c.currMission.headingMode + "]").click(), $("input[name=headingmoderadio]").on("change", function(a) {
                    c.currMission.headingMode = parseInt($("input[name=headingmoderadio]:checked").val()), null !== c.currIdx && c.currIdx >= 0 && c.updateCurrentSelection(c.currIdx, !1), c.refreshGSHeadings(!1)
                }), $("input[name=finishactionradio][id=option" + c.currMission.finishAction + "]").click(), $("input[name=finishactionradio]").on("change", function(a) {
                    c.currMission.finishAction = parseInt($("input[name=finishactionradio]:checked").val()), c.refreshMissionLine(!1), c.refreshTotalTimeAndDistance()
                }), $("input[name=defgpitchmoderadio][id=option" + c.defaultGimbalPitchMode + "]").click(), $("input[name=defgpitchmoderadio]").on("change", function(a) {
                    c.defaultGimbalPitchMode = parseInt($("input[name=defgpitchmoderadio]:checked").val()), localStorage && localStorage.setItem("defgpitchmode", c.defaultGimbalPitchMode)
                }), $("input[name=pathradio][id=option" + c.currMission.pathMode + "]").click(), $("input[name=pathradio]").on("change", function(a) {
                    c.currMission.pathMode = parseInt($("input[name=pathradio]:checked").val()), null !== c.currIdx && c.currIdx >= 0 && c.updateCurrentSelection(c.currIdx, !1), c.refreshMissionLine(!1)
                }), $("input[name=gpitchctrlradio]").on("change", function(a) {
                    c.updateGimbalMode(a.target.value)
                }), $("#et-gpitch").on("change", function(a) {
                    var b = parseInt(a.target.value);
                    c.updateGimbalPitchAngle(b >= -90 && 30 >= b ? b : c.markerToWaypoints[c.currIdx].wp.gimbalPitchAngle)
                }), c.sliderStay = $("#slider-stay").slider({
                    formatter: function(a) {
                        return a + "s"
                    }
                }), $("#slider-stay-label").text("Stay Time: 3s"), $("#slider-stay").on("change", function(a) {
                    var b = a.value.newValue;
                    $("#slider-stay-label").text("Stay Time: " + b + "s"), c.markerToWaypoints[c.currIdx].wp.stayTime = b, c.lastWP = c.markerToWaypoints[c.currIdx].wp
                }), $("#checkbox-banked").on("click", function() {
                    c.markerToWaypoints[c.currIdx].wp.turnMode = $(this).is(":checked") ? 1 : 0, c.lastWP = c.markerToWaypoints[c.currIdx].wp
                }), c.sliderCruisingSpeed = $("#slider-cruisingspd").slider({
                    formatter: function(a) {
                        return c.formatSpeed(a / 10)
                    }
                }), $("#slider-cruisingspd").on("change", function(a) {
                    var b = a.value.newValue;
                    $("#et-cruisingspd").val(c.formatSpeed(b / 10)), c.currMission.horizontalSpeed = b / 10, localStorage && localStorage.setItem("hspeed", c.currMission.horizontalSpeed), c.refreshTotalTimeAndDistance()
                }), $("#et-cruisingspd").on("change", function(a) {
                    var b = parseFloat(a.target.value);
                    b /= 1 == c.unit ? 2.2369 : 3.6, b && b >= 0 && 15 >= b ? (c.updateCruisingSpeedSlider(10 * b), c.currMission.horizontalSpeed = b, localStorage && localStorage.setItem("hspeed", c.currMission.horizontalSpeed), c.refreshTotalTimeAndDistance()) : $("#et-cruisingspd").val(c.formatSpeed(c.currMission.horizontalSpeed))
                }), c.updateCruisingSpeedSlider(10 * c.currMission.horizontalSpeed), c.sliderMaxSpeed = $("#slider-maxspd").slider({
                    formatter: function(a) {
                        return c.formatSpeed(a / 10)
                    }
                }), $("#slider-maxspd").on("change", function(a) {
                    var b = a.value.newValue;
                    $("#et-maxspd").val(c.formatSpeed(b / 10)), c.currMission.rcSpeed = b / 10, localStorage && localStorage.setItem("rspeed", c.currMission.rcSpeed), c.refreshTotalTimeAndDistance()
                }), $("#et-maxspd").on("change", function(a) {
                    var b = parseFloat(a.target.value);
                    b /= 1 == c.unit ? 2.2369 : 3.6, b && b >= 2 && 15 >= b ? (c.updateMaxSpeedSlider(10 * b), c.currMission.rcSpeed = b, localStorage && localStorage.setItem("rspeed", c.currMission.rcSpeed), c.refreshTotalTimeAndDistance()) : $("#et-maxspd").val(c.formatSpeed(c.currMission.rcSpeed))
                }), c.updateMaxSpeedSlider(10 * c.currMission.rcSpeed), c.sliderCurv = $("#slider-curv").slider({
                    formatter: function(a) {
                        return a + "%"
                    }
                }), $("#slider-curv").on("change", function(a) {
                    var b = a.value.newValue;
                    $("#et-curv").val(b + "%"), c.defaultCurveSize = b, localStorage && localStorage.setItem("defcurvesize", c.defaultCurveSize)
                }), $("#et-curv").on("change", function(a) {
                    var b = parseInt(a.target.value);
                    b && b >= 0 && 100 >= b ? (c.defaultCurveSize = b, c.updateCurvSlider(b), localStorage && localStorage.setItem("defcurvesize", c.defaultCurveSize)) : $("#et-curv").val(c.defaultCurveSize + "%")
                }), c.updateCurvSlider(c.defaultCurveSize), $("#action-add").on("click", function() {
                    var a = c.selectedIdxs.length > 1,
                        b = a ? c.batchWp : c.markerToWaypoints[c.currIdx].wp;
                    a && c.setBatchSettingModified("Actions", !0), b.numActions < 15 && (c.addAction(b.numActions, 0, 0), b.actions.push(0), b.actionParams.push(0), ++b.numActions, c.refreshNumActions(), $("#actionlist").scrollTop($("#actionlist")[0].scrollHeight))
                }), $("#filter-hasvideo").on("change", function() {
                    c.filters.hv = $(this).is(":checked") ? 1 : 0, c.refreshDiscoverMarkers(0)
                }), $("#downloadbtn").on("click", function() {
                    c.onSave.call(c)
                }), $("#importbtn").on("click", function() {
                    c["import"].call(c)
                }), $("#mission-refresh-btn").on("click", function() {
                    c.refreshCurrent.call(c)
                }), $("#mclosebtn").on("click", function() {
                    $("#msettings").modal("hide")
                }), $("#facebookbtn").on("click", function() {
                    c.shareFB.call(c, location.href)
                }), $("#delwp").on("click", function() {
                    c.deleteObj.call(c)
                }), $("#inswp").on("click", function() {
                    c.insertWP.call(c)
                }), $("#prevwp").on("click", function() {
                    c.prevWP.call(c)
                }), $("#nextwp").on("click", function() {
                    c.nextWP.call(c)
                }), $("#closewp").on("click", function() {
                    c.hideWPSettings()
                }), $("#batch-cancel").on("click", function() {
                    c.hideWPSettings()
                }), $("#batch-selectall").on("click", function() {
                    c.batchSelectAll.call(c)
                }), $("#batch-apply").on("click", function() {
                    c.batchApply.call(c)
                }), $("#batch-delete").on("click", function() {
                    $("#batchdel").modal("show")
                }), $("#clearall-clear").on("click", function() {
                    c.toggleAllOff(), c.isClone = !1, c.reset.call(c), $("#clearall").modal("hide")
                }), $("#clearall-cancel").on("click", function() {
                    $("#clearall").modal("hide")
                }), $("#batchdel-cancel").on("click", function() {
                    $("#batchdel").modal("hide")
                }), $("#batchdel-delete").on("click", function() {
                    c.batchDelete.call(c), $("#batchdel").modal("hide")
                }), $(document).on("click", "#pano-preset", function() {
                    c.panoPreset.call(c, $(this))
                }), $(document).on("click", ".need-login-btn", function() {
                    $("#contest").modal("hide"), $("#openmodal").modal("hide"), $("#downloadalert").modal("hide"), $("#login-error-div").hide(), $("#login-error").html(""), $("#login-modal").modal("show")
                }), $(document).on("click", "#loginbtn", function() {
                    $("#login-error-div").hide(), $("#login-error").html(""), $("#login-modal").modal("show")
                }), $(document).on("click", "#logoutbtn", function() {
                    Parse.User.logOut(), g_user = null, c.myMissions = {}, setTimeout(function() {
                        $("#loginblock").html(c.getLoginButtonHTML())
                    }, 250)
                }), $("#login-form").on("submit", function() {
                    return c.doLogin(), !1
                }), $("#fblogin").on("click", function() {
                    c.doFBLogin()
                }), $("#register-go").on("click", function() {
                    $("#login-modal").modal("hide"), $("#register-error-div").hide(), $("#register-error").html(""), $("#register-modal").modal("show")
                }), $("#register-form").on("submit", function() {
                    return c.doRegister(), !1
                }), $("#forgot-go").on("click", function() {
                    $("#login-modal").modal("hide"), $("#forgot-error-div").hide(), $("#forgot-error").html(""), $("#forgot-modal").modal("show")
                }), $("#forgot-form").on("submit", function() {
                    return c.doForgot(), !1
                }), $(document).on("click", "a.share-mission", function() {
                    c.shareFB.call(c, "https://flylitchi.com/hub?m=" + $(this).data("id"));

                }), $(document).on("change", "input.private-mission", function() {
                    c.setMissionPublicReadable($(this).is(":checked"), $(this).data("id"))
                }), $(document).popover({
                    selector: "a.video-mission",
                    html: !0,
                    title: function() {
                        return $(this).parent().find(".head").html()
                    },
                    content: function() {
                        return $(this).parent().find(".content").html()
                    }
                }), $(document).on("click", ".video-url-form > button", function() {
                    c.saveVideoUrl($(this).data("id"), $(this).parent().find('input[type="text"]').val()), $("a.video-mission[data-id=" + $(this).data("id") + "]").popover("hide")
                }), $(document).on("click", "a.delete-mission", function() {
                    c.deleteMission($(this).data("id"))
                }), $(document).on("click", "a.open-mission", function() {
                    $("#openmodal").modal("hide"), c.openFromCloud($(this).data("id"))
                }), $(document).on("click", "a.download-mission", function() {
                    var a = new Parse.Query("Mission");
                    a.get($(this).data("id"), {
                        success: function(a) {
                            Parse.Cloud.run("getMission", {
                                url: a.get("file").url()
                            }, function(b) {
                                var d = b.buffer;
                                c.triggerDownload(Uint8Array.from(d).buffer, a.get("name"))
                            }, function(a) {})
                        },
                        error: function(a, b) {}
                    })
                }), $('a[data-toggle="tab"]').on("show.bs.tab", function(a) {
                    if ("mymissions-a" == a.target.id) c.refreshMyMissions();
                    else if ("pubmissions-a" == a.target.id) {
                        var b = $("#pubmissions-rows").html();
                        (void 0 == b || "" == b) && c.pubMissionHTML && navigator.userAgent.toLowerCase().indexOf("firefox") > -1 && $("#pubmissions-rows").html(c.pubMissionHTML)
                    }
                }), $('[data-toggle="tooltip"]').tooltip(), $(document).on("keyup", function(a) {
                    switch (a.keyCode) {
                        case 13:
                            $("#downloadalert").is(":visible") && c.onSave.call(c);
                            break;
                        case 46:
                            "input" !== a.target.tagName.toLowerCase() && (c.selectedIdxs.length > 1 ? $("#batchdel").modal("show") : c.deleteObj.call(c));
                            break;
                        case 37:
                            "input" !== a.target.tagName.toLowerCase() && c.selectedIdxs.length <= 1 && c.prevWP.call(c);
                            break;
                        case 39:
                            "input" !== a.target.tagName.toLowerCase() && c.selectedIdxs.length <= 1 && c.nextWP.call(c);
                            break;
                        case 27:
                            c.hideWPSettings();
                            break;
                        case 45:
                            c.selectedIdxs.length <= 1 && c.insertWP.call(c)
                    }
                }), c.refreshTotalTimeAndDistance.call(c), !c.readQuery(), c.refreshDiscoverMarkers(0), mobileAndTabletcheck() && $("#nomobilesupport").modal("show")
            };
            ! function() {
                var a, b = 250,
                    c = 50;
                a = window.setInterval(function() {
                    if ("hidden" != g_tabState) {
                        var d = $("#slider-alt").length > 0;
                        d && (b -= c, 0 >= b && (window.clearInterval(a), x()))
                    }
                }, c)
            }(), c.headingIcon = new Image, c.headingIcon.onload = function() {}, c.headingIcon.src = "../assets/img/heading_blue.png", c.wpMarkerSIcon = new Image, c.wpMarkerSIcon.onload = function() {}, c.wpMarkerSIcon.src = "../assets/img/waypoint_marker_S.png", c.wpMarkerXLIcon = new Image, c.wpMarkerXLIcon.onload = function() {}, c.wpMarkerXLIcon.src = "../assets/img/waypoint_marker_XL.png", c.wpGreenMarkerSIcon = new Image, c.wpGreenMarkerSIcon.onload = function() {}, c.wpGreenMarkerSIcon.src = "../assets/img/waypoint_green_marker_S.png", c.wpGreenMarkerXLIcon = new Image, c.wpGreenMarkerXLIcon.onload = function() {}, c.wpGreenMarkerXLIcon.src = "../assets/img/waypoint_green_marker_XL.png", c.poiMarkerSIcon = new Image, c.poiMarkerSIcon.onload = function() {}, c.poiMarkerSIcon.src = "../assets/img/poi_marker_S.png", c.poiMarkerXLIcon = new Image, c.poiMarkerXLIcon.onload = function() {}, c.poiMarkerXLIcon.src = "../assets/img/poi_marker_XL.png", c.poiGreenMarkerSIcon = new Image, c.poiGreenMarkerSIcon.onload = function() {}, c.poiGreenMarkerSIcon.src = "../assets/img/poi_green_marker_S.png", c.poiGreenMarkerXLIcon = new Image, c.poiGreenMarkerXLIcon.onload = function() {}, c.poiGreenMarkerXLIcon.src = "../assets/img/poi_green_marker_XL.png", navigator.geolocation && navigator.geolocation.getCurrentPosition(function(a) {
                c.myLoc = new google.maps.LatLng(a.coords.latitude, a.coords.longitude), !c.loadingFromCloud && location && (!location.hash || location.hash.length <= 1) && (c.map.setCenter(c.myLoc), c.map.setZoom(16))
            }, function() {}), $("#nsdontshowbtn").on("click", function() {
                localStorage && localStorage.setItem("nsdontshow", "true"), $("#newserver").modal("hide")
            }), $("#nsclosebtn").on("click", function() {
                $("#newserver").modal("hide")
            }), !localStorage || "true" != localStorage.getItem("nsdontshow")
        },
        showAccountNeeded: function() {
            $("#login-modal").modal("show"), $("#login-modal-title").text("Please Log in to use this feature"), $("#login-modal").off("hidden.bs.modal").on("hidden.bs.modal", function(a) {
                $("#login-modal-title").text("Log in")
            })
        },
        addLoginButton: function() {
            var a = document.createElement("div"),
                b = $('<span style="display:block" id="loginblock">' + this.getLoginButtonHTML() + "</span>").get(0);
            b.style.marginTop = "16px", b.style.marginRight = "20px", a.appendChild(b), a.index = 2, this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(a)
        },
        doFBLogin: function() {
            var a = this;
            Parse.FacebookUtils.logIn("email", {
                success: function(b) {
                    b.existed() ? (g_user = b, $("#login-modal").modal("hide"), $("#loginblock").html(a.getLoginButtonHTML())) : FB.api("/me?fields=name,first_name,last_name,email", function(c) {
                        b = Parse.User.current(), b.set("name", c.name), b.set("email", c.email), b.set("first_name", c.first_name), b.set("last_name", c.last_name), b.set("fromFB", !0), b.save(null, {
                            success: function(b) {
                                g_user = b, $("#login-modal").modal("hide"), $("#loginblock").html(a.getLoginButtonHTML())
                            },
                            error: function(b, c) {
                                $("#login-modal").modal("hide"), $("#loginblock").html(a.getLoginButtonHTML())
                            }
                        })
                    })
                },
                error: function(a, b) {}
            })
        },
        doLogin: function() {
            var a = $("#inputEmail3").val(),
                b = $("#inputPassword3").val(),
                c = this;
            Parse.User.logIn(a, b, {
                success: function(a) {
                    g_user = a, $("#login-modal").modal("hide"), $("#loginblock").html(c.getLoginButtonHTML())
                },
                error: function(a, b) {
                    $("#login-error-div").show(), $("#login-error").html(b.message.replace("username", "email"))
                }
            })
        },
        doForgot: function() {
            var a = $("#inputEmail10").val();
            Parse.User.requestPasswordReset(a, {
                success: function() {
                    $("#forgot-modal").modal("hide")
                },
                error: function(a) {
                    $("#forgot-error-div").show(), $("#forgot-error").html(a.message.replace("username", "email"))
                }
            })
        },
        doRegister: function() {
            var a = $("#inputName1").val(),
                b = $("#inputEmail4").val(),
                c = $("#inputPassword5").val(),
                d = $("#inputPassword6").val();
            if (c != d) return $("#register-error-div").show(), void $("#register-error").html("Passwords are not the same");
            var e = new Parse.User;
            e.set("username", b), e.set("password", c), e.set("email", b), e.set("name", a);
            var f = this;
            e.signUp(null, {
                success: function(a) {
                    g_user = a, $("#register-modal").modal("hide"), $("#loginblock").html(f.getLoginButtonHTML()), fbq("track", "CompleteRegistration")
                },
                error: function(a, b) {
                    $("#register-error-div").show(), $("#register-error").html(b.message.replace("username", "email"))
                }
            })
        },
        getLoginButtonHTML: function() {
            var a = '<a id="loginbtn" class="btn btn-default" href="javascript:;" role="button" data-toggle="tooltip" data-placement="bottom" title="Log in"><i class="fa fa-lg fa-sign-in"></i></a>';
            return g_user && (a = $(".userbtn").clone(), a.get(0).className = "btn-group", a.find(".logoutbtn").get(0).id = "logoutbtn", a.find(".logoutbtn").get(0).className = "", a = $("<div />").append(a).html(), a = a.replace("___", g_user.get("name"))), a
        },
        deleteQueryParam: function() {
            History.replaceState(null, document.title, location.href.split("?")[0])
        },
        readQuery: function() {
            var a = getUrlParameter("m");
            return a ? (this.openFromCloud(a, !0), !0) : (this.deleteQueryParam(), !1)
        },
        writeURLParam: function(a) {
            var b = location.href.split("?")[0];
            b = b.split("#")[0], History.replaceState(null, document.title, b + "?m=" + a)
        },
        openFromCloud: function(a, b) {
            this.loadingFromCloud = !0;
            var c = new Parse.Query("Mission"),
                d = this;
            c.get(a, {
                success: function(a) {
                    var c = a.get("user");
                    c && g_user && c.id == g_user.id ? (d.currMission.parseMission = a, d.writeURLParam(a.id)) : (d.currMission.parseMission = null, d.isClone = !0, b || d.deleteQueryParam()), d.loadFromCloud(a)
                },
                error: function(a, b) {
                    d.deleteQueryParam()
                }
            })
        },
        readHash: function() {
            var a = location.hash;
            "#" == a.substr(0, 1) && (a = a.substr(1), a.length > 0 && this.restoreWaypointsFromHash(a))
        },
        getWPIcon: function(a, b, c, d, e) {
            var f = d ? this.wpMarkerXLIcon : this.wpMarkerSIcon;
            c && (f = d ? this.wpGreenMarkerXLIcon : this.wpGreenMarkerSIcon);
            var g = document.createElement("canvas"),
                h = f.width,
                i = f.height;
            g.width = h, g.height = i;
            var j = g.getContext("2d");
            j.drawImage(f, 0, 0, h, i), j.font = "bold 12px Arial", j.fillStyle = "white";
            var k = j.measureText(a).width;
            j.fillText(a, h / 2 - k / 2, .7 * i), j.font = "bold 9px Arial";
            var l = .25;
            if (d) {
                var m = this.formatDistance(e, !1, 1, !0) + "",
                    n = m.length,
                    o = m + " (" + this.formatDistance(b, !1, 1, !0) + ")";
                k = j.measureText(o).width;
                for (var p = h / 2 - k / 2, q = i * l, r = 0; r < o.length; ++r) {
                    var s = o.charAt(r);
                    j.fillStyle = n > r ? "yellow" : "white", j.fillText(s, p, q), p += j.measureText(s).width
                }
            } else {
                var o = this.formatDistance(b, !1, 1, !0) + "";
                k = j.measureText(o).width;
                var p = h / 2 - k / 2,
                    q = i * l;
                j.fillText(o, p, q)
            }
            return g.toDataURL("image/png")
        },
        getPOIIcon: function(a, b, c, d, e) {
            var f = d ? this.poiMarkerXLIcon : this.poiMarkerSIcon;
            c && (f = d ? this.poiGreenMarkerXLIcon : this.poiGreenMarkerSIcon);
            var g = document.createElement("canvas"),
                h = f.width,
                i = f.height;
            g.width = h, g.height = i;
            var j = g.getContext("2d");
            j.drawImage(f, 0, 0, h, i), j.font = "bold 12px Arial", j.fillStyle = "white";
            var k = j.measureText(a).width;
            j.fillText(a, h / 2 - k / 2, .82 * i), j.font = "bold 9px Arial";
            var l = .18;
            if (d) {
                var m = this.formatDistance(e, !1, 1, !0) + "",
                    n = m.length,
                    o = m + " (" + this.formatDistance(b, !1, 1, !0) + ")";
                k = j.measureText(o).width;
                for (var p = h / 2 - k / 2, q = i * l, r = 0; r < o.length; ++r) {
                    var s = o.charAt(r);
                    j.fillStyle = n > r ? "yellow" : "white", j.fillText(s, p, q), p += j.measureText(s).width
                }
            } else {
                var o = this.formatDistance(b, !1, 1, !0) + "";
                k = j.measureText(o).width;
                var p = h / 2 - k / 2,
                    q = i * l;
                j.fillText(o, p, q)
            }
            return g.toDataURL("image/png")
        },
        restoreWaypointsFromHash: function(a) {
            var b = LZString.decompressFromBase64(a),
                c = this.getBufferFromString(b);
            this.loadMissionFromArrayBuffer(c.buffer)
        },
        loadMissionFromArrayBuffer: function(a) {
            this.reset();
            var b = new DataView(a, 0),
                c = 0,
                d = b.getInt32(0),
                e = 1818454121 == d,
                f = 1818454122 == d || 1818454123 == d || 1818454124 == d || 1818454125 == d || 1818454126 == d,
                g = 1818454123 == d || 1818454124 == d || 1818454125 == d || 1818454126 == d,
                h = 1818454124 == d || 1818454125 == d || 1818454126 == d,
                i = 1818454125 == d || 1818454126 == d,
                j = 1818454126 == d;
            if (e || f) {
                var k = 4,
                    l = 0,
                    m = 0;
                if (g) {
                    m += 28, h && (m += 4), i && (m += 4), this.currMission.headingMode = b.getInt32(k), $("input[name=headingmoderadio][id=option" + this.currMission.headingMode + "]").click(), k += 4, this.currMission.finishAction = b.getInt32(k), $("input[name=finishactionradio][id=option" + this.currMission.finishAction + "]").click(), k += 4, this.currMission.pathMode = b.getInt32(k), $("input[name=pathradio][id=option" + this.currMission.pathMode + "]").click(), k += 4, this.currMission.horizontalSpeed = b.getFloat32(k), k += 4, this.updateCruisingSpeedSlider(10 * this.currMission.horizontalSpeed), this.currMission.rcSpeed = b.getFloat32(k), k += 4, this.updateMaxSpeedSlider(10 * this.currMission.rcSpeed), this.currMission.repeatNum = b.getInt32(k), k += 4, l = b.getInt16(k), k += 2; {
                        b.getInt16(k)
                    }
                    k += 2
                }
                k = 4 + m;
                var n = 44;
                f && (n += 4);
                var o = -1;
                g && (n += 8, o = b.getInt32(k), k += 4);
                var p = [];
                if (!g || o > 0)
                    for (;;) {
                        if (k + n > a.byteLength) break;
                        var q = new GSWaypoint(this);
                        q.altitude = b.getFloat32(k), q.aglAltitude = q.altitude, q.turnMode = b.getInt32(k + 4), q.heading = b.getFloat32(k + 8), q.speed = b.getFloat32(k + 12) * (0 == this.acType || j || l >= 6 ? 1 : 0), q.stayTime = b.getInt16(k + 16), q.maxReachTime = b.getInt16(k + 18), q.latitude = b.getFloat64(k + 20), q.longitude = b.getFloat64(k + 28);
                        var r = 36;
                        f && (q.dampingDistance = b.getFloat32(k + r), r += 4), g && (q.gimbalCtrl = b.getInt32(k + r), r += 4, q.gimbalPitchAngle = b.getInt32(k + r), r += 4), q.numActions = b.getInt32(k + r), r += 4, q.repeatActions = b.getInt32(k + r), r += 4;
                        var s = 0;
                        if (q.numActions > 0) {
                            s += 8 * q.numActions;
                            for (var t = 0; t < q.numActions; ++t) q.actions.push(b.getInt32(k + r)), r += 4, q.actionParams.push(b.getInt32(k + r)), r += 4
                        }
                        if (p.push(q), ++c, k += s + n, g && c == o) break
                    }
                var u = [];
                if (g) {
                    var v = b.getInt32(k);
                    k += 4;
                    for (var t = 0; v > t; ++t) {
                        var w = new GSPOI;
                        w.latitude = b.getFloat64(k), k += 8, w.longitude = b.getFloat64(k), k += 8, w.altitude = b.getFloat32(k), w.aglAltitude = w.altitude, k += 4, u.push(w)
                    }
                }
                if (l >= 8) {
                    for (var t = 0; t < p.length; ++t) {
                        var q = p[t];
                        q.altitudeMode = b.getInt16(k), k += 2, q.aglAltitude = b.getFloat32(k), k += 4;
                        var x = -1;
                        l >= 9 && (x = b.getInt32(k), q.targetPoi = x, k += 4)
                    }
                    for (var t = 0; t < u.length; ++t) {
                        var w = u[t];
                        w.altitudeMode = b.getInt16(k), k += 2, w.aglAltitude = b.getFloat32(k), k += 4
                    }
                }
                for (var t = 0; t < u.length; ++t) {
                    var w = u[t];
                    this.addPOI(new google.maps.LatLng(w.latitude, w.longitude), w.altitude, !1, w)
                }
                for (var t = 0; t < p.length; ++t) {
                    var q = p[t];
                    null != q.targetPoi && q.targetPoi >= 0 && q.targetPoi < this.poiMarkers.length ? q.targetPoi = this.poiMarkers[q.targetPoi] : q.targetPoi = null, this.addWaypoint(!0, q.latitude, q.longitude, q.altitude, q.speed, q.stayTime, q.turnMode, q.maxReachTime, q.heading, q)
                }
                9 > l && this.assignPOITargets()
            } else
                for (;;) {
                    if (36 * (c + 1) > a.byteLength) break;
                    var y = 36 * c,
                        q = new GSWaypoint(this);
                    q.altitude = b.getFloat32(y), q.aglAltitude = q.altitude, q.turnMode = b.getInt32(y + 4), q.heading = b.getFloat32(y + 8), q.speed = b.getFloat32(y + 12), q.stayTime = b.getInt16(y + 16), q.maxReachTime = b.getInt16(y + 18), q.latitude = b.getFloat64(y + 20), q.longitude = b.getFloat64(y + 28), this.addWaypoint(!0, q.latitude, q.longitude, q.altitude, q.speed, q.stayTime, q.turnMode, q.maxReachTime, q.heading, q), ++c
                }
            this.refreshMissionLine(), this.refreshGSHeadings(!1), this.zoomToAllWPs();
            var z = this;
            z.markerToWaypoints.length > 0 ? z.setGroundLocationReference(z.markerToWaypoints[0].marker.getPosition(), !0, !1, function() {
                z.refreshTotalTimeAndDistance()
            }) : z.refreshTotalTimeAndDistance();
            for (var c in this.markerToWaypoints) {
                var A = this.markerToWaypoints[c];
                null == A.wp.targetPoi && 0 != A.wp.heading && (A.wp.manualHeadingOverride = !0)
            }
        },
        refreshCurrent: function() {
            var a = $(".nav-tabs .active").find("a").get(0).id;
            "pubmissions-a" == a ? this.refreshDiscoverMarkers(0) : "mymissions-a" == a && (this.myMissions = {}, this.refreshMyMissions())
        },
        exportKML: function() {
            var a = this.currMission && this.currMission.parseMission ? this.currMission.parseMission.get("name") : "new",
                b = [],
                c = [],
                d = 1 == this.currMission.pathMode;
            for (var e in this.markerToWaypoints) {
                e = parseInt(e);
                var f = this.markerToWaypoints[e],
                    g = new google.maps.LatLng(f.wp.latitude, f.wp.longitude);
                if (d && e > 0 && e < this.markerToWaypoints.length - 1) {
                    var h = this.markerToWaypoints[e - 1],
                        i = this.markerToWaypoints[e + 1],
                        j = google.maps.geometry.spherical.computeHeading(f.marker.getPosition(), h.marker.getPosition()),
                        k = f.marker.position,
                        l = this.distance3DBetween(k, f.wp.altitude, h.marker.position, h.wp.altitude),
                        m = Math.cos(Math.asin(Math.abs(h.wp.altitude - f.wp.altitude) / l)) * f.wp.dampingDistance,
                        n = google.maps.geometry.spherical.computeOffset(k, m, j);
                    j = google.maps.geometry.spherical.computeHeading(f.marker.getPosition(), i.marker.getPosition());
                    for (var o = this.distance3DBetween(k, f.wp.altitude, i.marker.position, i.wp.altitude), p = Math.cos(Math.asin(Math.abs(i.wp.altitude - f.wp.altitude) / o)) * f.wp.dampingDistance, q = google.maps.geometry.spherical.computeOffset(k, p, j), r = h.wp.altitude + (l - f.wp.dampingDistance) / l * (f.wp.altitude - h.wp.altitude), s = f.wp.altitude + f.wp.dampingDistance / o * (i.wp.altitude - f.wp.altitude), t = 0, u = 20, v = 0; u >= v; ++v) t = 1 / u * v, b.push(this.getQuadraticBezierCoordFor(n, k, q, t)), c.push(this.getQuadraticBezierValueFor(r, f.wp.altitude, s, t))
                } else b.push(g), c.push(f.wp.altitude)
            }
            var w = this;
            this.getElevationsWithCache([b[0]], function(d, e) {
                if (0 == d) {
                    for (var f = "absolute", g = "", h = "", i = 0; i < b.length; ++i) {
                        var j = b[i],
                            k = j.lng() + "," + j.lat() + "," + (c[i] + e[0]);
                        g += ("" == g ? "" : " ") + k, i == b.length - 1 && (h = k)
                    }
                    a = (null != a && "" != a ? a : "new") + "_3Dpath.kml";
                    var l = '<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">\n<Document>\n<name>KML 3D Path - Litchi</name>\n<StyleMap id="startpin-style">\n	<Pair>\n		<key>normal</key>\n		<styleUrl>#startpin-style-normal</styleUrl>\n	</Pair>\n	<Pair>\n		<key>highlight</key>\n		<styleUrl>#startpin-style-highlight</styleUrl>\n	</Pair>\n</StyleMap>\n<Style id="startpin-style-normal">\n	<IconStyle>\n		<color>ff00ff00</color>\n		<scale>1.1</scale>\n		<Icon>\n			<href>http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png</href>\n		</Icon>\n		<hotSpot x="20" y="2" xunits="pixels" yunits="pixels"/>\n	</IconStyle>\n</Style>\n<Style id="startpin-style-highlight">\n	<IconStyle>\n		<color>ff00ff00</color>\n		<scale>1.3</scale>\n		<Icon>\n			<href>http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png</href>\n		</Icon>\n		<hotSpot x="20" y="2" xunits="pixels" yunits="pixels"/>\n	</IconStyle>\n</Style>\n <Placemark>\n     <name>Start</name>\n     <styleUrl>#startpin-style</styleUrl>\n     <Point>\n         <altitudeMode>%altMode2%</altitudeMode>\n         <gx:drawOrder>1</gx:drawOrder>\n         <coordinates>%startPoint%</coordinates>\n     </Point>\n </Placemark>\n<StyleMap id="endpin-style">\n	<Pair>\n		<key>normal</key>\n		<styleUrl>#endpin-style-normal</styleUrl>\n	</Pair>\n	<Pair>\n		<key>highlight</key>\n		<styleUrl>#endpin-style-highlight</styleUrl>\n	</Pair>\n</StyleMap>\n<Style id="endpin-style-normal">\n	<IconStyle>\n		<color>ff0000ff</color>\n		<scale>1.1</scale>\n		<Icon>\n			<href>http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png</href>\n		</Icon>\n		<hotSpot x="20" y="2" xunits="pixels" yunits="pixels"/>\n	</IconStyle>\n</Style>\n<Style id="endpin-style-highlight">\n	<IconStyle>\n		<color>ff0000ff</color>\n		<scale>1.3</scale>\n		<Icon>\n			<href>http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png</href>\n		</Icon>\n		<hotSpot x="20" y="2" xunits="pixels" yunits="pixels"/>\n	</IconStyle>\n</Style>\n <Placemark>\n     <name>End</name>\n     <styleUrl>#endpin-style</styleUrl>\n     <Point>\n         <altitudeMode>%altMode3%</altitudeMode>\n         <gx:drawOrder>1</gx:drawOrder>\n         <coordinates>%endPoint%</coordinates>\n     </Point>\n </Placemark>\n<StyleMap id="wpline-style">\n	<Pair>\n		<key>normal</key>\n		<styleUrl>#wpline-style-normal</styleUrl>\n	</Pair>\n	<Pair>\n		<key>highlight</key>\n		<styleUrl>#wpline-style-highlight</styleUrl>\n	</Pair>\n</StyleMap>\n<Style id="wpline-style-normal">\n	<LineStyle>\n		<color>ff00ffff</color>\n		<width>3</width>\n	</LineStyle>\n	<PolyStyle>\n		<color>5000ffff</color>\n		<outline>0</outline>\n	</PolyStyle>\n</Style>\n<Style id="wpline-style-highlight">\n	<LineStyle>\n		<color>ff00ffff</color>\n		<width>3</width>\n	</LineStyle>\n	<PolyStyle>\n		<color>5000ffff</color>\n	</PolyStyle>\n</Style>\n	<Placemark>\n		<name>%name%</name>\n		<styleUrl>#wpline-style</styleUrl>\n		<LineString>\n			<extrude>1</extrude>\n			<tessellate>1</tessellate>\n			<altitudeMode>%altMode1%</altitudeMode>\n			<coordinates>%s</coordinates>\n		</LineString>\n	</Placemark>\n</Document>\n</kml>';
                    if (l = l.replace("%name%", w.escapeHTML(a)), l = l.replace("%altMode1%", f), l = l.replace("%altMode2%", f), l = l.replace("%altMode3%", f), l = l.replace("%startPoint%", g.substring(0, -1 == g.indexOf(" ") ? g.length : g.indexOf(" "))), l = l.replace("%endPoint%", h), l = l.replace("%s", g), w.detectIE()) {
                        var m = new Blob([l], {
                            type: "text/xml;charset=utf-8;"
                        });
                        navigator.msSaveBlob(m, a)
                    } else {
                        var n = navigator.userAgent.indexOf("Chrome") > -1,
                            o = navigator.userAgent.indexOf("Safari") > -1;
                        if (n && o && (o = !1), o) $.ajax({
                            type: "POST",
                            url: "/geturl",
                            data: {
                                t: "c",
                                buf: l
                            },
                            dataType: "json"
                        }).success(function(b) {
                            window.location.assign(b.n + "&t=c&n=" + encodeURIComponent(a))
                        }).fail(function() {});
                        else {
                            var p = $("<a>");
                            if (void 0 !== p.get(0).download) {
                                var m = new Blob([l], {
                                        type: "text/xml;charset=utf-8;"
                                    }),
                                    q = URL.createObjectURL(m);
                                p.get(0).setAttribute("href", q), p.get(0).setAttribute("download", a), p.get(0).style.opacity = 0, $("body").append(p), p.show().focus();
                                var r = document.createEvent("MouseEvents");
                                r.initEvent("click", !1, !1), p.get(0).dispatchEvent(r), p.hide(), p.remove()
                            }
                        }
                    }
                } else g_user ? w.enableElevation || $("#need-enable-elev").modal("show") : w.showAccountNeeded()
            })
        },
        escapeHTML: function(a) {
            var b = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };
            return a.replace(/[&<>"']/g, function(a) {
                return b[a]
            })
        },
        exportCSV: function() {
            if (!(this.markerToWaypoints.length <= 0)) {
                var a = this.currMission && this.currMission.parseMission ? this.currMission.parseMission.get("name") : "litchi_mission";
                a += ".csv";
                for (var b = "latitude,longitude,altitude(" + (1 == this.unit ? "ft" : "m") + "),heading(deg),curvesize(" + (1 == this.unit ? "ft" : "m") + "),rotationdir,gimbalmode,gimbalpitchangle", c = 0; 15 > c; ++c) b += ",actiontype" + (c + 1) + ",actionparam" + (c + 1);
                b += ",altitudemode,speed(m/s),poi_latitude,poi_longitude,poi_altitude(" + (1 == this.unit ? "ft" : "m") + "),poi_altitudemode", b += "\n";
                for (var c = 0; c < this.markerToWaypoints.length; ++c) {
                    var d = this.markerToWaypoints[c].wp,
                        e = 1 == this.unit ? 3.2808399 * d.altitude : d.altitude;
                    d.altitudeMode == AltitudeMode.AboveGround && (e = 1 == this.unit ? 3.2808399 * d.aglAltitude : d.aglAltitude);
                    var f = d.heading;
                    0 == this.currMission.headingMode && c < this.markerToWaypoints.length - 1 && (f = google.maps.geometry.spherical.computeHeading(this.markerToWaypoints[c].marker.position, this.markerToWaypoints[c + 1].marker.position)), b += d.latitude + "," + d.longitude + "," + e + "," + this.getDisplayedHeading(f) + "," + (1 == this.unit ? 3.2808399 * d.dampingDistance : d.dampingDistance) + "," + d.turnMode + "," + d.gimbalCtrl + "," + d.gimbalPitchAngle;
                    for (var g = 0; 15 > g; ++g) b += g < d.actions.length ? "," + d.actions[g] + "," + d.actionParams[g] : ",-1,0";
                    if (b += "," + d.altitudeMode + "," + d.speed, null != d.targetPoi) {
                        var h = d.targetPoi.poi,
                            i = 1 == this.unit ? 3.2808399 * h.altitude : h.altitude;
                        h.altitudeMode == AltitudeMode.AboveGround && (i = 1 == this.unit ? 3.2808399 * h.aglAltitude : h.aglAltitude), b += "," + h.latitude + "," + h.longitude + "," + i + "," + h.altitudeMode
                    } else b += ",0,0,0,0";
                    b += "\n"
                }
                this.saveCSVtoFile(b, a)
            }
        },
        parseKMLGeometryToWaypoint: function(a, b, c, d) {
            var e = [],
                f = this;
            if (!a || !a.type || -1 == ["LineString", "Point", "Polygon"].indexOf(a.type) || !a.coordinates || a.coordinates.length < 1) return e;
            var g = null,
                h = null,
                i = a.coordinates;
            if ("Point" == a.type ? (i = [a.coordinates], g = b && b.LookAt ? b.LookAt : null, h = b && b.camera ? b.camera : null) : "Polygon" == a.type && (i = a.coordinates[0]), f.markerToWaypoints.length < 99)
                for (var j in i)
                    if (f.markerToWaypoints.length < 99) {
                        var k = i[j],
                            l = new GSWaypoint(f);
                        if (c && g) {
                            var m = Math.max(-200, Math.min(500, Math.cos(f.toRadians(g.tilt)) * g.range));
                            l.altitude = m + g.altitude, l.aglAltitude = l.altitude;
                            var n = new google.maps.LatLng(g.latitude, g.longitude);
                            e.push(n);
                            var o = google.maps.geometry.spherical.computeOffset(n, Math.sin(f.toRadians(g.tilt)) * g.range, g.heading + 180);
                            l.latitude = o.lat(), l.longitude = o.lng(), l.heading = g.heading, l.gimbalCtrl = 2, l.gimbalPitchAngle = -(90 - g.tilt)
                        } else c && h ? (l.altitude = h.altitude, l.aglAltitude = l.altitude, e.push(new google.maps.LatLng(h.latitude, h.longitude)), l.latitude = h.latitude, l.longitude = h.longitude, l.heading = h.heading, l.gimbalCtrl = 2, l.gimbalPitchAngle = -(90 - h.tilt)) : (l.altitude = k.length > 2 && 0 != parseFloat(k[2]) ? Math.max(-200, Math.min(500, parseFloat(k[2]))) : 30, l.altitudeMode = "relativeToGround" == a.altitudeMode || "relativeToSeaFloor" == a.altitudeMode ? AltitudeMode.AboveGround : AltitudeMode.AboveTakeOff, l.aglAltitude = l.altitude, l.latitude = parseFloat(k[1]), l.longitude = parseFloat(k[0]));
                        d && (f.currMission.pathMode = 0, $("input[name=pathradio][id=option" + f.currMission.pathMode + "]").click(), l.actions.push(1), l.actionParams.push(0), l.numActions = 1), f.addWaypoint(!1, l.latitude, l.longitude, l.altitude, l.speed, l.stayTime, l.turnMode, l.maxReachTime, l.heading, l)
                    }
            return e
        },
        "import": function() {
            var a = this;
            if (!g_user) return void a.showAccountNeeded();
            var b = $("#fileimport").get(0).files[0];
            if (b)
                if (/\.kml$/i.test(b.name)) {
                    var c = new FileReader;
                    c.onload = function(b) {
                        var c = (new DOMParser).parseFromString(b.target.result, "text/xml"),
                            d = toGeoJSON.kml(c),
                            e = $("#kml_placemarks_as_poi").is(":checked");
                        if (e && !a.enableElevation) return void $("#need-enable-elev").modal("show");
                        var f = [],
                            g = $("#kml_add_takephoto").is(":checked");
                        if (d.features && d.features.length > 0) {
                            $("#importmodal").modal("hide"), a.newFile();
                            for (var h = 0; h < d.features.length; ++h) {
                                var i = d.features[h];
                                if (i.geometry && i.geometry.type)
                                    if ("GeometryCollection" == i.geometry.type && i.geometry.geometries)
                                        for (var j = 0; j < i.geometry.geometries.length; ++j) {
                                            var k = i.geometry.geometries[j],
                                                l = a.parseKMLGeometryToWaypoint(k, i.properties, e, g);
                                            l.length > 0 && (f = f.concat(l))
                                        } else {
                                            var l = a.parseKMLGeometryToWaypoint(i.geometry, i.properties, e, g);
                                            l.length > 0 && (f = f.concat(l))
                                        }
                            }
                            if (e && 1 == a.currMission.pathMode)
                                for (var h = 1; h < a.markerToWaypoints.length - 1; ++h) {
                                    var m = parseInt(h),
                                        n = a.markerToWaypoints[m - 1],
                                        o = a.markerToWaypoints[m],
                                        p = a.markerToWaypoints[m + 1],
                                        q = google.maps.geometry.spherical.computeHeading(o.marker.getPosition(), n.marker.getPosition()),
                                        r = o.marker.position,
                                        s = this.distance3DBetween(r, o.wp.altitude, n.marker.position, n.wp.altitude),
                                        t = Math.cos(Math.asin(Math.abs(n.wp.altitude - o.wp.altitude) / s)) * o.wp.dampingDistance,
                                        u = google.maps.geometry.spherical.computeOffset(r, t, q);
                                    q = google.maps.geometry.spherical.computeHeading(o.marker.getPosition(), p.marker.getPosition());
                                    var v = this.distance3DBetween(r, o.wp.altitude, p.marker.position, p.wp.altitude),
                                        w = Math.cos(Math.asin(Math.abs(p.wp.altitude - o.wp.altitude) / v)) * o.wp.dampingDistance,
                                        x = google.maps.geometry.spherical.computeOffset(r, w, q),
                                        y = a.getQuadraticBezierCoordFor(u, r, x, .5),
                                        z = google.maps.geometry.spherical.computeDistanceBetween(o.marker.getPosition(), y);
                                    q = google.maps.geometry.spherical.computeHeading(y, o.marker.getPosition());
                                    var A = google.maps.geometry.spherical.computeOffset(o.marker.getPosition(), z, q);
                                    o.wp.latitude = A.lat(), o.wp.longitude = A.lng(), o.marker.setPosition(A)
                                }
                            a.refreshMissionLine(), a.refreshGSHeadings(!1), e ? a.setAltitudesRelativeToGroundUsingPOIs(f, function() {
                                a.markerToWaypoints.length > 0 ? a.setGroundLocationReference(a.markerToWaypoints[0].marker.getPosition(), !0, !1, function() {
                                    a.refreshTotalTimeAndDistance()
                                }) : a.refreshTotalTimeAndDistance()
                            }) : a.markerToWaypoints.length > 0 ? a.setGroundLocationReference(a.markerToWaypoints[0].marker.getPosition(), !0, !1, function() {
                                a.refreshTotalTimeAndDistance()
                            }) : a.refreshTotalTimeAndDistance(), a.zoomToAllWPs()
                        } else $("#import-error-div").show(), $("#import-error").html("Error: failed parsing kml file")
                    }, c.readAsText(b)
                } else if (/\.csv$/i.test(b.name)) Papa.parse(b, {
                complete: function(b) {
                    var c = null,
                        d = b.data;
                    (!d || d.length <= 0 || d[0].length < 2) && (c = "invalid data");
                    var e = !1;
                    if (c || "latitude" != d[0][0] && "lat" != d[0][0] || (d[0].length >= 3 && (e = -1 != d[0][2].indexOf("ft")), d.shift()), !c)
                        for (; d.length > 0 && "" == d[d.length - 1][0];) d.splice(-1, 1);
                    if (!c && d.length > 99 && (c = "too many waypoints"), !c)
                        for (var f = 0; f < d.length; ++f) {
                            f = parseInt(f);
                            var g = Math.abs(parseFloat(d[f][0])),
                                h = Math.abs(parseFloat(d[f][1]));
                            if (0 > g || g > 90 || 0 > h || h > 180) {
                                c = "invalid coordinates for waypoint " + (f + 1);
                                break
                            }
                            var i = d[f].length > 2 ? parseFloat(d[f][2]) : 30;
                            if (e && (i /= 3.2808399), -200 > i || i > 500) {
                                c = "invalid altitude for waypoint " + (f + 1) + " (valid range is " + (e ? "[-655,1640]ft" : "[-200,500]m") + ")";
                                break
                            }
                            var j = d[f].length > 3 ? parseFloat(d[f][3]) : 0;
                            if (-180 > j || j > 360) {
                                c = "invalid heading for waypoint " + (f + 1) + " (valid range is [-180,360]Â°)";
                                break
                            }
                            var k = d[f].length > 4 ? parseFloat(d[f][4]) : .2;
                            if (e && (k /= 3.2808399), 0 > k || k > 1e3) {
                                c = "invalid curve size for waypoint " + (f + 1) + " (valid range is " + (e ? "[0,3280]ft" : "[0,1000]m") + ")";
                                break
                            }
                            var l = d[f].length > 5 ? parseInt(d[f][5]) : 0;
                            if (0 != l && 1 != l) {
                                c = "invalid rotation direction for waypoint " + (f + 1) + " (0 for clockwise, 1 for counterclockwise)";
                                break
                            }
                            var m = d[f].length > 6 ? parseInt(d[f][6]) : 0;
                            if (0 != m && 1 != m && 2 != m) {
                                c = "invalid gimbal mode for waypoint " + (f + 1) + " (0 for disabled, 1 for focus poi, 2 for interpolate)";
                                break
                            }
                            var n = d[f].length > 7 ? parseInt(d[f][7]) : 0;
                            if (-90 > n || n > 30) {
                                c = "invalid gimbal pitch angle for waypoint " + (f + 1) + " (valid range is [-90,30]Â°)";
                                break
                            }
                            for (var o = 8, p = 0; 15 > p && !(d[f].length < o + 2); ++p) {
                                var q = parseInt(d[f][o]),
                                    r = parseInt(d[f][o + 1]);
                                if (-1 == [-1, 0, 1, 2, 3, 4, 5].indexOf(q)) {
                                    c = "invalid action type " + (p + 1) + " for waypoint " + (f + 1) + " (valid range is [-1,5])";
                                    break
                                }
                                switch (q) {
                                    case 0:
                                        (0 > r || r > 65535) && (c = "invalid stay time action param " + (p + 1) + " for waypoint " + (f + 1) + " (valid range is [0,65535]ms)");
                                        break;
                                    case 1:
                                        break;
                                    case 2:
                                        break;
                                    case 3:
                                        break;
                                    case 4:
                                        (-180 > r || r > 360) && (c = "invalid aircraft rotation action param " + (p + 1) + " for waypoint " + (f + 1) + " (valid range is [-180,360]Â°)");
                                        break;
                                    case 5:
                                        (-90 > r || r > 0) && (c = "invalid tilt camera param " + (p + 1) + " for waypoint " + (f + 1) + " (valid range is [-90,0]Â°)")
                                }
                                if (null != c) break;
                                o += 2
                            }
                            if (null != c) break;
                            var s = o,
                                t = d[f].length > s ? parseInt(d[f][s]) : 0;
                            if (0 > t || t > 1) {
                                c = "invalid altitude mode for waypoint " + (f + 1) + " (accepted values are 0 for AboveTakeOff or 1 for AboveGround)";
                                break
                            }
                            s += 1;
                            var u = d[f].length > s ? parseFloat(d[f][s]) : 0;
                            if (0 > u || u > 15) {
                                c = "invalid speed for waypoint " + (f + 1) + " (valid range is [0,15]m/s, 0 means 'Use cruising speed')";
                                break
                            }
                            if (s += 1, g = Math.abs(parseFloat(d[f][s])), h = Math.abs(parseFloat(d[f][s + 1])), 0 > g || g > 90 || 0 > h || h > 180) {
                                c = "invalid coordinates for waypoint " + (f + 1) + "'s poi";
                                break
                            }
                            if (s += 2, i = d[f].length > s ? parseFloat(d[f][s]) : 30, e && (i /= 3.2808399), -200 > i || i > 500) {
                                c = "invalid altitude for waypoint " + (f + 1) + "'s poi (valid range is " + (e ? "[-655,1640]ft" : "[-200,500]m") + ")";
                                break
                            }
                            if (s += 1, t = d[f].length > s ? parseInt(d[f][s]) : 0, 0 > t || t > 1) {
                                c = "invalid altitude mode for waypoint " + (f + 1) + "'s poi (accepted values are 0 for AboveTakeOff or 1 for AboveGround)";
                                break
                            }
                            if (null != c) break
                        }
                    if (null != c) $("#import-error-div").show(), $("#import-error").html("Error: " + c);
                    else {
                        $("#importmodal").modal("hide"), a.newFile();
                        for (var v = {}, f = 0; f < d.length; ++f) {
                            var w = d[f].length > 40 ? parseFloat(d[f][40]) : 0,
                                x = d[f].length > 41 ? parseFloat(d[f][41]) : 0;
                            if (0 != w || 0 != x) {
                                var y = d[f].length > 42 ? parseFloat(d[f][42]) : 30,
                                    z = d[f].length > 43 ? parseInt(d[f][43]) : AltitudeMode.AboveTakeOff;
                                e && (y /= 3.2808399);
                                var A = "" + w + ":" + x + ":" + y + ":" + z;
                                if (!v.hasOwnProperty(A)) {
                                    var B = new GSPOI;
                                    B.latitude = w, B.longitude = x, B.altitude = y, B.altitudeMode = z, B.aglAltitude = y, a.addPOI(new google.maps.LatLng(B.latitude, B.longitude), B.altitude, !1, B), v[A] = a.poiMarkers[a.poiMarkers.length - 1]
                                }
                            }
                        }
                        for (var f = 0; f < d.length; ++f) {
                            var C = new GSWaypoint(a),
                                D = d[f].length > 2 ? parseFloat(d[f][2]) : 30,
                                t = d[f].length > 38 ? parseInt(d[f][38]) : AltitudeMode.AboveTakeOff;
                            e && (D /= 3.2808399), C.altitude = D, C.altitudeMode = t, C.aglAltitude = D, C.speed = d[f].length > 39 ? parseFloat(d[f][39]) : 0, C.latitude = parseFloat(d[f][0]), C.longitude = parseFloat(d[f][1]);
                            var j = d[f].length > 3 ? parseFloat(d[f][3]) : 0;
                            C.heading = a.getRealHeading(j);
                            var k = d[f].length > 4 ? parseFloat(d[f][4]) : .2;
                            e && (k /= 3.2808399), C.dampingDistance = Math.max(.2, Math.min(1e3, k)), C.rdir = d[f].length > 5 ? parseInt(d[f][5]) : 0, C.gimbalCtrl = d[f].length > 6 ? parseInt(d[f][6]) : 0, C.gimbalPitchAngle = d[f].length > 7 ? parseInt(d[f][7]) : 0;
                            for (var o = 8, p = 0; 15 > p && !(d[f].length < o + 2); ++p) {
                                var q = parseInt(d[f][o]);
                                if (-1 == q) break;
                                C.actions.push(q), C.actionParams.push(parseInt(d[f][o + 1])), o += 2
                            }
                            C.numActions = (o - 8) / 2;
                            var w = d[f].length > 40 ? parseFloat(d[f][40]) : 0,
                                x = d[f].length > 41 ? parseFloat(d[f][41]) : 0;
                            if (0 != w || 0 != x) {
                                var y = d[f].length > 42 ? parseFloat(d[f][42]) : 30,
                                    z = d[f].length > 43 ? parseInt(d[f][43]) : AltitudeMode.AboveTakeOff;
                                e && (y /= 3.2808399);
                                var A = "" + w + ":" + x + ":" + y + ":" + z;
                                v.hasOwnProperty(A) && (C.targetPoi = v[A])
                            }
                            a.addWaypoint(!0, C.latitude, C.longitude, C.altitude, C.speed, C.stayTime, C.turnMode, C.maxReachTime, C.heading, C)
                        }
                        a.refreshMissionLine(), a.refreshGSHeadings(!1), a.markerToWaypoints.length > 0 ? a.setGroundLocationReference(a.markerToWaypoints[0].marker.getPosition(), !0, !1, function() {
                            a.refreshTotalTimeAndDistance()
                        }) : a.refreshTotalTimeAndDistance(), a.zoomToAllWPs()
                    }
                },
                error: function(a) {
                    $("#import-error-div").show(), $("#import-error").html("Error: " + (a ? a.message : "unknown error"))
                }
            });
            else {
                var c = new FileReader;
                a.newFile(), c.onload = function(b) {
                    a.loadMissionFromArrayBuffer(b.target.result)
                }, c.readAsArrayBuffer(b), $("#importmodal").modal("hide")
            } else $("#import-error-div").show(), $("#import-error").html("Error: no file")
        },
        zoomToAllWPs: function() {
            if (this.markerToWaypoints.length >= 2) {
                var a = new google.maps.LatLngBounds;
                for (var b in this.markerToWaypoints) a.extend(this.markerToWaypoints[b].marker.position);
                this.map.fitBounds(a)
            } else this.markerToWaypoints.length >= 1 && (this.map.setCenter(this.markerToWaypoints[0].marker.position), this.map.setZoom(14))
        },
        refreshNumActions: function() {
            $("#actionnum").text("Actions: " + (this.selectedIdxs.length > 1 ? this.batchWp.numActions : this.markerToWaypoints[this.currIdx].wp.numActions) + (1 == this.currMission.pathMode ? " (disabled with Curved Turns)" : ""))
        },
        refreshHash: function() {},
        refreshAircraftControls: function() {
            1 == this.acType ? ($("#field-actions").show(), $("#field-defcurv").show(), $("#field-cruisingspd").show(), $("#field-pathmode").show(), $("#field-poi").show(), $("#field-cs").show(), $("#field-gctrl").show(), $("#field-he").show(), $("#field-speed").show(), $("#field-staytime").hide(), $("#field-bankedturn").hide()) : ($("#field-actions").hide(), $("#field-defcurv").hide(), $("#field-cruisingspd").hide(), $("#field-pathmode").hide(), $("#field-poi").hide(),
                $("#field-cs").hide(), $("#field-gctrl").hide(), $("#field-he").hide(), $("#field-speed").show(), $("#field-staytime").show(), $("#field-bankedturn").show())
        },
        switchAircraft: function() {
            this.acType = 1 == this.acType ? 0 : 1, localStorage && localStorage.setItem("acType", this.acType), this.refreshAircraftControls()
        },
        switchUnit: function() {
            this.unit = 1 == this.unit ? 0 : 1, localStorage && localStorage.setItem("gsUnit", this.unit), this.refreshTotalTimeAndDistance(), this.refreshPOIIndices(), this.refreshWaypointIndices(), this.refreshMissionLine(), this.updateCruisingSpeedSlider(10 * this.currMission.horizontalSpeed), this.updateMaxSpeedSlider(10 * this.currMission.rcSpeed), null !== this.currIdx && this.updateCurrentSelection(this.currIdx, !1)
        },
        homeAction: function() {
            this.myLoc && (this.map.setCenter(this.myLoc), this.map.setZoom(17))
        },
        globeAction: function() {
            this.map.setCenter(new google.maps.LatLng(20, 0)), this.map.setZoom(3)
        },
        setCursors: function(a, b) {
            b && this.map.setOptions({
                draggableCursor: a
            });
            for (var c in this.markerToWaypoints) this.markerToWaypoints[c].marker.setCursor(a);
            for (var c in this.poiMarkers) this.poiMarkers[c].marker.setCursor(a)
        },
        toggleScale: function(a) {
            this.scalingEnabled = a, this.scalingEnabled ? ($("#scalebtn").addClass("active"), this.setCursors("ew-resize", !1)) : ($("#scalebtn").removeClass("active"), this.setCursors(void 0, !0))
        },
        toggleRotate: function(a) {
            this.rotateEnabled = a, this.rotateEnabled ? ($("#rotatebtn").addClass("active"), this.setCursors("url('../assets/img/rotate_cw.png'), default", !1)) : ($("#rotatebtn").removeClass("active"), this.setCursors(void 0, !0), this.rotateMarker && (this.rotateMarker.setMap(null), this.rotateMarker = null))
        },
        toggleMove: function(a) {
            this.movingEnabled = a, this.movingEnabled ? ($("#movebtn").addClass("active"), this.setCursors("move", !0)) : ($("#movebtn").removeClass("active"), this.setCursors(void 0, !0))
        },
        toggleAllOff: function() {
            this.selectedIdxs.length > 1 && this.hideWPSettings(), this.movingEnabled && this.toggleMove(!1), this.rotateEnabled && this.toggleRotate(!1), this.scalingEnabled && this.toggleScale(!1)
        },
        reset: function() {
            for (var a = 0; a < this.markerToWaypoints.length; ++a) this.markerToWaypoints[a].marker.setMap(null), this.markerToWaypoints[a].overlay && this.markerToWaypoints[a].overlay.setMap(null);
            this.markerToWaypoints = [];
            for (var a in this.poiMarkers) this.poiMarkers[a].marker.setMap(null);
            this.poiMarkers = [];
            for (var a in this.curves) this.curves[a].setMap(null);
            this.curves = [], this.refreshMissionLine(), this.refreshTotalTimeAndDistance(), this.hideWPSettings(), location.hash = ""
        },
        showShare: function() {
            $("#sharemodal").modal("show"), $("#missionlink").val(location.href)
        },
        showSettings: function() {
            $("#msettings").modal("show")
        },
        newFile: function() {
            this.currMission.repeatNum = 0, this.currMission.autoGimbal = 0, this.currMission.parseMission = null, this.isClone = !1, this.deleteQueryParam(), this.reset(), this.refreshTotalTimeAndDistance()
        },
        showSave: function() {
            this.markerToWaypoints.length > 1 && (g_user ? ($("#save-notloggedin").hide(), $("#filename").val(this.currMission.parseMission ? this.currMission.parseMission.get("name") : "")) : $("#save-notloggedin").show(), $("#save-error-div").hide(), $("#downloadalert").modal("show"))
        },
        panoPreset: function(a) {
            var b = this.markerToWaypoints[this.currIdx].wp;
            if (this.selectedIdxs.length > 1 && (b = this.batchWp, this.setBatchSettingModified("Actions", !0)), !(b.actions && b.actions.length > 1)) {
                for (var c = -180; 180 > c; c += 52) this.addAction(b.numActions, 4, c), b.actions.push(4), b.actionParams.push(c), ++b.numActions, this.addAction(b.numActions, 1, 0), b.actions.push(1), b.actionParams.push(0), ++b.numActions;
                this.refreshNumActions()
            }
        },
        refreshDiscoverMarkers: function(a) {
            0 == a && (this.discoverData = [], this.cluster.clearMarkers());
            var b = this;
            $(".filters").find("input").attr("disabled", "disabled"), $("#mission-loader-icon").show(), $("#mission-refresh-btn").hide(), Parse.Cloud.run("listMissionsV3", {
                s: 1e3 * a,
                f: b.filters
            }, function(c) {
                b.handleDiscoverReceived(c, a)
            }, function(a) {}), Parse.Cloud.run("countPublicMissions", {}, function(a) {
                $("#pubmissions-a").html('Discover&nbsp;<span class="badge">' + a + "</span>")
            }, function(a) {})
        },
        handleDiscoverReceived: function(a, b) {
            var c = this;
            if (a && a.length > 0) {
                for (var d = 0; d < a.length; d++) {
                    var e = a[d];
                    if (c.discoverData.push(e), c.showDiscover) {
                        var f = e.name;
                        f = f.replace(/<(?:.|\n)*?>/gm, ""), f.length > 45 && (f = f.substr(0, 45) + "...");
                        var g = e.videourl && void 0 != typeof e.videourl,
                            h = new google.maps.Marker({
                                position: new google.maps.LatLng(e.latitude - 7e-5, e.longitude),
                                draggable: !1,
                                icon: "../assets/img/" + (g ? "video" : "mission") + "_marker.png"
                            });
                        g && h.setZIndex(999), h.tooltipContent = '<span class="mission-name">' + f + "</span>", h.tooltipContent += e.from && void 0 !== typeof e.from ? "<br>By " + e.from : "", g && (h.tooltipContent += '<br><i style="vertical-align: middle" class="fa fa-2x fa-youtube-play"></i> Double-click to watch'), google.maps.event.addListener(h, "click", function(a) {
                            return function() {
                                $("#mission-tooltip").hide(), c.openFromCloud(a)
                            }
                        }(e.id)), g && google.maps.event.addListener(h, "dblclick", function(a) {
                            return function() {
                                var b = a.replace("https://www.youtube.com/watch?v=", ""),
                                    c = "https://www.youtube.com/embed/" + b + "?html5=1",
                                    d = !1; - 1 != a.indexOf("vimeo.com") && (d = !0, b = a.replace("https://www.vimeo.com/", ""), c = "//player.vimeo.com/video/" + b), $("#videoModal").find("iframe").attr("src", c + (d ? "?" : "&") + "autoplay=1"), $("#videoModal").off("hidden.bs.modal").on("hidden.bs.modal", function(a) {
                                    $("#videoModal").find("iframe").attr("src", c)
                                }), $("#videoModal").modal("show")
                            }
                        }(e.videourl)), google.maps.event.addListener(h, "mouseover", function(a) {
                            return function() {
                                var b = c.overlay.getProjection().fromLatLngToContainerPixel(a.position),
                                    d = $("#mission-tooltip");
                                d.html(a.tooltipContent).css({
                                    left: b.x,
                                    top: b.y
                                }).show()
                            }
                        }(h)), google.maps.event.addListener(h, "mouseout", function() {
                            $("#mission-tooltip").hide()
                        }), c.cluster.addMarker(h)
                    }
                }
                c.refreshDiscover(), c.refreshDiscoverMarkers(b + 1)
            } else c.refreshDiscover(), $(".filters").find("input").removeAttr("disabled"), $("#mission-loader-icon").hide(), $("#mission-refresh-btn").show()
        },
        refreshDiscover: function() {
            if ($("#pubmissions-rows").html(""), this.discoverData.length > 0) {
                for (var a in this.discoverData) {
                    var b = new google.maps.LatLng(this.discoverData[a].latitude, this.discoverData[a].longitude);
                    this.discoverData[a].dist = this.myLoc ? google.maps.geometry.spherical.computeDistanceBetween(b, this.myLoc) : 0
                }
                this.filters.hv || (this.discoverData = this.discoverData.sort(function(a, b) {
                    return parseFloat(a.dist) - parseFloat(b.dist)
                }));
                for (var c = "", a = 0; a < this.discoverData.length; a++) {
                    var d = this.discoverData[a],
                        e = d.name;
                    e = e.replace(/<(?:.|\n)*?>/gm, ""), e.length > 25 && (e = e.substr(0, 25) + "...");
                    var f = d.from;
                    f || (f = "unknown"), f.length > 15 && (f = f.substr(0, 15) + "..."), c += "<tr>", c += '<td style="vertical-align: middle">' + e + "</td>", c += '<td style="vertical-align: middle" class="text-center">' + (d.dist ? this.formatDistance(d.dist, !0) : "?") + "</td>", c += '<td style="vertical-align: middle" class="text-center">' + f + "</td>", c += '<td class="text-center td-btn"><a class="open-mission btn btn-default" data-id="' + d.id + '" href="javascript:;"><i class="fa fa-folder-open-o"></i></a></td>', c += '<td class="text-center td-btn"><a class="download-mission btn btn-default" data-id="' + d.id + '" href="javascript:;"><i class="fa fa-cloud-download"></i></a></td>', c += '<td class="text-center td-btn">' + (d.videourl ? '<a class="btn btn-default" data-id="' + d.id + '" target="_blank" href="' + d.videourl + '"><i class="fa fa-youtube-play"></i></a>' : "") + "</td>", c += '<td class="text-center td-btn"><a class="btn btn-default" target="_blank" href="/hub?m=' + d.id + '"><i class="fa fa-link"></i></a></td>', c += '<td class="text-center td-btn"><a class="share-mission btn btn-default" data-id="' + d.id + '" href="javascript:;"><i class="fa fa-share-alt"></i></a></td>', c += "</tr>"
                }!$("#openmodal").hasClass("in") && navigator.userAgent.toLowerCase().indexOf("firefox") > -1 ? this.pubMissionHTML = c : $("#pubmissions-rows").html(c)
            }
        },
        refreshMyMissions: function() {
            if (!g_user) return void $("#mymissions-rows").html('<tr><td colspan="5"><div class="alert alert-info" role="alert"><button type="button" class="need-login-btn btn btn-sm btn-primary">Log in</button>&nbsp;&nbsp;&nbsp;to see your missions</div></td></tr>');
            if ($.isEmptyObject(this.myMissions)) {
                $("#mymissions-rows").html(""), $("#mission-loader-icon").show(), $("#mission-refresh-btn").hide();
                var a = this,
                    b = new Parse.Query("Mission");
                b.equalTo("user", g_user), b.ascending("name"), b.limit(5e3), b.find({
                    success: function(b) {
                        for (var c = "", d = 0; d < b.length; d++) {
                            var e = b[d],
                                f = e.get("name");
                            f.length > 35 && (f = f.substr(0, 35) + "...");
                            var g = !e.getACL() || e.getACL().getPublicReadAccess() ? "" : 'checked="checked"';
                            c += "<tr>", c += '<td style="vertical-align: middle">' + f + "</td>", c += '<td style="vertical-align: middle" class="text-center td-btn"><input class="private-mission" data-id="' + e.id + '" type="checkbox" ' + g + " /></td>", c += '<td class="text-center td-btn"><a class="open-mission btn btn-default" data-id="' + e.id + '" href="javascript:;"><i class="fa fa-folder-open-o"></i></a></td>', c += '<td class="text-center td-btn"><a class="download-mission btn btn-default" data-id="' + e.id + '" href="javascript:;"><i class="fa fa-cloud-download"></i></a></td>', c += '<td class="text-center td-btn"><a class="video-mission btn btn-default" data-id="' + e.id + '" href="javascript:;"><i class="fa fa-youtube-play"></i></a>' + a.getYoutubeHTML(e.id, e.get("videourl")) + "</td>", c += '<td class="text-center td-btn"><a class="btn btn-default" target="_blank" href="/hub?m=' + e.id + '"><i class="fa fa-link"></i></a></td>', c += '<td class="text-center td-btn"><a class="share-mission btn btn-default" data-id="' + e.id + '" href="javascript:;"><i class="fa fa-share-alt"></i></a></td>', c += '<td class="text-center td-btn"><a class="delete-mission btn btn-default" data-id="' + e.id + '" href="javascript:;"><i class="fa fa-trash-o"></i></a></td>', c += "</tr>", a.myMissions[e.id] = e
                        }
                        $("#mymissions-rows").html(c), $("#mission-loader-icon").hide(), $("#mission-refresh-btn").show()
                    },
                    error: function(a) {
                        $("#mission-loader-icon").hide(), $("#mission-refresh-btn").show()
                    }
                })
            }
        },
        getYoutubeHTML: function(a, b) {
            var c = '<div class="head hide">Video (Youtube/Vimeo)</div><div class="content hide"><span class="video-url-form"><div class="form-group"><input type="text" class="form-control" placeholder="Paste video URLâ€¦" value="' + (b && void 0 != typeof b ? b : "") + '"></div><button type="button" data-id="' + a + '" class="btn btn-default btn-block">Update</button></span></div>';
            return c
        },
        showImport: function() {
            $("#import-error-div").hide(), $("#importmodal").modal("show")
        },
        showOpen: function() {
            "pubmissions-a" == $(".nav-tabs .active").find("a").get(0).id || this.refreshMyMissions(), $("#openmodal").modal("show")
        },
        detectIE: function() {
            var a = window.navigator.userAgent,
                b = a.indexOf("MSIE ");
            if (b > 0) return parseInt(a.substring(b + 5, a.indexOf(".", b)), 10);
            var c = a.indexOf("Trident/");
            if (c > 0) {
                var d = a.indexOf("rv:");
                return parseInt(a.substring(d + 3, a.indexOf(".", d)), 10)
            }
            var e = a.indexOf("Edge/");
            return e > 0 ? parseInt(a.substring(e + 5, a.indexOf(".", e)), 10) : !1
        },
        saveVideoUrl: function(a, b) {
            b = $.trim(b);
            var c = this.myMissions[a];
            if (c) {
                var d = this;
                c.set("videourl", b), c.save(null, {
                    success: function(a) {
                        c = a, d.myMissions = {}, d.refreshMyMissions(), d.syncMyDevices()
                    },
                    error: function() {
                        c.unset("videourl")
                    }
                })
            }
        },
        setMissionPublicReadable: function(a, b) {
            var c = this.myMissions[b];
            if (c) {
                var d = this,
                    e = c.getACL();
                e.setPublicReadAccess(!a), c.save(null, {
                    success: function(b) {
                        b.fetch(), d.syncMyDevices(), a || c.has("location") && c.get("location") || Parse.Cloud.run("getMission", {
                            url: c.get("file").url()
                        }, function(a) {
                            var b = a.buffer;
                            b = Uint8Array.from(b).buffer;
                            var d = new DataView(b, 0),
                                e = d.getFloat64(64),
                                f = d.getFloat64(72),
                                g = new Parse.GeoPoint({
                                    latitude: e,
                                    longitude: f
                                });
                            c.set("location", g), c.save(null, {
                                success: function(a) {},
                                error: function() {}
                            })
                        }, function(a) {})
                    },
                    error: function() {}
                })
            }
        },
        deleteMission: function(a) {
            var b = this.myMissions[a],
                c = this;
            b && b.destroy({
                success: function(a) {
                    c.myMissions = {}, c.refreshMyMissions(), c.syncMyDevices()
                },
                error: function(a, b) {}
            })
        },
        shareFB: function(a) {
            FB.ui({
                method: "share",
                href: a
            }, function(a) {})
        },
        prevWP: function() {
            null == this.currIdx && (this.currIdx = 1);
            var a = this.currIdx - 1;
            a >= 0 && a > this.markerToWaypoints.length - 1 || 0 > a && Math.abs(a) > this.poiMarkers.length || this.updateCurrentSelection(a, !0)
        },
        nextWP: function() {
            null == this.currIdx && (this.currIdx = -1);
            var a = this.currIdx + 1;
            a >= 0 && a > this.markerToWaypoints.length - 1 || 0 > a && Math.abs(a) > this.poiMarkers.length || this.updateCurrentSelection(a, !0)
        },
        batchSelectAll: function() {
            if (null != this.currIdx)
                if (this.selectedIdxs = [], this.currIdx >= 0)
                    for (var a = 0; a < this.markerToWaypoints.length; ++a) this.selectedIdxs.push(a), this.redrawWaypoint(a, !0);
                else
                    for (var a = 0; a < this.poiMarkers.length; ++a) this.selectedIdxs.push(-(parseInt(a) + 1)), this.redrawPOI(a, !0)
        },
        batchDelete: function() {
            if (this.currIdx < 0) {
                this.selectedIdxs.sort(function(a, b) {
                    return parseInt(a) - parseInt(b)
                });
                for (var a = 0; a < this.selectedIdxs.length; ++a) {
                    var b = Math.abs(this.selectedIdxs[a]) - 1;
                    this.poiMarkers[b].marker.setMap(null);
                    var c = this.poiMarkers.splice(b, 1);
                    this.nullifyPOITargets(c[0])
                }
                this.refreshPOIIndices(), this.refreshGSHeadings(!1)
            } else {
                this.selectedIdxs.sort(function(a, b) {
                    return parseInt(b) - parseInt(a)
                });
                for (var d = !1, a = 0; a < this.selectedIdxs.length; ++a) {
                    var b = this.selectedIdxs[a];
                    0 == b && (d = !0), this.markerToWaypoints[b].marker.setMap(null), this.markerToWaypoints[b].overlay && this.markerToWaypoints[b].overlay.setMap(null), this.markerToWaypoints.splice(b, 1)
                }
                if (this.refreshWaypointIndices(), this.refreshMissionLine(), this.refreshGSHeadings(!1), d && this.markerToWaypoints.length > 0) {
                    var e = this;
                    this.setGroundLocationReference(this.markerToWaypoints[0].marker.getPosition(), !0, !1, function() {
                        e.refreshTotalTimeAndDistance()
                    })
                } else this.refreshTotalTimeAndDistance()
            }
            this.hideWPSettings()
        },
        batchApply: function() {
            for (var a = this.selectedIdxs[0] >= 0, b = 0; b < this.selectedIdxs.length; ++b) {
                var c = this.selectedIdxs[b];
                if (a) {
                    var d = this.markerToWaypoints[c];
                    if (this.batchSettingsModifiedState[MarkerSettings.Altitude] && (d.wp.altitudeMode = this.batchWp.altitudeMode, this.batchAltitudeAboveCurrent ? this.batchWp.altitudeMode == AltitudeMode.AboveTakeOff ? (d.wp.altitude += this.batchWp.altitude, d.wp.altitude = Math.max(-200, Math.min(d.wp.altitude, 500)), d.wp.aglAltitude = d.wp.altitude) : (d.wp.aglAltitude += this.batchWp.altitude, d.wp.aglAltitude = Math.max(-200, Math.min(d.wp.aglAltitude, 500))) : this.batchWp.altitudeMode == AltitudeMode.AboveTakeOff ? (d.wp.altitude = this.batchWp.altitude, d.wp.aglAltitude = d.wp.altitude) : d.wp.aglAltitude = this.batchWp.altitude), this.batchSettingsModifiedState[MarkerSettings.Speed] && (d.wp.speed = this.batchWp.speed), this.batchSettingsModifiedState[MarkerSettings.CurveSize] && b > 0 && b < this.markerToWaypoints.length - 1) {
                        var e = this.markerToWaypoints[b - 1],
                            f = this.markerToWaypoints[b],
                            g = this.markerToWaypoints[b + 1],
                            h = this.distance3DBetween(new google.maps.LatLng(e.wp.latitude, e.wp.longitude), e.wp.altitude, new google.maps.LatLng(f.wp.latitude, f.wp.longitude), f.wp.altitude),
                            i = this.distance3DBetween(new google.maps.LatLng(g.wp.latitude, g.wp.longitude), g.wp.altitude, new google.maps.LatLng(f.wp.latitude, f.wp.longitude), f.wp.altitude),
                            j = h;
                        b > 1 && (j -= e.wp.dampingDistance), j = Math.min(j, h / 2) - 1;
                        var k = i;
                        b < this.markerToWaypoints.length - 2 && -1 == this.selectedIdxs.indexOf(b + 1) && (k -= g.wp.dampingDistance), k = Math.min(k, i / 2) - 1, d.wp.dampingDistance = Math.max(.2, Math.min(1e3, Math.min(j, k) * (this.batchEditCurvePercent / 100)))
                    }
                    if ((this.batchSettingsModifiedState[MarkerSettings.Poi] || this.batchSettingsModifiedState[MarkerSettings.Heading]) && (d.wp.heading = this.batchSettingsModifiedState[MarkerSettings.Poi] && null != this.batchWp.targetPoi ? this.computeOneWPHeadingFromGSPOI(d, this.batchWp.targetPoi) : this.batchWp.heading, d.wp.manualHeadingOverride = this.batchWp.manualHeadingOverride, d.wp.targetPoi = this.batchSettingsModifiedState[MarkerSettings.Heading] ? null : this.batchWp.targetPoi), this.batchSettingsModifiedState[MarkerSettings.GimbalPitch] && (d.wp.gimbalCtrl = this.batchWp.gimbalCtrl, d.wp.gimbalPitchAngle = this.batchWp.gimbalPitchAngle, 1 == d.wp.gimbalCtrl && null != d.wp.targetPoi)) {
                        var l = google.maps.geometry.spherical.computeDistanceBetween(d.marker.getPosition(), d.wp.targetPoi.marker.getPosition());
                        l = 0 == l ? 1e-5 : l, d.wp.gimbalPitchAngle = -(180 * Math.atan((d.wp.altitude - d.wp.targetPoi.altitude) / l) / Math.PI), d.wp.gimbalPitchAngle = Math.max(-90, Math.min(30, d.wp.gimbalPitchAngle))
                    }
                    if (this.batchSettingsModifiedState[MarkerSettings.Actions] && (d.wp.numActions = 0, d.wp.actions = [], d.wp.actionParams = [], null != this.batchWp.actions && this.batchWp.actions.length > 0)) {
                        for (var m = 0; m < this.batchWp.actions.length; ++m) d.wp.actions.push(this.batchWp.actions[m]), d.wp.actionParams.push(this.batchWp.actionParams[m]);
                        d.wp.numActions = this.batchWp.actions.length
                    }
                } else {
                    var n = Math.abs(c) - 1,
                        d = this.poiMarkers[n];
                    this.batchSettingsModifiedState[MarkerSettings.Altitude] && (d.poi.altitudeMode = this.batchWp.altitudeMode, this.batchAltitudeAboveCurrent ? this.batchWp.altitudeMode == AltitudeMode.AboveTakeOff ? (d.poi.altitude += this.batchWp.altitude, d.poi.altitude = Math.max(-200, Math.min(d.poi.altitude, 500)), d.poi.aglAltitude = d.poi.altitude) : (d.poi.aglAltitude += this.batchWp.altitude, d.poi.aglAltitude = Math.max(-200, Math.min(d.poi.aglAltitude, 500))) : this.batchWp.altitudeMode == AltitudeMode.AboveTakeOff ? (d.poi.altitude = this.batchWp.altitude, d.poi.aglAltitude = d.poi.altitude) : d.poi.aglAltitude = this.batchWp.altitude)
                }
            }
            if (this.refreshPOIIndices(), this.refreshWaypointIndices(), this.refreshMissionLine(), this.refreshGSHeadings(!1), this.markerToWaypoints.length > 0) {
                var o = this;
                this.setGroundLocationReference(this.markerToWaypoints[0].marker.getPosition(), !0, !1, function() {
                    o.refreshTotalTimeAndDistance()
                })
            } else this.refreshTotalTimeAndDistance();
            this.hideWPSettings()
        },
        canAddWP: function() {
            return 1 == this.acType ? this.markerToWaypoints.length < 99 : this.markerToWaypoints.length < 15
        },
        interpolateFixed: function(a, b, c) {
            var d = L(a.Ja),
                e = L(a.Ka),
                f = L(b.Ja),
                g = L(b.Ka),
                h = n.cos(d),
                i = n.cos(f),
                b = zx.se(a, b),
                j = n.sin(b);
            return a = n.sin((1 - c) * b) / j, c = n.sin(c * b) / j, b = a * h * n.cos(e) + c * i * n.cos(g), e = a * h * n.sin(e) + c * i * n.sin(g), new Q(Fd(n[zb](a * n.sin(d) + c * n.sin(f), n[Db](b * b + e * e))), Fd(n[zb](e, b)))
        },
        getMidPoint: function(a, b, c, d) {
            var e = this.toRadians(d - b);
            a = this.toRadians(a), c = this.toRadians(c), b = this.toRadians(b);
            var f = Math.cos(c) * Math.cos(e),
                g = Math.cos(c) * Math.sin(e),
                h = Math.atan2(Math.sin(a) + Math.sin(c), Math.sqrt((Math.cos(a) + f) * (Math.cos(a) + f) + g * g)),
                i = b + Math.atan2(g, Math.cos(a) + f);
            return new google.maps.LatLng(this.toDegrees(h), this.toDegrees(i))
        },
        toDegrees: function(a) {
            return a * (180 / Math.PI)
        },
        toRadians: function(a) {
            return a * (Math.PI / 180)
        },
        insertWP: function() {
            var a = this.currIdx;
            if (a < this.markerToWaypoints.length - 1 && this.canAddWP()) {
                var b = this.markerToWaypoints[a].marker,
                    c = this.markerToWaypoints[a + 1].marker,
                    d = this.getMidPoint(b.position.lat(), b.position.lng(), c.position.lat(), c.position.lng()),
                    e = this.markerToWaypoints[a].wp,
                    f = this.markerToWaypoints[a + 1].wp,
                    g = (e.altitude + f.altitude) / 2,
                    h = this.lastWP;
                this.lastWP = null, this.addWaypoint.call(this, !1, d.lat(), d.lng(), g, 0 == this.acType ? 2 : 0, 3, 0, 0, 1 == this.acType ? 0 : 360, null, a + 1), this.lastWP = h, this.refreshWaypointIndices(), this.refreshMissionLine(), this.refreshGSHeadings(!1), this.updateCurrentSelection(a + 1, !0)
            }
        },
        refreshGSHeadings: function(a, b) {
            return this._refreshGSHeadings(a, null, !1, b)
        },
        _refreshGSHeadings: function(a, b, c, d) {
            if (1 == this.acType) {
                a ? this.computeHeadingsForLatestGSPOI() : b ? this.computeHeadingsForGSPOI(b) : c && this.assignPOITargets();
                var e = 0 == this.currMission.headingMode;
                for (var f in this.markerToWaypoints) {
                    var g = this.markerToWaypoints[f].overlay,
                        h = this.markerToWaypoints[f].wp.heading;
                    if (e && parseInt(f) < this.markerToWaypoints.length - 1 && (h = google.maps.geometry.spherical.computeHeading(this.markerToWaypoints[f].marker.position, this.markerToWaypoints[parseInt(f) + 1].marker.position)), isNaN(this.map.getHeading()) || (h -= this.map.getHeading()), g) d || g.setIcon(this.getHeadingIcon(g.rotateIcon, h)), g.setPosition(this.markerToWaypoints[f].marker.position);
                    else {
                        var i = RotateIcon.makeIcon(this.headingIcon);
                        g = new google.maps.Marker({
                            position: this.markerToWaypoints[f].marker.position,
                            map: this.map,
                            draggable: !1,
                            icon: this.getHeadingIcon(i, h),
                            flat: !0,
                            clickable: !1
                        }), g.rotateIcon = i
                    }
                    this.markerToWaypoints[f].overlay = g
                }
            }
        },
        getHeadingIcon: function(a, b) {
            return {
                url: a.setRotation(b).getUrl(),
                anchor: new google.maps.Point(17, 18)
            }
        },
        updateOneGSHeadingRotation: function(a) {
            var b = this.markerToWaypoints[a],
                c = b.overlay;
            if (c) {
                var d = 0 == this.currMission.headingMode,
                    e = b.wp.heading;
                d && parseInt(a) < this.markerToWaypoints.length - 1 && (e = google.maps.geometry.spherical.computeHeading(this.markerToWaypoints[a].marker.position, this.markerToWaypoints[parseInt(a) + 1].marker.position)), c.setIcon(this.getHeadingIcon(c.rotateIcon, e))
            }
        },
        refreshOneGSHeading: function(a) {
            var b = this.markerToWaypoints[a];
            b && b.wp.targetPoi && (b.wp.heading = this.computeOneWPHeadingFromGSPOI(b, b.wp.targetPoi));
            var c = b.overlay;
            if (c) {
                c.setPosition(b.marker.position);
                var d = 0 == this.currMission.headingMode,
                    e = b.wp.heading;
                d && parseInt(a) < this.markerToWaypoints.length - 1 && (e = google.maps.geometry.spherical.computeHeading(this.markerToWaypoints[a].marker.position, this.markerToWaypoints[parseInt(a) + 1].marker.position)), c.setIcon(this.getHeadingIcon(c.rotateIcon, e))
            }
        },
        computeHeadingsForLatestGSPOI: function() {
            if (0 != this.poiMarkers.length)
                for (var a in this.markerToWaypoints) {
                    var b = this.markerToWaypoints[a];
                    if (null == b.wp.targetPoi && !b.wp.manualHeadingOverride) {
                        var c = this.poiMarkers[this.poiMarkers.length - 1];
                        c && (b.wp.heading = Math.round(google.maps.geometry.spherical.computeHeading(b.marker.position, c.marker.position)), b.wp.targetPoi = c)
                    }
                }
        },
        computeHeadingsForGSPOI: function(a) {
            if (0 != this.poiMarkers.length)
                for (var b in this.markerToWaypoints) {
                    var c = this.markerToWaypoints[b];
                    a && c.wp.targetPoi && c.wp.targetPoi == a && (c.wp.heading = Math.round(google.maps.geometry.spherical.computeHeading(c.marker.position, a.marker.position)))
                }
        },
        assignPOITargets: function() {
            if (0 != this.poiMarkers.length)
                for (var a in this.markerToWaypoints) {
                    var b = this.markerToWaypoints[a];
                    for (var c in this.poiMarkers) {
                        var d = this.poiMarkers[c],
                            e = google.maps.geometry.spherical.computeHeading(b.marker.position, d.marker.position);
                        if (Math.abs(e - b.wp.heading) <= 1.5) {
                            b.wp.targetPoi = d;
                            break
                        }
                    }
                }
        },
        nullifyPOITargets: function(a) {
            for (var b in this.markerToWaypoints) {
                var c = this.markerToWaypoints[b];
                if (c.wp.targetPoi && a && c.wp.targetPoi == a) {
                    c.wp.targetPoi = null;
                    var d = this.getClosestPOI(c.marker.position);
                    c.wp.heading = this.computeOneWPHeadingFromGSPOI(c, d)
                }
            }
        },
        getClosestPOI: function(a) {
            var b = -1,
                c = null;
            for (var d in this.poiMarkers) {
                var e = google.maps.geometry.spherical.computeDistanceBetween(a, this.poiMarkers[d].marker.position);
                (-1 == b || b > e) && (b = e, c = this.poiMarkers[d])
            }
            return c
        },
        refreshPOIIndices: function() {
            for (var a = 0; a < this.poiMarkers.length; ++a) this.redrawPOI(a, !1)
        },
        refreshWaypointIndices: function() {
            for (var a = 0; a < this.markerToWaypoints.length; ++a) this.redrawWaypoint(a, !1)
        },
        deleteObj: function() {
            if (!(this.currIdx >= 0 && this.currIdx > this.markerToWaypoints.length - 1 || this.currIdx < 0 && Math.abs(this.currIdx) > this.poiMarkers.length)) {
                var a = 0;
                if (this.currIdx < 0) {
                    this.poiMarkers[Math.abs(this.currIdx) - 1].marker.setMap(null);
                    var b = this.poiMarkers.splice(Math.abs(this.currIdx) - 1, 1);
                    this.nullifyPOITargets(b[0]), this.refreshPOIIndices(), this.refreshGSHeadings(!1), a = Math.abs(this.currIdx) - 1 == this.poiMarkers.length ? this.currIdx + 1 : this.currIdx
                } else {
                    if (this.markerToWaypoints[this.currIdx].marker.setMap(null), this.markerToWaypoints[this.currIdx].overlay && this.markerToWaypoints[this.currIdx].overlay.setMap(null), this.markerToWaypoints.splice(this.currIdx, 1), this.refreshWaypointIndices(), this.refreshMissionLine(), this.refreshGSHeadings(!1), 0 == this.currIdx && this.markerToWaypoints.length > 0) {
                        var c = this;
                        this.setGroundLocationReference(this.markerToWaypoints[0].marker.getPosition(), !0, !1, function() {
                            c.refreshTotalTimeAndDistance()
                        })
                    } else this.refreshTotalTimeAndDistance();
                    a = this.currIdx == this.markerToWaypoints.length ? this.currIdx - 1 : this.currIdx
                }
                this.updateCurrentSelection(a, !1)
            }
        },
        addAction: function(a, b, c) {
            var d = $(".actionselect.real").clone(),
                e = d.get(0);
            d.removeClass("real"), e.dataset.actionIndex = a, e.style.display = "";
            var f = d.find("select");
            for (var g in this.ACTIONS) {
                var h = document.createElement("option");
                h.value = parseInt(g), h.value == b && (h.selected = !0), $(h).text(this.ACTIONS[g]), f.append(h)
            }
            f.on("change", this.onActionChange.bind(this, d));
            var i = d.find("input[type=text]"),
                j = c;
            switch (b) {
                case 0:
                    j = c / 1e3, i.val(j + "s"), i.removeAttr("disabled");
                    break;
                case 4:
                    0 > j && (j += 360);
                case 5:
                    i.val(j + "Â°"), i.removeAttr("disabled");
                    break;
                default:
                    i.attr("disabled", "disabled")
            }
            i.on("change", this.onActionParamChange.bind(this, d));
            var k = d.find("button");
            k.on("click", this.onActionDelete.bind(this, d)), $("#actionlist").append(d)
        },
        onActionDelete: function(a) {
            var b = this.selectedIdxs.length > 1,
                c = b ? this.batchWp : this.markerToWaypoints[this.currIdx].wp;
            b && this.setBatchSettingModified("Actions", !0);
            var d = a.get(0).dataset.actionIndex;
            c.actions.splice(d, 1), c.actionParams.splice(d, 1), --c.numActions, this.refreshTotalTimeAndDistance(), this.refreshNumActions();
            var e = $("#actionlist").find(".actionselect");
            $(e[d]).remove();
            var f = 0;
            $("#actionlist div").each(function(a, b) {
                b.dataset.actionIndex = f, ++f
            })
        },
        onActionChange: function(a) {
            var b = a.get(0).dataset.actionIndex,
                c = $(a).find("select"),
                d = $(a).find("input[type=text]"),
                e = parseInt(c.val()),
                f = this.selectedIdxs.length > 1,
                g = f ? this.batchWp : this.markerToWaypoints[this.currIdx].wp;
            switch (f && this.setBatchSettingModified("Actions", !0), g.actions[b] = e, e) {
                case 0:
                case 4:
                case 5:
                    d.removeAttr("disabled");
                    break;
                default:
                    d.attr("disabled", "disabled")
            }
            this.onActionParamChange(a)
        },
        onActionParamChange: function(a) {
            var b = a.get(0).dataset.actionIndex,
                c = $(a).find("select"),
                d = $(a).find("input[type=text]"),
                e = parseInt(c.val()),
                f = isNaN(parseFloat(d.val())) ? 0 : parseFloat(d.val());
            switch (e) {
                case 0:
                    d.val(f + "s"), f *= 1e3;
                    break;
                case 4:
                case 5:
                    5 == e && (f = Math.min(0, Math.max(-90, f))), d.val(f + "Â°");
                    break;
                default:
                    d.val("")
            }
            var g = this.selectedIdxs.length > 1,
                h = g ? this.batchWp : this.markerToWaypoints[this.currIdx].wp;
            g && this.setBatchSettingModified("Actions", !0), h.actionParams[b] = f, 0 == e && this.refreshTotalTimeAndDistance()
        },
        onSave: function() {
            var a = $("#filename").val();
            if (a = $.trim(a), "" == a || a.length > 50 || -1 != a.indexOf("/") || -1 != a.indexOf("\\")) return $("#save-error-div").show(), void $("#save-error").html("Error: invalid name"); {
                var b = this.getBufferFromWaypoints(!1);
                this.getTotalTimeAndDistance().t
            }
            if (g_user) {
                var c = this,
                    d = c.currMission.parseMission,
                    e = !1,
                    f = d ? c.currMission.parseMission.get("name") != a : !1;
                (!d || f) && (d = new c.ParseMission, e = !0);
                var g = new Parse.Query("Mission");
                g.equalTo("user", g_user), g.equalTo("name", a), e || g.notEqualTo("objectId", d.id), g.find({
                    success: function(f) {
                        if (0 == f.length) {
                            var g = new Uint8Array(b),
                                h = Array.prototype.slice.call(g),
                                i = new Parse.File("mission", h);
                            i.save().then(function() {
                                if (d.set("name", a), d.set("user", g_user), d.set("file", i), e) {
                                    var b = new Parse.ACL(g_user);
                                    b.setPublicReadAccess(!1), b.setPublicWriteAccess(!1), d.setACL(b)
                                } else d.set("version", d.get("version"));
                                c.isClone && d.set("isClone", !0);
                                var f = new Parse.GeoPoint({
                                    latitude: c.markerToWaypoints[0].wp.latitude,
                                    longitude: c.markerToWaypoints[0].wp.longitude
                                });
                                d.set("location", f), d.save(null, {
                                    success: function(a) {
                                        c.currMission.parseMission = a, c.refreshTotalTimeAndDistance(), c.writeURLParam(a.id), c.myMissions = {}, c.syncMyDevices(), $("#downloadalert").modal("hide")
                                    },
                                    error: function(a, b) {
                                        $("#save-error-div").show(), $("#save-error").html("Error: " + b.message)
                                    }
                                })
                            }, function(a) {
                                $("#downloadalert").modal("hide")
                            })
                        } else $("#save-error-div").show(), $("#save-error").html("Error: a mission with this name already exists")
                    },
                    error: function(a) {
                        $("#downloadalert").modal("hide")
                    }
                })
            } else $("#downloadalert").modal("hide"), this.triggerDownload(b, a)
        },
        saveCSVtoFile: function(a, b) {
            if (this.detectIE()) {
                var c = new Blob([a], {
                    type: "text/csv;charset=utf-8;"
                });
                navigator.msSaveBlob(c, b)
            } else {
                var d = navigator.userAgent.indexOf("Chrome") > -1,
                    e = navigator.userAgent.indexOf("Safari") > -1;
                if (d && e && (e = !1), e) $.ajax({
                    type: "POST",
                    url: "/geturl",
                    data: {
                        t: "c",
                        buf: a
                    },
                    dataType: "json"
                }).success(function(a) {
                    window.location.assign(a.n + "&t=c&n=" + encodeURIComponent(b))
                }).fail(function() {});
                else {
                    var f = $("<a>");
                    if (void 0 !== f.get(0).download) {
                        var c = new Blob([a], {
                                type: "text/csv;charset=utf-8;"
                            }),
                            g = URL.createObjectURL(c);
                        f.get(0).setAttribute("href", g), f.get(0).setAttribute("download", b), f.get(0).style.opacity = 0, $("body").append(f), f.show().focus();
                        var h = document.createEvent("MouseEvents");
                        h.initEvent("click", !1, !1), f.get(0).dispatchEvent(h), f.hide(), f.remove()
                    }
                }
            }
        },
        triggerDownload: function(a, b) {
            if (this.detectIE()) {
                var c = new Blob([a], {
                    type: "data:application/octet-stream"
                });
                navigator.msSaveBlob(c, b)
            } else {
                var d = navigator.userAgent.indexOf("Chrome") > -1,
                    e = navigator.userAgent.indexOf("Safari") > -1;
                d && e && (e = !1);
                var f = this.getBase64FromBuffer(a, !1);
                if (e) $.ajax({
                    type: "POST",
                    url: "/geturl",
                    data: {
                        t: "l",
                        buf: f
                    },
                    dataType: "json"
                }).success(function(a) {
                    window.location.assign(a.n + "&t=l&n=" + encodeURIComponent(b))
                }).fail(function() {});
                else {
                    var g = $('<a href="data:application/octet-stream;base64,' + f + '" download="' + b + '">');
                    g.get(0).style.opacity = 0, $("body").append(g), g.show().focus();
                    var h = document.createEvent("MouseEvents");
                    h.initEvent("click", !1, !1), g.get(0).dispatchEvent(h), g.hide(), g.remove()
                }
            }
        },
        syncMyDevices: function() {
            Parse.Cloud.run("syncMyDevices", {}, function(a, b) {}, function(a) {
                console.log("err", a)
            })
        },
        loadFromCloud: function(a) {
            this.reset();
            var b = this;
            Parse.Cloud.run("getMission", {
                url: a.get("file").url()
            }, function(a) {
                var c = a.buffer;
                b.loadMissionFromArrayBuffer(Uint8Array.from(c).buffer)
            }, function(a) {})
        },
        getBufferFromWaypoints: function(a) {
            var b = 0;
            b = a ? 1 : 4;
            for (var c = 36, d = 56, e = 4 + this.markerToWaypoints.length * d, f = 0; f < this.markerToWaypoints.length; ++f) {
                var g = this.markerToWaypoints[f].wp;
                g.numActions > 0 && (e += 8 * g.numActions)
            }
            var h = 4 + (null != this.poiMarkers ? 20 * this.poiMarkers.length : 0),
                i = 10 * this.markerToWaypoints.length + (null != this.poiMarkers ? 6 * this.poiMarkers.length : 0),
                j = new ArrayBuffer(b + c + e + h + i),
                k = new DataView(j, 0);
            a ? k.setInt8(0, GStool.VERSION) : k.setInt32(0, 1818454125);
            var l = b;
            k.setInt32(l, this.currMission.headingMode), l += 4, k.setInt32(l, this.currMission.finishAction), l += 4, k.setInt32(l, this.currMission.pathMode), l += 4, k.setFloat32(l, Math.max(-15, Math.min(15, this.currMission.horizontalSpeed))), l += 4, k.setFloat32(l, Math.max(2, Math.min(15, this.currMission.rcSpeed))), l += 4, k.setInt32(l, this.currMission.repeatNum), l += 4, k.setInt16(l, GStool.MISSION_CURR_VERSION), l += 2, k.setInt16(l, 0), l += 2, k.setInt32(b + c, this.markerToWaypoints.length), l = b + c + 4;
            for (var f = 0; f < this.markerToWaypoints.length; ++f) {
                var g = this.markerToWaypoints[f].wp;
                k.setFloat32(l, g.altitude), k.setInt32(l + 4, g.turnMode), k.setFloat32(l + 8, g.heading), k.setFloat32(l + 12, g.speed), k.setInt16(l + 16, g.stayTime), k.setInt16(l + 18, g.maxReachTime), k.setFloat64(l + 20, g.latitude), k.setFloat64(l + 28, g.longitude), k.setFloat32(l + 36, Math.max(.2, Math.min(1e3, g.dampingDistance))), k.setInt32(l + 40, g.gimbalCtrl), k.setInt32(l + 44, g.gimbalPitchAngle), k.setInt32(l + 48, g.numActions), k.setInt32(l + 52, g.repeatActions);
                var m = l + 56;
                if (g.numActions > 0)
                    for (var n = 0; n < g.numActions; ++n) k.setInt32(m, g.actions[n]), m += 4, k.setInt32(m, g.actionParams[n]), m += 4;
                l += d + 8 * g.numActions
            }
            if (k.setInt32(b + c + e, null != this.poiMarkers ? this.poiMarkers.length : 0), null != this.poiMarkers) {
                l = b + c + e + 4;
                for (var n = 0; n < this.poiMarkers.length; ++n) {
                    var o = this.poiMarkers[n].poi;
                    k.setFloat64(l, o.latitude), l += 8, k.setFloat64(l, o.longitude), l += 8, k.setFloat32(l, o.altitude), l += 4
                }
            }
            for (var f = 0; f < this.markerToWaypoints.length; ++f) {
                var g = this.markerToWaypoints[f].wp;
                k.setInt16(l, g.altitudeMode), l += 2, k.setFloat32(l, g.aglAltitude), l += 4;
                var p = -1;
                for (var n in this.poiMarkers)
                    if (null != g.targetPoi && g.targetPoi == this.poiMarkers[n]) {
                        p = n;
                        break
                    }
                k.setInt32(l, p), l += 4
            }
            for (var n = 0; n < this.poiMarkers.length; ++n) {
                var o = this.poiMarkers[n].poi;
                k.setInt16(l, o.altitudeMode), l += 2, k.setFloat32(l, o.aglAltitude), l += 4
            }
            return j
        },
        getBase64FromWaypoints: function(a, b) {
            var c = this.getBufferFromWaypoints(!1),
                d = this.getBase64FromBuffer(c, b);
            return d
        },
        getBase64FromBuffer: function(a, b) {
            for (var c = "", d = new Uint8Array(a), e = d.byteLength, f = 0; e > f; f++) c += String.fromCharCode(d[f]);
            return b ? LZString.compressToBase64(c) : window.btoa(c)
        },
        getBufferFromString: function(a) {
            for (var b = new Uint8Array(a.length), c = 0; c < a.length; c++) b[c] = a[c].charCodeAt(0);
            return b
        },
        hideWPSettings: function() {
            $("#wpsettings").is(":visible") && ($("#wpsettings").hide(), this.deselectCurrentSelection(), this.currIdx = null, this.deselectAllSelections(), this.selectedIdxs = [], this.clearBatchSettingsModifiedState())
        },
        updatePOISelection: function(a) {
            var b = this.selectedIdxs.length > 1,
                c = b ? this.batchWp : this.markerToWaypoints[this.currIdx].wp;
            b && this.setBatchSettingModified("Poi", !0), -1 == a ? (c.targetPoi = null, c.manualHeadingOverride = !0, $("#field-poi-selected").text("None")) : (c.targetPoi = this.poiMarkers[a], $("#field-poi-selected").text(parseInt(a) + 1), c.manualHeadingOverride = !1, b || (c.heading = this.computeOneWPHeadingFromGSPOI(this.markerToWaypoints[this.currIdx], c.targetPoi), this.updateOneGSHeadingRotation(this.currIdx), this.updateHESlider(this.getDisplayedHeading(c.heading)), this.updateGimbalMode(c.gimbalCtrl)))
        },
        updatePOIDropdown: function() {
            var a = this,
                b = this.markerToWaypoints[this.currIdx];
            $("#field-poi-dropdown").html("");
            var c = $("<li>"),
                d = $("<a>"),
                e = d.get(0);
            e.style.cursor = "pointer", d.text("None"), d.on("click", function(b) {
                return function() {
                    a.updatePOISelection(b)
                }
            }(-1)), c.append(d), $("#field-poi-dropdown").append(c);
            var f = !1;
            for (var g in this.poiMarkers) {
                var c = $("<li>"),
                    d = $("<a>"),
                    e = d.get(0);
                e.style.cursor = "pointer", d.text(parseInt(g) + 1), d.on("click", function(b) {
                    return function() {
                        a.updatePOISelection(b)
                    }
                }(g)), b.wp.targetPoi && b.wp.targetPoi == this.poiMarkers[g] && ($("#field-poi-selected").text(parseInt(g) + 1), f = !0), c.append(d), $("#field-poi-dropdown").append(c)
            }
            f || $("#field-poi-selected").text("None")
        },
        updateGimbalMode: function(a) {
            a = parseInt(a);
            var b = this.markerToWaypoints[this.currIdx].wp;
            switch (this.selectedIdxs.length > 1 && (b = this.batchWp, this.setBatchSettingModified("GimbalPitch", !0)), b.gimbalCtrl = a, a) {
                case 0:
                    $("#gpitchangle").hide();
                    break;
                case 1:
                    $("#gpitchangle").show(), $("#et-gpitch").attr("disabled", "disabled");
                    var c = 0;
                    if (b.targetPoi) {
                        var d = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(b.latitude, b.longitude), new google.maps.LatLng(b.targetPoi.poi.latitude, b.targetPoi.poi.longitude));
                        d = 0 == d ? 1e-5 : d, b.gimbalPitchAngle = -(180 * Math.atan((b.altitude - b.targetPoi.poi.altitude) / d) / Math.PI), b.gimbalPitchAngle = Math.max(-90, Math.min(30, b.gimbalPitchAngle)), c = b.gimbalPitchAngle
                    }
                    this.updateGimbalPitchAngle(c);
                    break;
                case 2:
                    $("#gpitchangle").show(), $("#et-gpitch").removeAttr("disabled"), this.updateGimbalPitchAngle(b.gimbalPitchAngle)
            }
        },
        updateGimbalPitchAngle: function(a) {
            this.selectedIdxs.length > 1 ? (this.setBatchSettingModified("GimbalPitch", !0), this.batchWp.gimbalPitchAngle = a) : this.markerToWaypoints[this.currIdx].wp.gimbalPitchAngle = a, $("#et-gpitch").val(Math.round(a) + "Â°")
        },
        redrawPOI: function(a, b) {
            this.poiMarkers[a].marker.setIcon(this.getPOIIcon(a + 1, this.poiMarkers[a].poi.altitude, b, this.poiMarkers[a].poi.altitudeMode == AltitudeMode.AboveGround, this.poiMarkers[a].poi.aglAltitude))
        },
        redrawWaypoint: function(a, b) {
            this.markerToWaypoints[a].marker.setIcon(this.getWPIcon(a + 1, this.markerToWaypoints[a].wp.altitude, b, this.markerToWaypoints[a].wp.altitudeMode == AltitudeMode.AboveGround, this.markerToWaypoints[a].wp.aglAltitude))
        },
        deselectCurrentSelection: function() {
            if (null !== this.currIdx)
                if (this.currIdx >= 0 && this.currIdx < this.markerToWaypoints.length) this.redrawWaypoint(this.currIdx, !1);
                else {
                    var a = this.currIdx < 0 && Math.abs(this.currIdx) <= this.poiMarkers.length ? Math.abs(this.currIdx) - 1 : null;
                    null != a && this.redrawPOI(a, !1)
                }
        },
        deselectAllSelections: function() {
            for (var a = 0; a < this.selectedIdxs.length; ++a) {
                var b = this.selectedIdxs[a];
                b >= 0 && b < this.markerToWaypoints.length ? this.redrawWaypoint(b, !1) : 0 > b && Math.abs(b) - 1 < this.poiMarkers.length && this.redrawPOI(Math.abs(b) - 1, !1)
            }
        },
        clearBatchSettingsModifiedState: function() {
            for (var a in MarkerSettings) this.setBatchSettingModified(a, !1)
        },
        updateCurrentSelection: function(a, b, c, d) {
            if (a >= 0 && a > this.markerToWaypoints.length - 1) return void this.hideWPSettings();
            if (0 > a && Math.abs(a) > this.poiMarkers.length) return void this.hideWPSettings();
            var e = 0 > a,
                f = e && (null == this.currIdx || this.currIdx >= 0) || !e && (null == this.currIdx || this.currIdx < 0);
            (!c || f) && (this.deselectCurrentSelection(), this.currIdx = null, this.deselectAllSelections(), this.selectedIdxs = []);
            var g = null,
                h = this.selectedIdxs.indexOf(a);
            if (c && -1 != h ? this.selectedIdxs.length > 1 && (this.selectedIdxs.splice(h, 1), e ? this.redrawPOI(Math.abs(a) - 1, !1) : this.redrawWaypoint(a, !1), 1 == this.selectedIdxs.length && (this.currIdx = this.selectedIdxs[0])) : (this.currIdx = a, c ? (1 == this.selectedIdxs.length && this.toggleAllOff(), this.selectedIdxs.push(this.currIdx), 2 == this.selectedIdxs.length && (this.clearBatchSettingsModifiedState(), this.sliderCs.slider("setAttribute", "max", 100), this.batchEditCurvePercent = this.defaultCurveSize, this.updateCSSlider(this.batchEditCurvePercent), this.batchAltitudeAboveCurrent = !1, $("#wp-altitude-current").get(0).checked = !1)) : this.selectedIdxs = [this.currIdx], e ? this.redrawPOI(Math.abs(this.currIdx) - 1, !0) : this.redrawWaypoint(this.currIdx, !0)), g = e ? this.poiMarkers[Math.abs(this.currIdx) - 1].poi : this.markerToWaypoints[this.currIdx].wp, this.selectedIdxs.length > 1) $("#wp-altitude-current").parent().show(), $("#prevnext-btns").hide(), $("#batch-btns").show(), $("#inswp").hide(), $("#delwp").hide(), $("#wpsettingslabel").text("BATCH SETTINGS"), $("#field-latitude").hide(), $("#field-longitude").hide(), $("#wp-elevation").hide();
            else {
                if (e ? (this.batchWp.altitude = g.altitudeMode == AltitudeMode.AboveGround ? g.aglAltitude : g.altitude, this.batchWp.aglAltitude = g.aglAltitude, this.batchWp.altitudeMode = g.altitudeMode) : (this.batchWp = $.extend(!0, {}, g), this.batchWp.altitude = g.altitudeMode == AltitudeMode.AboveGround ? g.aglAltitude : g.altitude), $("#batch-btns").hide(), $("#prevnext-btns").show(), $("#wp-altitude-current").parent().hide(), this.updateLatLongET(g.latitude, g.longitude), $("#wp-altitude-agl").get(0).checked = g.altitudeMode == AltitudeMode.AboveGround, this.updateAltSlider(g.altitudeMode == AltitudeMode.AboveGround ? g.aglAltitude : g.altitude), !e) {
                    this.updateSpeedSlider(g.speed), this.updateStaytimeSlider(g.stayTime), this.setMaxDamping(this.currIdx), this.updateCSSlider(g.dampingDistance);
                    var i = g.heading;
                    if (0 == this.currMission.headingMode && a < this.markerToWaypoints.length - 1 && (i = Math.round(google.maps.geometry.spherical.computeHeading(this.markerToWaypoints[a].marker.position, this.markerToWaypoints[a + 1].marker.position))), this.updateHESlider(this.getDisplayedHeading(i)), $("#checkbox-banked").get(0).checked = g.turnMode, this.updatePOIDropdown(), $("input[name=gpitchctrlradio][id=option" + g.gimbalCtrl + "]").click(), this.updateGimbalMode(g.gimbalCtrl), $("#actionlist").html(""), g.actions.length > 0)
                        for (var j in g.actions) this.addAction(parseInt(j), g.actions[j], g.actionParams[j]);
                    this.refreshNumActions(), 3 == this.currMission.headingMode ? (this.sliderHe.slider("enable"), $("#et-he").removeAttr("disabled")) : (this.sliderHe.slider("disable"), $("#et-he").attr("disabled", "disabled"))
                }
                d || this.refreshDisplayedElevation(new google.maps.LatLng(g.latitude, g.longitude)), $("#wpsettingslabel").text((e ? "POI " + Math.abs(this.currIdx) : "WAYPOINT " + (this.currIdx + 1)) + " SETTINGS"), $("#delwp").show(), e || this.currIdx == this.markerToWaypoints.length - 1 ? $("#inswp").hide() : $("#inswp").show(), $("#field-latitude").show(), $("#field-longitude").show(), e ? ($("#field-poi").hide(), $("#field-cs").hide(), $("#field-he").hide(), $("#field-speed").hide(), $("#field-gctrl").hide(), $("#field-actions").hide()) : 1 == this.acType && ($("#field-gctrl").show(), $("#field-poi").show(), $("#field-cs").show(), $("#field-he").show(), $("#field-speed").show(), $("#field-actions").show())
            }
            $("#wpsettings").show(), this.selectedIdxs.length <= 1 && b ? this.map.panTo(e ? this.poiMarkers[Math.abs(this.currIdx) - 1].marker.getPosition() : this.markerToWaypoints[this.currIdx].marker.getPosition()) : google.maps.event.trigger(this.map, "center_changed")
        },
        addPOI: function(a, b, c, d) {
            if (1 == this.acType) {
                var e = new google.maps.Marker({
                        position: a,
                        map: this.map,
                        draggable: !0,
                        icon: this.getPOIIcon(this.poiMarkers.length + 1, b, !1, d ? d.altitudeMode : AltitudeMode.AboveTakeOff, d ? d.aglAltitude : b)
                    }),
                    f = this;
                google.maps.event.addListener(e, "click", function() {
                    for (var a = null, b = 0; b < f.poiMarkers.length; ++b)
                        if (f.poiMarkers[b].marker == e) {
                            a = b;
                            break
                        }
                    f.updateCurrentSelection(-(a + 1), !1, g_ctrlkeydown)
                }), google.maps.event.addListener(e, "drag", function() {
                    return f.movingEnabled ? void f.moveMissionToLocation.call(f, e.position, -(f.movingIndex + 1), 0) : f.scalingEnabled ? void f.scaleMission(e.position, -(f.movingIndex + 1), 0) : f.rotateEnabled && f.rotateMarker ? void f.rotateMission(e.position, 0) : void f.repositionPOI.call(f, e)
                }), google.maps.event.addListener(e, "dragend", function() {
                    if (f.ignoreNextClick = !0, window.setTimeout(function() {
                            f.ignoreNextClick = !1
                        }, 250), f.movingEnabled) return f.moveMissionToLocation.call(f, e.position, -(f.movingIndex + 1), 1), f.refreshMissionLine.call(f), void f.setGroundLocationReference(f.markerToWaypoints[0].marker.getPosition(), !0, !1, function() {
                        null != f.currIdx && f.refreshDisplayedElevation(f.currIdx < 0 ? f.poiMarkers[Math.abs(f.currIdx) - 1].marker.getPosition() : f.markerToWaypoints[f.currIdx].marker.getPosition())
                    });
                    if (f.scalingEnabled) {
                        e.setPosition(f.movingRef);
                        for (var a in f.markerToWaypoints)
                            if (a >= 1 && a < f.markerToWaypoints.length - 1) {
                                a = parseInt(a);
                                var b = f.getMaxDamping(a),
                                    c = f.markerToWaypoints[a];
                                c && (c.wp.dampingDistance = Math.min(b, Math.max(c.wp.dampingDistance, .2)))
                            }
                        return f.refreshMissionLine.call(f), void f.setGroundLocationReference(f.markerToWaypoints[0].marker.getPosition(), !0, !1, function() {
                            null !== f.currIdx && f.currIdx < 0 && f.refreshDisplayedElevation(new google.maps.LatLng(f.poiMarkers[Math.abs(f.currIdx) - 1].poi.latitude, f.poiMarkers[Math.abs(f.currIdx) - 1].poi.longitude))
                        })
                    }
                    if (f.rotateEnabled && f.rotateMarker) {
                        f.rotateMission(e.position, 1);
                        for (var a in f.poiMarkers) f.computeHeadingsForGSPOI(f.poiMarkers[a]);
                        return f.refreshMissionLine.call(f), f.refreshGSHeadings(!1), void f.setGroundLocationReference(f.markerToWaypoints[0].marker.getPosition(), !0, !1, function() {
                            null !== f.currIdx && f.currIdx < 0 && f.refreshDisplayedElevation(new google.maps.LatLng(f.poiMarkers[Math.abs(f.currIdx) - 1].poi.latitude, f.poiMarkers[Math.abs(f.currIdx) - 1].poi.longitude))
                        })
                    }
                    f.repositionPOI.call(f, e, !0)
                }), google.maps.event.addListener(e, "dragstart", function() {
                    return f.selectedIdxs.length > 1 && f.hideWPSettings(), f.movingEnabled ? (f.setMovingIndexFromPOI.call(f, e), void f.moveMissionToLocation.call(f, e.position, -(f.movingIndex + 1), -1)) : f.scalingEnabled ? (f.setMovingIndexFromPOI.call(f, e), void f.scaleMission(e.position, -(f.movingIndex + 1), -1)) : f.rotateEnabled && f.rotateMarker ? (f.setMovingIndexFromPOI.call(f, e), void f.rotateMission(e.position, -1)) : void f.repositionPOI.call(f, e)
                });
                var g = new GSPOI;
                g.altitude = b, g.latitude = a.lat(), g.longitude = a.lng(), g.altitudeMode = d ? d.altitudeMode : AltitudeMode.AboveTakeOff, g.aglAltitude = d ? d.aglAltitude : g.altitude, this.poiMarkers.push({
                    poi: g,
                    marker: e
                }), this._refreshGSHeadings(c, null, !c)
            }
        },
        addWaypoint: function(a, b, c, d, e, f, g, h, i, j, k) {
            var l = (k && k > 0 ? k : this.markerToWaypoints.length) + 1,
                m = new google.maps.LatLng(b, c),
                n = new GSWaypoint(this);
            n.latitude = m.lat(), n.longitude = m.lng(), n.altitude = d, n.speed = e, n.turnMode = g, n.heading = i, n.maxReachTime = h, n.stayTime = f, n.dampingDistance = .2, null != this.lastWP && (n.altitude = this.lastWP.altitude, n.aglAltitude = this.lastWP.aglAltitude, n.altitudeMode = this.lastWP.altitudeMode, 0 == this.acType && (n.speed = this.lastWP.speed), n.turnMode = this.lastWP.turnMode, n.stayTime = this.lastWP.stayTime, n.heading = this.lastWP.heading);
            var o = new google.maps.Marker({
                    position: m,
                    map: this.map,
                    draggable: !0,
                    icon: this.getWPIcon(l, j ? j.altitude : n.altitude, !1, j ? j.altitudeMode == AltitudeMode.AboveGround : !1, j ? j.aglAltitude : n.altitude)
                }),
                p = this;
            google.maps.event.addListener(o, "click", function(a) {
                for (var b = null, c = 0; c < p.markerToWaypoints.length; ++c)
                    if (p.markerToWaypoints[c].marker == o) {
                        b = c;
                        break
                    }
                return g_ctrlkeydown && p.rotateEnabled && p.rotateMarker ? void p.fixedRotate() : void p.updateCurrentSelection(b, !1, g_ctrlkeydown)
            }), google.maps.event.addListener(o, "drag", function() {
                return p.movingEnabled ? void p.moveMissionToLocation(o.position, p.movingIndex, 0) : p.scalingEnabled ? void p.scaleMission(o.position, p.movingIndex, 0) : p.rotateEnabled && p.rotateMarker ? void p.rotateMission(o.position, 0) : void p.repositionWP.call(p, o)
            }), google.maps.event.addListener(o, "dragend", function() {
                if (p.ignoreNextClick = !0, window.setTimeout(function() {
                        p.ignoreNextClick = !1
                    }, 250), p.movingEnabled) return p.moveMissionToLocation(o.position, p.movingIndex, 1), p.refreshMissionLine.call(p), void p.setGroundLocationReference(p.markerToWaypoints[0].marker.getPosition(), !0, !1, function() {
                    null != p.currIdx && p.refreshDisplayedElevation(p.currIdx < 0 ? p.poiMarkers[Math.abs(p.currIdx) - 1].marker.getPosition() : p.markerToWaypoints[p.currIdx].marker.getPosition())
                });
                if (p.scalingEnabled) {
                    o.setPosition(p.movingRef);
                    for (var a in p.markerToWaypoints)
                        if (a >= 1 && a < p.markerToWaypoints.length - 1) {
                            a = parseInt(a);
                            var b = p.getMaxDamping(a),
                                c = p.markerToWaypoints[a];
                            c && (c.wp.dampingDistance = Math.min(b, Math.max(c.wp.dampingDistance, .2)))
                        }
                    return p.refreshMissionLine.call(p), void p.setGroundLocationReference(p.markerToWaypoints[0].marker.getPosition(), !0, !1, function() {
                        null !== p.currIdx && p.currIdx >= 0 && p.refreshDisplayedElevation(new google.maps.LatLng(p.markerToWaypoints[p.currIdx].wp.latitude, p.markerToWaypoints[p.currIdx].wp.longitude))
                    })
                }
                if (p.rotateEnabled && p.rotateMarker) {
                    p.rotateMission(o.position, 1);
                    for (var a in p.poiMarkers) p.computeHeadingsForGSPOI(p.poiMarkers[a]);
                    return p.refreshMissionLine.call(p), p.refreshGSHeadings(!1), void p.setGroundLocationReference(p.markerToWaypoints[0].marker.getPosition(), !0, !1, function() {
                        null !== p.currIdx && p.currIdx >= 0 && p.refreshDisplayedElevation(new google.maps.LatLng(p.markerToWaypoints[p.currIdx].wp.latitude, p.markerToWaypoints[p.currIdx].wp.longitude))
                    })
                }
                p.repositionWP.call(p, o, !0)
            }), google.maps.event.addListener(o, "dragstart", function() {
                return p.selectedIdxs.length > 1 && p.hideWPSettings(), p.movingEnabled ? (p.setMovingIndex.call(p, o), void p.moveMissionToLocation(o.position, p.movingIndex, -1)) : p.scalingEnabled ? (p.setMovingIndex.call(p, o), void p.scaleMission(o.position, p.movingIndex, -1)) : p.rotateEnabled && p.rotateMarker ? (p.setMovingIndex.call(p, o), void p.rotateMission(o.position, -1)) : void p.repositionWP.call(p, o)
            });
            var q = {
                marker: o,
                wp: j ? j : n
            };
            k && k > 0 ? this.markerToWaypoints.splice(k, 0, q) : this.markerToWaypoints.push(q), a || (n.heading = p.computeOneWPHeadingFromGSPOI(q, p.getClosestPOI(new google.maps.LatLng(q.wp.latitude, q.wp.longitude))));
            var r = k && k > 0 ? k : this.markerToWaypoints.length - 1;
            if (r > 1) {
                var s = r - 1,
                    t = this.markerToWaypoints[s];
                if (t) {
                    var u = this.getMaxDamping(s),
                        v = t.wp.dampingDistance;
                    a || (v = this.computeDefaultDamping(s)), t.wp.dampingDistance = Math.min(u, Math.max(v, .2))
                }
            }
        },
        fixedRotate: function() {
            var a = this,
                b = 45;
            for (var c in this.markerToWaypoints) {
                var d = this.markerToWaypoints[c],
                    e = google.maps.geometry.spherical.computeDistanceBetween(this.rotateMarker.position, d.marker.position),
                    f = google.maps.geometry.spherical.computeHeading(this.rotateMarker.position, d.marker.position),
                    g = google.maps.geometry.spherical.computeOffset(this.rotateMarker.position, e, f + b);
                d.wp.latitude = g.lat(), d.wp.longitude = g.lng(), d.marker.setPosition(g), this.currIdx == c && this.updateLatLongET(d.wp.latitude, d.wp.longitude)
            }
            for (var c in this.poiMarkers) {
                var d = this.poiMarkers[c],
                    e = google.maps.geometry.spherical.computeDistanceBetween(this.rotateMarker.position, d.marker.position),
                    f = google.maps.geometry.spherical.computeHeading(this.rotateMarker.position, d.marker.position),
                    g = google.maps.geometry.spherical.computeOffset(this.rotateMarker.position, e, f + b);
                d.poi.latitude = g.lat(), d.poi.longitude = g.lng(), d.marker.setPosition(g), this.currIdx < 0 && Math.abs(this.currIdx) - 1 == c && this.updateLatLongET(d.poi.latitude, d.poi.longitude)
            }
            a.refreshMissionLine.call(a);
            for (var c in a.poiMarkers) a.computeHeadingsForGSPOI(a.poiMarkers[c]);
            a.refreshGSHeadings(!1), a.setGroundLocationReference(a.markerToWaypoints[0].marker.getPosition(), !0, !1, function() {
                null !== a.currIdx && a.currIdx >= 0 && a.refreshDisplayedElevation(new google.maps.LatLng(a.markerToWaypoints[a.currIdx].wp.latitude, a.markerToWaypoints[a.currIdx].wp.longitude))
            })
        },
        computeOneWPHeadingFromGSPOI: function(a, b) {
            var c = a.wp.heading;
            return this.poiMarkers.length > 0 && b && (a.wp.targetPoi = b, c = Math.round(google.maps.geometry.spherical.computeHeading(a.marker.getPosition(), b.marker.getPosition()))), c
        },
        refreshMissionCurves: function(a) {
            for (var b in this.curves) this.curves[b].setMap(null);
            if (this.curves = [], !(a || this.markerToWaypoints.length <= 2))
                for (var b in this.markerToWaypoints) b > 0 && b < this.markerToWaypoints.length - 1 && this.curves.push(this.refreshOneCurve(parseInt(b), !1))
        },
        setAltitudesRelativeToGroundUsingPOIs: function(a, b) {
            if (this.markerToWaypoints.length <= 0) return void b();
            var c = this,
                d = [];
            d.push(new google.maps.LatLng(this.markerToWaypoints[0].wp.latitude, this.markerToWaypoints[0].wp.longitude));
            for (var e = 0; e < a.length; ++e) d.push(a[e]);
            this.getElevationsWithCache(d, function(a, d) {
                if (0 == a && d.length >= c.markerToWaypoints.length) {
                    for (var e = d[0], f = 0; f < c.markerToWaypoints.length; ++f) c.markerToWaypoints[f].wp.altitude = c.markerToWaypoints[f].wp.altitude + (d[f + 1] - e), c.markerToWaypoints[f].wp.aglAltitude = c.markerToWaypoints[f].wp.altitude, c.redrawWaypoint(f, !1);
                    c.refreshMissionLine(), c.refreshTotalTimeAndDistance(), c.refreshGSHeadings(!1)
                }
                b()
            })
        },
        refreshDisplayedElevation: function(a) {
            if (this.markerToWaypoints.length <= 0 || !this.enableElevation) return void $("#wp-elevation").hide();
            var b = this,
                c = new google.maps.LatLng(this.markerToWaypoints[0].wp.latitude, this.markerToWaypoints[0].wp.longitude);
            $("#wp-elevation").text(""), this.getElevationsWithCache([c, a], function(a, c) {
                if (0 == a) {
                    var d = Math.abs(c[0] - c[1]),
                        e = b.formatDistance(d, !1, 1) + " " + (c[0] < c[1] ? "above" : "below");
                    $("#wp-elevation").text("Ground Elevation: " + b.formatDistance(c[1], !1, 1) + " (" + e + " first waypoint)").show()
                } else $("#wp-elevation").hide()
            })
        },
        setAltitudeFinal: function(a, b) {
            b = Math.max(-200, Math.min(b, 500));
            var c = this,
                d = 0 > a ? Math.abs(a) - 1 : a,
                e = null != c.currIdx && c.currIdx == a;
            if (0 > a) c.poiMarkers[d].poi.altitude = b, c.redrawPOI(d, e);
            else {
                for (c.markerToWaypoints[d].wp.altitude = b, c.redrawWaypoint(d, e), c.lastWP = c.markerToWaypoints[d].wp, c.refreshTotalTimeAndDistance(), e && (c.updateGimbalMode(c.markerToWaypoints[d].wp.gimbalCtrl), c.setMaxDamping(d)), a = d - 1; d + 1 >= a; ++a)
                    if (a >= 1 && a < c.markerToWaypoints.length - 1) {
                        var f = c.getMaxDamping(a),
                            g = c.markerToWaypoints[a];
                        g && (g.wp.dampingDistance = Math.min(f, Math.max(g.wp.dampingDistance, .2))), c.refreshOneCurve(a, !0)
                    }
                c.refreshDistOverlaysAt(d)
            }
        },
        getElevationsWithCache: function(a, b) {
            for (var c = this, d = [], e = [], f = 0; f < a.length; ++f) {
                var g = a[f].lat() + "-" + a[f].lng();
                c.elevationCache.hasOwnProperty(g) ? e.push(c.elevationCache[g]) : d.push(a[f])
            }
            if (0 == d.length) b(0, e);
            else {
                if (!c.enableElevation || !g_user) return void b(1, []);
                this.getElevationsFromAPI(a, function(d, f) {
                    if (f === google.maps.ElevationStatus.OK) {
                        if (d && d.length == a.length) {
                            e = [];
                            for (var g = 0; g < a.length; ++g) {
                                var h = a[g].lat() + "-" + a[g].lng();
                                c.elevationCache[h] = d[g].elevation, e.push(c.elevationCache[h])
                            }
                            return void b(0, e)
                        }
                        console.log("elevation service failed, did not return enough result")
                    } else console.log("Elevation service failed due to: " + f);
                    b(1, [])
                })
            }
        },
        getElevationsFromAPI: function(a, b) {
            var c = google.maps.geometry.encoding.encodePath(a),
                d = $("#wp-elevation").text();
            $("#wp-elevation").text(""), $("#wp-elev-loader").show(), Parse.Cloud.run("getElevations", {
                locs: c
            }, {
                success: function(a) {
                    $("#wp-elevation").text(d), $("#wp-elev-loader").hide(), a.status ? b(a.results, a.status) : b([], google.maps.ElevationStatus.UNKNOWN_ERROR)
                },
                error: function(a) {
                    $("#wp-elevation").text(d), $("#wp-elev-loader").hide(), b([], google.maps.ElevationStatus.UNKNOWN_ERROR)
                }
            })
        },
        setGroundLocationReference: function(a, b, c, d) {
            return b || a.lat() != this.groundLocationReference.lat() || a.lng() != this.groundLocationReference.lng() ? (this.groundLocationReference = a, void(c ? d && d() : this.refreshAllAglAltitudes(d))) : void(d && d())
        },
        refreshAllAglAltitudes: function(a) {
            for (var b = this, c = [this.groundLocationReference], d = b.markerToWaypoints.length, e = 0; d > e; ++e) {
                var f = b.markerToWaypoints[e];
                c.push(f.marker.getPosition())
            }
            for (var g = b.poiMarkers.length, e = 0; g > e; ++e) {
                var h = b.poiMarkers[e];
                c.push(h.marker.getPosition())
            }
            this.getElevationsWithCache(c, function(c, e) {
                if (0 == c) {
                    for (var f = 1, h = 0; d > h; ++h) {
                        var i = b.markerToWaypoints[h];
                        i.wp.altitudeMode == AltitudeMode.AboveGround && b.setAltitudeFinal(h, e[f] - e[0] + i.wp.aglAltitude), ++f
                    }
                    for (var h = 0; g > h; ++h) {
                        var j = b.poiMarkers[h];
                        j.poi.altitudeMode == AltitudeMode.AboveGround && b.setAltitudeFinal(-(h + 1), e[f] - e[0] + j.poi.aglAltitude), ++f
                    }
                }
                a && a()
            })
        },
        getQuadraticBezierCoordFor: function(a, b, c, d) {
            return new google.maps.LatLng(this.getQuadraticBezierValueFor(a.lat(), b.lat(), c.lat(), d), this.getQuadraticBezierValueFor(a.lng(), b.lng(), c.lng(), d))
        },
        getQuadraticBezierPointFor: function(a, b, c, d) {
            return new google.maps.Point(this.getQuadraticBezierValueFor(a.x, b.x, c.x, d), this.getQuadraticBezierValueFor(a.y, b.y, c.y, d))
        },
        getQuadraticBezierValueFor: function(a, b, c, d) {
            return Math.pow(1 - d, 2) * a + 2 * (1 - d) * d * b + Math.pow(d, 2) * c
        },
        isCurveUseful: function() {
            return this.currIdx > 0 && this.currIdx < this.markerToWaypoints.length - 1
        },
        setMaxDamping: function(a) {
            var b = this.markerToWaypoints[a].wp;
            this.isCurveUseful() ? this.maxDamping = this.getMaxDamping(a) : this.maxDamping = .2, this.sliderCs.slider("setAttribute", "max", parseInt(this.maxDamping)), this.updateCSSlider(Math.max(.2, Math.min(this.maxDamping, b.dampingDistance)))
        },
        computeDefaultDamping: function(a) {
            var b = this.markerToWaypoints[a - 1],
                c = this.markerToWaypoints[a],
                d = this.markerToWaypoints[a + 1],
                e = this.distance3DBetween(new google.maps.LatLng(b.wp.latitude, b.wp.longitude), b.wp.altitude, new google.maps.LatLng(c.wp.latitude, c.wp.longitude), c.wp.altitude),
                f = this.distance3DBetween(new google.maps.LatLng(d.wp.latitude, d.wp.longitude), d.wp.altitude, new google.maps.LatLng(c.wp.latitude, c.wp.longitude), c.wp.altitude),
                g = e;
            a > 1 && (g -= b.wp.dampingDistance), g = Math.min(g, e / 2);
            var h = f / 2,
                i = Math.min(g, h),
                j = i * (this.defaultCurveSize / 100);
            return j = Math.max(.2, Math.min(1e3, j))
        },
        getMaxDamping: function(a) {
            var b = this.markerToWaypoints[a - 1],
                c = this.markerToWaypoints[a],
                d = this.markerToWaypoints[a + 1],
                e = this.distance3DBetween(new google.maps.LatLng(b.wp.latitude, b.wp.longitude), b.wp.altitude, new google.maps.LatLng(c.wp.latitude, c.wp.longitude), c.wp.altitude);
            a > 1 && (e -= b.wp.dampingDistance);
            var f = this.distance3DBetween(new google.maps.LatLng(d.wp.latitude, d.wp.longitude), d.wp.altitude, new google.maps.LatLng(c.wp.latitude, c.wp.longitude), c.wp.altitude);
            a < this.markerToWaypoints.length - 2 && (f -= d.wp.dampingDistance);
            var g = Math.min(e, f);
            return Math.min(1e3, Math.max(.2, g - 1))
        },
        refreshOneCurve: function(a, b) {
            if (b && 0 == this.curves.length) return this.refreshMissionCurves(), null;
            var c = this.markerToWaypoints[a - 1],
                d = this.markerToWaypoints[a],
                e = this.markerToWaypoints[a + 1],
                f = google.maps.geometry.spherical.computeHeading(d.marker.getPosition(), c.marker.getPosition()),
                g = d.marker.position,
                h = this.distance3DBetween(g, d.wp.altitude, c.marker.position, c.wp.altitude),
                i = Math.cos(Math.asin(Math.abs(c.wp.altitude - d.wp.altitude) / h)) * d.wp.dampingDistance,
                j = google.maps.geometry.spherical.computeOffset(g, i, f);
            f = google.maps.geometry.spherical.computeHeading(d.marker.getPosition(), e.marker.getPosition());
            for (var k = this.distance3DBetween(g, d.wp.altitude, e.marker.position, e.wp.altitude), l = Math.cos(Math.asin(Math.abs(e.wp.altitude - d.wp.altitude) / k)) * d.wp.dampingDistance, m = google.maps.geometry.spherical.computeOffset(g, l, f), n = [], o = 0, p = 20, q = 0; p >= q; ++q) {
                o = 1 / p * q;
                var r = this.getQuadraticBezierCoordFor(j, g, m, o);
                n.push(r)
            }
            var s = new google.maps.Polyline({
                path: n,
                strokeColor: "#00ffff",
                strokeOpacity: 1,
                strokeWeight: 2
            });
            if (1 == this.acType && 1 == this.currMission.pathMode && s.setMap(this.map), b) {
                var t = this.curves[a - 1];
                t.setMap(null), this.curves[a - 1] = s
            }
            return s
        },
        repositionPOI: function(a, b) {
            for (var c = null, d = 0; d < this.poiMarkers.length; ++d)
                if (this.poiMarkers[d].marker == a) {
                    c = d;
                    break
                }
            if (null != c) {
                (this.currIdx >= 0 || c != Math.abs(this.currIdx) - 1) && this.updateCurrentSelection(-(c + 1), !1, !1, !0);
                var e = this.poiMarkers[c].poi;
                if (e.latitude = a.getPosition().lat(), e.longitude = a.getPosition().lng(), this._refreshGSHeadings(!1, this.poiMarkers[c], !1), this.updateLatLongET(e.latitude, e.longitude), b) {
                    var f = this,
                        g = new google.maps.LatLng(e.latitude, e.longitude);
                    f.getElevationsWithCache([f.groundLocationReference, g], function(a, b) {
                        0 == a && e.altitudeMode == AltitudeMode.AboveGround && f.setAltitudeFinal(-(c + 1), b[1] - b[0] + e.aglAltitude), f.refreshDisplayedElevation(g)
                    })
                }
            }
        },
        snapToLine: function(a, b) {
            var c = b > 1 ? this.markerToWaypoints[b - 2] : null,
                d = null == c ? null : new google.maps.LatLng(c.wp.latitude, c.wp.longitude),
                e = this.markerToWaypoints[b - 1],
                f = new google.maps.LatLng(e.wp.latitude, e.wp.longitude),
                g = null == d ? 0 : google.maps.geometry.spherical.computeHeading(f, d),
                h = google.maps.geometry.spherical.computeHeading(f, a),
                i = this.normAngle180(g + 90),
                j = this.normAngle180(g - 90),
                k = this.normAngle180(g),
                l = this.normAngle180(g + 180),
                m = h - i;
            m += m > 180 ? -360 : -180 > m ? 360 : 0;
            var n = h - j;
            n += n > 180 ? -360 : -180 > n ? 360 : 0;
            var o = h - k;
            o += o > 180 ? -360 : -180 > o ? 360 : 0;
            var p = h - l;
            p += p > 180 ? -360 : -180 > p ? 360 : 0;
            var q = [Math.abs(m), Math.abs(n), Math.abs(o), Math.abs(p)];
            q.sort(function(a, b) {
                return a - b
            });
            var r = q[0],
                s = 0;
            r == Math.abs(m) ? s = i : r == Math.abs(n) ? s = j : r == Math.abs(o) ? s = k : r == Math.abs(p) && (s = l);
            var t = google.maps.geometry.spherical.computeDistanceBetween(f, a),
                u = google.maps.geometry.spherical.computeOffset(f, 100, s),
                v = this.distanceToLine.call(this, a, f, u),
                w = Math.sqrt(t * t - v * v);
            return isNaN(w) && (w = .5), google.maps.geometry.spherical.computeOffset(f, w, s)
        },
        repositionMarker: function(a) {
            var b = 0 > a ? this.poiMarkers[Math.abs(a) - 1] : this.markerToWaypoints[a],
                c = 0 > a ? b.poi : b.wp,
                d = new google.maps.LatLng(c.latitude, c.longitude);
            b.marker.setPosition(d), 0 > a ? this.repositionPOI(b.marker, !0) : this.repositionWP(b.marker, !0)
        },
        repositionWP: function(a, b) {
            for (var c = null, d = 0; d < this.markerToWaypoints.length; ++d)
                if (this.markerToWaypoints[d].marker == a) {
                    c = d;
                    break
                }
            if (null != c) {
                if (b && g_shiftkeydown && this.markerToWaypoints.length >= 2 && c == this.markerToWaypoints.length - 1) {
                    var e = this.snapToLine(a.getPosition(), c);
                    this.markerToWaypoints[c].marker.setPosition(e)
                }
                c != this.currIdx && this.updateCurrentSelection(c, !1, !1, !0), this.setMaxDamping(c);
                var f = this.markerToWaypoints[c].wp;
                if (f.latitude = a.getPosition().lat(), f.longitude = a.getPosition().lng(), null == this.missionLine) this.refreshMissionLine();
                else {
                    var g = this.markerToWaypoints.length;
                    for (3 == this.currMission.finishAction && 0 == c && this.missionLine.getPath().setAt(g, new google.maps.LatLng(f.latitude, f.longitude)), this.missionLine.getPath().setAt(c, new google.maps.LatLng(f.latitude, f.longitude)), d = c - 1; c + 1 >= d; ++d)
                        if (d >= 1 && g - 1 > d) {
                            var h = this.getMaxDamping(d),
                                i = this.markerToWaypoints[d];
                            i && (i.wp.dampingDistance = Math.min(h, Math.max(i.wp.dampingDistance, .2))), this.refreshOneCurve(d, !0)
                        }
                    this.refreshDistOverlaysAt(c)
                }
                if (this.refreshTotalTimeAndDistance(), this.refreshOneGSHeading(c), this.updateGimbalMode(f.gimbalCtrl), this.updateLatLongET(f.latitude, f.longitude), 0 == this.currMission.headingMode && parseInt(c) > 0 && this.refreshOneGSHeading(parseInt(c) - 1), b) {
                    var j = this,
                        k = new google.maps.LatLng(f.latitude, f.longitude);
                    0 == c ? j.setGroundLocationReference(k, !1, !1, function() {
                        j.refreshDisplayedElevation(k)
                    }) : j.getElevationsWithCache([j.groundLocationReference, k], function(a, b) {
                        0 == a && f.altitudeMode == AltitudeMode.AboveGround && j.setAltitudeFinal(c, b[1] - b[0] + f.aglAltitude), j.refreshDisplayedElevation(k)
                    })
                }
            }
        },
        refreshDistOverlaysAt: function(a) {
            if (null != this.distOverlays) {
                this.distOverlays[a] && (this.distOverlays[a].setMap(null), this.distOverlays[a] = this.getDistOverlay(this.markerToWaypoints[a], this.markerToWaypoints[a + 1 < this.markerToWaypoints.length ? a + 1 : 0]));
                var b = 3 == this.currMission.finishAction && 0 == a ? this.markerToWaypoints.length - 1 : a - 1;
                b >= 0 && this.distOverlays[b] && (this.distOverlays[b].setMap(null), this.distOverlays[b] = this.getDistOverlay(this.markerToWaypoints[b], this.markerToWaypoints[a]))
            }
        },
        setMovingIndex: function(a) {
            for (var b = null, c = 0; c < this.markerToWaypoints.length; ++c)
                if (this.markerToWaypoints[c].marker == a) {
                    b = c;
                    break
                }
            null != b && (this.movingIndex = b)
        },
        setMovingIndexFromPOI: function(a) {
            for (var b = null, c = 0; c < this.poiMarkers.length; ++c)
                if (this.poiMarkers[c].marker == a) {
                    b = c;
                    break
                }
            null != b && (this.movingIndex = b)
        },
        isForIndexValid: function(a) {
            return a >= 0 && this.markerToWaypoints.length < a + 1 ? !1 : 0 > a && this.poiMarkers.length < Math.abs(a) ? !1 : !0
        },
        rotateMission: function(a, b) {
            if (this.rotateMarker) {
                -1 == b && (this.bearingRef = google.maps.geometry.spherical.computeHeading(this.rotateMarker.position, a), this.movingRefs = []);
                var c = google.maps.geometry.spherical.computeHeading(this.rotateMarker.position, a),
                    d = c - this.bearingRef;
                for (var e in this.markerToWaypoints) {
                    var f = this.markerToWaypoints[e];
                    if (-1 == b) {
                        var g = google.maps.geometry.spherical.computeDistanceBetween(this.rotateMarker.position, f.marker.position),
                            c = google.maps.geometry.spherical.computeHeading(this.rotateMarker.position, f.marker.position);
                        this.movingRefs[e] = {
                            d: g,
                            b: c
                        }
                    }
                    var h = google.maps.geometry.spherical.computeOffset(this.rotateMarker.position, this.movingRefs[e].d, this.movingRefs[e].b + d);
                    f.wp.latitude = h.lat(), f.wp.longitude = h.lng(), f.marker.setPosition(h), this.currIdx == e && this.updateLatLongET(f.wp.latitude, f.wp.longitude)
                }
                for (var e in this.poiMarkers) {
                    var f = this.poiMarkers[e];
                    if (-1 == b) {
                        var g = google.maps.geometry.spherical.computeDistanceBetween(this.rotateMarker.position, f.marker.position),
                            c = google.maps.geometry.spherical.computeHeading(this.rotateMarker.position, f.marker.position);
                        this.movingRefs[-(e + 1)] = {
                            d: g,
                            b: c
                        }
                    }
                    var h = google.maps.geometry.spherical.computeOffset(this.rotateMarker.position, this.movingRefs[-(e + 1)].d, this.movingRefs[-(e + 1)].b + d);
                    f.poi.latitude = h.lat(), f.poi.longitude = h.lng(), f.marker.setPosition(h), this.currIdx < 0 && Math.abs(this.currIdx) - 1 == e && this.updateLatLongET(f.poi.latitude, f.poi.longitude)
                }
                this.refreshMissionLine(!0), this.refreshGSHeadings(!1, !0)
            }
        },
        scaleMission: function(a, b, c) {
            if (this.isForIndexValid(b)) {
                -1 == c && (this.movingRef = b >= 0 ? this.markerToWaypoints[b].marker.position : this.poiMarkers[Math.abs(b) - 1].marker.position, this.movingRefs = []);
                var d = google.maps.geometry.spherical.computeHeading(this.movingRef, a),
                    e = 1 + (0 > d ? -1 : 1) * (google.maps.geometry.spherical.computeDistanceBetween(this.movingRef, new google.maps.LatLng(this.movingRef.lat(), a.lng())) / 100);
                for (var f in this.markerToWaypoints) {
                    var g = this.markerToWaypoints[f];
                    if (-1 == c) {
                        var h = google.maps.geometry.spherical.computeDistanceBetween(this.movingRef, g.marker.position),
                            d = google.maps.geometry.spherical.computeHeading(this.movingRef, g.marker.position);
                        this.movingRefs[f] = {
                            d: h,
                            b: d
                        }
                    }
                    if (b != f) {
                        var i = google.maps.geometry.spherical.computeOffset(this.movingRef, this.movingRefs[f].d * e, this.movingRefs[f].b);
                        g.wp.latitude = i.lat(), g.wp.longitude = i.lng(), g.marker.setPosition(i), this.currIdx == f && this.updateLatLongET(g.wp.latitude, g.wp.longitude)
                    } else g.marker.setPosition(this.movingRef)
                }
                for (var f in this.poiMarkers) {
                    var g = this.poiMarkers[f];
                    if (-1 == c) {
                        var h = google.maps.geometry.spherical.computeDistanceBetween(this.movingRef, g.marker.position),
                            d = google.maps.geometry.spherical.computeHeading(this.movingRef, g.marker.position);
                        this.movingRefs[-(f + 1)] = {
                            d: h,
                            b: d
                        }
                    }
                    if (b != -(f + 1)) {
                        var i = google.maps.geometry.spherical.computeOffset(this.movingRef, this.movingRefs[-(f + 1)].d * e, this.movingRefs[-(f + 1)].b);
                        g.poi.latitude = i.lat(), g.poi.longitude = i.lng(), g.marker.setPosition(i), this.currIdx < 0 && Math.abs(this.currIdx) - 1 == f && this.updateLatLongET(g.poi.latitude, g.poi.longitude)
                    } else g.marker.setPosition(this.movingRef)
                }
                this.refreshMissionLine(!0), this.refreshGSHeadings(!1, !0), this.refreshTotalTimeAndDistance()
            }
        },
        moveMissionToLocation: function(a, b, c) {
            if (this.isForIndexValid(b)) {
                -1 == c && (this.movingRef = b >= 0 ? this.markerToWaypoints[b].marker.position : this.poiMarkers[Math.abs(b) - 1].marker.position, this.movingRefs = []);
                for (var d in this.markerToWaypoints) {
                    var e = this.markerToWaypoints[d];
                    if (-1 == c) {
                        var f = google.maps.geometry.spherical.computeDistanceBetween(this.movingRef, e.marker.position),
                            g = google.maps.geometry.spherical.computeHeading(this.movingRef, e.marker.position);
                        this.movingRefs[d] = {
                            d: f,
                            b: g
                        }
                    }
                    var h = google.maps.geometry.spherical.computeOffset(a, this.movingRefs[d].d, this.movingRefs[d].b);
                    e.wp.latitude = h.lat(), e.wp.longitude = h.lng(), e.marker.setPosition(h), this.currIdx == d && this.updateLatLongET(e.wp.latitude, e.wp.longitude)
                }
                for (var d in this.poiMarkers) {
                    var e = this.poiMarkers[d];
                    if (-1 == c) {
                        var f = google.maps.geometry.spherical.computeDistanceBetween(this.movingRef, e.marker.position),
                            g = google.maps.geometry.spherical.computeHeading(this.movingRef, e.marker.position);
                        this.movingRefs[-(d + 1)] = {
                            d: f,
                            b: g
                        }
                    }
                    var h = google.maps.geometry.spherical.computeOffset(a, this.movingRefs[-(d + 1)].d, this.movingRefs[-(d + 1)].b);
                    e.poi.latitude = h.lat(), e.poi.longitude = h.lng(), e.marker.setPosition(h), this.currIdx < 0 && Math.abs(this.currIdx) - 1 == d && this.updateLatLongET(e.poi.latitude, e.poi.longitude)
                }
                this.refreshMissionLine(!0), this.refreshGSHeadings(!1, !0)
            }
        },
        isPointOnSegment: function(a, b, c) {
            var d, e, f = this.map.getProjection().fromLatLngToPoint(a),
                g = this.map.getProjection().fromLatLngToPoint(b),
                h = this.map.getProjection().fromLatLngToPoint(c);
            return g.x - f.x == 0 && g.y - f.y == 0 ? h.x == f.x && h.y == f.y : g.x - f.x == 0 && g.y - f.y != 0 ? (e = (h.y - f.y) / (g.y - f.y), h.x == f.x && e >= 0 && 1 >= e) : g.x - f.x != 0 && g.y - f.y == 0 ? (d = (h.x - f.x) / (g.x - f.x), h.y == f.y && d >= 0 && 1 >= d) : (d = (h.x - f.x) / (g.x - f.x), e = (h.y - f.y) / (g.y - f.y), d.toFixed(1) == e.toFixed(1) && d >= 0 && 1 >= d && e >= 0 && 1 >= e)
        },
        getDistOverlay: function(a, b) {
            var c = a.marker.getPosition(),
                d = b.marker.getPosition(),
                e = this.getMidPoint(c.lat(), c.lng(), d.lat(), d.lng()),
                f = this.distance3DBetween(c, a.wp.altitude, d, b.wp.altitude);
            return new DistOverlay(e, this.formatDistance(f, !0, 1), this.map)
        },
        refreshMissionLine: function(a) {
            if (null != this.missionLine && this.missionLine.setMap(null), null != this.distOverlays)
                for (var b in this.distOverlays) this.distOverlays[b].setMap(null);
            this.distOverlays = [];
            for (var c = [], b = 0; b < this.markerToWaypoints.length; ++b) c.push(this.markerToWaypoints[b].marker.position), b + 1 < this.markerToWaypoints.length && this.distOverlays.push(this.getDistOverlay(this.markerToWaypoints[b], this.markerToWaypoints[b + 1]));
            3 == this.currMission.finishAction && this.markerToWaypoints.length > 1 && (c.push(this.markerToWaypoints[0].marker.position), this.distOverlays.push(this.getDistOverlay(this.markerToWaypoints[this.markerToWaypoints.length - 1], this.markerToWaypoints[0]))), this.missionLine = new google.maps.Polyline({
                path: c,
                strokeColor: "#ffff00",
                strokeOpacity: 1,
                strokeWeight: 2
            }), this.missionLine.setMap(this.map), this.refreshMissionCurves(a)
        },
        handleLineMouseMove: function(a, b) {
            for (var c = this, d = b.latLng, e = null, f = 0; f < a.length - 1; ++f)
                if (c.isPointOnSegment(a[f], a[f + 1], d)) {
                    e = google.maps.geometry.spherical.computeDistanceBetween(a[f], a[f + 1]);
                    break
                }
            if (null != e) {
                var g = c.overlay.getProjection().fromLatLngToContainerPixel(d),
                    h = $("#mission-tooltip");
                h.html(c.formatDistance(e, !0)).css({
                    left: g.x + 15,
                    top: g.y + 15
                }).show()
            }
        },
        plotElevation: function(a, b) {
            var c = document.getElementById("elevation_chart");
            if (b !== google.maps.ElevationStatus.OK) return void(c.innerHTML = "Cannot show elevation: request failed because " + b);
            var d = new google.visualization.ColumnChart(c),
                e = new google.visualization.DataTable;
            e.addColumn("string", "Sample"), e.addColumn("number", "Elevation");
            for (var f = 0; f < a.length; f++) e.addRow(["", a[f].elevation]);
            d.draw(e, {
                height: 150,
                legend: "none",
                titleY: "Elevation (m)"
            })
        },
        formatTime: function(a) {
            return a > 60 ? Math.round(a / 60) + "min" : Math.round(a) + "s"
        },
        distance3DBetween: function(a, b, c, d) {
            var e = 0,
                f = google.maps.geometry.spherical.computeDistanceBetween(a, c),
                g = Math.abs(b - d);
            return e = Math.sqrt(Math.pow(f, 2) + Math.pow(g, 2))
        },
        getMissionName: function() {
            var a = "new";
            return this.currMission.parseMission && (a = this.currMission.parseMission.get("name")), a
        },
        getTotalTimeAndDistance: function() {
            for (var a = 0, b = 0, c = this.currMission.horizontalSpeed, d = null, e = null, f = 0; f < this.markerToWaypoints.length; ++f) {
                var g = this.markerToWaypoints[f].wp;
                if (null != e) {
                    var h = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(e.latitude, e.longitude), new google.maps.LatLng(g.latitude, g.longitude)),
                        i = Math.abs(e.altitude - g.altitude),
                        j = this.distance3DBetween(new google.maps.LatLng(e.latitude, e.longitude), e.altitude, this.markerToWaypoints[f].marker.position, g.altitude);
                    a += j;
                    var k = 15;
                    i > 0 && (0 == h || i / h >= 1.5) && (k = 6);
                    var l = e.speed;
                    1 == this.acType && 0 >= l && (l = c), b += j / Math.max(.1, Math.min(k, l)) * 1.35, 0 == this.acType && (b += g.stayTime)
                }
                if (g.numActions > 0)
                    for (var m in g.actions) 0 == g.actions[m] && (b += g.actionParams[m] / 1e3);
                e = g, null == d && (d = g)
            }
            return 3 == this.currMission.finishAction && null != d && null != e && (h = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(e.latitude, e.longitude), new google.maps.LatLng(d.latitude, d.longitude)), i = Math.abs(e.altitude - d.altitude), j = this.distance3DBetween(new google.maps.LatLng(e.latitude, e.longitude), e.altitude, this.markerToWaypoints[0].marker.position, d.altitude), a += j, k = 15, i > 0 && (0 == h || i / h >= 1.5) && (k = 6), l = e.speed, 1 == this.acType && 0 >= l && (l = c), b += j / Math.max(.1, Math.min(k, l)) * 1.35), {
                t: b,
                d: a
            }
        },
        refreshTotalTimeAndDistance: function() {
            var a = this.getTotalTimeAndDistance(),
                b = this.getMissionName() + " - " + this.formatDistance(a.d, !0) + " | " + this.formatTime(a.t),
                c = $("#label-distance").text();
            b != c && $("#label-distance").text(b)
        },
        setBatchSettingModified: function(a, b) {
            this.batchSettingsModifiedState[MarkerSettings[a]] = b;
            var c = $("#marker-%-label".replace(/%/, a.toLowerCase()));
            b && -1 == c.text().indexOf("*") ? (c.css("color", "red"), c.text(c.text() + "*")) : b || (c.css("color", ""), c.text(c.text().replace(/\*/, "")))
        },
        normalize: function(a, b, c) {
            var d = c - b,
                e = a - b;
            return e - Math.floor(e / d) * d + b
        },
        normAngle180: function(a) {
            return this.normalize(a, -180, 180)
        },
        magnitudeFromCoordinate: function(a, b) {
            return Math.sqrt(Math.pow(b.lat() - a.lat(), 2) + Math.pow(b.lng() - a.lng(), 2))
        },
        distanceToLine: function(a, b, c) {
            var d, e;
            d = this.magnitudeFromCoordinate(c, b), e = ((a.lat() - b.lat()) * (c.lat() - b.lat()) + (a.lng() - b.lng()) * (c.lng() - b.lng())) / Math.pow(d, 2);
            var f = b.lat() + e * (c.lat() - b.lat()),
                g = b.lng() + e * (c.lng() - b.lng()),
                h = new google.maps.LatLng(f, g);
            return google.maps.geometry.spherical.computeDistanceBetween(a, h)
        }
    };
DistOverlay.prototype = new google.maps.OverlayView, DistOverlay.prototype.onAdd = function() {
        var a = document.createElement("div");
        a.className = "distoverlay", a.innerText = this.text_, a.textContent = this.text_, this.div_ = a, this.clickable = !1;
        var b = this.getPanes();
        b.overlayShadow.appendChild(a)
    }, DistOverlay.prototype.draw = function() {
        var a = this.getProjection(),
            b = a.fromLatLngToDivPixel(this.pos_),
            c = this.div_;
        c.style.left = b.x - 10 + "px", c.style.top = b.y - 10 + "px"
    }, DistOverlay.prototype.onRemove = function() {
        null != this.div_ && (this.div_.parentNode.removeChild(this.div_), this.div_ = null)
    }, google.load("visualization", "1", {
        packages: ["columnchart"]
    }),
    function() {
        function a(a) {
            var c = "visible",
                d = "hidden",
                e = {
                    focus: c,
                    focusin: c,
                    pageshow: c,
                    blur: d,
                    focusout: d,
                    pagehide: d
                };
            a = a || window.event, g_tabState = a.type in e ? e[a.type] : this[b] ? "hidden" : "visible", "hidden" == g_tabState && (g_ctrlkeydown = !1, g_shiftkeydown = !1)
        }
        var b = "hidden";
        b in document ? document.addEventListener("visibilitychange", a) : (b = "mozHidden") in document ? document.addEventListener("mozvisibilitychange", a) : (b = "webkitHidden") in document ? document.addEventListener("webkitvisibilitychange", a) : (b = "msHidden") in document ? document.addEventListener("msvisibilitychange", a) : "onfocusin" in document ? document.onfocusin = document.onfocusout = a : window.onpageshow = window.onpagehide = window.onfocus = window.onblur = a, void 0 !== document[b] && a({
            type: document[b] ? "blur" : "focus"
        })
    }(), window.mobileAndTabletcheck = function() {
        var a = !1;
        return function(b) {
            (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(b) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(b.substr(0, 4))) && (a = !0)
        }(navigator.userAgent || navigator.vendor || window.opera), a
    }, google.maps.event.addDomListener(window, "load", GStool.initialize.bind(GStool));