var version = '1.10.1';

/*------------------------------------------------------------------------------
vars.js
------------------------------------------------------------------------------*/

var jsonData,
courseIndex, yearIndex, docLink,
urlCourse, urlYear, urlDoc,
urlCourse2, urlYear2, urlDoc2,
selectedCourse, selectedYear, selectedDoc,
params, timestamp;

/*------------------------------------------------------------------------------
helpers.js
------------------------------------------------------------------------------*/

// get url parameters
function urlParam(name) {
  var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
  return results === null ? '' : decodeURIComponent(results[1]);
}

// if not found from url params
function urlNotFound(type) {
  var table = $('#not-found-modal-table'),
  modalType = $('#not-found-modal-type');
  // clear
  table.html('');
  modalType.html('');
  // add modal title
  modalType.html(type);

  // writer function
  function write(typeToWrite, val, error) {
    if (error) {
      table.append('<tr class="error"><td>' + typeToWrite +
        '</td><td>' + val + '</td></tr>');
    } else {
      table.append('<tr><td>' + typeToWrite + '</td><td>' + val + '</td></tr>');
    }
  }

  // show url params
  switch(type) {
    case 'Course':
      write('Course', urlCourse, true);
      break;
    case 'Year':
      write('Course', urlCourse, false);
      write('Year', urlYear, true);
      break;
    case 'Doc':
      write('Course', urlCourse, false);
      write('Year', urlYear, false);
      write('Doc', urlDoc, true);
      break;
    case 'Course2':
      write('Course2', urlCourse2, true);
      break;
    case 'Year2':
      write('Course2', urlCourse2, false);
      write('Year2', urlYear2, true);
      break;
    case 'Doc2':
      write('Course2', urlCourse2, false);
      write('Year2', urlYear2, false);
      write('Doc2', urlDoc2, true);
  }

  // show the modal
  $('#not-found-modal')
    .modal({
      duration: 200,
      onApprove: function() {
        // clear urlParams variables
        urlCourse = '';
        urlYear = '';
        urlDoc = '';
        // show dropdown
        setTimeout(function(){
          $('#' + type.toLowerCase() + '-dropdown').dropdown('show');
        }, 200);
      }
    })
    .modal('show');
}

// use PDF Object to detect if PDF can be embedded
function openPDF(link, side) {
  // get target iframe
  var target = $('#iframe');
  if (side === 'right') target = $('#iframe-split-right');
  // show PDF in iframe - also includes fix for firefox
  // if (PDFObject.supportsPDFs || navigator.userAgent.indexOf("Firefox") > -1) {
  //   target.attr('src', link);
  //   // dim
  //   dimmable = true;
  // } else {
  // hide loader
  $('#loader').removeClass('active');
  // get file name
  var fileName = /[^\/]+$/.exec(link);
  fileName = fileName[0].replace('?MOD=AJPERES','');
  // show message
  iframeMsg(side,
    // '<i class="big warning circle icon"></i><br>' +
    '<b>' + fileName + '</b><br>' +
    '<a href="' + link + '" target="_blank"' +
    'class="ui huge primary compact button">' +
    '<i class="external icon"></i>Open in a new tab</a>'
  );
  // Open in new tab
  window.open(link, '_blank');
  // }
}

