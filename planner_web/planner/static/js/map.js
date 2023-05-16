history.pushState(null, null, window.location.href.split('?')[0] + '?title=MyPage');
var map, marker;
var start_marker, start_info;
var loc_marker;
var end_marker, end_info;
var startCoord = { latitude: null, longitude: null };
var endCoord = { latitude: null, longitude: null };
var start_str = '出發點';
var end_str = '目的地'
start_point = document.getElementById("start_coord");
end_point = document.getElementById("end_coord");
start_hint = document.getElementById("start_hint");
end_hint = document.getElementById("end_hint");
result = document.getElementById("result");
var setted_time;
var start_IsSet = {set: false};
var end_IsSet = {set: false};
var time_IsSet = {set:false};
var line2id = {'淡水信義線': 'R', '松山新店線': 'G', '文湖線': 'BR', '中和新蘆線': 'O', '板南線': 'BL', '環狀線': 'Y'};

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 25.046, lng: 121.517},
        zoom: 12,
        clickableIcons: false
    });

    marker = new google.maps.Marker({
        map: map,
    });

    loc_marker = new google.maps.Marker({
        map: map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: 'red',
            fillOpacity: 0.6,
            strokeColor: 'white',
            strokeWeight: 0.5,
            scale: 10,
        },
    });

    start_marker = new google.maps.Marker({
        icon: "https://duck00036-public-images.s3.ap-northeast-1.amazonaws.com/site_icon.png",
        map: map,
    });

    start_info = new google.maps.InfoWindow({
        content: '出發點',
        visible: true,
        disableAutoPan: true,
        closeOnClick: false
    });

    end_marker = new google.maps.Marker({
        icon: "https://duck00036-public-images.s3.ap-northeast-1.amazonaws.com/site_icon.png",
        map: map,
    });

    end_info = new google.maps.InfoWindow({
        content: '目的地',
        visible: true,
        disableAutoPan: true,
        closeOnClick: false
    });

    map.addListener('click', function(event) {
        marker.setPosition(event.latLng);
    });

    var searchBox = new google.maps.places.Autocomplete(document.getElementById('searchBox'));

    searchBox.addListener('place_changed', function() {
        var place = searchBox.getPlace();

        if (!place.geometry) {
            window.alert("No details available for input: '" + place.name + "'");
            return;
        }

        map.setCenter(place.geometry.location);
        marker.setPosition(place.geometry.location);
    });
}


function setLocation(set_marker, set_infowindow, name, Coord, point, IsSet, hint, button) {
    if (marker.getPosition() == null) {
        window.alert("請選取地點");
        return;
    }
    Coord.latitude = marker.getPosition().lat();
    Coord.longitude = marker.getPosition().lng();
    point.innerHTML = `(${Coord.latitude.toFixed(4)}, ${Coord.longitude.toFixed(4)})`;
    IsSet.set = true;
    console.log(start_IsSet,end_IsSet);
    if (start_IsSet.set && end_IsSet.set && time_IsSet.set) {
        document.getElementById("calculate").disabled = false;
    }

    marker.setMap(null);
    marker = new google.maps.Marker({
        map: map,
    });

    set_marker.setPosition({ lat: Coord.latitude, lng: Coord.longitude });
    set_infowindow.open(map, set_marker);

    button.innerHTML = "重設" + name;
    hint.innerHTML = '設定完成'
    button.onclick = function() {
        resetLocation(set_marker, set_infowindow, name, Coord, point, IsSet, hint, button);
    };
}


function resetLocation(set_marker, set_infowindow, name, Coord, point, IsSet, hint, button) {
    IsSet.set = false;
    document.getElementById("calculate").disabled = true;
    set_infowindow.close();
    set_marker.setMap(null);
    set_marker = new google.maps.Marker({
        icon: "https://duck00036-public-images.s3.ap-northeast-1.amazonaws.com/site_icon.png",
        map: map,
    });
    point.innerHTML = "";
    button.innerHTML = "設為" + name;
    hint.innerHTML = '請在地圖中選取' + name;
    button.onclick = function() {
        setLocation(set_marker, set_infowindow, name, Coord, point, IsSet, hint, button)
    };
}

var pathjson;
var csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
function calculate(){
    var time = new Date(setted_time + ":00");

    $.ajax({
        url: '/calculate/',
        type: 'POST',
        headers: {'X-CSRFToken': csrfToken},
        data: {
            start_lat:startCoord.latitude,
            start_lon:startCoord.longitude,
            end_lat:endCoord.latitude,
            end_lon:endCoord.longitude,
            day:time.getDay(),
            hour:time.getHours(),
            minute:time.getMinutes()
        },
        success: function(data) {
            produce(data);
            pathjson = data;
            $("#save_button").prop("disabled", false);
        }
    });
}

flatpickr("#time", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    clickOpens: true,
    time_24hr: true
});

function setTime() {
    if (!(time._flatpickr.selectedDates.length > 0)) {
        window.alert("請選取時間");
        return;
    }
    setted_time = document.getElementById("time").value;
    document.getElementById("setted_time").innerHTML = setted_time;
    time._flatpickr.clear();
    time_IsSet.set = true;
    if (start_IsSet.set && end_IsSet.set && time_IsSet.set) {
        document.getElementById("calculate").disabled = false;
    }
}


