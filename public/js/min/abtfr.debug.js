!function(i,r,e){console.warn("Abtfr","debug notices visible to admin only"),r[14]=function(e,t,o){(t=document)[o="addEventListener"]?t[o]("DOMContentLoaded",e):i.attachEvent("onload",e)};var n,a=[];r[0]=function(e,t){if(n||t){if(e(i,i.Abtfr,i.document,Object),!0===t){if(0<a.length)for(var o=a.shift();o;)r[0](o,1),o=a.shift();n=!0,c&&r[10]()}}else a.push(e)};var c,f=function(o,n){var e=o.requestAnimationFrame||o.webkitRequestAnimationFrame||o.mozRequestAnimationFrame||o.msRequestAnimationFrame||function(e){o.setTimeout(e,1e3/60)};n[15]=function(){e.apply(o,arguments)};var t=!!o.requestIdleCallback&&o.requestIdleCallback;if(n[16]=!!t&&function(){t.apply(o,arguments)},n[7])var i=n[7];var r=function(){i[2]?(n[17](i[3],"webfont"),console.log("Abtfr.fonts()","async",o.WebFontConfig)):void 0!==o.WebFont&&(o.WebFont.load(o.WebFontConfig),console.log("Abtfr.fonts()",o.WebFontConfig))};n[10]=function(){if(n[6]&&n[27](n[6]),n[1]&&!n[1][1]&&n[18](n[1][0]),n[7]){if(void 0===o.WebFontConfig&&(o.WebFontConfig={}),i[0]){o.WebFontConfig.google||(o.WebFontConfig.google={}),o.WebFontConfig.google.families||(o.WebFontConfig.google.families=[]);for(var e=i[0].length,t=0;t<e;t++)o.WebFontConfig.google.families.push(i[0][t])}i[1]||r()}n[12]&&!n[4]&&n[12]()},n[11]=function(){n[12]&&n[4]&&(console.log("Abtfr.css()","footer start"),n[12]()),n[1]&&n[1][1]&&(console.log("Abtfr.js()","footer start"),n[18](n[1][0])),n[7]&&i[1]&&(console.log("Abtfr.fonts()","footer start"),r())},n[14](n[11]),n[17]=function(n,i){!function(e){var t=e.createElement("script");t.src=n,i&&(t.id=i),t.async=!0;var o=e.getElementsByTagName("script")[0];o?o.parentNode.insertBefore(t,o):(document.head||document.getElementsByTagName("head")[0]).appendChild(t)}(document)};var a=document.createElement("a");a.href=document.location.href;var c=new RegExp("^(https?:)?//"+a.host.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&"),"i");n[29]=function(e){return e.replace(c,"")}},s="data-abtfr",t=function(e){var t=e.getAttribute(s);if(t&&"string"==typeof t)try{t=JSON.parse(t)}catch(e){console.error("Abtfr","failed to parse config",t,e)}if(!(t&&t instanceof Array))throw console.error("Abtfr","invalid config",t),new Error("invalid config");for(var o=t.length,n=0;n<o;n++)void 0===i.Abtfr[n]&&(i.Abtfr[n]=-1===t[n]?void 0:t[n]);r[0](f,!0)};if(document.currentScript&&document.currentScript.hasAttribute(s))t(document.currentScript);else{var o=function(){return document.querySelector("script["+s+"]")},l=o();if(l)t(l);else{var u="<script "+s+"> client missing";i.console&&void 0!==console.error&&console.error(u),r[14](function(){if(!(l=o()))throw console.warn("Abtfr","client script <script "+s+"> detected on domready. Make sure that the script tag is included in the header unmodified."),new Error(u);t(l)})}}r[9]=function(){n?r[10]():c=!0}}(window,Abtfr);