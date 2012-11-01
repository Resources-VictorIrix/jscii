!function() {

	navigator.getMedia = navigator.getUserMedia ||
		navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia ||
		navigator.msGetUserMedia;

	var imgCanvas = document.createElement('canvas');
	var imgCtx = imgCanvas.getContext('2d');
	var videoCanvas = document.createElement('canvas');
	var videoCtx = videoCanvas.getContext('2d');

	var videoWidth, videoHeight, video, container, stream, videoTimer;

	/**
	 * value to character mapping
	 * the extra &nbsp; is to account for the value range inclusive of 100%
	 */
	var chars = ['@','#','$','=','*','!',';',':','~','-',',','.','&nbsp;', '&nbsp;'];
	var charLen = chars.length-1;
	function getChar(val) { return chars[parseInt(val*charLen, 10)]; }

	/**
	 * log when getUserMedia or when video metadata loading fail
	 */
	function logError(err) { if(console && console.log) console.log('Error!', e); }

	/**
	 * Sets the video dimension (and subsequently ASCII string dimension)
	 */
	function setVideoDimension(width, height) {
		videoCanvas.width = videoWidth = width;
		videoCanvas.height = videoHeight = height;
	}

	/**
	 * given a video object and DOM element, render the ASCII string inside element
	 */
	function renderVideo(videoEl, containerEl) {
		video = videoEl;
		container = containerEl;
		navigator.getMedia({video: true, audio: true}, function(localMediaStream){
			stream = localMediaStream;
			var url = window.URL || window.webkitURL;
			video.src = url.createObjectURL(localMediaStream);

			startRender(15);
			video.onloadedmetadata = logError;
		}, logError);
	}

	/**
	 * gets video image data, perform ascii conversion, append string to container
	 */
	function startRender(interval) {
		if(typeof interval !== 'number') interval = 20;
		videoTimer = setInterval(function(){
			if(stream) {
				var w = videoWidth, h = videoHeight;
				videoCtx.drawImage(video, 0, 0, w, h);
				var data = videoCtx.getImageData(0, 0, w, h).data;
				container.innerHTML = getAsciiString(data, w, h);
			}
		}, interval);
	}

	/**
	 * Allow pause and play for ascii rendering
	 */
	function stopRender() { if(videoTimer) clearInterval(videoTimer); }

	/**
	 * given an image object and DOM element, render the ASCII string inside element
	 */
	function renderImage(image, container) {
		image.addEventListener('load', function(){
			var ratio = image.width/image.height;
			imgCanvas.width = w = 150;
			imgCanvas.height = h = w/ratio;
			imgCtx.drawImage(image, 0, 0, w, h);
			data = imgCtx.getImageData(0, 0, w, h).data;
			container.innerHTML = getAsciiString(data, w, h);
		});
	}

	/**
	 * pixel data is a 1-dimensional array of rgba sequence
	 * just a helper method to retrieve this rgb value
	 */
	function getRGB(d, pixel) { return [d[pixel=pixel*4], d[pixel+1], d[pixel+2]]; }

	/**
	 * given a picture/frame's pixel data and a defined width and height
	 * return the ASCII string representing the image
	 */
	function getAsciiString(d, width, height) {
		var len = width*height-1, str = '';
		for(var i=0; i<len; i++) {
			if(i%width === 0) str += '<br>';
			var rgb = getRGB(d, i);
			var val = Math.max(rgb[0], rgb[1], rgb[2])/255;
			//str += '<b style="color: rgb('+rgb.join(',')+')">'+getChar(val)+'</b>';
			str += getChar(val);
		}
		return str;
	}


	/**
	 * given an rgb array, return the hue-saturation-lightness
	 */
	function rgbToHsv(rgb) {
		var r = rgb[0]/255, g = rgb[1]/255, b = rgb[2]/255;
		var max = Math.max(r, g, b);
		var min = Math.min(r, g, b);
		var v = max, d = max - min;
		var s = max === 0 ? 0 : d/max;

		if(max === min) {
			h = 0;
		} else {
			if(max === r) h = (g - b) / d + (g < b ? 6 : 0);
			else if(max === g) h = (b - r) / d + 2;
			else if(max === b) h = (r - g) / d + 4;
			h *= 60;
		}
		return [h, s, v];
	}


	// default video dimension at 150 width and a 4:3 ratio
	setVideoDimension(150, parseInt(150*3/4, 10));
	window.Jscii = {
		setVideoDimension: setVideoDimension,
		renderVideo: renderVideo,
		startRender: startRender,
		stopRender: stopRender,
		renderImage: renderImage
	};

}();
