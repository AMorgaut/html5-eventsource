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
