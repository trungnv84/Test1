function ztest() {
    document.getElementsByTagName('iframe')[0].contentWindow.widgetReady(function () {
        console.log('widgetReady');
    });
}