// write message to iframe
function iframeMsg(side, msg) {
  // get target iframe
  var target = $('#iframe');
  if (side === 'right') target = $('#iframe-split-right');
  // add semantic css, body background
  target.contents().find('head').html(
    '<link rel="stylesheet" type="text/css" href="semantic/dist/semantic.min.css">' +
    '<style>' +
      '.msg-body {' +
        'background-color: #262626;' +
        'min-width: auto;' +
        'padding: 20px' +
      '}' +
      '.container {' +
        'align-items: center;' +
        'display: flex;' +
        'height: 100%;' +
        'justify-content: center' +
      '}' +
      '.message {' +
        'background: 0 0;' +
        'color: rgba(255,255,255,.5);' +
        'cursor: default;' +
        'font-size: 24px;' +
        'line-height: 1.2em;' +
        'text-align: center;' +
        'user-select: none' +
      '}' +
      '.message .icon:not(.big) {' +
        'margin: 0 .2em 0 .3em' +
      '}' +
      '.message .big.icon {' +
        'margin-bottom: .25em' +
      '}' +
      '.ui.button {' +
        'border-radius: 10px;' +
        'line-height: 1.2em;' +
        'margin-top: 1em;' +
      '}' +
      '.divider {' +
        'background-color: rgba(255,255,255,.2);' +
        'height: 80%;' +
        'left: 0;' +
        'position: absolute;' +
        'top: 10%;' +
        'width: 1px' +
      '}' +
      '.message p.copyright {' +
        'font-size: 16px;' +
        'margin-top: 4em;' +
        'max-width: 560px' +
      '}' +
      '.message p.copyright a {' +
        'color: #fff;' +
      '}' +
      '.message p.copyright a:hover,' +
      '.message p.copyright a:active,' +
      '.message p.copyright a:focus {' +
        'text-decoration: underline;' +
      '}' +
    '</style>'
  );
  target.contents().find('body').addClass('msg-body').html(
    '<div class="container">' +
      '<div class="message">' +
        msg +
        '<p class="copyright">' +
          'Past papers are no longer directly viewable on this web app to ' +
          'comply with <a target="_blank" href="' +
            'http://educationstandards.nsw.edu.au/wps/portal/nesa/mini-footer/copyright' +
          '">NESA Copyright Policy</a>. You can read about the changes made ' +
          '<a target="_blank" href="' +
            'https://github.com/notseenee/hscpastpapers/blob/master/copyright-changes.md' +
          '">here</a>.' +
        '</p>' +
      '</div>' +
    '</div>'
  );
  // add left border to right iframe placeholder
  if (side === 'right') {
    target.contents().find('body').append('<div class="divider"></div>');
  }
}

/*------------------------------------------------------------------------------
dropdown.js
------------------------------------------------------------------------------*/

// parses JSON to populate dropdowns
function populateDropdown(json, searchFor, pushTo, reverse, examPack) {
	if (typeof(json) == 'object') {
		// get all items into an array
		var items = [];
		// loop through each item and push to array
		for (i = 0; i < json.length; i++) {
			items.push(json[i][searchFor]);
		}
		// sort array
		items.sort();
		// optionally reverses array (for year dropdown)
		if (reverse) items.reverse();
		// clears dropdown
		$(pushTo).empty();
		// loops through items in array and adds to the dropdown if not empty
    if (items.length == 0 && examPack) {
      $(pushTo).append(
        '<div class="item" style="display:none"></div>' +
        '<div class="no-item-msg">' +
        'No documents available.<br><a target="_blank" href="' + examPack +
        '">View exam pack on NESA website <i class="external icon"></i></a>' +
        '</div>');
    }
    else {
  		for (j = 0; j < items.length; j++) {
  			$(pushTo).append('<div class="item" data-value"1">' + items[j] + '</div>');
  		}
    }
	} else {
		console.error('Input JSON not an object: ' + json);
		alert('Error:\n\nInput JSON not an object: ' + json);
	}
}

// when a course is selected, populate year dropdown
$('#course-input').change( function() {
	// get selected value
	selectedCourse = $('#course-input')[0].value;
	// add to new params
	params.course = selectedCourse;
	// add loading spinner to year dropdown
	$('#year-dropdown').addClass('loading').removeClass('disabled');
	// loops through each element in json object to find index
	for (k = 0; k < jsonData.length; k++) {
		if (jsonData[k].course_name.toLowerCase() == selectedCourse) {
			courseIndex = k;
			break;
		}
	}
	// populates dropdown
	populateDropdown(jsonData[courseIndex].packs, 'year', '#year-menu', true);
	// activates year dropdown
	$('#year-dropdown')
		.removeClass('loading')
		.dropdown('restore defaults')
		.dropdown('show')
		.dropdown({ selectOnKeydown: false });
	// Select year from URL parameter
	if (urlYear) {
		$('#year-dropdown')
			.dropdown('set selected', urlYear)
			.dropdown('hide');
		// if not found
		if ( !$('#year-dropdown').dropdown('get value') ) urlNotFound('Year');
	}
	// change url to new params
	history.pushState(null, '', '?' + $.param(params) );
});

