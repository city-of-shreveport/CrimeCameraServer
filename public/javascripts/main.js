var nodeName;
var socket = io();
var dreamHost = io('https://crime-cameras.shreveport-it.org/cameras');
let map;
var marker;
var marker2;
var marker3;
let infoWindow;
var nodeID = '';
var currentCamIP;
var ip;
var newGrid = `
<div class= 'row '>
  <div class= 'col-sm-5 '>
    <div class= 'card '>
      <div class= 'card-body '>
        <div class= 'row '>
          <div class= 'col-sm-6 '>
            <div class='card border-dark mb-4' style='max-width: 100%;'>               
              <div class='card-header actionHeader'>Cameras</div> 
              <div class='card-body text-dark'>  
                <input class='form-control' id='filterCameras' type='text' placeholder='Search..'></input> 
                <ul class="list-group" id='cameraListItems'>
                </ul> 
              </div> 
            </div>
          </div> 
          <div class= 'col-sm-6 '>
            <div class= 'card ' >
              <div class='card-header actionHeader'>Camera Info</div>
              <ul class= 'list-group list-group-flush '>
                <li class= 'list-group-item ' id='camNameLI'>Camera Name</li>
                <li class= 'list-group-item ' id='camStatLI'>Status</li>
                <li class= 'list-group-item ' id='Streaming'>Start Streaming</li>
                <li class= 'list-group-item ' id='cam1Status'>cam1: </li>
                <li class= 'list-group-item ' id='cam2Status'>cam2: </li>
                <li class= 'list-group-item ' id='cam3Status'>cam3: </li>
              </ul>
            </div>
          </div> 
        </div>
      </div>
    </div>
  </div>
  <div class= 'col-sm-7 '>
    <div class= 'card '>
      <div class= 'card-body '>
        <div id='map'> 
        </div>
      </div>
    </div>
  </div>
</div>
<br>
<div class= 'card '>
  <div class= 'card-body '>
    <div class= 'row '>
      <div class= 'col-sm-3  '>
        <div class= 'card '>
          <div class= 'card-body '>
            <div class='card-header actionHeader'>Calendar</div> 
            <div class='calendar'></div> 
          </div>
        </div>
      </div>
      <div class= 'col-sm-9'>
            <div class= 'card '>
              <div class='card-header actionHeader'>Video Player</div> 
                <div class= 'card-body '>
                    <div class= 'container '>
                      <div class= 'row row-cols-1 row-cols-md-3 g-4'>
                        <div class='col'>            
                          <div class='card'>
                          <h5 class= 'card-title '>Camera 1</h5>    
                          <div id='video'>
                           <video width='330' height='auto'  controls autoplay>
                        <source src='' type='video/mp4'>
                            "Your browser does not support the video tag.
                          </video>
                          </div>
                          <div class= 'card-body '>
                          </div>
                          <h5 class= 'card-title '>Video Times</h5> 
                          <ul class= 'list-group list-group-flush ' id='cam1Times' style='overflow:scroll; height:300px'>
                          </ul>
                        </div>
                      </div>
                      <div class= 'col '>
                        <div class= 'card ' >
                        <h5 class= 'card-title '>Camera 2</h5>
                        <div id='video2'>
                          <video width='330' height='auto'  controls autoplay>
                        <source src='' type='video/mp4'>
                            "Your browser does not support the video tag.
                          </video>
                          </div>
                          <div class= 'card-body '>
                          </div>
                        </div>
                      </div>
                      <div class= 'col  '>
                        <div class= 'card ' >
                         <h5 class= 'card-title '>Camera 3</h5>  
                          <div id='video3'>
                            <video width='330' height='auto'  controls autoplay>
                              <source src='' type='video/mp4'>
                              "Your browser does not support the video tag.
                            </video>
                          </div>
                          <div class= 'card-body '>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div> 
        </div> 
      </div>
    </div>
  </div>
</div>
`;

const myLatLng = {
  lat: 38.926908833333336,
  lng: -77.69556366666667,
};

