!function(e,n){if("serviceWorker"in e.navigator&&n[6]&&n[6][0]){var o=n[6],r=!1;if(o[3]){var t,i=function(){n[10](function(){if(t!==navigator.onLine){if(navigator.onLine){if(void 0===t)return;console.info("Abtf.offline() ➤ connection restored"),e.jQuery("body").removeClass("offline")}else console.warn("Abtf.offline() ➤ connection offline"),e.jQuery("body").addClass("offline");t=!!navigator.onLine}})};e.addEventListener("online",i),e.addEventListener("offline",i),i()}var a=function(){navigator.serviceWorker.controller.postMessage([1,n[6][2],n[6][4],n[6][5]]),o[6]&&(console.info("Abtf.pwa() ➤ preload",o[6]),navigator.serviceWorker.controller.postMessage([2,o[6]]))};navigator.serviceWorker.ready.then(function(){navigator.serviceWorker.controller?a():navigator.serviceWorker.addEventListener("controllerchange",function(){a()})}),navigator.serviceWorker.register(o[0],{scope:o[1]}).then(function(e){return new Promise(function(n,o){e.installing?e.installing.addEventListener("statechange",function(e){"installed"==e.target.state?n():"redundant"==e.target.state&&o()}):n()})}).then(function(){console.info("Abtf.pwa() ➤ service worker loaded"),r=!0}).catch(function(e){throw e}),navigator.serviceWorker.addEventListener("message",function(n){n&&n.data&&n.data instanceof Array&&2===n.data[0]&&e.jQuery("body").trigger("sw-update",n.data[1])});var s=function(e){navigator.serviceWorker.controller?navigator.serviceWorker.controller.postMessage([2,e]):navigator.serviceWorker.ready.then(function(){s(e)})};n.offline=function(e){s(e)}}}(window,window.Abtf);