// when a year is selected, populate docs dropdown
$('#year-input').change( function() {
	// if year is blank for some reason, ignore
	if ($(this)[0].value === '') return;
	// get selected year
	selectedYear = $('#year-input')[0].value;
	// add to new params
	params.year = selectedYear;
	// add loading spinner to year dropdown
	$('#doc-dropdown').addClass('loading').removeClass('disabled');
	// loops through each element in json object to find year index
	for (l = 0; l < jsonData[courseIndex].packs.length; l++) {
		if (jsonData[courseIndex].packs[l].year == selectedYear) {
			yearIndex = l;
			break;
		}
	}
	// populates dropdown
	populateDropdown(jsonData[courseIndex].packs[yearIndex].docs,
		'doc_name', '#doc-menu', false, jsonData[courseIndex].packs[yearIndex].link);
	// activate doc dropdown
	$('#doc-dropdown')
		.removeClass('loading')
		.dropdown('restore defaults')
		.dropdown('show');
	// Select doc from URL parameter
	if (urlDoc) {
		$('#doc-dropdown')
			.dropdown('set selected', urlDoc)
			.dropdown('hide');
		// if not found
		if ( !$('#doc-dropdown').dropdown('get value') ) urlNotFound('Doc');
	}
	// activate exam pack buttons and adds link
  $('#actions-dropdown').removeClass('disabled').dropdown({action:'nothing'});
	$('.button-exampack')
		.removeClass('disabled')
		.attr('href', jsonData[courseIndex].packs[yearIndex].link);
	// change url to new params
	history.pushState(null, '', '?' + $.param(params) );
});

// when a doc is selected, open it
$('#doc-input').change( function(){
	// if selected doc is blank, ignore
	if ($(this)[0].value == '') return;
	// get selected doc
	selectedDoc = $('#doc-input')[0].value.replace('&amp;', '&');
	// add to new params
	params.doc = selectedDoc;
	// loops thorugh each doc to find doc index
	for (m = 0; m < jsonData[courseIndex].packs[yearIndex].docs.length; m++) {
		if (jsonData[courseIndex].packs[yearIndex].docs[m].doc_name.toLowerCase() ==
			selectedDoc) {
			docLink = jsonData[courseIndex].packs[yearIndex].docs[m].doc_link;
			// force https
			docLink = docLink.replace('http', 'https');
			break;
		}
	}
	// add loading indicator on logo
	$('#loader').addClass('active');
	// open in iframe
	openPDF(docLink, 'left');
	// activate download & link buttons
	$('.button-download').removeClass('disabled').attr('href', docLink);
	$('.button-link').removeClass('disabled').removeAttr('disabled');
	// change url to new params
	history.pushState(null, '', '?' + $.param(params) );
	// change tab title
	updateTabTitle();
});

/*------------------------------------------------------------------------------
loadjson.js
------------------------------------------------------------------------------*/

function loadJSON(url, name, xhr, callback) {
	// Check if local storage is supported
	if (typeof(Storage) !== 'undefined') {
		// Check if expired
		var expired = true;
		var cacheTimestamp = localStorage.getItem('timestamp');
		if (cacheTimestamp !== null) {
			// Calculate time difference
			var currentTime = new Date();
			var diff = currentTime.getTime() - new Date(cacheTimestamp).getTime();
			// If under a week old, use local storage
			if (diff < 1000*60*60*24*7) expired = false;
		} else {
			var newTimestamp = new Date();
			localStorage.setItem('timestamp', newTimestamp);
			console.log('Local storage - set new download date: ' + newTimestamp);
		}

		// Check if already in local storage and not expired
		var check = localStorage.getItem(name);
		if (check !== null && expired === false) {
			// Serve from local storage
			console.log('Serving from LocalStorage: ' + name);
			// Make sure to parse the JSON from string format
			try { callback(JSON.parse(check)); }
			catch (err) {
				// Write error message
				var msg = 'Failed to parse ' + name + ' JSON from cache.\n' + err;
				// Display in console and alert
				console.error(msg);
				alert(msg + '\n\nPress OK to reload.');
				// Remove from local storage
				localStorage.removeItem(name);
				// Reload
				location.reload();
			}
		} else {
			// Else, download and cache
			console.log('Downloading: ' + name);
			ajaxJSON(url, name, xhr, function(data){
				console.log('Downloaded and cached: ' + name);
				// Make sure to stringify the data
				localStorage.setItem(name, JSON.stringify(data));
				callback(data);
			});
		}

	} else {
		// No local storage available - download using ajax
		console.log('LocalStorage not available: ' + name);
		ajaxJSON(url, name, xhr, function(data){ callback(data); });
	}
}

