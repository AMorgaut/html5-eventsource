﻿var	DOMException,	SyntaxError,	RECONNECTION_TIME;/** * @class EventSource * @extends EventTarget * @constructor * @param {string} url * @param {EventSourceInit} [eventSourceInitDict] **/function EventSource(url, eventSourceInitDict) {	var		index,		ssl,		host,		hostname,		port,		path,		CORSMode,		readyState,		lastEventId,		client,		statusOK,		acceptOk,		connectionFailed;	// http://www.w3.org/TR/eventsource/#processing-model	function establishTheConnection() {		client = net.connect(port, host, function(connection) {			var				request;			readyState = EventSource.OPEN;			request = [				'GET ' + path + ' HTTP/1.1',				'Host: ' + host			];			request.push('Accept: text/event-stream');			request.push('Cache-Control: no-cache');			if (lastEventId) {				request.push('Last-Event-ID: ' + lastEventId);			}			request.push(''); // end of header			client.write(request.join('\n'));		});	}	// http://www.w3.org/TR/eventsource/#announce-the-connection	function announceTheConnection() {		var			openEvent;		if (readyState !== EventSource.CLOSED) {			readyState = EventSource.OPEN;		}		openEvent = {			type: 'open'		};		if (typeof this.onopen === 'function') {			this.onopen(openEvent);		}		this.dispatchEvent(openEvent);	}	// http://www.w3.org/TR/eventsource/#reestablish-the-connection	function reestablishTheConnection() {		setTimeout(function () {			if (readyState === EventSource.CLOSED) {				return;			}			readyState = EventSource.CONNECTING;			dispacthError('reconnecting')		}, 0);		setTimeout(function () {			if (readyState !== EventSource.CONNECTING) {				return;			}			establishTheConnection();		}, RECONNECTION_TIME)		// Not yet supported		// Optionally, wait some more. In particular, if the previous attempt failed, 		// then user agents might introduce an exponential backoff delay to avoid overloading 		// a potentially already overloaded server. 		// Alternatively, if the operating system has reported that there is no network connectivity, 		// user agents might wait for the operating system to announce that the network connection 		// has returned before retrying.	}	// http://www.w3.org/TR/eventsource/#fail-the-connection	function failTheConnection(message) {		client.end();		readyState = EventSource.CLOSED;		connectionFailed = true;		dispacthError(message);	}	function dispacthError(message) {		var			errorEvent;		errorEvent = {			type: 'error',			message: message		};		if (typeof this.onerror === 'function') {			this.onerror(errorEvent);		}		this.dispatchEvent(errorEvent);	}	// EventTarget inheritance	EventTarget = EventTarget || require('w3c-events');	EventTarget.call(this);	// SyntaxError DOMException support	DOMException = DOMException || require('w3c-domcore-errors').DOMException;	SyntaxError = SyntaxError || new DOMException('SyntaxError');	// PARSE AND VALIDATE URL	url = String(url);	index = url.indexOf('://');	if (index === -1) {		throw SyntaxError;	}	switch (url.substr(0, index)) {	case 'http':		ssl = false;		break;	case 'https':		ssl = true;		break;	default:		throw SyntaxError;	}	url = url.substr(index + 3);	index = url.indexOf('/');	if (index === -1) {		hostname = url;		path = '/';	} else {		hostname = url.substr(0, index);		path = url.substr(index);	}	// raw port detection	// doesn't support IPV6 addresses nor in URL Basic Auth credentials	index = hostname.lastIndexOf(':');	if (index === -1) {		host = hostname;		port = 80;	} else {		host = hostname.substr(0, index);		port = Number(hostname.substr(index));	}	// INITIALIZE OBJECT	Object.defineProperties(this, {		url: {			value: String(url),			writable: false		},		withCredentials: {			value: eventSourceInitDict && Boolean(eventSourceInitDict.withCredentials),			writable: false		},		readyState: {			get: function () { return readyState; },			set: function () {}		}	});	if (this.withCredentials) {		CORSMode = 'USE_CREDENTIALS';	}	// CONNECT TO THE SERVER	readyState = EventSource.CONNECTING;	establishTheConnection();	// HANDLE SERVER RESPONSE	client.on('data', function (data) {		var			rows;		rows = data.split('\n');		// CHECK CONNECTION STATUS		if (readyState !== EventSource.OPEN) {			rows.some(function parseConnection(row, index) {				var					connected;				// STATUS LINE				if (!index) {					// Not yet supported:					// HTTP 305 Use Proxy, 401 Unauthorized, and 407 Proxy Authentication Required should be treated transparently as for any other subresource.					// HTTP 301 Moved Permanently, 302 Found, 303 See Other, and 307 Temporary Redirect responses are handled by the fetching and CORS algorithms. In the case of 301 redirects, the user agent must also remember the new URL so that subsequent requests for this resource for this EventSource object start with the URL given for the last 301 seen for requests for this object.					// HTTP 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable, and 504 Gateway Timeout responses, and any network error that prevents the connection from being established in the first place (e.g. DNS errors), must cause the user agent to asynchronously reestablish the connection.					if (row.toUpperCase() !== 'HTTP 200 OK') {						failTheConnection('Bad Status: ' + rows[0]);						rows = [];						return true;					}					statusOK = true;					return false;				}				// CONTENT-TYPE HEADER				if (row.substr(0, 12).toUpperCase() === 'CONTENT_TYPE') {					row = row.split(':')[1].trim();					row = row.substr(0, 17);					if (row !== 'text/event-stream') {						failTheConnection('Bad MIME Type: ' + row);						rows = [];						return true;					}					acceptOK = true;					return false;				}								// END OF HEADERS				if (row === '') {					if (statusOK && acceptOK) {						announceTheConnection();						rows = rows.splice(0, index);						return true;					}					failTheConnection('Bad Response: ' + data);					rows = [];					return true;				}				// IGNORED HEADER				return false;			});		}				// PARSE EVENT STREAM		// http://www.w3.org/TR/eventsource/#event-stream-interpretation		rows.forEach(function (row) {			// IN PROGRESS		});	});	// HANDLE SERVER CONNECTION CLOSE	client.on('end', function() {		readyState = EventSource.CLOSED;	});	this.close = function close() {		client.end();	};}EventSource.prototype.CONNECTING = EventSource.CONNECTING = 0;EventSource.prototype.OPEN = EventSource.OPEN = 1;EventSource.prototype.CLOSED = EventSource.CLOSED = 2;RECONNECTION_TIME = 10000; // 10 secondsexports.EventSource = EventSource;