function find_location(lat,lon) {
    loc_marker.setPosition({lat: lat, lng: lon});
    map.panTo({lat: lat, lng: lon});
    map.setZoom(14);
}

function produce(data) {
    if ($('#timeline_box').length) {
        $('#timeline_box').remove();
    }

    const newul = $('<ul>', {
        'id': 'timeline_box',
    });
    const stationli = $('<li>', {
        'class': 'station',
        'onclick': `find_location(${startCoord.latitude},${startCoord.longitude})`
    });
    const stationspan_1 = $('<span>', {
        'class': 'abs_time',
        'html': data.depart_time
    });
    const stationspan_2 = $('<span>', {
        'class': 'station_name',
        'html': "出發點"
    });
    stationli.append(stationspan_1,stationspan_2)
    newul.append(stationli);

    data.path.forEach(element => {
        const timeli = $('<li>');
        
        if (element.action == 'walk') {
            const timespan_1 = $('<span>', {
                'class': 'action',
                'html': '步行'
            });
            timeli.append(timespan_1)
        }

        if (element.action == 'wait') {
            const timespan_1 = $('<span>', {
                'class': 'action',
                'html': '等車'
            });
            timeli.append(timespan_1)
        }

        if (element.action == 'trans') {
            const timespan_1 = $('<span>', {
                'class': 'action',
                'html': '轉車'
            });
            timeli.append(timespan_1)
        }

        const timespan_2 = $('<span>', {
            'class': 'time',
            'html': element.time
        });
        timeli.append(timespan_2)

        const stationli = $('<li>', {
            'class': 'station',
            'onclick': `find_location(${element.lat},${element.lon})`
        });

        if (element.line != null){
            const stationspan_1 = $('<span>', {
                'class': 'line',
                'html': element.line
            });
            stationli.append(stationspan_1);
            if (element.line in line2id){
                stationspan_1.addClass(line2id[element.line]);
            }
        }

        const stationspan_2 = $('<span>', {
            'class': 'abs_time',
            'html': element.abs_time
        });
        const stationspan_3 = $('<span>', {
            'class': 'station_name',
            'html': element.station
        });
        stationli.append(stationspan_2,stationspan_3);
        
        newul.append(timeli,stationli);
    });
    $(".timeline").append(newul);
}

let path_type = path_name = path_tag = null;

function select_type() {
    $("#overlay").addClass("active");
    const newbox = $('<div>', {
        'class': "smallBox",
        'id': "selectBox",
    });
    const text = $('<p>', {
        'id': "select_text",
        'html': "請選擇要儲存的路線種類"
    });
    const routineBtn = $('<button>', {
        'class': "select_button",
        'id': "routineBtn",
        'onclick': "select_name('routine')",
        'html': "日常路線"
    });
    const customBtn = $('<button>', {
        'class': "select_button",
        'id': "customBtn",
        'onclick': "select_name('custom')",
        'html': "自訂路線"
    });
    const closeBtn = $('<div>', {
        'class': "closeBtn",
        'onclick': "close_window()",
        'html': "&#10006;"
    });
    newbox.append(text,routineBtn,customBtn,closeBtn);
    $("#block_2").append(newbox);
}

function select_name(type) {
    path_type = type;
    $("#routineBtn").remove();
    $("#customBtn").remove();
    $("#select_text").html("請為此路線命名");
    const input_name = $('<input>', {
        'id': "input_name",
        'placeholder': "Enter name here",
        'maxlength': "30"
    });
    const nextBtn = $('<button>', {
        'class': "select_button",
        'id': "nextBtn",
        'onclick': "select_tag()",
        'html': "下一步"
    });
    $("#selectBox").append(input_name,nextBtn);
}

function select_tag() {
    if (!($("#input_name").val())) {
        window.alert("請輸入名稱");
        return;
    }
    path_name = $("#input_name").val();
    $("#input_name").remove();
    $("#select_text").html("為此路線加入備註(option)");
    $("#nextBtn").html("儲存");
    $("#nextBtn").attr('onclick', 'save_path()');
    $("#selectBox").removeClass("smallBox");
    $("#selectBox").addClass("bigBox");
    const input_tag = $('<textarea>', {
        'id': "input_tag",
        'placeholder': "Enter tag here",
        'maxlength': "200"
    });
    $("#selectBox").append(input_tag);
}

function save_path() {
    path_tag = $("#input_tag").val();
    console.log(path_type,path_name,path_tag);
    $.ajax({
        url: '/save_path/',
        type: 'POST',
        headers: {'X-CSRFToken': csrfToken},
        data: {
            path_data: JSON.stringify(pathjson),
            path_type: path_type,
            date: setted_time.slice(0,10),
            path_name: path_name,
            path_tag: path_tag,
            start_lat: startCoord.latitude.toFixed(6),
            start_lon: startCoord.longitude.toFixed(6),
            end_lat: endCoord.latitude.toFixed(6),
            end_lon: endCoord.longitude.toFixed(6)
        },
        success: function(message) {
            console.log(message);
        }
    });
    close_window();
}

function close_window() {
    path_type = path_name = path_tag = null;
    $("#overlay").removeClass("active");
    $("#selectBox").remove();
}
