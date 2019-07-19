const tl = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no,viewport-fit=cover"> <title></title> <script> (function (doc, win) { var docEl = doc.documentElement, resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize', recalc = function () { var clientWidth = docEl.clientWidth; if (!clientWidth) return; if (clientWidth >= 640) { docEl.style.fontSize = '100px'; } else { docEl.style.fontSize = 100 * (clientWidth / 750) + 'px'; var div = document.createElement('div'); div.style.width = '1.4rem'; div.style.height = '0'; document.body.appendChild(div); var ideal = 140 * clientWidth / 750; var rmd = (div.clientWidth / ideal); if (rmd > 1.2 || rmd < 0.8) { docEl.style.fontSize = 100 * (clientWidth / 750) / rmd + 'px'; } document.body.removeChild(div); } }; if (!doc.addEventListener) return; win.addEventListener(resizeEvt, recalc, false); doc.addEventListener('DOMContentLoaded', recalc, false); })(document, window); </script>
	<style>
		body,
		html,
		table {
			padding: 0;
			margin: 0;
		}
		p {
			margin: 0.14rem 0;
			list-style-type: none;
			font-family: PingFang-SC-Medium;
			font-size: 0.28rem;
			color: #848484;
			letter-spacing: 0;
			text-align: justify;
			line-height: 0.48rem;
			padding: 0 0.3rem;
		}
		td {
			border: 1px solid #000;
			text-align: left;
			vertical-align: middle;
			font-family: PingFang-SC-Medium;
			font-size: 0.28rem;
			color: #848484;
		}
		.container>table {
			width: 6.9rem;
		}
		table {
			border-collapse: collapse;
		}
		.container {
			padding: 0.3rem
		}
	</style>
</head>
<body><noscript>You need to enable JavaScript to run this app.</noscript><div class="container">` 

const tr = `</div></html>`

module.exports = {
    tl,
    tr
}