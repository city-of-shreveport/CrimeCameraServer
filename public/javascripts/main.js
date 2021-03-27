var nodeName;

var socket = io();
var dreamHost = io('http://192.168.196.128:3001/cameras');
var cameraNode1 = io('//192.168.196.89:3000/');
let map;
var marker;
var marker2;
var marker3;
let infoWindow;
var nodeID = '';
var currentCamIP;

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
                <li class= 'list-group-item ' id='oldestVidLI'>Oldest Video Date</li>
                <li class= 'list-group-item ' id='camStatLI'>Status</li>
                <li class= 'list-group-item ' id='driveSpaceLI'>Drive Space</li>
                <li class= 'list-group-item ' id='Streaming'>Start Streaming</li>
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
                          <div id='video'>
                           <video width='400' height='auto'  controls autoplay>
                        <source src='' type='video/mp4'>
 
                            "Your browser does not support the video tag.
                          </video>
                          </div>
                          <div class= 'card-body '>
                            <h5 class= 'card-title '>Camera 1</h5>    
                          </div>
                          <ul class= 'list-group list-group-flush ' id='cam1Times' style='overflow:scroll'>
                              
                          </ul>
                          <div class= 'card-body '>
                            <a href= '# ' class= 'card-link '>Controll</a>
                            <a href= '# ' class= 'card-link '>Save</a>
                          </div>
                        </div>
                      </div>
                      <div class= 'col '>
                        <div class= 'card ' >
                        <div id='video2'>
                          <video width='400' height='auto'  controls autoplay>
                        <source src='' type='video/mp4'>
 
                            "Your browser does not support the video tag.
                          </video>
                          </div>
                          <div class= 'card-body '>
                            <h5 class= 'card-title '>Camera 2</h5>
                          </div>
                          <ul class= 'list-group list-group-flush ' id='cam2Times' style='overflow:scroll'>             
                          </ul>
                          <div class= 'card-body '>
                            <a href= '# ' class= 'card-link '>Controll</a>
                            <a href= '# ' class= 'card-link '>Save</a>
                          </div>
                        </div>
                      </div>
                      <div class= 'col  '>
                        <div class= 'card ' >
                          <div id='video3'>
                          <video width='400' height='auto'  controls autoplay>
                        <source src='' type='video/mp4'>
 
                            "Your browser does not support the video tag.
                          </video>
                          
                          
                          </div>
                          <div class= 'card-body '>
                            <h5 class= 'card-title '>Camera 3</h5>        
                          </div>
                          <ul class= 'list-group list-group-flush ' id='cam3Times' style='overflow:scroll'>
                          </ul>        
                          <div class= 'card-body '>
                            <a href= '# ' class= 'card-link '>Controll</a>
                            <a href= '# ' class= 'card-link '>Save</a>
                          </div>>
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
  $('#mainDIV').html(newGrid);
  var myModal = document.getElementById('exampleModal');


  $('body').on('click', '.videoTimePlay', function (e) {
    var li = this.id;
    var loc = document.getElementById(li).getAttribute('data-location');
    console.log(loc);

    var locationArray = loc.split('/');

    var videourlLocation = 'http://192.168.196.164:3000/' + locationArray[5] + '/cam1/' + locationArray[7];
    var videourlLocation2 = 'http://192.168.196.164:3000/' + locationArray[5] + '/cam2/' + locationArray[7];
    var videourlLocation3 = 'http://192.168.196.164:3000/' + locationArray[5] + '/cam3/' + locationArray[7];

    $('#video').html("<video width='400' height='auto'  controls autoplay>"+
                        "<source src="+videourlLocation+" type='video/mp4'>"+
 
                            "Your browser does not support the video tag."+
                          "</video>")
    $('#video2').html("<video width='400' height='auto'  controls autoplay>"+
                        "<source src="+videourlLocation2+" type='video/mp4'>"+
 
                            "Your browser does not support the video tag."+
                          "</video>")
    $('#video3').html("<video width='400' height='auto'  controls autoplay>"+
                        "<source src="+videourlLocation3+" type='video/mp4'>"+
 
                            "Your browser does not support the video tag."+
                          "</video>")
    

  });

  $('body').on('click', '#Streaming', function () {
  var video = document.getElementById('vid1');
  var videoSrc = 'http://192.168.196.128:3001/cammid.m3u8';

  var video2 = document.getElementById('vid2');
  var videoSrc2 = 'http://192.168.196.128:3001/camleft.m3u8';

  var video3 = document.getElementById('vid3');
  var videoSrc3 = 'http://192.168.196.128:3001/camright.m3u8';
  if (Hls.isSupported()) {
      var hls = new Hls();
    hls.loadSource(videoSrc);
    hls.attachMedia(video);
  
    var hls2 = new Hls();
    hls2.loadSource(videoSrc2);
    hls2.attachMedia(video2);

    var hls3 = new Hls();
    hls3.loadSource(videoSrc3);
    hls3.attachMedia(video3);
  }
  // hls.js is not supported on platforms that do not have Media Source
  // Extensions (MSE) enabled.
  //
  // When the browser has built-in HLS support (check using `canPlayType`),
  // we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video
  // element through the `src` property. This is using the built-in support
  // of the plain video element, without using hls.js.
  //
  // Note: it would be more normal to wait on the 'canplay' event below however
  // on Safari (where you are most likely to find built-in HLS support) the
  // video.src URL must be on the user-driven white-list before a 'canplay'
  // event will be emitted; the last video event that can be reliably
  // listened-for when the URL is not on the white-list is 'loadedmetadata'.
  else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = videoSrc;
    video2.src = videoSrc2;
    video3.src = videoSrc3;
  }
  //hls.on(Hls.Events.MANIFEST_PARSED,playVideo);
  //hls2.on(Hls.Events.MANIFEST_PARSED,playVideo);
  //hls3.on(Hls.Events.MANIFEST_PARSED,playVideo);
    $('#staticBackdrop').modal('show')
console.log(":")
   

    
  });

  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 38.926908833333336,
      lng: -77.69556366666667,
    },
    zoom: 14,
  });

  infoWindow = new google.maps.InfoWindow(); // Try HTML5 geolocation.

  function createMarker(pos, t, v, i, type, numCams) {
    console.log(pos, t, v, i, type, numCams);
    var marker = new google.maps.Marker({
      position: pos,
      map: map, // google.maps.Map
      customInfo: t,
      sysType: type,
      cams: numCams,
      videoURL: v,
      icon: i,
    });
    google.maps.event.addListener(marker, 'click', function () {
      console.log(marker);
      currentCamIP = marker.videoURL;
      $('.videoFeeds').html('');
      $('.wc-calendar__days-list li').each(function (index) {
        $(this).css('background', 'white');
      });
      var cameraVideoURL = 'http://192.168.196.128:3001/cameras/videoDatesbyNode/' + marker.customInfo;
      nodeID = marker.customInfo;
      $.getJSON(cameraVideoURL, function (data) {
        console.log(data);
        for (var i = 0; i < data.length; i++) {
          var dateCalendar = moment(data[i].DateTime).format('M/DD/YYYY');
          console.log(moment(data[i].DateTime).format('M/DD/YYYY hh:mm'));

          //$(searchparam).css('background', 'lightblue');

          $('.wc-calendar__days-list li').each(function (index) {
            if ($(this).attr('data-date') === dateCalendar) {
              $(this).css('background', 'lightblue');
            }
          });
        }
      });
      console.log(marker.cams);
      if (marker.cams === 3) {
        var URL1 =
          "<img id='liveVideo' style='height:400px;width:490px' src='http://" + marker.videoURL + ":8081/'></img>";
        var URL2 =
          "<img id='liveVideo2' style='height:400px;width:490px' src='http://" + marker.videoURL + ":8082/'></img>";
        var URL3 =
          "<img id='liveVideo3' style='height:400px;width:490px' src='http://" + marker.videoURL + ":8083/'></img>";

        $('.videoFeeds').html(Cards3HTML);
        $('#livefeed1').html(URL1);
        $('#livefeed2').html(URL2);
        $('#livefeed3').html(URL3);
      }
      if (marker.sysType === 'PTZ') {
        var URL1 =
          "<img id='liveVideo' style='height:400px;width:490px' src='http://" + marker.videoURL + ":8081/'></img>";

        $('.videoFeeds').html(PTZCamHTML);
        $('#PTZVideoFeed').html(URL1);
        $('#panSpeed').change(function () {
          panspeed = $('#panSpeed').val();
          dreamHost.emit('panSpeed', panspeed);
        });

        $('.up').mousedown(function () {
          dreamHost.emit('Cameraaction', 'up');
          console.log('UP');
        });
        $('.up').mouseup(function () {
          dreamHost.emit('Cameraaction', 'upStop');
        });

        $('.down').mousedown(function () {
          dreamHost.emit('Cameraaction', 'down');
        });
        $('.down').mouseup(function () {
          dreamHost.emit('Cameraaction', 'downStop');
        });
        $('.left').mousedown(function () {
          dreamHost.emit('Cameraaction', 'left');
        });
        $('.left').mouseup(function () {
          dreamHost.emit('Cameraaction', 'leftStop');
        });
        $('.right').mousedown(function () {
          dreamHost.emit('Cameraaction', 'right');
        });
        $('.right').mouseup(function () {
          dreamHost.emit('Cameraaction', 'rightStop');
        });
        $('.pos1').mouseup(function () {
          dreamHost.emit('Cameraaction', 'pos1');
        });
        $('.pos2').mouseup(function () {
          dreamHost.emit('Cameraaction', 'pos2');
        });
        $('.pos3').mouseup(function () {
          dreamHost.emit('Cameraaction', 'pos3');
        });
        $('.pos4').mouseup(function () {
          dreamHost.emit('Cameraaction', 'pos4');
        });
        $('.pos5').mouseup(function () {
          dreamHost.emit('Cameraaction', 'pos5');
        });
        $('.startTour').mouseup(function () {
          dreamHost.emit('Cameraaction', 'startTour');
        });
        $('.zoomin').mousedown(function () {
          dreamHost.emit('Cameraaction', 'zoomIN');
        });

        $('.zoomout').mousedown(function () {
          dreamHost.emit('Cameraaction', 'zoomOUT');
        });

        $('.zoomin').mouseup(function () {
          dreamHost.emit('Cameraaction', 'zoomINStop');
        });

        $('.zoomout').mouseup(function () {
          dreamHost.emit('Cameraaction', 'zoomOUTStop');
        });
        $('.scanon').mouseup(function () {
          dreamHost.emit('Cameraaction', 'scanON');
        });
        $('.scanoff').mouseup(function () {
          dreamHost.emit('Cameraaction', 'scanOff');
        });
        $('.recordon').mousedown(function () {
          dreamHost.emit('recording', 'start');
        });
        $('.recordoff').mousedown(function () {
          dreamHost.emit('recording', 'stop');
          dreamHost.emit('getVideos', 'start');
        });
      }
      if (marker.customInfo != 'm1') {
        $('#liveFeed2').html('');
        $('#liveFeed3').html('');
        $('#liveFeed1').html(marker.videoURL);
      }
      return marker;
    });
  }

  var videoFiles = [];

  $.getJSON('http://192.168.196.128:3001/cameras/currentcameraList', function (data) {
    console.log(data);
    var lihtmlCameras = '';

    for (var i = 0; i < data.length; i++) {
      var checkedinTime = moment(data[i].lastCheckIn).format('MM-DD hh:mm');
 nodeName = data[0].nodeName;
      $('#cameraListItems').append(
        "<li class='list-group-item' id='" + data[i].nodeName + "'>" + data[i].nodeName + '</li>'
      );

      $('#filterCameras').on('keyup', function () {
        var value = $(this).val().toLowerCase();
        console.log(value);
        $('#cameraListItems li').filter(function () {
          $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
      });

      $('#cameraListItems .list-group-item').on('click', function () {
        //$('#myModal').modal('show');

        $.getJSON('http://192.168.196.128:3001/cameras/getCameraInfo/' + nodeName, function (data) {
          console.log(data);
         
          var checkinTime = moment(data[0].lastCheckIn);
          var now = moment();
          var difference = now.diff(checkinTime, 'seconds');
          $('#camNameLI').html('Name: ' + data[0].nodeName);
          $('#camStatLI').html('Checked in: ' + difference + ' seconds ago');
          $.getJSON('http://192.168.196.128:3001/cameras/oldestVideo/' + data[0].nodeName, function (data) {
            var dateTimeClean = moment(data[0].DateTime).format('MM-DD hh:mm');
            $('#oldestVidLI').html('Oldest VId: ' + dateTimeClean);
          });

          $('.videoFeeds').html('');
          $('.wc-calendar__days-list li').each(function (index) {
            $(this).css('background', 'white');
          });
          var cameraVideoURL = 'http://192.168.196.128:3001/cameras/videoDatesbyNode/' + nodeName;

          $.getJSON(cameraVideoURL, function (data) {
            console.log(data);
            for (var i = 0; i < data.length; i++) {
              var dateCalendar = moment(data[i].DateTime).tz("America/New_York").format('M/DD/YYYY');
              console.log(moment(data[i].DateTime).tz("America/New_York").format('M/DD/YYYY hh:mm'));

              //$(searchparam).css('background', 'lightblue');

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
      createMarker(
        new google.maps.LatLng(data[i].location.lat, data[i].location.lng),
        data[i].nodeName,
        data[i].ip,
        'http://maps.google.com/mapfiles/kml/pal4/icon38.png',
        data[i].systemType,
        data[i].numOfCams
      );
    }
  });

  cameraNode1.on('videoFileDataDone', function (data) {
    videoFiles.sort(function (a, b) {
      return a.dateUTC - b.dateUTC;
    });
    console.log(videoFiles);
  });

  ///////////// Calendar Stuff
  class Calendar {
    /**
     * @constructor
     * @param {string} container - represents calendar container DOM query
     * @param {string} activeDateClass - represents custom class for selected date
     * @param {Date} initialDate - represents initially selected calendar date
     */
    constructor({ container = '', activeDateClass = '', initialDate = new Date() } = {}) {
      this.$container = container ? document.querySelector(container) : null;
      this.activeDateClass = activeDateClass;

      this.selectedDate = initialDate;
      this.currentMonth = initialDate;
      this.currentMonthDays = [];

      // Months human readable names, to be used inside
      // getFormattedDate() function
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
      // initizlize markup and bootstrap application events
      this.generateMarkup();
      this.bootstrapEvents();
    }

    /**
     * Generate selected month visible dates
     * @function buildCurrentMonthDays
     */
    buildCurrentMonthDays() {
      var curYear = this.currentMonth.getFullYear(),
        curMonth = this.currentMonth.getMonth(),
        firstMonthDay = new Date(curYear, curMonth, 1),
        lastMonthDay = new Date(curYear, curMonth + 1, 0);

      // clear previously selected month generated days
      this.currentMonthDays = [];

      // push visible previous month days
      for (let i = -firstMonthDay.getUTCDay(); i < 0; i++) {
        this.currentMonthDays.push(new Date(curYear, curMonth, i));
      }

      // push current month days
      for (let i = 1, lastDay = lastMonthDay.getDate(); i <= lastDay; i++) {
        this.currentMonthDays.push(new Date(curYear, curMonth, i));
      }

      // push visible next month days
      for (let i = 1, daysAppend = 7 - lastMonthDay.getUTCDay(); i < daysAppend; i++) {
        this.currentMonthDays.push(new Date(curYear, curMonth + 1, i));
      }
    }

    /**
     * Generate 'days-list__item' element class
     * @function getDayClass
     * @return {string} - represents element class string
     */
    getDayClass(date) {
      var classes = ['wc-calendar__days-list__item'],
        curYear = this.currentMonth.getFullYear(),
        curMonth = this.currentMonth.getMonth(),
        firstMonthDay = new Date(curYear, curMonth, 1),
        lastMonthDay = new Date(curYear, curMonth + 1, 0);

      // if date is selectedDate
      if (date.toDateString() === this.selectedDate.toDateString()) {
        // add default and custom active classes
        classes = classes.concat(['wc-calendar__days-list__item--active', this.activeDateClass]);
      }
      // if date is from previous year
      if (date.getMonth() === 11 && this.currentMonth.getMonth() === 0) {
        // mark as previous month date
        classes.push('wc-calendar__days-list__item--prev-month');
        // if date is from next year
      } else if (date.getMonth() === 0 && this.currentMonth.getMonth() === 11) {
        // mark as next month date
        classes.push('wc-calendar__days-list__item--next-month');
        // if date is from previous month
      } else if (date.getMonth() < this.currentMonth.getMonth()) {
        classes.push('wc-calendar__days-list__item--prev-month');
        // if date is from next month
      } else if (date.getMonth() > this.currentMonth.getMonth()) {
        classes.push('wc-calendar__days-list__item--next-month');
      }

      // return element class string
      return classes.join(' ');
    }
    /**
     * Utility function for showing formatted date of type 'MonthName YYYY'
     * @function gerFormattedDate
     * @param {Date} date - represents date object which shall be formatted
     * @return {string} - represents formatted date
     */
    getFormattedDate(date) {
      return `${date.getFullYear()} ${this.monthsNames[date.getMonth()]}`;
    }
    /**
     * Generate HTML string markup for visible calendar dates
     * @function generateDaysMarkup
     * @return {string} - represents HTML markup for currently selected month days
     */
    generateDaysMarkup() {
      var days = [];
      // build month days list
      this.buildCurrentMonthDays();
      // generate markup for each month day
      this.currentMonthDays.forEach(
        function (day) {
          days.push(
            `<li data-date="${day.toLocaleDateString()}" class="${this.getDayClass(day)}">${day.getDate()}</li>`
          );
        }.bind(this)
      );

      return days.join('');
    }
    /**
     * Refresh calendar view
     * @function refreshCalendar
     */
    refreshCalendar() {
      // refresh days-list
      this.$container.querySelector('.wc-calendar__days-list').innerHTML = this.generateDaysMarkup();
      // refresh calendar header date
      this.$container.querySelector('.wc-calendar__header__date').innerHTML = this.getFormattedDate(this.currentMonth);
    }
    /**
     * Switch calendar to previous month
     * @function prevMonth
     */
    prevMonth() {
      var curYear = this.currentMonth.getFullYear(),
        curMonth = this.currentMonth.getMonth();
      // set currentMonth to month before
      this.currentMonth = new Date(curYear, curMonth - 1, 1);
      // refresh calendar view
      this.refreshCalendar();
    }
    /**
     * Switch calendar to next month
     * @function nextMonth
     */
    nextMonth() {
      var curYear = this.currentMonth.getFullYear(),
        curMonth = this.currentMonth.getMonth();
      // set currentMonth to month after
      this.currentMonth = new Date(curYear, curMonth + 1, 1);
      // refresh calendar view
      this.refreshCalendar();
    }
    /**
     * Update calendar options
     * @function update
     * @param {string} [option='selectedDate'|'activeDateClass'] - name of option to be updated
     * @param {string} value - value of option to be updated
     */
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
    /**
     * Select day. Used as event handler for day-list__item 'click'
     * @function selectDay
     * @prop {Object} event - represents 'click' event object
     */
    selectDay(event) {
      var $target = event.target;
      // Act only if 'day-list__item' was clicked
      if ($target.classList.contains('wc-calendar__days-list__item')) {
        let isPrevMonth = $target.classList.contains('wc-calendar__days-list__item--prev-month'),
          isNextMonth = $target.classList.contains('wc-calendar__days-list__item--next-month');

        this.selectedDate = new Date($target.dataset.date);
        console.log(this.selectedDate);
        var selectedDate = moment(this.selectedDate).format('YYYY-MM-DD');
        var getIPString = 'http://192.168.196.128:3001/cameras/getIP/' + nodeName;
        var getURLString = 'http://192.168.196.128:3001/cameras/videosByDay/' + selectedDate + '/' + nodeName;
        var dailyVidsItemsLIcam1 = '';
        var dailyVidsItemsLIcam2 = '';
        var dailyVidsItemsLIcam3 = '';
        var videoSource = [];
        var ip;
        $.getJSON(getIPString, function (data) {
          ip = data[0].ip;
          console.log(data);
        });
        $(document).on('input', '#customRange3', function () {
          $('#customRange3_value').html($(this).val());
        });

        $.getJSON(getURLString, function (data) {
          $('#cam1Times').html('')
$('#cam2Times').html('')
$('#cam3Times').html('')
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

                var cleanedtime = moment(data.cam1[i].DateTime).tz("America/New_York").format('HH:mm');
                var cleanedDate = moment(data.cam1[i].DateTime).tz("America/New_York").format('MM/DD/YYYY');
                var locationString = data.cam1[i].fileLocation;
                var locationArray = locationString.split('/');

                var videourlLocation =
                  'http://' + ip + ':3000/' + locationArray[5] + '/' + locationArray[6] + '/' + locationArray[7];
                videoSource.push(videourlLocation);

                var videoDateTimeRAW = locationArray[7]
                var videoDateTimeRawSplit = videoDateTimeRAW.split(".")
                var videoTimeDate = videoDateTimeRawSplit[0]
                var videoTimeRaw = videoTimeDate.split("_")
                var videoTime = videoTimeRaw[1]
                 var formatedTime = videoTime.replace("-", ":");
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
                //dailyVidsItemsLIcam1 += "<li class='list-group-item'>"+cleanedtime+"</li>"
              } catch (error) {
                console.log(error);
              }
            }
          }

          for (var i = 0; i < data.cam2.length; i++) {
            try {
              var cleanedtime = moment(data.cam2[i].DateTime).tz("America/New_York").format('HH:mm');
              var cleanedDate = moment(data.cam2[i].DateTime).tz("America/New_York").format('MM/DD/YYYY');
              var locationString = data.cam2[i].fileLocation;
              var locationArray = locationString.split('/');
 var videoDateTimeRAW = locationArray[7]
                var videoDateTimeRawSplit = videoDateTimeRAW.split(".")
                var videoTimeDate = videoDateTimeRawSplit[0]
                var videoTimeRaw = videoTimeDate.split("_")
                var videoTime = videoTimeRaw[1]
                 var formatedTime = videoTime.replace("-", ":");
              var videourlLocation =
                'http://' + ip + ':3000/' + locationArray[5] + '/' + locationArray[6] + '/' + locationArray[7];
              videoSource.push(videourlLocation);
              $('#cam2Times').append(
                "<li class='list-group-item videoTimePlay' id='" +
                  cleanedtime +
                  "' data-location='" +
                  locationString +
                  "'>" +
                  cleanedDate +
                  '   @   ' +
                  formatedTime +
                  '</li>'
              );
              //dailyVidsItemsLIcam1 += "<li class='list-group-item'>"+cleanedtime+"</li>"
            } catch (error) {
              console.log(error);
            }
          }
          for (var i = 0; i < data.cam3.length; i++) {
            try {
              var cleanedtime = moment(data.cam3[i].DateTime).tz("America/New_York").format('HH:mm');
              var cleanedDate = moment(data.cam3[i].DateTime).tz("America/New_York").format('MM/DD/YYYY');
              var locationString = data.cam3[i].fileLocation;
              var locationArray = locationString.split('/');

              var videoDateTimeRAW = locationArray[7]
                var videoDateTimeRawSplit = videoDateTimeRAW.split(".")
                var videoTimeDate = videoDateTimeRawSplit[0]
                var videoTimeRaw = videoTimeDate.split("_")
                var videoTime = videoTimeRaw[1]
                 var formatedTime = videoTime.replace("-", ":");
              var videourlLocation =
                'http://' + ip + ':3000/' + locationArray[5] + '/' + locationArray[6] + '/' + locationArray[7];
              videoSource.push(videourlLocation);
              $('#cam3Times').append(
                "<li class='list-group-item videoTimePlay' id='" +
                  cleanedtime +
                  "' data-location='" +
                  locationString +
                  "'>" +
                  cleanedDate +
                  '   @   ' +
                  formatedTime +
                  '</li>'
              );
              //dailyVidsItemsLIcam1 += "<li class='list-group-item'>"+cleanedtime+"</li>"
            } catch (error) {
              console.log(error);
            }
          }

          $('#ulCam1').html(dailyVidsItemsLIcam1);
          var i = 0; // define i
          var videoCount = videoSource.length;
          function videoPlay(videoNum) {
            document.getElementById('myVideo').setAttribute('src', videoSource[videoNum]);
            document.getElementById('myVideo').load();
            document.getElementById('myVideo').play();
          }
          //document.getElementById('myVideo').addEventListener('ended', myHandler, false);
          //videoPlay(0); // play the video

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

        // if element represents date from either previous or next month
        if (isPrevMonth || isNextMonth) {
          // if previous month
          if (isPrevMonth) {
            // switch calendar to month before
            this.prevMonth();
            // if next
          } else {
            // switch calendar to month after
            this.nextMonth();
          }
          // select date element from currently rendered month
          $target = this.$container.querySelector(`[data-date="${this.selectedDate.toLocaleDateString()}"]`);
          // if element represents currently rendered month
        } else {
          let $activeItem = this.$container.querySelector('.wc-calendar__days-list__item--active');
          // if there already is element with active class
          if ($activeItem) {
            // remove active class from element
            $activeItem.classList.remove('wc-calendar__days-list__item--active');
            // if custom active class was specified - remove this class
            this.activeDateClass && $activeItem.classList.remove(this.activeDateClass);
          }
        }
        // add default and custom active classes to selected date element
        $target.classList.add('wc-calendar__days-list__item--active');
        this.activeDateClass && $target.classList.add(this.activeDateClass);
      }
    }
    /**
     * Generate initial calendar markup
     * @function generateMarkup
     */
    generateMarkup() {
      // if container query wasn't specified
      if (!this.$container) {
        // create new container element
        let fragment = document.createDocumentFragment(),
          calendarContainer = document.createElement('div');
        fragment.appendChild(calendarContainer);
        // append container to body
        document.body.appendChild(calendarContainer);
        // save new container reference
        this.$container = calendarContainer;
      }
      // add default class for container
      this.$container.classList.add('wc-calendar');
      // form calendar markup
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
    /**
     * Bootstrap calendar specific events
     * @function bootstrapEvents
     */
    bootstrapEvents() {
      // prev month button event handler
      this.$container.querySelector('.wc-calendar__btn--prev').addEventListener('click', this.prevMonth.bind(this));
      // next month button event handler
      this.$container.querySelector('.wc-calendar__btn--next').addEventListener('click', this.nextMonth.bind(this));
      // select day item delegated to days-list event handler
      this.$container.querySelector('.wc-calendar__days-list').addEventListener('click', this.selectDay.bind(this));
    }
  }

  // Testing part. Contains calendar initialization and calendar testing form
  // handler
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
