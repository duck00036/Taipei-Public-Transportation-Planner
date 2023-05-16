history.pushState(null, null, window.location.href.split('?')[0] + '?title=MyPage');
var map, marker;
var start_marker, start_info;
var loc_marker;
var end_marker, end_info;
var startCoord = { latitude: null, longitude: null };
var endCoord = { latitude: null, longitude: null };
var start_str = '出發點';
var end_str = '目的地'
var time_IsSet = {set:false};
var line2id = {'淡水信義線': 'R', '松山新店線': 'G', '文湖線': 'BR', '中和新蘆線': 'O', '板南線': 'BL', '環狀線': 'Y'};
var pathjson;
var csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
let path_type = path_name = null;
let routine_paths, custom_paths ,paths;
let path_id;

function loadpage() {
    initMap();
    get_paths();
}

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
}

function type_selected() {
    if (!path_type) {
        $('#select_path').prop("disabled", false);
    }
    else if (path_type != $('#select_type option:selected').text()) {
        $('#select_path').val("");
        path_name = null;
        $('#load_button').prop("disabled", true);
    }
    path_type = $('#select_type option:selected').text();
    load_select();
}

function path_selected() {
    path_name = $('#select_path option:selected').text();
    $('#load_button').prop("disabled", false);
}

function get_paths() {
    $.ajax({
        url: '/get_paths/',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            paths = {}
            routine_paths = [];
            custom_paths = [];
            data.forEach(element => {
                paths[element['id']]=element;
                if (element['path_type'] == 'routine') {
                    routine_paths.push(element);
                }
                if (element['path_type'] == 'custom') {
                    custom_paths.push(element);
                }
            });
            load_select();
        }
    });
}

function If_delete_path() {
    $("#overlay").addClass("active");
    const newbox = $('<div>', {
        'class': "smallBox",
        'id': "selectBox",
    });
    const text = $('<p>', {
        'id': "select_text",
        'html': "是否確定要刪除"
    });
    const deleteBtn = $('<button>', {
        'class': "select_button",
        'id': "deleteBtn",
        'onclick': `deletePath(${path_id})`,
        'html': "是"
    });
    const cancelBtn = $('<button>', {
        'class': "select_button",
        'id': "cancelBtn",
        'onclick': "close_window()",
        'html': "否"
    });
    const closeBtn = $('<div>', {
        'class': "closeBtn",
        'onclick': "close_window()",
        'html': "&#10006;"
    });
    newbox.append(text,deleteBtn,cancelBtn,closeBtn);
    $("#block_2").append(newbox);
}

function close_window() {
    $("#overlay").removeClass("active");
    $("#selectBox").remove();
}

function deletePath(pathId) {
    $.ajax({
        url: '/delete_path/' + pathId + '/',
        headers: {'X-CSRFToken': csrfToken},
        type: 'POST',
        success: function() {
            get_paths();
            $('#delete_button').prop("disabled", true);
            $('#load_button').prop("disabled", true);
            $('#path_name_text').html("");
            $('#path_date_text').html("");
            $('#path_tag_text').html("");
            $('#timeline_box').remove();
            start_marker.setMap(null);
            end_marker.setMap(null);
        }
    });
    close_window();
}

function load_select() {
    $("#select_path").empty();
    $('#select_path').append($('<option>', {
        value: "",
        text: '請選擇',
        selected: true,
        disabled: true,
        hidden: true
    }));
    if (path_type == '日常路徑') {
        routine_paths.forEach(element => {
            $('#select_path').append($('<option>', {
                value: element['id'],
                text: element['path_name'],
            }));
        });
    }
    if (path_type == '自訂路徑') {
        custom_paths.forEach(element => {
            $('#select_path').append($('<option>', {
                value: element['id'],
                text: element['path_name'],
            }));
        });
    }
}

let day_ref = {0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday'};

function load_path() {
    path_id = $('#select_path').val();
    $('#path_name_text').html(paths[path_id].path_name);
    if (path_type == '日常路徑') {
        let date_obj = new Date(paths[path_id].date);
        day = date_obj.getDay();
        $('#path_date_text').html(day_ref[day]);
    }
    else {
        $('#path_date_text').html(paths[path_id].date);
    }
    $('#path_tag_text').html(paths[path_id].path_tag);

    startCoord.latitude = parseFloat(paths[path_id].start_lat);
    startCoord.longitude = parseFloat(paths[path_id].start_lon);
    endCoord.latitude = parseFloat(paths[path_id].end_lat);
    endCoord.longitude = parseFloat(paths[path_id].end_lon);

    start_marker.setPosition({ lat: startCoord.latitude, lng: startCoord.longitude });
    start_info.open(map, start_marker);
    start_marker.setMap(map);
    end_marker.setPosition({ lat: endCoord.latitude, lng: endCoord.longitude });
    end_info.open(map, end_marker);
    end_marker.setMap(map);

    map.panTo({lat: 25.046, lng: 121.517});
    map.setZoom(12);
    loc_marker.setMap(null);

    produce(paths[path_id].path_data);
    $('#delete_button').prop("disabled", false);
}

function find_location(lat,lon) {
    loc_marker.setPosition({lat: lat, lng: lon});
    loc_marker.setMap(map);
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