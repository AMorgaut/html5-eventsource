﻿/*global net*/var	EventTarget,	Event,	RECONNECTION_TIME,	DIGITS_REGEX,	CRLF,	LF,	CR;/** * @class MessageEvent * @extends Event * @constructor * @param {mixed} data * @param {string} origin **/function MessageEvent(data, origin) {	Event.call(this, 'message', {		bubble: false,		cancellable: false	});	this.data = data;	this.origin = origin;}MessageEvent.prototype = Object.create(Event.prototype);/** * @class EventSource * @extends EventTarget * @constructor * @param {string} url * @param {EventSourceInit} [eventSourceInitDict] **/function EventSource(url, eventSourceInitDict) {	var		index,		scheme,		ssl,		host,		hostname,		port,		path,		CORSMode,		// http://www.w3.org/TR/eventsource/#dom-eventsource-readystate		readyState,		// http://www.w3.org/TR/eventsource/#concept-event-stream-last-event-id		lastEventId,		client,		statusOK,		finalUrl,		acceptOk,		connectionFailed,		// buffers		dataBuffer,		eventTypeBuffer,		lastEventIdBuffer,		// http://www.w3.org/TR/eventsource/#concept-event-stream-reconnection-time		reconnectionTime;	function dispatchError(message) {		var			errorEvent;		errorEvent = new Event('error');		errorEvent.message = message;		if (typeof this.onerror === 'function') {			this.onerror(errorEvent);		}		this.dispatchEvent(errorEvent);	}	// http://www.w3.org/TR/eventsource/#processing-model	function establishTheConnection() {		client = net.connect(port, host, function(connection) {			var				request;			readyState = EventSource.OPEN;			request = [				'GET ' + path + ' HTTP/1.1',				'Host: ' + host			];			request.push('Accept: text/event-stream');			request.push('Cache-Control: no-cache');			if (lastEventId) {				request.push('Last-Event-ID: ' + lastEventId);			}			request.push(''); // end of header			client.write(request.join('\n'));		});	}	// http://www.w3.org/TR/eventsource/#announce-the-connection	function announceTheConnection() {		var			openEvent;		if (readyState !== EventSource.CLOSED) {			readyState = EventSource.OPEN;		}		openEvent = new Event('open');		if (typeof this.onopen === 'function') {			this.onopen(openEvent);		}		this.dispatchEvent(openEvent);	}	// http://www.w3.org/TR/eventsource/#reestablish-the-connection	function reestablishTheConnection() {		setTimeout(function () {			if (readyState === EventSource.CLOSED) {				return;			}			readyState = EventSource.CONNECTING;			dispatchError('reconnecting');		}, 0);		setTimeout(function () {			if (readyState !== EventSource.CONNECTING) {				return;			}			establishTheConnection();		}, RECONNECTION_TIME);		// Not yet supported		// Optionally, wait some more. In particular, if the previous attempt failed, 		// then user agents might introduce an exponential backoff delay to avoid overloading 		// a potentially already overloaded server. 		// Alternatively, if the operating system has reported that there is no network connectivity, 		// user agents might wait for the operating system to announce that the network connection 		// has returned before retrying.	}	// http://www.w3.org/TR/eventsource/#fail-the-connection	function failTheConnection(message) {		client.end();		readyState = EventSource.CLOSED;		connectionFailed = true;		dispatchError(message);	}	// http://www.w3.org/TR/eventsource/#processField	function processTheField(field, value) {		switch (field) {		case 'event':			eventTypeBuffer = value;			break;		case 'data':			dataBuffer += value + LF;			break;		case 'id':			lastEventIdBuffer = value;			break;		case 'retry':			if (DIGITS_REGEX.test(value)) {				reconnectionTime = parseInt(value, 10);			}			break;		default:			// field is ignored			break;		}	}	// http://www.w3.org/TR/eventsource/#dispatchMessage	function dispatchTheEvent() {		var			event,			ServerEvent;		// step 1		lastEventId = lastEventIdBuffer;		// step 2		if (dataBuffer === '') {			// dataBuffer = ''; // specified by the spec but not required as already right			eventTypeBuffer = '';			return;		}		// step 3		if (dataBuffer[dataBuffer.length - 1] === LF) {			dataBuffer.substr(0, dataBuffer.length - 1);		}		// step 4 & 5 		// mixed because step 5 ask to modify the type attribute which is in fact read-only (see DOM Event)		if (eventTypeBuffer !== '') {			// create custom ServerEvent			ServerEvent = function (data, type, origin) {				Event.call(this, type, {					bubble: false,					cancellable: false				});				this.data = data;				this.origin = origin;			}			ServerEvent.prototype = Object.create(Event.prototype);			event = new ServerEvent(dataBuffer, eventTypeBuffer, finalUrl);		} else {			// use standard MessageEvent			event = new MessageEvent(dataBuffer, finalUrl);		}	}	// EventTarget inheritance	EventTarget.call(this);	// PARSE AND VALIDATE URL	url = String(url);	index = url.indexOf(':');	if (index === -1) {		throw new SyntaxError('Invalid URL: ' + url);	}	scheme = url.substr(0, index);	switch (scheme) {	case 'http':		ssl = false;		break;	case 'https':		ssl = true;		break;	default:		throw SyntaxError('invalid sheme: ' + scheme);	}	url = url.substr(index + 3);	index = url.indexOf('/');	if (index === -1) {		hostname = url;		path = '/';	} else {		hostname = url.substr(0, index);		path = url.substr(index);	}	// raw port detection	// doesn't support IPV6 addresses nor in URL Basic Auth credentials	index = hostname.lastIndexOf(':');	if (index === -1) {		host = hostname;		port = 80;	} else {		host = hostname.substr(0, index);		port = Number(hostname.substr(index));	}	// INITIALIZE OBJECT	Object.defineProperties(this, {		url: {			value: String(url),			writable: false		},		withCredentials: {			value: eventSourceInitDict && Boolean(eventSourceInitDict.withCredentials),			writable: false		},		readyState: {			get: function () { return readyState; },			set: function () {}		}	});	if (this.withCredentials) {		CORSMode = 'USE_CREDENTIALS';	}	// CONNECT TO THE SERVER	readyState = EventSource.CONNECTING;	establishTheConnection();	// HANDLE SERVER RESPONSE	client.on('data', function (data) {		var			eol,			rows;		// MANAGE END OF LINE FORMAT (CRLF, CR, or LF)		if (data.indexOf(CRLF) === -1) {			if (data.indexOf(LF) === -1) {				if (data.indexOf(CR) === -1) {					eol = undefined;				} else {					eol = CR;				}			} else {				eol = LF;			}		} else {			eol = CRLF;		}		rows = eol ? data.split(eol) : data;		// CHECK CONNECTION STATUS		if (readyState !== EventSource.OPEN) {			rows.some(function parseConnection(row, index) {				var					connected;				// STATUS LINE				if (!index) {					// Not yet supported:					// HTTP 305 Use Proxy, 401 Unauthorized, and 407 Proxy Authentication Required should be treated transparently as for any other subresource.					// HTTP 301 Moved Permanently, 302 Found, 303 See Other, and 307 Temporary Redirect responses are handled by the fetching and CORS algorithms. In the case of 301 redirects, the user agent must also remember the new URL so that subsequent requests for this resource for this EventSource object start with the URL given for the last 301 seen for requests for this object.					// HTTP 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable, and 504 Gateway Timeout responses, and any network error that prevents the connection from being established in the first place (e.g. DNS errors), must cause the user agent to asynchronously reestablish the connection.					if (row.toUpperCase() !== 'HTTP 200 OK') {						failTheConnection('Bad Status: ' + rows[0]);						rows = [];						return true;					}					statusOK = true;					finalUrl = url;					return false;				}				// CONTENT-TYPE HEADER				if (row.substr(0, 12).toUpperCase() === 'CONTENT_TYPE') {					row = row.split(':')[1].trim();					row = row.substr(0, 17);					if (row !== 'text/event-stream') {						failTheConnection('Bad MIME Type: ' + row);						rows = [];						return true;					}					acceptOk = true;					return false;				}								// END OF HEADERS				if (row === '') {					if (statusOK && acceptOk) {						announceTheConnection();						rows = rows.splice(0, index);						return true;					}					failTheConnection('Bad Response: ' + data);					rows = [];					return true;				}				// IGNORED HEADER				return false;			});		}				// PARSE EVENT STREAM		// http://www.w3.org/TR/eventsource/#event-stream-interpretation		rows.forEach(function (row) {			var				colonIndex,				field,				value;			// empty line			if (row === '') {				dispatchTheEvent();				return;			}			// comment			if (row[0] === ':') {				return;			}			// field			colonIndex = row.indexOf(':');			if (colonIndex !== -1) {				// with value				field = row.substr(0, colonIndex);				value = row.substr(colonIndex);				if (value[0] === ' ') {					value = value.substr(1);				}				processTheField(field, value);			} else {				// without value				processTheField(row, '');			}		});	});	// HANDLE SERVER CONNECTION CLOSE	client.on('end', function() {		readyState = EventSource.CLOSED;	});	this.close = function close() {		client.end();	};}EventSource.prototype.CONNECTING = EventSource.CONNECTING = 0;EventSource.prototype.OPEN = EventSource.OPEN = 1;EventSource.prototype.CLOSED = EventSource.CLOSED = 2;RECONNECTION_TIME = 10000; // 10 secondsCR = '\r';LF = '\n';CRLF = CR + LF;DIGITS_REGEX = /^[0-9]*$/g;EventTarget = EventTarget || require('w3c-domevents').EventTarget;Event = Event || require('w3c-domevents').Event;exports.EventSource = EventSource;