function ajaxJSON(url, name, xhr, success) {
	// If there's an xhr progress function submitted
	if (xhr !== null) {
		$.ajax({ dataType: 'json', url: url, xhr: xhr, success: success });
	} else {
		$.ajax({ dataType: 'json', url: url, success: success });
	}
}

// Clear cache button
$('#clear-cache').click(function(){
	localStorage.clear();
	location.reload();
});

/*------------------------------------------------------------------------------
ready.js
------------------------------------------------------------------------------*/

$(document).ready(function(){
	// when jQuery loads, hide warning
	$('#nojquery').hide();
	// Set about modal transition duration
	$('#about-modal').modal({ duration: 200 });
	// show version in about modal
	$('#version').html(version);
	// show current year in about modal
	$('#currentYear').html(new Date().getFullYear().toString().substr(-2));
	// store url params
	urlCourse = urlParam('course');
	urlYear = urlParam('year');
	urlDoc = urlParam('doc');
	// store url params2
	urlCourse2 = urlParam('course2');
	urlYear2 = urlParam('year2');
	urlDoc2 = urlParam('doc2');
	// open about window
	if (urlParam('open') == 'about') $('#about-modal').modal('show');
	// initialise new params object
	params = { mode: 'normal' };
	// activate mobile more-dropdown
	$('#more-dropdown').dropdown({action:'nothing'});
	// gets JSON from nesappscraper
	loadJSON('data/data.json', 'data', dataProgress, dataReceived);
	// Update timestamp
	loadJSON('data/meta.json', 'meta', null, showTimestamp);
});

function dataProgress() {
	console.log('Downloading data...');
	// access xhr
	var xhr = new window.XMLHttpRequest();
	xhr.addEventListener('progress', function(e) {
		// data.json is approx 1217736 bytes
		var percent = Math.floor(e.loaded / 1217736 * 100);
		// update ui loading bar
		$('#loadingbar').progress({ percent: percent });
		$('#loadingpercent').html(percent + '%');
	}, false);
	return xhr;
}

function dataReceived(data) {
	console.log('Received data');
	// write to jsonData variable
	jsonData = data;
	// populate course dropdown
	populateDropdown(jsonData, 'course_name', '#course-menu', false);
	// also populate dropdown for split view
	populateDropdown(jsonData, 'course_name', '#course-menu2', false);
	// remove loading indicator
	$('#loadingpercent').html('100%');
	$('#loadingbar').progress({ percent: 100 }).delay(500).fadeOut(200);
	$('body').removeClass('loading');
	// show placeholder in iframe
	iframeMsg('left',
		'<p>' +
      'Select a' +
      '<i class="student icon left spaced"></i>Course,' +
      '<i class="history icon left spaced"></i>Year, and' +
      '<i class="file pdf outline icon left spaced"></i>Document above' +
    '</p>');
	iframeMsg('right',
		'<p>' +
      'Select a' +
      '<i class="student icon left spaced"></i>Course,' +
      '<i class="history icon left spaced"></i>Year, and' +
      '<i class="file pdf outline icon left spaced"></i>Document above' +
    '</p>');
	// change page background
	$('body').css('background-color', '#fff');
	// activate course dropdown
	$('#course-dropdown')
		.removeClass('disabled')
		.dropdown('show')
		.dropdown({ selectOnKeydown: false });
	// also activate course dropdown for split view
	$('#course-dropdown2')
		.removeClass('disabled')
		.dropdown({ selectOnKeydown: false });
	// Select course from URL parameter
	if (urlCourse) {
		$('#course-dropdown')
			.dropdown('set selected', urlCourse)
			.dropdown('hide');
		// if not found
		if ( !$('#course-dropdown').dropdown('get value') ) urlNotFound('Course');
	}
	// Select course2 from URL parameter
	if (urlCourse2) {
		$('#course-dropdown2')
			.dropdown('set selected', urlCourse2)
			.dropdown('hide');
		// if not found
		if ( !$('#course-dropdown2').dropdown('get value') ) urlNotFound('Course2');
	}
}

