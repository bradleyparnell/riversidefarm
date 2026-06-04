(function () {
  var BASE = 'https://bradleyparnell.github.io/riversidefarm/';

  // Create a container to mount into
  var container = document.createElement('div');
  container.id = 'rf-corporate-embed';
  container.style.cssText = 'width:100%;margin:0;padding:0;';

  // Insert right after this script tag
  var scripts = document.getElementsByTagName('script');
  var thisScript = scripts[scripts.length - 1];
  thisScript.parentNode.insertBefore(container, thisScript.nextSibling);

  fetch(BASE + 'index.html')
    .then(function (r) { return r.text(); })
    .then(function (html) {
      // Rewrite relative asset paths to absolute GitHub Pages URLs
      html = html.replace(/(['"])(\.\/assets\/)/g, '$1' + BASE + 'assets/');
      html = html.replace(/url\(['"]?\.\//g, 'url(\'' + BASE);

      // Parse the fetched HTML
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, 'text/html');

      // Inject all <style> blocks into <head>
      var styles = doc.querySelectorAll('style');
      styles.forEach(function (s) {
        var style = document.createElement('style');
        style.textContent = s.textContent.replace(/url\(['"]?\.\//g, 'url(\'' + BASE);
        document.head.appendChild(style);
      });

      // Inject all <link rel="stylesheet"> into <head>
      var links = doc.querySelectorAll('link[rel="stylesheet"]');
      links.forEach(function (l) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = l.href.startsWith('http') ? l.href : BASE + l.href;
        document.head.appendChild(link);
      });

      // Inject the body content into the container
      container.innerHTML = doc.body.innerHTML;

      // Fix any remaining relative src/href attributes
      container.querySelectorAll('[src]').forEach(function (el) {
        if (!el.src.startsWith('http')) el.src = BASE + el.getAttribute('src');
      });
      container.querySelectorAll('[href]').forEach(function (el) {
        var href = el.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto')) {
          el.href = BASE + href;
        }
      });

      // Re-execute any inline scripts inside the injected content
      container.querySelectorAll('script').forEach(function (oldScript) {
        var newScript = document.createElement('script');
        if (oldScript.src) {
          newScript.src = oldScript.src.startsWith('http') ? oldScript.src : BASE + oldScript.src;
        } else {
          newScript.textContent = oldScript.textContent;
        }
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });
    })
    .catch(function (err) {
      console.error('Riverside Farm embed failed to load:', err);
    });
})();
