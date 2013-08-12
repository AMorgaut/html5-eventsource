#HTML5 EventSource / Server-Sent Events#


**IN PROGRESS**

This package provides the [**HTML5 `EventSource`**](http://w3.org/TR/eventsource) Interface on the server.
It makes possible to listen to any Server-Sent Events resources currently listened by Web Browsers. Of course, you will most of the time need to provide correct Authentication.


##Requirements##

While written in pure JS this Package requires:

* CommonJS Module support
* Node.js net API support

It is currently meant to be compatible with at least [WakandaDB](http://wakandadb.org) and [node.js](http://nodejs.org).

The node.js net API may be replaced in the future by the upcomming [W3C Raw Socket API](http://www.w3.org/TR/raw-sockets/). A polyfil would then be used for node.js as for other platforms.

This package use those external packages as submodules:

* [w3c-domcore-errors](http://github.com/AMorgaut/w3c-domcore-errors)
* [w3c-domevents](http://github.com/AMorgaut/w3c-domevents)

##References##

* [W3C Candidate Recommendation](http://www.w3.org/TR/eventsource)
* [WHATWG Living Standard - Communication](http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html)
## License (MIT License) ##Copyright (c) 2013 Alexandre MorgautPermission is hereby granted, free of charge, to any person obtaining a copyof this software and associated documentation files (the "Software"), to dealin the Software without restriction, including without limitation the rightsto use, copy, modify, merge, publish, distribute, sublicense, and/or sellcopies of the Software, and to permit persons to whom the Software isfurnished to do so, subject to the following conditions:The above copyright notice and this permission notice shall be included inall copies or substantial portions of the Software.THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS ORIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THEAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHERLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS INTHE SOFTWARE.