function showTimestamp(data) {
	console.log('Received meta');
	// create new date object so it can be formatted
	timestamp = new Date(data.timestamp);
	// show in about modal
	$('#timestamp').html( timestamp.toLocaleDateString() );
}

/*------------------------------------------------------------------------------
ui.js
------------------------------------------------------------------------------*/

// when link button is clicked, show prompt
$('.button-link').click( function(){ prompt('Copy link below:', docLink); });
// when about button is clicked, show modal
$('.button-about').click( function(){ $('#about-modal').modal('show'); });
// if from /about, remove ?open=about from url
$('#close-modal').click( function(){
	if (urlParam('open') == 'about') history.pushState(null, '', '?');
});
// when iframe finishes loading, remove loading indicator on logo
$('#iframe').on('load', function(){ $('#loader').removeClass('active'); });

/*------------------------------------------------------------------------------
dim.js
------------------------------------------------------------------------------*/

// dims ui elements when idle
var idleTime = 0,
		dimmable = false;

$(document).ready(function () {
  // Increment the idle time counter every minute.
  var idleInterval = setInterval(timerIncrement, 5000); // 5 sec
  // Reset on mouse movement, click or key press
  $(this).mousemove( function (e) { resetTimer(); } );
  $(this).mousedown( function (e) { resetTimer(); } );
  $(this).mouseup( function (e) { resetTimer(); } );
  $(this).keypress( function (e) { resetTimer(); } );
  this.addEventListener('touchstart', function (e) { resetTimer(); }, false);
  this.addEventListener('touchmove', function (e) { resetTimer(); }, false);
  this.addEventListener('touchend', function (e) { resetTimer(); }, false);
});

// dim
function timerIncrement() {
  idleTime = idleTime + 5;
  if (idleTime >= 5 && dimmable === true) { // 5 sec then dim
      $('body').addClass('idle');
  }
}
// reset
function resetTimer() {
	idleTime = -5;
	$('body').removeClass('idle');
}

/*------------------------------------------------------------------------------
tabTitle.js
------------------------------------------------------------------------------*/

// updates tab title
function updateTabTitle() {
	// but only if a doc is actually selected
	if ( $('#doc-dropdown .text.overflow').html() != 'Document' ) {
	document.title = $('#year-dropdown .text').html() + ' ' +
		$('#course-dropdown .text').html() + ' ' +
		$('#doc-dropdown .text.overflow').html();

		if ( $('body').hasClass('split') &&
			$('#doc-dropdown2 .text.overflow').html() != 'Document' ) {
			document.title += ' | ' + $('#year-dropdown2 .text').html() + ' ' +
			$('#course-dropdown2 .text').html() + ' ' +
			$('#doc-dropdown2 .text.overflow').html();
		}
	}
	else {
		document.title = 'HSCPastPapers.com';
	}
}

/*------------------------------------------------------------------------------
split.js
------------------------------------------------------------------------------*/

var courseIndex2, yearIndex2, docLink2,
selectedCourse2, selectedYear2, selectedDoc2,
params;

// if url has ?mode=split, open split view immediately
$(document).ready(function(){
	// open split view
	if (urlParam('mode') == 'split') {
		$('body').addClass('split');
		// show course2 dropdown
		$('#course-dropdown2').dropdown('show');
		// add mode to params
		params.mode = 'split';
	}
});

// activate split view
$('.button-split').click(function(){
	// add split class to body
	$('body').addClass('split');
	// show course2 dropdown if no doc is already selected
	if (!selectedCourse2 && !selectedYear2 && !selectedDoc2) {
		$('#course-dropdown2').dropdown('show');
	}
	// change url
	params.mode = 'split';
	history.pushState(null, '', '?' + $.param(params) );
	// update tab title
	updateTabTitle();
});

// exit split view
$('.button-splitexit').click(function(){
	// remove split class from body
	$('body').removeClass('split');
	// change url
	params.mode = 'normal';
	history.pushState(null, '', '?' + $.param(params) );
	// update tab title
	updateTabTitle();
});