myLatlng = new google.maps.LatLng(38.926415, -77.704038);

$(function () {
  $('body').on('click', '#startStream', function () {
    $.getJSON(
      'https://crime-cameras.shreveport-it.org/streaming/startStreaming/' + nodeName + '/' + ip,
      function (data) {}
    );

    var client = `wss://cc-restreamer.shreveport-it.org/${nodeName}/camera1.flv`;
    var client2 = `wss://cc-restreamer.shreveport-it.org/${nodeName}/camera2.flv`;
    var client3 = `wss://cc-restreamer.shreveport-it.org/${nodeName}/camera3.flv`;

    setTimeout(() => {
      if (flvjs.isSupported()) {
        var videoElement = document.getElementById('vid1');
        var videoElement2 = document.getElementById('vid2');
        var videoElement3 = document.getElementById('vid3');
        var flvPlayer = flvjs.createPlayer({
          type: 'flv',
          url: client,
        });
        flvPlayer.attachMediaElement(videoElement);
        flvPlayer.load();
        flvPlayer.play();

        var flvPlayer2 = flvjs.createPlayer({
          type: 'flv',
          url: client2,
        });
        flvPlayer2.attachMediaElement(videoElement2);
        flvPlayer2.load();
        flvPlayer2.play();
        var flvPlayer3 = flvjs.createPlayer({
          type: 'flv',
          url: client3,
        });
        flvPlayer3.attachMediaElement(videoElement3);
        flvPlayer3.load();
      }
    }, 3000);
    setTimeout(() => {
      $.getJSON('https://crime-cameras.shreveport-it.org/streaming/stopStreaming/' + nodeName, function (data) {});
    }, 600000);
  });

  $('body').on('click', '#stopStream', function () {
    $.getJSON('https://crime-cameras.shreveport-it.org/streaming/stopStreaming/' + nodeName);
  });

  $('body').on('hidden.bs.modal', '#staticBackdrop', function () {
    $.getJSON('https://crime-cameras.shreveport-it.org/streaming/stopStreaming/' + nodeName, function (data) {});

    var videoElement = document.getElementById('vid1');
    var videoElement2 = document.getElementById('vid2');
    var videoElement3 = document.getElementById('vid3');
    var flvPlayer = flvjs.createPlayer({
      type: 'flv',
      url: 'wss://localhost:8000/live/STREAM_NAME.flv',
    });
    flvPlayer.attachMediaElement(videoElement);
    flvPlayer.load();
    flvPlayer.play();

    var flvPlayer2 = flvjs.createPlayer({
      type: 'flv',
      url: '',
    });
    flvPlayer2.attachMediaElement(videoElement2);
    flvPlayer2.load();
    flvPlayer2.play();
    var flvPlayer3 = flvjs.createPlayer({
      type: 'flv',
      url: '',
    });
    flvPlayer3.attachMediaElement(videoElement3);
    flvPlayer3.load();
    flvPlayer3.play();
  });

  $('#mainDIV').html(newGrid);

  var myModal = document.getElementById('exampleModal');

  $('body').on('click', '.videoTimePlay', function (e) {
    wss: var li = this.id;
    var loc = document.getElementById(li).getAttribute('data-location');
    var locationArray = loc.split('/');
    var videourlLocation =
      'https://crime-cameras.shreveport-it.org/' + locationArray[5] + '/' + nodeName + '/cam1/' + locationArray[7];
    var videourlLocation2 =
      'https://crime-cameras.shreveport-it.org/' + locationArray[5] + '/' + nodeName + '/cam2/' + locationArray[7];
    var videourlLocation3 =
      'https://crime-cameras.shreveport-it.org/' + locationArray[5] + '/' + nodeName + '/cam3/' + locationArray[7];
    $('#video').html(
      "<video width='400' height='auto'  controls autoplay>" +
        '<source src=' +
        videourlLocation +
        " type='video/mp4'>" +
        'Your browser does not support the video tag.' +
        '</video>'
    );
    $('#video2').html(
      "<video width='400' height='auto'  controls autoplay>" +
        '<source src=' +
        videourlLocation2 +
        " type='video/mp4'>" +
        'Your browser does not support the video tag.' +
        '</video>'
    );
    $('#video3').html(
      "<video width='400' height='auto'  controls autoplay>" +
        '<source src=' +
        videourlLocation3 +
        " type='video/mp4'>" +
        'Your browser does not support the video tag.' +
        '</video>'
    );
  });

  $('body').on('click', '#Streaming', function () {
    $('#staticBackdrop').modal('show');
  });

  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 38.926908833333336,
      lng: -77.69556366666667,
    },
    zoom: 14,
  });

  infoWindow = new google.maps.InfoWindow();

  function createMarker(pos, t, v, i, type, numCams) {
    var marker = new google.maps.Marker({
      position: pos,
      map: map,
      customInfo: t,
      sysType: type,
      cams: numCams,
      videoURL: v,
      icon: i,
    });
    google.maps.event.addListener(marker, 'click', function () {
      ip = marker.videoURL;
      $('.videoFeeds').html('');

      $('.wc-calendar__days-list li').each(function (index) {
        $(this).css('background', 'white');
      });

      var cameraVideoURL = 'https://crime-cameras.shreveport-it.org/cameras/videoDatesbyNode/' + marker.customInfo;
      nodeID = marker.customInfo;
      nodeName = marker.customInfo;

      var getIPString = 'https://crime-cameras.shreveport-it.org/cameras/getIP/' + nodeName;

      $.getJSON(getIPString, function (data) {
        ip = data[0].ip;
        var clientInfo = [ip, nodeName];
        var checkinTime = moment(data[0].lastCheckIn);
        var now = moment();
        var difference = now.diff(checkinTime, 'seconds');
        $('#camNameLI').html('Name: ' + data[0].nodeName);
        $('#camStatLI').html('Checked in: ' + difference + ' seconds ago');

        try {
          $('#cam1Status').html('Camera 1 Online?: ' + data[0].camsOnlineStatus.cam1);
          $('#cam2Status').html('Camera 3 Online?: ' + data[0].camsOnlineStatus.cam2);
          $('#cam3Status').html('Camera 2 Online?: ' + data[0].camsOnlineStatus.cam3);
        } catch (error) {}

        $('.videoFeeds').html('');
        $('.wc-calendar__days-list li').each(function (index) {
          $(this).css('background', 'white');
        });
        var cameraVideoURL = 'https://crime-cameras.shreveport-it.org/cameras/videoDatesbyNode/' + nodeName;
        $.getJSON(cameraVideoURL, function (data) {
          for (var i = 0; i < data.length; i++) {
            var dateCalendar = moment(data[i].DateTime).tz('America/New_York').format('M/D/YYYY');
            $('.wc-calendar__days-list li').each(function (index) {
              if ($(this).attr('data-date') === dateCalendar) {
                $(this).css('background', 'lightblue');
              }
            });
          }
        });
      });

      return marker;
    });
  }

  var videoFiles = [];

  $.getJSON('https://crime-cameras.shreveport-it.org/cameras/currentcameraList', function (data) {
    var lihtmlCameras = '';
    for (var i = 0; i < data.length; i++) {
      var checkedinTime = moment(data[i].lastCheckIn).format('MM-DD hh:mm');
      $('#cameraListItems').append(
        "<li class='list-group-item cameraItem' id='" + data[i].nodeName + "'>" + data[i].nodeName + '</li>'
      );

      $('#filterCameras').on('keyup', function () {
        var value = $(this).val().toLowerCase();
        $('#cameraListItems li').filter(function () {
          $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
      });

      $('.cameraItem')
        .off()
        .on('click', function () {
          nodeName = this.id;

          var getIPString = 'https://crime-cameras.shreveport-it.org/cameras/getIP/' + nodeName;
          $.getJSON(getIPString, function (data) {
            ip = data[0].ip;
            var clientInfo = [ip, nodeName];

            var checkinTime = moment(data[0].lastCheckIn);
            var now = moment();
            var difference = now.diff(checkinTime, 'seconds');
            $('#camNameLI').html('Name: ' + data[0].nodeName);
            $('#camStatLI').html('Checked in: ' + difference + ' seconds ago');

            try {
              $('#cam1Status').html('Camera 1 Online?: ' + data[0].camsOnlineStatus.cam1);
              $('#cam2Status').html('Camera 3 Online?: ' + data[0].camsOnlineStatus.cam2);
              $('#cam3Status').html('Camera 2 Online?: ' + data[0].camsOnlineStatus.cam3);
            } catch (error) {}

            $('.videoFeeds').html('');

            $('.wc-calendar__days-list li').each(function (index) {
              $(this).css('background', 'white');
            });

            var cameraVideoURL = 'https://crime-cameras.shreveport-it.org/cameras/videoDatesbyNode/' + nodeName;

            $.getJSON(cameraVideoURL, function (data) {
              for (var i = 0; i < data.length; i++) {
                var dateCalendar = moment(data[i].DateTime).tz('America/New_York').format('M/D/YYYY');

                $('.wc-calendar__days-list li').each(function (index) {
                  if ($(this).attr('data-date') === dateCalendar) {
                    $(this).css('background', 'lightblue');
                  }
                });
              }
            });
          });
        });
    }

    for (var i = 0; i < data.length; i++) {
      try {
        createMarker(
          new google.maps.LatLng(data[i].location.lat, data[i].location.lng),
          data[i].nodeName,
          data[i].ip,
          'http://maps.google.com/mapfiles/kml/pal4/icon38.png',
          data[i].systemType,
          data[i].numOfCams
        );
      } catch (error) {}
    }
  });

  class Calendar {
    constructor({ container = '', activeDateClass = '', initialDate = new Date() } = {}) {
      this.$container = container ? document.querySelector(container) : null;
      this.activeDateClass = activeDateClass;
      this.selectedDate = initialDate;
      this.currentMonth = initialDate;
      this.currentMonthDays = [];

      this.monthsNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

      this.generateMarkup();
      this.bootstrapEvents();
    }

    buildCurrentMonthDays() {
      var curYear = this.currentMonth.getFullYear(),
        curMonth = this.currentMonth.getMonth(),
        firstMonthDay = new Date(curYear, curMonth, 1),
        lastMonthDay = new Date(curYear, curMonth + 1, 0);

      this.currentMonthDays = [];

      for (let i = -firstMonthDay.getUTCDay(); i < 0; i++) {
        this.currentMonthDays.push(new Date(curYear, curMonth, i));
      }

      for (let i = 1, lastDay = lastMonthDay.getDate(); i <= lastDay; i++) {
        this.currentMonthDays.push(new Date(curYear, curMonth, i));
      }

      for (let i = 1, daysAppend = 7 - lastMonthDay.getUTCDay(); i < daysAppend; i++) {
        this.currentMonthDays.push(new Date(curYear, curMonth + 1, i));
      }
    }

    getDayClass(date) {
      var classes = ['wc-calendar__days-list__item'],
        curYear = this.currentMonth.getFullYear(),
        curMonth = this.currentMonth.getMonth(),
        firstMonthDay = new Date(curYear, curMonth, 1),
        lastMonthDay = new Date(curYear, curMonth + 1, 0);

      if (date.toDateString() === this.selectedDate.toDateString()) {
        classes = classes.concat(['wc-calendar__days-list__item--active', this.activeDateClass]);
      }
      if (date.getMonth() === 11 && this.currentMonth.getMonth() === 0) {
        classes.push('wc-calendar__days-list__item--prev-month');
      } else if (date.getMonth() === 0 && this.currentMonth.getMonth() === 11) {
        classes.push('wc-calendar__days-list__item--next-month');
      } else if (date.getMonth() < this.currentMonth.getMonth()) {
        classes.push('wc-calendar__days-list__item--prev-month');
      } else if (date.getMonth() > this.currentMonth.getMonth()) {
        classes.push('wc-calendar__days-list__item--next-month');
      }

      return classes.join(' ');
    }

    getFormattedDate(date) {
      return `${date.getFullYear()} ${this.monthsNames[date.getMonth()]}`;
    }

    generateDaysMarkup() {
      var days = [];
      this.buildCurrentMonthDays();

      this.currentMonthDays.forEach(
        function (day) {
          days.push(
            `<li data-date="${day.toLocaleDateString()}" class="${this.getDayClass(day)}">${day.getDate()}</li>`
          );
        }.bind(this)
      );

      return days.join('');
    }

    refreshCalendar() {
      this.$container.querySelector('.wc-calendar__days-list').innerHTML = this.generateDaysMarkup();
      this.$container.querySelector('.wc-calendar__header__date').innerHTML = this.getFormattedDate(this.currentMonth);
    }

    prevMonth() {
      var curYear = this.currentMonth.getFullYear(),
        curMonth = this.currentMonth.getMonth();
      this.currentMonth = new Date(curYear, curMonth - 1, 1);
      this.refreshCalendar();
    }

    nextMonth() {
      var curYear = this.currentMonth.getFullYear();
      var curMonth = this.currentMonth.getMonth();
      this.currentMonth = new Date(curYear, curMonth + 1, 1);
      this.refreshCalendar();
    }

    update(option, value) {
      if (option === 'selectedDate') {
        let date = new Date(value);

        if (!isNaN(date.getTime())) {
          this.selectedDate = new Date(value);
          this.currentMonth = this.selectedDate;
        } else {
          throw new Error('Invalid date format');
        }
      } else if (option === 'activeDateClass') {
        this.activeDateClass = value;
      }

      this.refreshCalendar();
    }

    selectDay(event) {
      var $target = event.target;
      if ($target.classList.contains('wc-calendar__days-list__item')) {
        let isPrevMonth = $target.classList.contains('wc-calendar__days-list__item--prev-month');
        let isNextMonth = $target.classList.contains('wc-calendar__days-list__item--next-month');
        this.selectedDate = new Date($target.dataset.date);
        var selectedDate = moment(this.selectedDate).format('YYYY-MM-DD');
        var getIPString = 'https://crime-cameras.shreveport-it.org/cameras/getIP/' + nodeName;
        var getURLString =
          'https://crime-cameras.shreveport-it.org/cameras/videosByDay/' + selectedDate + '/' + nodeName;
        var dailyVidsItemsLIcam1 = '';
        var dailyVidsItemsLIcam2 = '';
        var dailyVidsItemsLIcam3 = '';
        var videoSource = [];

        $.getJSON(getIPString, function (data) {
          ip = data[0].ip;
          var camerainfo = [ip, nodeName];
        });

        $(document).on('input', '#customRange3', function () {
          $('#customRange3_value').html($(this).val());
        });

        $.getJSON(getURLString, function (data) {
          $('#cam1Times').html('');

          if (data.cam1.length > 0) {
            $('#videoListGrid').append(
              "<div class='col-sm'>" +
                "<div id='videoPlayer1'></div>" +
                '<h3>Camera 1</h3>' +
                "<ul class='list-group list-group-flush' id='ulCam1'>" +
                '</ul>' +
                '</div>'
            );

            for (var i = 0; i < data.cam1.length; i++) {
              try {
                var numItems = data.cam1.length - 1;
                var cleanedtimeStartFilter = moment(data.cam1[0].DateTime).format('HHmm');
                var cleanedEndtimeFilter = moment(data.cam1[numItems].DateTime).format('HHmm');
                var cleanedtime = moment(data.cam1[i].DateTime).tz('America/New_York').format('HH:mm');
                var cleanedDate = moment(data.cam1[i].DateTime).tz('America/New_York').format('MM/DD/YYYY');
                var locationString = data.cam1[i].fileLocation;
                var locationArray = locationString.split('/');

                var videourlLocation =
                  'http://' + ip + ':3000/' + locationArray[5] + '/' + locationArray[6] + '/' + locationArray[7];
                videoSource.push(videourlLocation);

                var videoDateTimeRAW = locationArray[7];
                var videoDateTimeRawSplit = videoDateTimeRAW.split('.');
                var videoTimeDate = videoDateTimeRawSplit[0];
                var videoTimeRaw = videoTimeDate.split('_');
                var videoTime = videoTimeRaw[1];
                var formatedTime = videoTime.replace('-', ':');
                $('#cam1Times').append(
                  "<li class='list-group-item videoTimePlay' id='" +
                    cleanedtime +
                    "' data-location='" +
                    locationString +
                    "'>" +
                    cleanedDate +
                    '   @  ' +
                    formatedTime +
                    '</li>'
                );
              } catch (error) {}
            }
          }

          $('#ulCam1').html(dailyVidsItemsLIcam1);
          var i = 0;
          var videoCount = videoSource.length;

          function videoPlay(videoNum) {
            document.getElementById('myVideo').setAttribute('src', videoSource[videoNum]);
            document.getElementById('myVideo').load();
            document.getElementById('myVideo').play();
          }

          function myHandler() {
            i++;
            if (i == videoCount - 1) {
              i = 0;
              videoPlay(i);
            } else {
              videoPlay(i);
            }
          }
        });

        if (isPrevMonth || isNextMonth) {
          if (isPrevMonth) {
            this.prevMonth();
          } else {
            this.nextMonth();
          }
          $target = this.$container.querySelector(`[data-date="${this.selectedDate.toLocaleDateString()}"]`);
        } else {
          let $activeItem = this.$container.querySelector('.wc-calendar__days-list__item--active');
          if ($activeItem) {
            $activeItem.classList.remove('wc-calendar__days-list__item--active');
            this.activeDateClass && $activeItem.classList.remove(this.activeDateClass);
          }
        }
        $target.classList.add('wc-calendar__days-list__item--active');
        this.activeDateClass && $target.classList.add(this.activeDateClass);
      }
    }

    generateMarkup() {
      if (!this.$container) {
        let fragment = document.createDocumentFragment(),
          calendarContainer = document.createElement('div');
        fragment.appendChild(calendarContainer);
        document.body.appendChild(calendarContainer);
        this.$container = calendarContainer;
      }
      this.$container.classList.add('wc-calendar');
      this.$container.innerHTML = `
<div class="wc-calendar__header">
  <button class="wc-calendar__btn wc-calendar__btn--prev">Prev</button>
  <div class="wc-calendar__header__date">${this.getFormattedDate(this.currentMonth)}</div>
  <button class="wc-calendar__btn wc-calendar__btn--next">Next</button>
</div>
<div class="wc-calendar__body">
  <ul class="wc-calendar__days-names">
    <li class="wc-calendar__days-names__item">Mon</li>
    <li class="wc-calendar__days-names__item">Tue</li>
    <li class="wc-calendar__days-names__item">Wed</li>
    <li class="wc-calendar__days-names__item">Thu</li>
    <li class="wc-calendar__days-names__item">Fri</li>
    <li class="wc-calendar__days-names__item">Sat</li>
    <li class="wc-calendar__days-names__item">Sun</li>
  </ul>
  <ul class="wc-calendar__days-list">
    ${this.generateDaysMarkup()}
  </ul>
</div>
`;
    }
    bootstrapEvents() {
      this.$container.querySelector('.wc-calendar__btn--prev').addEventListener('click', this.prevMonth.bind(this));
      this.$container.querySelector('.wc-calendar__btn--next').addEventListener('click', this.nextMonth.bind(this));
      this.$container.querySelector('.wc-calendar__days-list').addEventListener('click', this.selectDay.bind(this));
    }
  }

  var calendar = new Calendar({
    container: '.calendar',
  });

  function changeCalendarOptions(event) {
    event.preventDefault();

    var classValue = $('#class-input').value;
    var dateValue = $('#date-input').value;

    classValue.trim() && calendar.update('activeDateClass', classValue);
    dateValue.trim() && calendar.update('selectedDate', dateValue);
  }
});
