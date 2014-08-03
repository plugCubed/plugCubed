function loader() {
    if (typeof requirejs !== 'undefined' && typeof API !== 'undefined' && API.enabled)
        $.getScript('URL');
    else
        setTimeout(loader, 1e3);
}

var s = document.createElement('script');
s.innerText = loader.toString().split('URL').join(chrome.extension.getURL('plugCubed.js')) + ' loader();';
document.head.appendChild(s);