// when a course is selected, populate year dropdown
$('#course-input2').change( function() {
	// get selected value
	selectedCourse2 = $('#course-input2')[0].value;
	// add to new params
	params.course2 = selectedCourse2;
	// add loading spinner to year dropdown
	$('#year-dropdown2').addClass('loading').removeClass('disabled');
	// loops through each element in json object to find index
	for (k = 0; k < jsonData.length; k++) {
		if (jsonData[k].course_name.toLowerCase() == selectedCourse2) {
			courseIndex2 = k;
			break;
		}
	}
	// populates dropdown
	populateDropdown(jsonData[courseIndex2].packs, 'year', '#year-menu2', true);
	// activates year dropdown
	$('#year-dropdown2')
		.removeClass('loading')
		.dropdown('restore defaults')
		.dropdown('show')
		.dropdown({ selectOnKeydown: false });
	// Select year from URL parameter
	if (urlYear2) {
		$('#year-dropdown2')
			.dropdown('set selected', urlYear2)
			.dropdown('hide');
		// if not found
		if ( !$('#year-dropdown2').dropdown('get value') ) urlNotFound('Year2');
	}
	// change url to new params
	history.pushState(null, '', '?' + $.param(params) );
});

// when a year is selected, populate docs dropdown
$('#year-input2').change( function() {
	// if year is blank for some reason, ignore
	if ($(this)[0].value === '') return;
	// get selected year
	selectedYear2 = $('#year-input2')[0].value;
	// add to new params
	params.year2 = selectedYear2;
	// add loading spinner to year dropdown
	$('#doc-dropdown2').addClass('loading').removeClass('disabled');
	// loops through each element in json object to find year index
	for (l = 0; l < jsonData[courseIndex2].packs.length; l++) {
		if (jsonData[courseIndex2].packs[l].year == selectedYear2) {
			yearIndex2 = l;
			break;
		}
	}
	// populates dropdown
	populateDropdown(jsonData[courseIndex2].packs[yearIndex2].docs,
		'doc_name', '#doc-menu2', false);
	// activate doc dropdown
	$('#doc-dropdown2')
		.removeClass('loading')
		.dropdown('restore defaults')
		.dropdown('show');
	// Select doc from URL parameter
	if (urlDoc2) {
		$('#doc-dropdown2')
			.dropdown('set selected', urlDoc2)
			.dropdown('hide');
		// if not found
		if ( !$('#doc-dropdown2').dropdown('get value') ) urlNotFound('Doc2');
	}
	// activate exam pack buttons and adds link
	// $('.button-exampack')
	// 	.removeClass('disabled')
	// 	.attr('href', jsonData[courseIndex].packs[yearIndex]['link']);
	// change url to new params
	history.pushState(null, '', '?' + $.param(params) );
});

// when a doc is selected, open it
$('#doc-input2').change( function(){
	// if selected doc is blank, ignore
	if ($(this)[0].value === '') return;
	// get selected doc
	selectedDoc2 = $('#doc-input2')[0].value;
	// add to new params
	params.doc2 = selectedDoc2;
	// loops thorugh each doc to find doc index
	for (m = 0; m < jsonData[courseIndex2].packs[yearIndex2].docs.length; m++) {
		if (jsonData[courseIndex2].packs[yearIndex2].docs[m].doc_name.toLowerCase() ==
			selectedDoc2) {
			docLink2 = jsonData[courseIndex2].packs[yearIndex2].docs[m].doc_link;
			// force https
			docLink2 = docLink2.replace('http', 'https');
			break;
		}
	}
	// open in iframe
	openPDF(docLink2, 'right');
	// add loading indicator on logo
	$('#loader').addClass('active');
	// activate download & link buttons
	// $('.button-download').removeClass('disabled').attr('href', docLink);
	// $('.button-link').removeClass('disabled').removeAttr('disabled');
	// $('#actions-dropdown').removeClass('disabled').dropdown({action:'nothing'});
	// change url to new params
	history.pushState(null, '', '?' + $.param(params) );
	// change tab title
	updateTabTitle();
});

// when iframe finishes loading, remove loading indicator on logo
$('#iframe-split-right').on('load', function(){ $('#loader').removeClass('active'); });
